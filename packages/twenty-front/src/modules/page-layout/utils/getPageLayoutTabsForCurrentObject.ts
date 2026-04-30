import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';

export const getSystemObjectTabTitles = (i18n: I18n) => [
  i18n._(msg`Home`),
  i18n._(msg`Timeline`),
  i18n._(msg`Overview`),
  i18n._(msg`Flow`),
];

type GetPageLayoutTabsForCurrentObjectArgs = {
  isSystemObject: boolean;
  tabsWithVisibleWidgets: PageLayoutTab[];
  systemObjectTabTitles: string[];
};

export const getPageLayoutTabsForCurrentObject = ({
  isSystemObject,
  tabsWithVisibleWidgets,
  systemObjectTabTitles,
}: GetPageLayoutTabsForCurrentObjectArgs) => {
  return isSystemObject
    ? tabsWithVisibleWidgets.filter((tab) =>
        systemObjectTabTitles.includes(tab.title),
      )
    : tabsWithVisibleWidgets;
};
