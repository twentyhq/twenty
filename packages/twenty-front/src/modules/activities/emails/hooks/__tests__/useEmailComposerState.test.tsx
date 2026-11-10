import { type MockLink } from '@apollo/client/testing';
import { isNonEmptyString } from '@sniptt/guards';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { SEND_APP_CHANNEL_MESSAGE } from '@/activities/emails/graphql/mutations/sendAppChannelMessage';
import { SEND_EMAIL } from '@/activities/emails/graphql/mutations/sendEmail';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import {
  type SendAppChannelMessageMutation,
  type SendAppChannelMessageMutationVariables,
} from '~/generated-metadata/graphql';

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({
    refetchQueries: jest.fn().mockResolvedValue(undefined),
  }),
}));

const createSendEmailMock = (input: {
  connectedAccountId: string;
  fromHandle?: string;
  subject?: string;
  inReplyTo?: string;
  targetRecord?: { objectNameSingular: string; recordId: string };
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
        targetRecord: undefined,
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

const renderComposerState = ({
  mocks,
  onSent,
  contextRecord,
}: {
  mocks: ReturnType<typeof createSendEmailMock>[];
  onSent: (messageThreadId: string | null) => void;
  contextRecord?: { objectNameSingular: string; recordId: string };
}) =>
  renderHook(
    () =>
      useEmailComposerState({
        connectedAccountId: 'account-1',
        defaultTo: 'ada@lovelace.com',
        defaultSubject: 'Hello',
        contextRecord,
        onSent,
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      ),
    },
  );

const APP_REPLY_EMAIL_INPUT = {
  to: 'ada@lovelace.com',
  cc: undefined,
  bcc: undefined,
  subject: 'Re: Hello',
  body: '',
  inReplyTo: '<inbound-1@app>',
};

type SendAppChannelMessageMockedResponse = MockLink.MockedResponse<
  SendAppChannelMessageMutation,
  SendAppChannelMessageMutationVariables
>;

const buildSendAppChannelMessageRequest = (
  isExpectedIdempotencyKey: (idempotencyKey: string) => boolean,
): SendAppChannelMessageMockedResponse['request'] => ({
  query: SEND_APP_CHANNEL_MESSAGE,
  variables: ({ input }) =>
    input.messageChannelId === 'channel-1' &&
    input.messageThreadId === 'message-thread-1' &&
    JSON.stringify(input.email) === JSON.stringify(APP_REPLY_EMAIL_INPUT) &&
    isExpectedIdempotencyKey(input.idempotencyKey),
});

const createSendAppChannelMessageMock = (
  isExpectedIdempotencyKey: (idempotencyKey: string) => boolean,
): SendAppChannelMessageMockedResponse => ({
  request: buildSendAppChannelMessageRequest(isExpectedIdempotencyKey),
  result: {
    data: {
      sendAppChannelMessage: {
        __typename: 'SendAppChannelMessageOutput',
        messageId: 'message-1',
        messageThreadId: 'message-thread-1',
      },
    },
  },
});

const createFailingSendAppChannelMessageMock = (
  isExpectedIdempotencyKey: (idempotencyKey: string) => boolean,
): SendAppChannelMessageMockedResponse => ({
  request: buildSendAppChannelMessageRequest(isExpectedIdempotencyKey),
  error: new Error('Network error'),
});

const renderAppComposerState = ({
  mocks,
  onSent,
}: {
  mocks: MockLink.MockedResponse[];
  onSent: (messageThreadId: string | null) => void;
}) =>
  renderHook(
    () =>
      useEmailComposerState({
        connectedAccountId: 'account-1',
        defaultTo: 'ada@lovelace.com',
        defaultSubject: 'Re: Hello',
        defaultInReplyTo: '<inbound-1@app>',
        appReplyTarget: {
          connectedAccountId: 'account-1',
          handle: 'jane@outlook.com',
          messageChannelId: 'channel-1',
          messageThreadId: 'message-thread-1',
        },
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

    const { result } = renderComposerState({
      mocks: [
        createSendEmailMock({
          connectedAccountId: 'account-1',
          fromHandle: undefined,
        }),
      ],
      onSent,
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onSent).toHaveBeenCalledWith('message-thread-1');
  });

  it('sends from the picked alias together with the account owning it', async () => {
    const onSent = jest.fn();

    const { result } = renderComposerState({
      mocks: [
        createSendEmailMock({
          connectedAccountId: 'account-2',
          fromHandle: 'sales@twenty.com',
        }),
      ],
      onSent,
    });

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
    expect(mockEnqueueToast).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' }),
    );
  });

  it('sends the record the composer was opened from so the thread gets linked to it', async () => {
    const onSent = jest.fn();
    const contextRecord = {
      objectNameSingular: 'opportunity',
      recordId: 'opportunity-1',
    };

    const { result } = renderComposerState({
      mocks: [
        createSendEmailMock({
          connectedAccountId: 'account-1',
          fromHandle: undefined,
          targetRecord: contextRecord,
        }),
      ],
      onSent,
      contextRecord,
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onSent).toHaveBeenCalledWith('message-thread-1');
  });

  it('sends the reply through the app when the account belongs to an app', async () => {
    const onSent = jest.fn();

    const { result } = renderAppComposerState({
      mocks: [
        createSendAppChannelMessageMock((idempotencyKey) =>
          isNonEmptyString(idempotencyKey),
        ),
      ],
      onSent,
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onSent).toHaveBeenCalledWith('message-thread-1');
    expect(onSent).toHaveBeenCalledTimes(1);
    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('retries a failed app reply with the same idempotency key', async () => {
    const onSent = jest.fn();
    const sentIdempotencyKeys: string[] = [];

    const { result } = renderAppComposerState({
      mocks: [
        createFailingSendAppChannelMessageMock((idempotencyKey) => {
          sentIdempotencyKeys.push(idempotencyKey);

          return true;
        }),
        createSendAppChannelMessageMock(
          (idempotencyKey) => idempotencyKey === sentIdempotencyKeys[0],
        ),
      ],
      onSent,
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onSent).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onSent).toHaveBeenCalledWith('message-thread-1');
    expect(onSent).toHaveBeenCalledTimes(1);
  });

  it('shows the server message when an app reply is refused', async () => {
    const onSent = jest.fn();

    const { result } = renderAppComposerState({
      mocks: [
        {
          request: buildSendAppChannelMessageRequest(() => true),
          result: {
            errors: [
              {
                message: 'Invalid email recipients',
                extensions: {
                  userFriendlyMessage: 'Invalid email addresses: ada@lovelace',
                },
              },
            ],
          },
        },
      ],
      onSent,
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onSent).not.toHaveBeenCalled();
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
    expect(mockEnqueueToast).toHaveBeenCalledWith({
      status: 'error',
      children: 'Invalid email addresses: ada@lovelace',
    });
  });

  it('sends with the picked account instead of the app when the sender changes', async () => {
    const onSent = jest.fn();

    const { result } = renderAppComposerState({
      mocks: [
        createSendEmailMock({
          connectedAccountId: 'account-2',
          fromHandle: undefined,
          subject: 'Re: Hello',
          inReplyTo: '<inbound-1@app>',
        }),
      ],
      onSent,
    });

    act(() => {
      result.current.setSender({ connectedAccountId: 'account-2' });
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(onSent).toHaveBeenCalledWith('message-thread-1');
    expect(onSent).toHaveBeenCalledTimes(1);
  });

  it('hides attachments while the app is the sender, including uploads that finish after switching', () => {
    const { result } = renderAppComposerState({ mocks: [], onSent: jest.fn() });

    act(() => {
      result.current.setSender({ connectedAccountId: 'account-2' });
    });

    const setFilesFromPendingUpload = result.current.setFiles;

    act(() => {
      result.current.setSender({ connectedAccountId: 'account-1' });
    });

    act(() => {
      setFilesFromPendingUpload([{ id: 'file-1', name: 'deck.pdf' }]);
    });

    expect(result.current.files).toEqual([]);

    act(() => {
      result.current.setSender({ connectedAccountId: 'account-2' });
    });

    expect(result.current.files).toEqual([{ id: 'file-1', name: 'deck.pdf' }]);
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
