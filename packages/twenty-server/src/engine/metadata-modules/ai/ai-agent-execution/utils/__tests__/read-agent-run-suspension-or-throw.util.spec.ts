import { type AgentRunSummary } from 'twenty-shared/ai';

import { type AgentRunSuspension } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-suspension.type';
import { readAgentRunSuspensionOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/read-agent-run-suspension-or-throw.util';
import { AiException } from 'src/engine/metadata-modules/ai/ai.exception';

const SUSPENSION: AgentRunSuspension = {
  caller: {
    type: 'AGENT_TRIGGER',
    ref: { agentId: 'agent-id', triggerId: 'trigger-id' },
  },
  runSpec: {
    agentId: 'agent-id',
    title: 'Follow up',
    baseSystemPrompt: 'Follow up with the conversation',
    instructions: null,
    capabilities: { canAskHumans: true },
  },
  summary: null,
  continuationCount: 0,
};

const SUMMARY: AgentRunSummary = {
  modelId: 'test-model',
  usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
  cost: { totalCostInDollars: 0, creditsUsedMicro: 0 },
  nativeWebSearchCallCount: 0,
  toolCalls: [
    {
      toolName: 'wait_for_event',
      toolCallId: 'tool-call-id',
      state: 'success',
      input: { eventName: 'opportunity.deleted' },
      output: { status: 'pending' },
    },
  ],
  durationMs: 1,
};

describe('readAgentRunSuspensionOrThrow', () => {
  it('reads a legacy suspension without a continuation checkpoint', () => {
    expect(readAgentRunSuspensionOrThrow(SUSPENSION)).toEqual(SUSPENSION);
  });

  it('preserves inline configuration and a recorded continuation result', () => {
    const suspension: AgentRunSuspension = {
      ...SUSPENSION,
      caller: {
        type: 'WORKFLOW_STEP',
        ref: {
          workflowRunId: 'workflow-run-id',
          stepId: 'step-id',
          request: { source: 'inbox' },
        },
      },
      runSpec: {
        ...SUSPENSION.runSpec,
        agentId: null,
        inlineConfig: {
          applicationId: 'application-id',
          instructions: 'Follow up',
          modelId: 'test-model',
          modelConfiguration: null,
          promptCacheKey: 'prompt-cache-key',
          scope: null,
        },
      },
      summary: SUMMARY,
      continuationCount: 1,
      continuationCompletion: {
        turnId: 'continuation-turn-id',
        execution: {
          result: {
            answer: 'The update is ready',
            details: { recordId: 'record-id' },
          },
          stopReason: null,
          isPaused: true,
        },
        summary: SUMMARY,
        waitCondition: {
          type: 'EVENT',
          eventName: 'opportunity.deleted',
          recordId: 'record-id',
        },
        isAborted: false,
        isAwaitingAnswer: false,
        questionMessageId: null,
        settledOutcome: { status: 'SUSPENDED' },
      },
    };

    expect(readAgentRunSuspensionOrThrow(suspension)).toEqual(suspension);
  });

  it.each([
    null,
    { ...SUSPENSION, caller: { type: 'AGENT_TRIGGER', ref: null } },
    {
      ...SUSPENSION,
      continuationCompletion: { turnId: 'continuation-turn-id' },
    },
  ])('rejects malformed persisted state %j', (payload) => {
    expect(() => readAgentRunSuspensionOrThrow(payload)).toThrow(AiException);
  });
});
