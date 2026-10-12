import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { Temporal } from 'temporal-polyfill';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { sleep } from '~/utils/sleep';

import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const openRecordTarget = jest.fn();
const openViewTarget = jest.fn();
const processWorkspaceSetupCompletion = jest.fn();

jest.mock('@/ai/hooks/useChatTargetNavigation', () => ({
  useChatTargetNavigation: () => ({ openRecordTarget, openViewTarget }),
}));

jest.mock('~/utils/sleep', () => ({ sleep: jest.fn() }));

jest.mock('@/ai/hooks/useProcessWorkspaceSetupCompletion', () => ({
  useProcessWorkspaceSetupCompletion: () => ({
    processWorkspaceSetupCompletion,
  }),
}));

const SESSION_START = '2026-01-01T10:00:00.000Z';

const buildMessage = (
  id: string,
  text: string,
  createdAt = '2026-01-01T10:00:01.000Z',
): ExtendedUIMessage => ({
  id,
  role: 'assistant',
  parts: [{ type: 'text', text }],
  metadata: { createdAt },
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
      Temporal.Instant.from(SESSION_START),
    );
  });

  it('processes each message once until it is replaced', () => {
    const updateStreamingPartsWithDiff = renderUpdateStreamingPartsWithDiff();
    const settledMessage = buildMessage('settled', 'Done');
    const streamingMessage = buildMessage('streaming', 'Hel');

    updateStreamingPartsWithDiff([settledMessage, streamingMessage]);
    expect(processWorkspaceSetupCompletion).toHaveBeenCalledTimes(2);

    const nextStreamingMessage = buildMessage('streaming', 'Hello');

    updateStreamingPartsWithDiff([settledMessage, nextStreamingMessage]);

    expect(processWorkspaceSetupCompletion).toHaveBeenCalledTimes(3);
    expect(processWorkspaceSetupCompletion).toHaveBeenLastCalledWith(
      nextStreamingMessage,
    );
  });

  it('does not process again a refetched message whose content did not change', () => {
    const updateStreamingPartsWithDiff = renderUpdateStreamingPartsWithDiff();

    updateStreamingPartsWithDiff([buildMessage('answer', 'Done')]);
    updateStreamingPartsWithDiff([buildMessage('answer', 'Done')]);

    expect(processWorkspaceSetupCompletion).toHaveBeenCalledTimes(1);
  });

  it('leaves messages written before this session alone', () => {
    const updateStreamingPartsWithDiff = renderUpdateStreamingPartsWithDiff();

    updateStreamingPartsWithDiff([
      buildMessage('earlier', 'Done', '2026-01-01T09:59:59.000Z'),
    ]);

    expect(processWorkspaceSetupCompletion).not.toHaveBeenCalled();
  });

  it.each(['direct', 'execute_tool'] as const)(
    'does not navigate or wait when streaming or replaying a legacy %s navigation result',
    (format) => {
      const updateStreamingPartsWithDiff = renderUpdateStreamingPartsWithDiff();
      const message: ExtendedUIMessage = {
        ...buildMessage('legacy-navigation', 'Open this record'),
        parts: [
          {
            type:
              format === 'direct' ? 'tool-navigate_app' : 'tool-execute_tool',
            toolCallId: 'navigate-record',
            state: 'output-available',
            input: { toolName: 'navigate_app' },
            output: {
              success: true,
              result: {
                action: 'navigateToRecord',
                objectNameSingular: 'company',
                recordId: '11111111-1111-4111-8111-111111111111',
              },
            },
          },
          {
            type:
              format === 'direct' ? 'tool-navigate_app' : 'tool-execute_tool',
            toolCallId: 'wait',
            state: 'output-available',
            input: { toolName: 'navigate_app' },
            output: {
              success: true,
              result: { action: 'wait', durationMs: 3000 },
            },
          },
        ],
      };

      updateStreamingPartsWithDiff([message]);
      updateStreamingPartsWithDiff([]);
      updateStreamingPartsWithDiff([{ ...message, parts: [...message.parts] }]);

      expect(openRecordTarget).not.toHaveBeenCalled();
      expect(openViewTarget).not.toHaveBeenCalled();
      expect(sleep).not.toHaveBeenCalled();
    },
  );
});
