import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type RecordExportAuthContext } from 'src/engine/core-modules/record-export/types/record-export-auth-context.type';

export const getRecordExportLocale = (authContext: RecordExportAuthContext) =>
  isUserAuthContext(authContext)
    ? authContext.workspaceMember.locale
    : SOURCE_LOCALE;
