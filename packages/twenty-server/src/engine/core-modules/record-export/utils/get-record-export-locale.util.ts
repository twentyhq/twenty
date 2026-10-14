import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import {
  type ApiKeyWorkspaceAuthContext,
  type UserWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const getRecordExportLocale = (
  authContext: UserWorkspaceAuthContext | ApiKeyWorkspaceAuthContext,
) =>
  isUserAuthContext(authContext)
    ? authContext.workspaceMember.locale
    : SOURCE_LOCALE;
