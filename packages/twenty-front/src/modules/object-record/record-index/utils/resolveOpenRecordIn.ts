import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import {
  type ResolvedOpenRecordIn,
  ViewOpenRecordIn,
} from 'twenty-shared/types';

type ResolveOpenRecordInArgs = {
  openRecordInViewSetting: ViewOpenRecordIn;
  openRecordInUserPreference: ResolvedOpenRecordIn;
  objectNameSingular: string;
  canDisplaySidePanel: boolean;
};

// The view setting is an intent, not a decision: it can defer to the member's
// own preference, and the side panel is only a real destination when there is
// room to display it next to the record list and the object has one to show.
export const resolveOpenRecordIn = ({
  openRecordInViewSetting,
  openRecordInUserPreference,
  objectNameSingular,
  canDisplaySidePanel,
}: ResolveOpenRecordInArgs): ResolvedOpenRecordIn => {
  const requestedOpenRecordIn =
    openRecordInViewSetting === ViewOpenRecordIn.USER_PREFERENCE
      ? openRecordInUserPreference
      : openRecordInViewSetting;

  return requestedOpenRecordIn === ViewOpenRecordIn.SIDE_PANEL &&
    canDisplaySidePanel &&
    canOpenObjectInSidePanel(objectNameSingular)
    ? ViewOpenRecordIn.SIDE_PANEL
    : ViewOpenRecordIn.RECORD_PAGE;
};
