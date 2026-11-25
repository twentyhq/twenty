import { isObject } from '@sniptt/guards';
import { agentRunSummarySchema } from 'twenty-shared/ai';
import { pendingWakeUpConditionSchema } from 'twenty-shared/pending-wake-up';
import {
  agentResponseFormatSchema,
  workflowAiAgentInlineConfigSchema,
} from 'twenty-shared/workflow';
import { z } from 'zod';

import { type AgentRunContinuationCompletion } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-continuation-completion.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type AgentRunSuspension } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-suspension.type';
import { parseAgentInputOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/parse-agent-input-or-throw.util';

const INLINE_CONFIG_SCHEMA = workflowAiAgentInlineConfigSchema
  .required()
  .extend({
    modelConfiguration:
      workflowAiAgentInlineConfigSchema.shape.modelConfiguration
        .unwrap()
        .nullable(),
    scope: workflowAiAgentInlineConfigSchema.shape.scope.unwrap().nullable(),
    promptCacheKey: z.string(),
    applicationId: z.string(),
  });

const RUN_SPEC_SCHEMA: z.ZodType<AgentRunSpec> = z.intersection(
  z.object({
    title: z.string(),
    baseSystemPrompt: z.string(),
    instructions: z.string().nullable(),
    responseFormat: agentResponseFormatSchema.optional(),
    capabilities: z.object({ canAskHumans: z.boolean() }),
    additionalExcludedToolNames: z.array(z.string()).optional(),
    toolLoadingStrategy: z.enum(['preload', 'lazy']).optional(),
  }),
  z.union([
    z.object({ agentId: z.string() }),
    z.object({ agentId: z.null(), inlineConfig: INLINE_CONFIG_SCHEMA }),
  ]),
);

const CONTINUATION_COMPLETION_SCHEMA: z.ZodType<AgentRunContinuationCompletion> =
  z.object({
    turnId: z.string(),
    execution: z.object({
      result: z.custom<object>(isObject),
      stopReason: z.enum(['workspaceAllowance', 'userAllowance']).nullable(),
      isPaused: z.boolean(),
    }),
    summary: agentRunSummarySchema,
    waitCondition: pendingWakeUpConditionSchema.nullable(),
    isAborted: z.boolean(),
    isAwaitingAnswer: z.boolean(),
    questionMessageId: z.string().nullable(),
    settledOutcome: z
      .discriminatedUnion('status', [
        z.object({
          status: z.literal('COMPLETED'),
          result: z.custom<object>(isObject),
        }),
        z.object({ status: z.literal('SUSPENDED') }),
        z.object({ status: z.literal('FAILED'), error: z.string() }),
      ])
      .optional(),
  });

const SUSPENSION_SCHEMA: z.ZodType<AgentRunSuspension> = z.object({
  caller: z.object({
    type: z.string(),
    ref: z.record(z.string(), z.unknown()),
  }),
  runSpec: RUN_SPEC_SCHEMA,
  summary: agentRunSummarySchema.nullable(),
  continuationCount: z.number().int().nonnegative(),
  continuationCompletion: CONTINUATION_COMPLETION_SCHEMA.optional(),
});

export const readAgentRunSuspensionOrThrow = (
  payload: unknown,
): AgentRunSuspension =>
  parseAgentInputOrThrow({
    schema: SUSPENSION_SCHEMA,
    input: payload,
    label: 'agent run suspension',
  });
