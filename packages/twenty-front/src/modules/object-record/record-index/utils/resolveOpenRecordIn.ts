import {
  type ResolvedOpenRecordIn,
  ViewOpenRecordIn,
} from 'twenty-shared/types';

type ResolveOpenRecordInArgs = {
  openRecordInViewSetting: ViewOpenRecordIn;
  openRecordInUserPreference: ResolvedOpenRecordIn;
  canDisplaySidePanel: boolean;
};

// The view setting is an intent, not a decision: it can defer to the member's
// own preference, and the side panel is only a real destination when there is
// room to display it next to the record list.
export const resolveOpenRecordIn = ({
  openRecordInViewSetting,
  openRecordInUserPreference,
  canDisplaySidePanel,
}: ResolveOpenRecordInArgs): ResolvedOpenRecordIn => {
  const requestedOpenRecordIn =
    openRecordInViewSetting === ViewOpenRecordIn.USER_PREFERENCE
      ? openRecordInUserPreference
      : openRecordInViewSetting;

  return requestedOpenRecordIn === ViewOpenRecordIn.SIDE_PANEL &&
    canDisplaySidePanel
    ? ViewOpenRecordIn.SIDE_PANEL
    : ViewOpenRecordIn.RECORD_PAGE;
};
