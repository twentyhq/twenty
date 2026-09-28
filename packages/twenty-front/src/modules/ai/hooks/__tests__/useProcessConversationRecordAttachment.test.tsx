import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { useProcessConversationRecordAttachment } from '@/ai/hooks/useProcessConversationRecordAttachment';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { GetChatThreadsForRecordDocument } from '~/generated-metadata/graphql';

const refetchQueriesMock = jest.fn(() => Promise.resolve([]));
const refetchCoreQueriesMock = jest.fn(() => Promise.resolve([]));

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ refetchQueries: refetchQueriesMock }),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ refetchQueries: refetchCoreQueriesMock }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: 'processConversationRecordAttachmentTest' }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </JotaiProvider>
);

const buildMessage = (parts: unknown[]) =>
  ({ parts }) as Pick<ExtendedUIMessage, 'parts'>;

const buildAttachPart = ({
  toolCallId,
  state = 'output-available',
  success = true,
}: {
  toolCallId: string;
  state?: string;
  success?: boolean;
}) => ({
  type: 'tool-attach_conversation_to_record',
  toolCallId,
  input: {
    objectNameSingular: 'company',
    recordId: '20202020-0000-4000-8000-000000000001',
  },
  output:
    state === 'output-available'
      ? { success, message: 'Attached this conversation to the company record' }
      : undefined,
  state,
});

const renderProcessConversationRecordAttachment = () =>
  renderHook(() => useProcessConversationRecordAttachment(), {
    wrapper: Wrapper,
  }).result;

describe('useProcessConversationRecordAttachment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('should refresh the conversations listed on record pages once per attachment', () => {
    const result = renderProcessConversationRecordAttachment();
    const message = buildMessage([
      { type: 'text', text: 'Done.' },
      buildAttachPart({ toolCallId: 'call-1' }),
    ]);

    act(() => {
      result.current.processConversationRecordAttachment(message);
      result.current.processConversationRecordAttachment(message);
    });

    expect(refetchQueriesMock).toHaveBeenCalledTimes(1);
    expect(refetchQueriesMock).toHaveBeenCalledWith({
      include: [GetChatThreadsForRecordDocument],
    });
    expect(refetchCoreQueriesMock).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.processConversationRecordAttachment(
        buildMessage([
          buildAttachPart({ toolCallId: 'call-1' }),
          buildAttachPart({ toolCallId: 'call-2' }),
        ]),
      );
    });

    expect(refetchQueriesMock).toHaveBeenCalledTimes(2);
  });

  it('should leave the conversations alone until an attachment succeeds', () => {
    const result = renderProcessConversationRecordAttachment();

    act(() => {
      result.current.processConversationRecordAttachment(
        buildMessage([
          buildAttachPart({ toolCallId: 'running', state: 'input-available' }),
          buildAttachPart({ toolCallId: 'failed', success: false }),
          {
            type: 'tool-ask_questions',
            toolCallId: 'other-tool',
            input: {},
            output: { success: true, message: 'Asked.' },
            state: 'output-available',
          },
        ]),
      );
    });

    expect(refetchQueriesMock).not.toHaveBeenCalled();
    expect(refetchCoreQueriesMock).not.toHaveBeenCalled();
  });
});
