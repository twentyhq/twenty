import { isDefined } from 'twenty-shared/utils';

import { TAB_POSITION_GAP } from 'src/database/commands/upgrade-version-command/2-32/utils/tab-position-gap.constant';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';

export const computeAppendedPageLayoutTabPositions = ({
  existingPageLayoutTabs,
  appendedTabCount,
}: {
  existingPageLayoutTabs: Pick<FlatPageLayoutTab, 'deletedAt' | 'position'>[];
  appendedTabCount: number;
}): number[] => {
  const lastPosition = Math.max(
    ...existingPageLayoutTabs
      .filter((pageLayoutTab) => !isDefined(pageLayoutTab.deletedAt))
      .map((pageLayoutTab) => pageLayoutTab.position),
    0,
  );

  return Array.from(
    { length: appendedTabCount },
    (_, index) => lastPosition + (index + 1) * TAB_POSITION_GAP,
  );
};
