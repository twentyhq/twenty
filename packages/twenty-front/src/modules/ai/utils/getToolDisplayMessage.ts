import { t } from '@lingui/core/macro';

import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import { type ToolInput } from '@/ai/types/ToolInput';
import { formatToolDisplayName } from '@/ai/utils/formatToolDisplayName';
import { isDefined } from 'twenty-shared/utils';

const DirectQuerySchema = z.object({ query: z.string() });
const NestedQuerySchema = z.object({
  action: z.object({ query: z.string() }),
});
const CustomStatusMessageSchema = z.object({
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

const extractCustomStatusMessages = (
  input: ToolInput,
): { loadingMessage: string; completedMessage: string | null } | null => {
  const parsed = CustomStatusMessageSchema.safeParse(input);

  if (!parsed.success) {
    return null;
  }

  return {
    loadingMessage: parsed.data.loadingMessage,
    completedMessage: parsed.data.completedMessage ?? null,
  };
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

const extractLearnToolNames = (input: ToolInput): string => {
  const parsed = LearnToolsSchema.safeParse(input);

  return parsed.success
    ? parsed.data.toolNames.map(formatToolDisplayName).join(', ')
    : '';
};

const extractSkillNames = (input: ToolInput): string => {
  const parsed = LoadSkillsSchema.safeParse(input);

  return parsed.success ? parsed.data.skillNames.join(', ') : '';
};

export const getToolDisplayMessage = (
  input: ToolInput,
  toolName: string,
  isFinished?: boolean,
): string => {
  const { resolvedInput, resolvedToolName } = resolveToolInput(input, toolName);

  const byStatus = (finished: string, inProgress: string): string =>
    isFinished ? finished : inProgress;

  const customMessages =
    extractCustomStatusMessages(input) ??
    extractCustomStatusMessages(resolvedInput);

  if (isDefined(customMessages)) {
    return byStatus(
      customMessages.completedMessage ?? customMessages.loadingMessage,
      customMessages.loadingMessage,
    );
  }

  if (
    resolvedToolName === 'web_search' ||
    resolvedToolName === 'app_exa_web_search'
  ) {
    const query = extractSearchQuery(resolvedInput);

    if (isNonEmptyString(query)) {
      return byStatus(
        t`Searched the web for ${query}`,
        t`Searching the web for ${query}`,
      );
    }

    return byStatus(t`Searched the web`, t`Searching the web`);
  }

  if (resolvedToolName === 'learn_tools') {
    const names = extractLearnToolNames(resolvedInput);

    if (isNonEmptyString(names)) {
      return byStatus(t`Learned ${names}`, t`Learning ${names}`);
    }

    return byStatus(t`Learned tools`, t`Learning tools...`);
  }

  if (resolvedToolName === 'load_skills') {
    const names = extractSkillNames(resolvedInput);

    if (isNonEmptyString(names)) {
      return byStatus(t`Loaded ${names}`, t`Loading ${names}`);
    }

    return byStatus(t`Loaded skills`, t`Loading skills...`);
  }

  const formattedName = formatToolDisplayName(resolvedToolName);

  return byStatus(t`Ran ${formattedName}`, t`Running ${formattedName}`);
};
