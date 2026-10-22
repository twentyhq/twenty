import { ReplyToEmailThreadCommand } from '@/command-menu-item/engine-command/record/single-record/message-thread/components/ReplyToEmailThreadCommand';
import { render } from '@testing-library/react';

const mockOpenComposeEmailInSidePanel = jest.fn();

jest.mock('@/activities/emails/hooks/useReplyContext', () => ({
  useReplyContext: () => ({
    loading: false,
    to: 'lead@example.com',
    subject: 'Re: Hello',
    inReplyTo: '',
    connectedAccountId: 'thread-account',
  }),
}));

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => ({
      selectedRecords: [{ id: 'thread-id' }],
    }),
  }),
);

jest.mock('@/side-panel/hooks/useOpenComposeEmailInSidePanel', () => ({
  useOpenComposeEmailInSidePanel: () => ({
    openComposeEmailInSidePanel: mockOpenComposeEmailInSidePanel,
  }),
}));

jest.mock(
  '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect',
  () => ({
    HeadlessEngineCommandWrapperEffect: ({
      execute,
    }: {
      execute: () => void;
    }) => {
      execute();
      return null;
    },
  }),
);

describe('ReplyToEmailThreadCommand', () => {
  it('opens the composer on the selected thread even without a message id', () => {
    render(<ReplyToEmailThreadCommand />);

    expect(mockOpenComposeEmailInSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: 'thread-id',
        connectedAccountId: 'thread-account',
        defaultInReplyTo: '',
      }),
    );
  });
});
