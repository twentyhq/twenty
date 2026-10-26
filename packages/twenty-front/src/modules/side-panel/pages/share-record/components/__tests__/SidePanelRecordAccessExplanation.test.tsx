import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SidePanelRecordAccessExplanation } from '@/side-panel/pages/share-record/components/SidePanelRecordAccessExplanation';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const explain = jest.fn();
jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useLazyQuery: () => [explain, { loading: false }],
}));
jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

describe('Record access explanation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      {
        id: 'member',
        name: { firstName: 'Alice', lastName: 'Smith' },
        userEmail: 'alice@example.com',
      },
    ] as never);
  });
  const open = async () => {
    const user = userEvent.setup();
    render(
      <JotaiProvider store={jotaiStore}>
        <I18nProvider i18n={i18n}>
          <MemoryRouter>
            <SidePanelRecordAccessExplanation
              target={{ objectMetadataId: 'company', recordId: 'record' }}
            />
          </MemoryRouter>
        </I18nProvider>
      </JotaiProvider>,
    );
    await user.click(
      screen.getByRole('button', { name: "Check a member's access" }),
    );
    return user;
  };
  it('checks the selected member on demand and explains a capability prohibition', async () => {
    explain.mockResolvedValue({
      data: {
        explainRecordPermission: {
          allowed: false,
          reason: 'capability',
          action: 'read',
          sources: [],
          hasMoreSources: false,
        },
      },
    });
    const user = await open();
    expect(explain).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Check access' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      "Blocked by this object's record capabilities",
    );
    expect(explain).toHaveBeenCalledWith({
      variables: {
        target: { objectMetadataId: 'company', recordId: 'record' },
        workspaceMemberId: 'member',
        action: 'read',
      },
    });
  });
  it('shows a retryable error when the live check fails', async () => {
    explain.mockRejectedValue(new Error('deadline'));
    const user = await open();
    await user.click(screen.getByRole('button', { name: 'Check access' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Access could not be checked',
    );
    expect(screen.queryByText('Allowed')).toBeNull();
  });
});
