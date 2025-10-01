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

export const getToolDisplayMessage = (
  input: ToolInput,
  toolName: string,
  isFinished?: boolean,
): string => {
  if (toolName === 'web_search') {
    const query = extractSearchQuery(input);
    const action = isFinished ? 'Searched' : 'Searching';
    return query ? `${action} the web for '${query}'` : `${action} the web`;
  }

  return extractLoadingMessage(input);
};
