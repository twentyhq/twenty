import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { computeCallRecordingTabPosition } from 'src/database/commands/upgrade-version-command/2-31/utils/compute-call-recording-tab-position.util';
import { TAB_POSITION_GAP } from 'src/database/commands/upgrade-version-command/2-31/utils/tab-position-gap.constant';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';

const CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .callRecording.universalIdentifier;

export const computeSummaryTabPosition = ({
  existingPageLayoutTabs,
}: {
  existingPageLayoutTabs: Pick<
    FlatPageLayoutTab,
    'deletedAt' | 'isActive' | 'position' | 'universalIdentifier'
  >[];
}): number => {
  const existingNonDeletedPageLayoutTabs = existingPageLayoutTabs.filter(
    (pageLayoutTab) => !isDefined(pageLayoutTab.deletedAt),
  );
  const callRecordingTab = existingNonDeletedPageLayoutTabs.find(
    (pageLayoutTab) =>
      pageLayoutTab.universalIdentifier ===
        CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER && pageLayoutTab.isActive,
  );

  if (!isDefined(callRecordingTab)) {
    return computeCallRecordingTabPosition({ existingPageLayoutTabs });
  }

  const previousTab = existingNonDeletedPageLayoutTabs
    .filter(
      (pageLayoutTab) => pageLayoutTab.position < callRecordingTab.position,
    )
    .sort(
      (leftPageLayoutTab, rightPageLayoutTab) =>
        rightPageLayoutTab.position - leftPageLayoutTab.position,
    )[0];

  if (!isDefined(previousTab)) {
    return callRecordingTab.position - TAB_POSITION_GAP;
  }

  return (previousTab.position + callRecordingTab.position) / 2;
};
