import { type AgentResponseFormat, type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

// What a step's hidden agent held, which the step now carries itself
export type StepAgentInlineConfig = {
  instructions: string;
  modelId: string;
  modelConfiguration: {
    webSearch?: { enabled: boolean };
    twitterSearch?: { enabled: boolean };
  } | null;
  responseFormat: AgentResponseFormat | null;
  // null when the agent had no role, so the step gets no data tools as before
  scope: AiRunScope | null;
};

type StoredStep = {
  id?: unknown;
  type?: unknown;
  settings?: { input?: Record<string, unknown> } & Record<string, unknown>;
} & Record<string, unknown>;

const isStoredStep = (step: unknown): step is StoredStep =>
  typeof step === 'object' && step !== null && !Array.isArray(step);

// the agent's text format is what a step without one already gets, so only a json one is worth carrying
export const resolveInlinedResponseFormat = ({
  stepResponseFormat,
  agentResponseFormat,
}: {
  stepResponseFormat: unknown;
  agentResponseFormat: AgentResponseFormat | null;
}): unknown =>
  isDefined(stepResponseFormat)
    ? stepResponseFormat
    : agentResponseFormat?.type === 'json'
      ? agentResponseFormat
      : undefined;

export const inlineWorkflowStepAgentInput = ({
  input,
  inlineConfig,
}: {
  input: Record<string, unknown>;
  inlineConfig: StepAgentInlineConfig;
}): Record<string, unknown> => {
  const { agentId: _agentId, responseFormat, ...rest } = input;
  const inlinedResponseFormat = resolveInlinedResponseFormat({
    stepResponseFormat: responseFormat,
    agentResponseFormat: inlineConfig.responseFormat,
  });

  return {
    ...rest,
    instructions: inlineConfig.instructions,
    modelId: inlineConfig.modelId,
    ...(isDefined(inlineConfig.modelConfiguration)
      ? { modelConfiguration: inlineConfig.modelConfiguration }
      : {}),
    ...(isDefined(inlineConfig.scope) ? { scope: inlineConfig.scope } : {}),
    ...(isDefined(inlinedResponseFormat)
      ? { responseFormat: inlinedResponseFormat }
      : {}),
  };
};

// Steps on an agent the command does not inline, or on no hidden agent, are left as they are
export const inlineWorkflowStepAgents = ({
  steps,
  inlineConfigByAgentId,
  keptAgentIds,
}: {
  steps: unknown;
  inlineConfigByAgentId: ReadonlyMap<string, StepAgentInlineConfig>;
  keptAgentIds: ReadonlySet<string>;
}): { steps: unknown; hasChanged: boolean; keptStepIds: string[] } => {
  if (!Array.isArray(steps)) {
    return { steps, hasChanged: false, keptStepIds: [] };
  }

  let hasChanged = false;
  const keptStepIds: string[] = [];

  const rewrittenSteps = steps.map((step: unknown) => {
    if (!isStoredStep(step) || step.type !== 'AI_AGENT') {
      return step;
    }

    const input = step.settings?.input;
    const agentId = input?.agentId;

    if (!isDefined(input) || typeof agentId !== 'string') {
      return step;
    }

    if (keptAgentIds.has(agentId)) {
      keptStepIds.push(String(step.id));

      return step;
    }

    const inlineConfig = inlineConfigByAgentId.get(agentId);

    if (!isDefined(inlineConfig)) {
      return step;
    }

    hasChanged = true;

    return {
      ...step,
      settings: {
        ...step.settings,
        input: inlineWorkflowStepAgentInput({ input, inlineConfig }),
      },
    };
  });

  return { steps: rewrittenSteps, hasChanged, keptStepIds };
};

type StoredModelConfiguration = {
  webSearch?: { enabled?: unknown } | null;
  twitterSearch?: { enabled?: unknown } | null;
} | null;

// The step only takes whether each native tool is on, as the runtime only reads that
export const normalizeStepModelConfiguration = (
  modelConfiguration: StoredModelConfiguration,
): StepAgentInlineConfig['modelConfiguration'] => {
  const webSearch = modelConfiguration?.webSearch?.enabled;
  const twitterSearch = modelConfiguration?.twitterSearch?.enabled;

  if (typeof webSearch !== 'boolean' && typeof twitterSearch !== 'boolean') {
    return null;
  }

  return {
    ...(typeof webSearch === 'boolean' ? { webSearch: { enabled: webSearch } } : {}),
    ...(typeof twitterSearch === 'boolean'
      ? { twitterSearch: { enabled: twitterSearch } }
      : {}),
  };
};
