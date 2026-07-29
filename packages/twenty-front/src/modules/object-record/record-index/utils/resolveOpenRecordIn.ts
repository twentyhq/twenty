import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';

type ResolveOpenRecordInArgs = {
  openRecordInViewSetting: ViewOpenRecordIn;
  objectNameSingular: string;
  canDisplaySidePanel: boolean;
};

// The view setting is an intent, not a decision: the side panel is only a real
// destination when there is room to display it next to the record list, and
// when the object has a side panel to display at all.
export const resolveOpenRecordIn = ({
  openRecordInViewSetting,
  objectNameSingular,
  canDisplaySidePanel,
}: ResolveOpenRecordInArgs): ViewOpenRecordIn =>
  openRecordInViewSetting === ViewOpenRecordIn.SIDE_PANEL &&
  canDisplaySidePanel &&
  canOpenObjectInSidePanel(objectNameSingular)
    ? ViewOpenRecordIn.SIDE_PANEL
    : ViewOpenRecordIn.RECORD_PAGE;
