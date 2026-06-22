import { t } from '@lingui/core/macro';

import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import { type ToolLabel } from '@/ai/hooks/useToolLabel';
import { type ToolInput } from '@/ai/types/ToolInput';
import { getToolOutputLabelEntries } from '@/ai/utils/getToolOutputLabelEntries';
import { isDefined } from 'twenty-shared/utils';

const DirectQuerySchema = z.object({ query: z.string() });
const NestedQuerySchema = z.object({
  action: z.object({ query: z.string() }),
});
const ModelGeneratedLabelSchema = z.object({
  loadingMessage: z.string(),
  completedMessage: z.string().optional(),
});
const ExecuteToolSchema = z.object({
  toolName: z.coerce.string(),
  arguments: z.unknown(),
});
const LearnToolsSchema = z.object({ toolNames: z.array(z.string()) });
const LoadSkillsSchema = z.object({ skillNames: z.array(z.string()) });

const extractSearchQuery = (input: ToolInput): string => {
  const direct = DirectQuerySchema.safeParse(input);

  if (direct.success) {
    return direct.data.query;
  }

  const nested = NestedQuerySchema.safeParse(input);

  if (nested.success) {
    return nested.data.action.query;
  }

  return '';
};

export const resolveToolInput = (
  input: ToolInput,
  toolName: string,
): { resolvedInput: ToolInput; resolvedToolName: string } => {
  if (toolName !== 'execute_tool') {
    return { resolvedInput: input, resolvedToolName: toolName };
  }

  const parsed = ExecuteToolSchema.safeParse(input);

  if (!parsed.success) {
    return { resolvedInput: input, resolvedToolName: toolName };
  }

  return {
    resolvedInput: parsed.data.arguments as ToolInput,
    resolvedToolName: parsed.data.toolName,
  };
};

const pickByStatus = (
  isFinished: boolean,
  finished: string,
  inProgress: string,
): string => (isFinished ? finished : inProgress);

type ToolCallContext = {
  input: ToolInput;
  toolName: string;
  isFinished: boolean;
  labelMap: Map<string, ToolLabel>;
  output?: unknown;
};

type ToolLabelResolver = (context: ToolCallContext) => string;

const resolveName = (
  name: string,
  labelMap: Map<string, ToolLabel>,
  output?: unknown,
): string => {
  const indexLabel = labelMap.get(name)?.label;

  if (isDefined(indexLabel)) {
    return indexLabel;
  }

  const outputEntry = getToolOutputLabelEntries(output).find(
    (entry) => entry.name === name,
  );

  return outputEntry?.label ?? name;
};

const toLabelList = (
  names: string[],
  labelMap: Map<string, ToolLabel>,
  output?: unknown,
): string =>
  names.map((name) => resolveName(name, labelMap, output)).join(', ');

const webSearchResolver: ToolLabelResolver = ({ input, isFinished }) => {
  const query = extractSearchQuery(input);

  if (isNonEmptyString(query)) {
    return pickByStatus(
      isFinished,
      t`Searched the web for ${query}`,
      t`Searching the web for ${query}`,
    );
  }

  return pickByStatus(isFinished, t`Searched the web`, t`Searching the web`);
};

const learnToolsResolver: ToolLabelResolver = ({
  input,
  isFinished,
  labelMap,
  output,
}) => {
  const parsed = LearnToolsSchema.safeParse(input);
  const names = parsed.success
    ? toLabelList(parsed.data.toolNames, labelMap, output)
    : '';

  if (isNonEmptyString(names)) {
    return pickByStatus(isFinished, t`Learned ${names}`, t`Learning ${names}`);
  }

  return pickByStatus(isFinished, t`Learned tools`, t`Learning tools...`);
};

const loadSkillsResolver: ToolLabelResolver = ({
  input,
  isFinished,
  labelMap,
  output,
}) => {
  const parsed = LoadSkillsSchema.safeParse(input);
  const names = parsed.success
    ? toLabelList(parsed.data.skillNames, labelMap, output)
    : '';

  if (isNonEmptyString(names)) {
    return pickByStatus(isFinished, t`Loaded ${names}`, t`Loading ${names}`);
  }

  return pickByStatus(isFinished, t`Loaded skills`, t`Loading skills...`);
};

const defaultResolver: ToolLabelResolver = ({
  toolName,
  isFinished,
  labelMap,
}) => {
  const labels = labelMap.get(toolName);
  const displayName = labels?.label ?? toolName;

  return pickByStatus(
    isFinished,
    labels?.completedLabel ?? t`Ran ${displayName}`,
    labels?.inProgressLabel ?? t`Running ${displayName}`,
  );
};

const modelGeneratedLabelResolver: ToolLabelResolver = ({
  input,
  isFinished,
}) => {
  const parsed = ModelGeneratedLabelSchema.safeParse(input);

  if (parsed.success) {
    return pickByStatus(
      isFinished,
      parsed.data.completedMessage ?? parsed.data.loadingMessage,
      parsed.data.loadingMessage,
    );
  }

  return pickByStatus(isFinished, t`Ran code`, t`Running code`);
};

const executeToolResolver: ToolLabelResolver = (context) => {
  const parsed = ExecuteToolSchema.safeParse(context.input);

  if (!parsed.success) {
    return defaultResolver(context);
  }

  return resolveToolDisplayMessage({
    ...context,
    input: parsed.data.arguments as ToolInput,
    toolName: parsed.data.toolName,
  });
};

const TOOL_LABEL_RESOLVERS: Record<string, ToolLabelResolver> = {
  execute_tool: executeToolResolver,
  web_search: webSearchResolver,
  app_exa_web_search: webSearchResolver,
  learn_tools: learnToolsResolver,
  load_skills: loadSkillsResolver,
  code_interpreter: modelGeneratedLabelResolver,
};

export const resolveToolDisplayMessage = (context: ToolCallContext): string => {
  const resolver = TOOL_LABEL_RESOLVERS[context.toolName] ?? defaultResolver;

  return resolver(context);
};
