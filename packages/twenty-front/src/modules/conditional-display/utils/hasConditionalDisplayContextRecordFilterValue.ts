import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import {
  assertUnreachable,
  isNonEmptyArray,
  parseJson,
} from 'twenty-shared/utils';

export const hasConditionalDisplayContextRecordFilterValue = ({
  contextKey,
  value,
}: {
  contextKey: ConditionalDisplayContextKey;
  value: string | null | undefined;
}): boolean => {
  switch (contextKey) {
    case 'currentRoleId':
    case 'device':
      return isNonEmptyArray(parseJson<unknown[]>(value));
    case 'currentWorkspaceMemberId':
      return isNonEmptyString(value);
    default:
      return assertUnreachable(contextKey);
  }
};
