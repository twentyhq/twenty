import { type ToolInput } from '@/ai/types/ToolInput';
import { isDefined } from 'twenty-shared/utils';

const extractSearchQuery = (input?: ToolInput): string => {
  if (!input) {
    return '';
  }

  if ('query' in input && typeof input.query === 'string') {
    return input.query;
  }

  if (
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

export const getWebSearchToolDisplayMessage = (
  input?: ToolInput,
  isSearchFinished?: boolean,
): string => {
  const query = extractSearchQuery(input);
  const action = isSearchFinished ? 'Searched' : 'Searching';

  return query ? `${action} the web for '${query}'` : `${action} the web`;
};
