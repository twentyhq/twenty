import { ViewOpenRecordIn } from '~/generated-metadata/graphql';

// Used where no view is in scope, so there is no setting to honour: a record
// chip in the command menu or in a mention has no list behind it.
export const DEFAULT_VIEW_OPEN_RECORD_IN = ViewOpenRecordIn.SIDE_PANEL;
