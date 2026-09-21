import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { RecordSharePrincipalType } from 'twenty-shared/types';

import { AiChatSharingDropdownContent } from '@/ai/components/AiChatSharingDropdownContent';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const setShare = jest.fn();
const refetch = jest.fn();
const copyToClipboard = jest.fn();

jest.mock('~/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard }),
}));

const sharing = {
  canManage: true,
  isEnabled: true,
  roles: [{ id: 'sales-role', label: 'Sales' }],
  shares: [],
};
const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);
const renderSharing = (overrides = {}) => {
  return render(
    <AiChatSharingDropdownContent
      threadId="shared-thread"
      sharingState={{
        sharing,
        setShare,
        refetch,
        loading: false,
        saving: false,
        error: undefined,
        ...overrides,
      }}
    />,
    {
      wrapper: Wrapper,
    },
  );
};

describe('Conversation sharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    refetch.mockResolvedValue(undefined);
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      {
        id: 'alice-member',
        name: { firstName: 'Alice', lastName: 'Smith' },
        userEmail: 'alice@example.com',
      } as never,
    ]);
  });

  it('finds a workspace member by email and grants viewing access', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.type(
      screen.getByPlaceholderText('Add people or roles'),
      'alice@',
    );
    expect(screen.queryByText('Sales')).toBeNull();
    await user.click(screen.getByText('Alice Smith'));
    expect(setShare).toHaveBeenCalledWith(
      { workspaceMemberId: 'alice-member' },
      true,
    );
  });

  it('finds a role by name and grants viewing access', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.type(
      screen.getByPlaceholderText('Add people or roles'),
      'sales',
    );
    expect(screen.queryByText('Alice Smith')).toBeNull();
    await user.click(screen.getByText('Sales'));
    expect(setShare).toHaveBeenCalledWith({ roleId: 'sales-role' }, true);
  });

  it('enables workspace-wide viewing', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(screen.getByText('Everyone in the workspace'));
    expect(setShare).toHaveBeenCalledWith({ everyone: true }, true);
  });

  it('returns to restricted access without removing named recipients', async () => {
    const user = userEvent.setup();
    renderSharing({
      sharing: {
        ...sharing,
        shares: [
          {
            id: 'everyone',
            principalType: RecordSharePrincipalType.EVERYONE,
            principalId: 'everyone',
          },
        ],
      },
    });
    await user.click(screen.getByText('Restricted'));
    expect(setShare).toHaveBeenCalledWith({ everyone: true }, false);
  });

  it('allows revocation while sharing is disabled', async () => {
    const user = userEvent.setup();
    renderSharing({
      sharing: {
        ...sharing,
        isEnabled: false,
        shares: [
          {
            id: 'grant',
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            principalId: 'alice-member',
          },
        ],
      },
    });
    expect(screen.queryByPlaceholderText('Add people or roles')).toBeNull();
    await user.click(screen.getByText('Everyone in the workspace'));
    expect(setShare).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', { name: 'Remove Alice Smith' }),
    );
    expect(setShare).toHaveBeenCalledWith(
      { workspaceMemberId: 'alice-member' },
      false,
    );
  });

  it('does not offer management controls to viewers', () => {
    renderSharing({ sharing: { ...sharing, canManage: false, roles: [] } });
    expect(
      screen.getByText(
        'You have view-only access. Contact the owner to change sharing.',
      ),
    ).toBeVisible();
    expect(screen.queryByText('General access')).toBeNull();
    expect(screen.queryByPlaceholderText('Add people or roles')).toBeNull();
    expect(screen.getByText('Copy link')).toBeVisible();
  });

  it('supports keyboard selection and reports empty searches', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.type(
      screen.getByPlaceholderText('Add people or roles'),
      'sales',
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Sales · Role' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(setShare).toHaveBeenCalledWith({ roleId: 'sales-role' }, true);
    await user.clear(screen.getByPlaceholderText('Add people or roles'));
    await user.type(
      screen.getByPlaceholderText('Add people or roles'),
      'no match',
    );
    expect(screen.getByText('No matching people or roles')).toBeVisible();
  });

  it('copies a link to this conversation', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(screen.getByText('Copy link'));
    expect(copyToClipboard).toHaveBeenCalledWith(
      `${window.location.origin}/chat/shared-thread`,
    );
  });

  it('shows a retry action when settings cannot be loaded', async () => {
    const user = userEvent.setup();
    renderSharing({ error: new Error('offline') });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Sharing settings could not be loaded.',
    );
    await user.click(screen.getByText('Try again'));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByPlaceholderText('Add people or roles')).toBeNull();
  });
});
