import {
  type ConditionalDisplayContextKey,
  type FilterableAndTSVectorFieldType,
} from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalDisplayContextRecordFilterType = (
  contextKey: ConditionalDisplayContextKey,
): FilterableAndTSVectorFieldType => {
  switch (contextKey) {
    case 'currentRoleId':
    case 'device':
      return 'SELECT';
    case 'currentWorkspaceMemberId':
      return 'RELATION';
    default:
      return assertUnreachable(contextKey);
  }
};
