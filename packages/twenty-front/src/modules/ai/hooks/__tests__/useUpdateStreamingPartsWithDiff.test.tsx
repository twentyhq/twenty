import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { Temporal } from 'temporal-polyfill';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const processUIToolCallMessage = jest.fn();
const processWorkspaceSetupCompletion = jest.fn();

jest.mock('@/ai/hooks/useProcessUIToolCallMessage', () => ({
  useProcessUIToolCallMessage: () => ({ processUIToolCallMessage }),
}));

jest.mock('@/ai/hooks/useProcessWorkspaceSetupCompletion', () => ({
  useProcessWorkspaceSetupCompletion: () => ({
    processWorkspaceSetupCompletion,
  }),
}));

const buildMessage = (id: string, text: string): ExtendedUIMessage => ({
  id,
  role: 'assistant',
  parts: [{ type: 'text', text }],
});

const renderUpdateStreamingPartsWithDiff = () => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
  );

  return renderHook(() => useUpdateStreamingPartsWithDiff(), {
    wrapper: Wrapper,
  }).result.current.updateStreamingPartsWithDiff;
};

describe('useUpdateStreamingPartsWithDiff', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
    jotaiStore.set(
      agentChatUISessionStartTimeState.atom,
      Temporal.Instant.fromEpochMilliseconds(0),
    );
  });

  it('processes each message once until it is replaced', () => {
    const updateStreamingPartsWithDiff = renderUpdateStreamingPartsWithDiff();
    const settledMessage = buildMessage('settled', 'Done');
    const streamingMessage = buildMessage('streaming', 'Hel');

    updateStreamingPartsWithDiff([settledMessage, streamingMessage]);
    expect(processUIToolCallMessage).toHaveBeenCalledTimes(2);

    const nextStreamingMessage = buildMessage('streaming', 'Hello');

    updateStreamingPartsWithDiff([settledMessage, nextStreamingMessage]);

    expect(processUIToolCallMessage).toHaveBeenCalledTimes(3);
    expect(processUIToolCallMessage).toHaveBeenLastCalledWith(
      nextStreamingMessage,
    );
    expect(processWorkspaceSetupCompletion).toHaveBeenCalledTimes(3);
  });
});
