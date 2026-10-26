import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { RecordPermissionPolicyStatus } from '@/settings/record-permissions/components/RecordPermissionPolicyStatus';
import { type RecordPermissionPolicyState } from '@/settings/record-permissions/types/RecordPermissionPolicyState';

const mockCancel = jest.fn();
const mockEnqueueToast = jest.fn();
let mockState: Partial<RecordPermissionPolicyState>;
jest.mock(
  '@/settings/record-permissions/hooks/useRecordPermissionPolicy',
  () => ({
    useRecordPermissionPolicy: () => ({ state: mockState, cancel: mockCancel }),
  }),
);
jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const Status = () => {
  const [isViewingActive, setIsViewingActive] = useState(false);
  return (
    <I18nProvider i18n={i18n}>
      <RecordPermissionPolicyStatus
        isViewingActive={isViewingActive}
        onToggleActive={() => setIsViewingActive(!isViewingActive)}
      />
    </I18nProvider>
  );
};

describe('Policy application status', () => {
  beforeEach(() => {
    i18n.load('en', {});
    i18n.activate('en');
    jest.resetAllMocks();
    mockState = {
      status: 'building',
      candidateRevisionId: 'candidate',
      activeDefinition: { version: 1, objects: [] },
      progress: [
        {
          revisionId: 'candidate',
          completedObjects: 2,
          totalObjects: 4,
          processed: '10000000',
        },
      ],
    };
  });

  it('keeps current permissions inspectable and reports actual processed work', async () => {
    const user = userEvent.setup();
    render(<Status />);
    expect(screen.getByRole('status')).toHaveTextContent(
      '2 of 4 objects completed; 10000000 records checked.',
    );
    await user.click(
      screen.getByRole('button', { name: 'View current permissions' }),
    );
    expect(
      screen.getByRole('button', { name: 'View pending changes' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(
      screen.getByRole('button', { name: 'View pending changes' }),
    );
    expect(
      screen.getByRole('button', { name: 'View current permissions' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('preserves failure status and reports cancellation failures', async () => {
    mockState.status = 'failed';
    mockState.failureReason = 'Review the changed relation';
    mockCancel.mockRejectedValue(new Error('Please retry'));
    const user = userEvent.setup();
    render(<Status />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Review the changed relation',
    );
    await user.click(screen.getByRole('button', { name: 'Cancel changes' }));
    await waitFor(() => expect(mockEnqueueToast).toHaveBeenCalledTimes(1));
    expect(
      screen.getByRole('button', { name: 'View current permissions' }),
    ).toBeEnabled();
  });
});
