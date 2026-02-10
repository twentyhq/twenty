import { type ToolInput } from '@/ai/types/ToolInput';
import { isDefined } from 'twenty-shared/utils';

const extractSearchQuery = (input: ToolInput): string => {
  if (!input) {
    return '';
  }

  if (
    typeof input === 'object' &&
    'query' in input &&
    typeof input.query === 'string'
  ) {
    return input.query;
  }

  if (
    typeof input === 'object' &&
    'action' in input &&
    isDefined(input.action) &&
    typeof input.action === 'object' &&
    'query' in input.action &&
    typeof input.action.query === 'string'
  ) {
    return input.action.query;
  }

  return '';
};

const extractLoadingMessage = (input: ToolInput): string => {
  if (
    isDefined(input) &&
    typeof input === 'object' &&
    'loadingMessage' in input &&
    typeof input.loadingMessage === 'string'
  ) {
    return input.loadingMessage;
  }

  return 'Processing...';
};

export const resolveToolInput = (
  input: ToolInput,
  toolName: string,
): { resolvedInput: ToolInput; resolvedToolName: string } => {
  if (
    toolName === 'execute_tool' &&
    isDefined(input) &&
    typeof input === 'object' &&
    'toolName' in input &&
    'arguments' in input
  ) {
    return {
      resolvedInput: input.arguments as ToolInput,
      resolvedToolName: String(input.toolName),
    };
  }

  return { resolvedInput: input, resolvedToolName: toolName };
};

const extractLearnToolNames = (input: ToolInput): string => {
  if (
    isDefined(input) &&
    typeof input === 'object' &&
    'toolNames' in input &&
    Array.isArray(input.toolNames)
  ) {
    return input.toolNames.join(', ');
  }

  return '';
};

export const getToolDisplayMessage = (
  input: ToolInput,
  toolName: string,
  isFinished?: boolean,
): string => {
  const { resolvedInput, resolvedToolName } = resolveToolInput(input, toolName);

  if (resolvedToolName === 'web_search') {
    const query = extractSearchQuery(resolvedInput);
    const action = isFinished ? 'Searched' : 'Searching';

    return query ? `${action} the web for '${query}'` : `${action} the web`;
  }

  if (resolvedToolName === 'learn_tools') {
    const names = extractLearnToolNames(resolvedInput);
    const action = isFinished ? 'Learned' : 'Learning';

    return names ? `${action} ${names}` : `${action} tools...`;
  }

  return extractLoadingMessage(resolvedInput);
};
