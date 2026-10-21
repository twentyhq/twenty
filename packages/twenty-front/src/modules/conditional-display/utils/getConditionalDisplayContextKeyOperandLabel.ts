import { t } from '@lingui/core/macro';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalDisplayContextKeyOperandLabel = (
  contextKey: ConditionalDisplayContextKey,
): string => {
  switch (contextKey) {
    case 'currentRoleId':
      return t`Is any of`;
    case 'currentWorkspaceMemberId':
    case 'device':
      return t`Is`;
    default:
      return assertUnreachable(contextKey);
  }
};
