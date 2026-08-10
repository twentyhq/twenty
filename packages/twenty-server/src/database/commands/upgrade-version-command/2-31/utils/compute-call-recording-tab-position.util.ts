import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { TAB_POSITION_GAP } from 'src/database/commands/upgrade-version-command/2-31/utils/tab-position-gap.constant';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';

const HOME_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs.home
    .universalIdentifier;

export const computeCallRecordingTabPosition = ({
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
  const homeTab = existingNonDeletedPageLayoutTabs.find(
    (pageLayoutTab) =>
      pageLayoutTab.universalIdentifier === HOME_TAB_UNIVERSAL_IDENTIFIER &&
      pageLayoutTab.isActive,
  );

  if (!isDefined(homeTab)) {
    return (
      Math.max(
        ...existingNonDeletedPageLayoutTabs.map(
          (pageLayoutTab) => pageLayoutTab.position,
        ),
        0,
      ) + TAB_POSITION_GAP
    );
  }

  const nextTab = existingNonDeletedPageLayoutTabs
    .filter((pageLayoutTab) => pageLayoutTab.position > homeTab.position)
    .sort(
      (leftPageLayoutTab, rightPageLayoutTab) =>
        leftPageLayoutTab.position - rightPageLayoutTab.position,
    )[0];

  if (!isDefined(nextTab)) {
    return homeTab.position + TAB_POSITION_GAP;
  }

  return (homeTab.position + nextTab.position) / 2;
};
