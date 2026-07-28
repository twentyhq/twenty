import {
  type ResolvedOpenRecordIn,
  ViewOpenRecordIn,
} from 'twenty-shared/types';

// Used before the workspace member has loaded, and for members created before
// the preference existed.
export const DEFAULT_OPEN_RECORD_IN_PREFERENCE: ResolvedOpenRecordIn =
  ViewOpenRecordIn.SIDE_PANEL;
