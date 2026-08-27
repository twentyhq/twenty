import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { SEND_EMAIL } from '@/activities/emails/graphql/mutations/sendEmail';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';

const mockEnqueueSuccessSnackBar = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSuccessSnackBar: mockEnqueueSuccessSnackBar,
    enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
  }),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ refetchQueries: jest.fn() }),
}));

const createSendEmailMock = (input: {
  connectedAccountId: string;
  fromHandle?: string;
}) => ({
  request: {
    query: SEND_EMAIL,
    variables: {
      input: {
        to: 'ada@lovelace.com',
        cc: undefined,
        bcc: undefined,
        subject: 'Hello',
        body: '',
        inReplyTo: undefined,
        draftMessageId: undefined,
        files: undefined,
        ...input,
      },
    },
  },
  result: {
    data: {
      sendEmail: {
        success: true,
        error: null,
        messageThreadId: 'message-thread-1',
      },
    },
  },
});

const renderComposerState = (
  mocks: ReturnType<typeof createSendEmailMock>[],
  onSent: (messageThreadId: string | null) => void,
) =>
  renderHook(
    () =>
      useEmailComposerState({
        connectedAccountId: 'account-1',
        defaultTo: 'ada@lovelace.com',
        defaultSubject: 'Hello',
        onSent,
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      ),
    },
  );

describe('useEmailComposerState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends from the connected account when no alias was picked', async () => {
    const onSent = jest.fn();

    const { result } = renderComposerState(
      [
        createSendEmailMock({
          connectedAccountId: 'account-1',
          fromHandle: undefined,
        }),
      ],
      onSent,
    );

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onSent).toHaveBeenCalledWith('message-thread-1');
  });

  it('sends from the picked alias together with the account owning it', async () => {
    const onSent = jest.fn();

    const { result } = renderComposerState(
      [
        createSendEmailMock({
          connectedAccountId: 'account-2',
          fromHandle: 'sales@twenty.com',
        }),
      ],
      onSent,
    );

    act(() => {
      result.current.setSender({
        connectedAccountId: 'account-2',
        fromHandle: 'sales@twenty.com',
      });
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onSent).toHaveBeenCalledWith('message-thread-1');
    expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
  });

  it('drops a picked alias when the reply moves to another account', () => {
    const { result, rerender } = renderHook(
      ({ connectedAccountId }: { connectedAccountId: string }) =>
        useEmailComposerState({ connectedAccountId }),
      {
        initialProps: { connectedAccountId: 'account-1' },
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[]}>{children}</MockedProvider>
        ),
      },
    );

    act(() => {
      result.current.setSender({
        connectedAccountId: 'account-1',
        fromHandle: 'sales@twenty.com',
      });
    });

    expect(result.current.fromHandle).toBe('sales@twenty.com');

    rerender({ connectedAccountId: 'account-2' });

    expect(result.current.connectedAccountId).toBe('account-2');
    expect(result.current.fromHandle).toBeUndefined();
  });
});
