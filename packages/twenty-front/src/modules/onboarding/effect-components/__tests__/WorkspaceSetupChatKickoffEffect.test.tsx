import { MockedProvider } from '@apollo/client/testing/react';
import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { StrictMode } from 'react';
import { WORKSPACE_SETUP_CHAT_THREAD_TITLE } from 'twenty-shared/ai';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { hasInitializedAgentChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { WorkspaceSetupChatKickoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect';
import { StartWorkspaceSetupChatDocument } from '~/generated-metadata/graphql';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';
import { workspaceSetupChatRequestedWorkspaceIdState } from '@/onboarding/states/workspaceSetupChatRequestedWorkspaceIdState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const threadId = '20202020-aaaa-4aaa-8aaa-202020202020';
const workspaceId = mockCurrentWorkspace.id;

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
  outcome: 'started' | 'alreadyStarted' | 'unavailable';
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
          threadId: outcome === 'unavailable' ? null : threadId,
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
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
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
        outcome: 'started',
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
        outcome: 'started',
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
    expect(
      jotaiStore.get(workspaceSetupChatRequestedWorkspaceIdState.atom),
    ).toBe(workspaceId);
  });

  it('should select the thread and mark it awaiting the first chunk when the chat is started', async () => {
    renderKickoffEffect([buildKickoffMock({ outcome: 'started' })]);

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
    ).toBe(WORKSPACE_SETUP_CHAT_THREAD_TITLE);
  });

  it('should select the thread without awaiting a first chunk when the chat was already started', async () => {
    renderKickoffEffect([buildKickoffMock({ outcome: 'alreadyStarted' })]);

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

  it('should not call the mutation when a workspace setup chat was already requested for this workspace', async () => {
    jotaiStore.set(
      workspaceSetupChatRequestedWorkspaceIdState.atom,
      workspaceId,
    );

    let callCount = 0;
    renderKickoffEffect([
      buildKickoffMock({
        outcome: 'started',
        countCall: () => {
          callCount += 1;
        },
      }),
    ]);

    await flushMutation();

    expect(callCount).toBe(0);
    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBeNull();
  });

  it('should call the mutation when the guard was consumed by another workspace', async () => {
    jotaiStore.set(
      workspaceSetupChatRequestedWorkspaceIdState.atom,
      '20202020-bbbb-4bbb-8bbb-202020202020',
    );

    let callCount = 0;
    renderKickoffEffect([
      buildKickoffMock({
        outcome: 'started',
        countCall: () => {
          callCount += 1;
        },
      }),
    ]);

    await flushMutation();

    expect(callCount).toBe(1);
    expect(
      jotaiStore.get(workspaceSetupChatRequestedWorkspaceIdState.atom),
    ).toBe(workspaceId);
  });

  it('should pass the stored enrichment as the companyContext variable when one is stored', async () => {
    jotaiStore.set(companyEnrichmentState.atom, enrichment);

    const capturedVariablesList: Record<string, unknown>[] = [];
    renderKickoffEffect([
      buildKickoffMock({
        outcome: 'started',
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
        outcome: 'started',
        captureVariables: (variables) => {
          capturedVariablesList.push(variables);
        },
      }),
    ]);

    await flushMutation();

    expect(capturedVariablesList.length).toBeGreaterThan(0);
    expect(capturedVariablesList[0].companyContext).toBeUndefined();
  });

  it('should keep the guard consumed when the chat is unavailable', async () => {
    renderKickoffEffect([buildKickoffMock({ outcome: 'unavailable' })]);

    await flushMutation();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBeNull();
    expect(jotaiStore.get(hasInitializedAgentChatThreadsState.atom)).toBe(
      false,
    );
    expect(jotaiStore.get(skipMessagesSkeletonUntilLoadedState.atom)).toBe(
      false,
    );
    expect(
      jotaiStore.get(workspaceSetupChatRequestedWorkspaceIdState.atom),
    ).toBe(workspaceId);
  });

  it('should release the guard for a later retry when the mutation fails', async () => {
    renderKickoffEffect([
      {
        request: { query: StartWorkspaceSetupChatDocument },
        error: new Error('Network error'),
      },
    ]);

    await flushMutation();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBeNull();
    expect(jotaiStore.get(hasInitializedAgentChatThreadsState.atom)).toBe(
      false,
    );
    expect(
      jotaiStore.get(workspaceSetupChatRequestedWorkspaceIdState.atom),
    ).toBeNull();
  });

  it('should not call the mutation when no current workspace is set', async () => {
    jotaiStore.set(currentWorkspaceState.atom, null);

    let callCount = 0;
    renderKickoffEffect([
      buildKickoffMock({
        outcome: 'started',
        countCall: () => {
          callCount += 1;
        },
      }),
    ]);

    await flushMutation();

    expect(callCount).toBe(0);
    expect(
      jotaiStore.get(workspaceSetupChatRequestedWorkspaceIdState.atom),
    ).toBeNull();
  });
});
