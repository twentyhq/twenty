import { t } from '@lingui/core/macro';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalDisplayContextKeyLabel = (
  contextKey: ConditionalDisplayContextKey,
): string => {
  switch (contextKey) {
    case 'currentRoleId':
      return t`Role`;
    case 'currentWorkspaceMemberId':
      return t`Workspace member`;
    case 'device':
      return t`Device`;
    default:
      return assertUnreachable(contextKey);
  }
};
