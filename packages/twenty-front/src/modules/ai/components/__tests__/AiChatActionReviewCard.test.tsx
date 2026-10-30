import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { AiChatActionReviewCard } from '@/ai/components/AiChatActionReviewCard';
import { type AiActionStateEntry } from '@/ai/types/AiActionStateEntry';

const decide = jest.fn();
const cancel = jest.fn();
const revise = jest.fn();
let state: AiActionStateEntry = { status: 'loading' };

jest.mock('@/ai/hooks/useAiActionState', () => ({
  useAiActionState: () => state,
}));
jest.mock('@/ai/hooks/useAiActionOperations', () => ({
  useAiActionOperations: () => ({ decide, cancel, revise }),
}));

const EMAIL_ACTION = {
  schemaVersion: 1 as const,
  id: 'action-id',
  logicalActionId: 'logical-id',
  revision: 1,
  stateVersion: 1,
  status: 'pending_review' as const,
  allowedOperations: ['revise' as const, 'approve' as const, 'reject' as const],
  expiresAt: null,
  errorCode: null,
  receipt: null,
  createdAt: '2026-10-30T00:00:00.000Z',
  updatedAt: '2026-10-30T00:00:00.000Z',
  kind: 'send_email' as const,
  payload: {
    connectedAccountId: 'account-id',
    senderHandle: 'riya@example.com',
    to: ['priya@example.com'],
    cc: [],
    bcc: [],
    subject: 'Restarting the expansion',
    body: 'Hi Priya,\n\nWould a call next week help?',
  },
};

const RECORD_ACTION = {
  ...EMAIL_ACTION,
  kind: 'update_record_fields' as const,
  payload: {
    objectNameSingular: 'opportunity',
    objectLabel: 'Opportunity',
    recordId: 'record-id',
    recordLabel: 'Acme expansion',
    changes: [
      {
        fieldName: 'stage',
        fieldLabel: 'Stage',
        before: 'MEETING',
        after: 'PROPOSAL',
      },
    ],
  },
};

const renderCard = () =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <AiChatActionReviewCard actionRequestId="action-id" />
      </Provider>
    </I18nProvider>,
  );

describe('AiChatActionReviewCard', () => {
  beforeEach(() => {
    decide.mockReset();
    cancel.mockReset();
    revise.mockReset();
  });

  it('shows the exact email and approves that version', async () => {
    const user = userEvent.setup();
    state = { status: 'available', action: EMAIL_ACTION };
    decide.mockResolvedValue({ isSuccessful: true });

    renderCard();

    expect(screen.getByText('riya@example.com')).toBeInTheDocument();
    expect(screen.getByText('priya@example.com')).toBeInTheDocument();
    expect(
      screen.getByText('Ready for review. Nothing has been queued or sent.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Approve & queue' }));

    expect(decide).toHaveBeenCalledWith(EMAIL_ACTION, 'approve');
  });

  it('saves an edit as a new version without approving it', async () => {
    const user = userEvent.setup();
    state = { status: 'available', action: EMAIL_ACTION };
    revise.mockResolvedValue({ isSuccessful: true });

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(
      screen.queryByRole('button', { name: 'Approve & queue' }),
    ).not.toBeInTheDocument();

    const subject = screen.getByRole('textbox', { name: 'Subject' });
    await user.clear(subject);
    await user.type(subject, 'Shorter subject');
    await user.click(screen.getByRole('button', { name: 'Save new version' }));

    expect(revise).toHaveBeenCalledWith(
      EMAIL_ACTION,
      expect.objectContaining({
        subject: 'Shorter subject',
        to: 'priya@example.com',
      }),
    );
    expect(decide).not.toHaveBeenCalled();
  });

  it('keeps edits and explains a version conflict', async () => {
    const user = userEvent.setup();
    state = { status: 'available', action: EMAIL_ACTION };
    revise.mockResolvedValue({
      isSuccessful: false,
      errorCode: 'STALE_VERSION',
    });

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const subject = screen.getByRole('textbox', { name: 'Subject' });
    await user.clear(subject);
    await user.type(subject, 'Kept edit');
    await user.click(screen.getByRole('button', { name: 'Save new version' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'This action changed since you opened it.',
      ),
    );
    expect(screen.getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Kept edit',
    );
  });

  it('shows before and after values for a record change', () => {
    state = { status: 'available', action: RECORD_ACTION };

    renderCard();

    expect(screen.getByText('Update Opportunity')).toBeInTheDocument();
    expect(screen.getByText('MEETING')).toBeInTheDocument();
    expect(screen.getByText('PROPOSAL')).toBeInTheDocument();
  });

  it('offers only cancel and edit once approved', () => {
    state = {
      status: 'available',
      action: {
        ...EMAIL_ACTION,
        status: 'queued',
        allowedOperations: ['revise', 'cancel'],
      },
    };

    renderCard();

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Approve & queue' }),
    ).not.toBeInTheDocument();
  });

  it('shows a receipt and no controls when finished', () => {
    state = {
      status: 'available',
      action: {
        ...EMAIL_ACTION,
        status: 'succeeded',
        allowedOperations: [],
        receipt: {
          completedAt: '2026-10-30T00:00:00.000Z',
          summary: 'Accepted by the email provider for priya@example.com.',
        },
      },
    };

    renderCard();

    expect(
      screen.getByText('Accepted by the email provider for priya@example.com.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('never offers a retry when the outcome is unknown', () => {
    state = {
      status: 'available',
      action: {
        ...EMAIL_ACTION,
        status: 'delivery_unknown',
        allowedOperations: [],
      },
    };

    renderCard();

    expect(
      screen.getByText(/will not be retried automatically/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('falls back safely for a newer schema', () => {
    state = { status: 'unsupported-version' };

    renderCard();

    expect(
      screen.getByText('This result requires a newer version of the app.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });
});
