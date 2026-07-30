import { MockedProvider } from '@apollo/client/testing/react';
import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { StrictMode } from 'react';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { hasInitializedAgentChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { WorkspaceSetupChatKickoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { StartWorkspaceSetupChatDocument } from '~/generated-metadata/graphql';

const threadId = '20202020-aaaa-4aaa-8aaa-202020202020';
const threadTitle = 'Configuration du workspace';

const enrichment: WorkspaceCompanyEnrichment = {
  domain: 'acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
  name: 'Acme Inc',
  website: null,
  industry: null,
  employeeCount: null,
  size: null,
  founded: null,
  headline: null,
  summary: null,
  tags: [],
  locality: null,
  region: null,
  country: null,
};

const buildKickoffMock = ({
  outcome,
  countCall,
  captureVariables,
}: {
  outcome: 'STARTED' | 'ALREADY_STARTED' | 'UNAVAILABLE';
  countCall?: () => void;
  captureVariables?: (variables: Record<string, unknown>) => void;
}) => ({
  request: {
    query: StartWorkspaceSetupChatDocument,
    variables: (variables: Record<string, unknown>) => {
      captureVariables?.(variables);
      return true;
    },
  },
  maxUsageCount: 2,
  result: () => {
    countCall?.();

    return {
      data: {
        startWorkspaceSetupChat: {
          __typename: 'StartWorkspaceSetupChatResult',
          outcome,
          thread:
            outcome === 'UNAVAILABLE'
              ? null
              : {
                  __typename: 'AgentChatThread',
                  id: threadId,
                  title: threadTitle,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                  contextWindowTokens: null,
                  conversationSize: 0,
                  totalInputCredits: 0,
                  totalOutputCredits: 0,
                  deletedAt: null,
                  lastMessageAt: null,
                  createdAt: '2026-07-21T10:00:00.000Z',
                  updatedAt: '2026-07-21T10:00:00.000Z',
                },
        },
      },
    };
  },
});

const renderKickoffEffect = (mocks: readonly unknown[]) =>
  render(
    <MockedProvider mocks={mocks as never}>
      <JotaiProvider store={jotaiStore}>
        <StrictMode>
          <WorkspaceSetupChatKickoffEffect />
        </StrictMode>
      </JotaiProvider>
    </MockedProvider>,
  );

const flushMutation = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
};

describe('WorkspaceSetupChatKickoffEffect', () => {
  beforeEach(() => {
    resetJotaiStore();
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should wait for an in-flight company enrichment before starting the chat', async () => {
    jotaiStore.set(isCompanyEnrichmentFetchInFlightState.atom, true);

    const capturedVariablesList: Record<string, unknown>[] = [];
    let callCount = 0;

    renderKickoffEffect([
      buildKickoffMock({
        outcome: 'STARTED',
        countCall: () => {
          callCount += 1;
        },
        captureVariables: (variables) => {
          capturedVariablesList.push(variables);
        },
      }),
    ]);

    await flushMutation();

    expect(callCount).toBe(0);

    await act(async () => {
      jotaiStore.set(companyEnrichmentState.atom, enrichment);
      jotaiStore.set(isCompanyEnrichmentFetchInFlightState.atom, false);
    });
    await flushMutation();

    expect(callCount).toBe(1);
    expect(capturedVariablesList[0].companyContext).toEqual(enrichment);
  });

  it('should start the workspace setup chat only once when the effect renders twice', async () => {
    let callCount = 0;
    const { rerender } = renderKickoffEffect([
      buildKickoffMock({
        outcome: 'STARTED',
        countCall: () => {
          callCount += 1;
        },
      }),
    ]);

    await flushMutation();

    rerender(
      <MockedProvider mocks={[] as never}>
        <JotaiProvider store={jotaiStore}>
          <StrictMode>
            <WorkspaceSetupChatKickoffEffect />
          </StrictMode>
        </JotaiProvider>
      </MockedProvider>,
    );
    await flushMutation();

    expect(callCount).toBe(1);
  });

  it('should select the thread with its server title and mark it awaiting the first chunk when the chat is started', async () => {
    renderKickoffEffect([buildKickoffMock({ outcome: 'STARTED' })]);

    await flushMutation();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(threadId);
    expect(jotaiStore.get(hasInitializedAgentChatThreadsState.atom)).toBe(true);
    expect(jotaiStore.get(skipMessagesSkeletonUntilLoadedState.atom)).toBe(
      true,
    );
    expect(
      jotaiStore.get(
        agentChatIsAwaitingFirstChunkComponentFamilyState.atomFamily({
          instanceId: AGENT_CHAT_INSTANCE_ID,
          familyKey: { threadId },
        }),
      ),
    ).toBe(true);
    expect(
      jotaiStore.get(
        currentAiChatThreadTitleComponentFamilyState.atomFamily({
          instanceId: AGENT_CHAT_INSTANCE_ID,
          familyKey: { threadId },
        }),
      ),
    ).toBe(threadTitle);
  });

  it('should select the thread without awaiting a first chunk when the chat was already started', async () => {
    renderKickoffEffect([buildKickoffMock({ outcome: 'ALREADY_STARTED' })]);

    await flushMutation();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(threadId);
    expect(
      jotaiStore.get(
        agentChatIsAwaitingFirstChunkComponentFamilyState.atomFamily({
          instanceId: AGENT_CHAT_INSTANCE_ID,
          familyKey: { threadId },
        }),
      ),
    ).toBe(false);
  });

  it('should pass the stored enrichment as the companyContext variable when one is stored', async () => {
    jotaiStore.set(companyEnrichmentState.atom, enrichment);

    const capturedVariablesList: Record<string, unknown>[] = [];
    renderKickoffEffect([
      buildKickoffMock({
        outcome: 'STARTED',
        captureVariables: (variables) => {
          capturedVariablesList.push(variables);
        },
      }),
    ]);

    await flushMutation();

    expect(capturedVariablesList[0].companyContext).toEqual(enrichment);
  });

  it('should send an undefined companyContext variable when no enrichment is stored', async () => {
    const capturedVariablesList: Record<string, unknown>[] = [];
    renderKickoffEffect([
      buildKickoffMock({
        outcome: 'STARTED',
        captureVariables: (variables) => {
          capturedVariablesList.push(variables);
        },
      }),
    ]);

    await flushMutation();

    expect(capturedVariablesList.length).toBeGreaterThan(0);
    expect(capturedVariablesList[0].companyContext).toBeUndefined();
  });

  it('should not touch the chat state when the chat is unavailable', async () => {
    renderKickoffEffect([buildKickoffMock({ outcome: 'UNAVAILABLE' })]);

    await flushMutation();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBeNull();
    expect(jotaiStore.get(hasInitializedAgentChatThreadsState.atom)).toBe(
      false,
    );
    expect(jotaiStore.get(skipMessagesSkeletonUntilLoadedState.atom)).toBe(
      false,
    );
  });

  it('should retry on a later effect run when the mutation fails', async () => {
    let callCount = 0;

    renderKickoffEffect([
      {
        request: { query: StartWorkspaceSetupChatDocument },
        error: new Error('Network error'),
      },
      buildKickoffMock({
        outcome: 'STARTED',
        countCall: () => {
          callCount += 1;
        },
      }),
    ]);

    await flushMutation();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBeNull();

    await act(async () => {
      jotaiStore.set(isCompanyEnrichmentFetchInFlightState.atom, true);
    });
    await act(async () => {
      jotaiStore.set(isCompanyEnrichmentFetchInFlightState.atom, false);
    });
    await flushMutation();

    expect(callCount).toBe(1);
    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(threadId);
  });
});
