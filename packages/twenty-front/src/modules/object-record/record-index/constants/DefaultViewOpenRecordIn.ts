import { ViewOpenRecordIn } from 'twenty-shared/types';

// Used where no view is in scope, so there is no setting to honour: a record
// chip in the command menu or in a mention has no list behind it.
export const DEFAULT_VIEW_OPEN_RECORD_IN = ViewOpenRecordIn.USER_PREFERENCE;
