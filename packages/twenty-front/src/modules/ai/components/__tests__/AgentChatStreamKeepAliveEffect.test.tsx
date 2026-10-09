import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AgentChatStreamKeepAliveEffect } from '@/ai/components/AgentChatStreamKeepAliveEffect';
import { AGENT_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS } from '@/ai/constants/AgentChatStreamLivenessCheckIntervalInMs';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatStreamLastEventTimestampState } from '@/ai/states/agentChatStreamLastEventTimestampState';
import { agentChatStreamRecoveryAttemptsState } from '@/ai/states/agentChatStreamRecoveryAttemptsState';
import { agentChatStreamResubscribeNonceState } from '@/ai/states/agentChatStreamResubscribeNonceState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const THREAD_ID = '6d1c2f4e-3a5b-4c7d-8e9f-0a1b2c3d4e5f';

const familyKey = { threadId: THREAD_ID };

const advanceLivenessChecks = (count: number) => {
  for (let index = 0; index < count; index++) {
    act(() => {
      jest.advanceTimersByTime(AGENT_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS);
    });
  }
};

describe('AgentChatStreamKeepAliveEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();

    jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);
    jotaiStore.set(
      agentChatIsAwaitingFirstChunkFamilyState.atomFamily(familyKey),
      true,
    );
    jotaiStore.set(agentChatErrorFamilyState.atomFamily(familyKey), null);
    jotaiStore.set(agentChatStreamRecoveryAttemptsState.atom, 0);
    jotaiStore.set(agentChatStreamResubscribeNonceState.atom, 0);
    jotaiStore.set(agentChatStreamLastEventTimestampState.atom, Date.now());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderEffect = () =>
    render(
      <JotaiProvider store={jotaiStore}>
        <AgentChatStreamKeepAliveEffect />
      </JotaiProvider>,
    );

  it('should report a lost connection when no event arrives after the silent recoveries', () => {
    renderEffect();

    advanceLivenessChecks(20);

    expect(
      isGraphqlErrorOfType(
        jotaiStore.get(agentChatErrorFamilyState.atomFamily(familyKey)),
        AiChatErrorCode.CONNECTION_LOST,
      ),
    ).toBe(true);
    expect(
      jotaiStore.get(
        agentChatIsAwaitingFirstChunkFamilyState.atomFamily(familyKey),
      ),
    ).toBe(false);
    expect(jotaiStore.get(agentChatStreamResubscribeNonceState.atom)).toBe(3);
  });

  it('should not resubscribe while events keep arriving', () => {
    renderEffect();

    for (let index = 0; index < 20; index++) {
      jotaiStore.set(agentChatStreamLastEventTimestampState.atom, Date.now());
      advanceLivenessChecks(1);
    }

    expect(jotaiStore.get(agentChatStreamResubscribeNonceState.atom)).toBe(0);
    expect(
      jotaiStore.get(agentChatErrorFamilyState.atomFamily(familyKey)),
    ).toBeNull();
  });
});
