import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';

const SYSTEM_OBJECT_TAB_SOURCE_TITLES = [
  'Home',
  'Timeline',
  'Overview',
  'Flow',
];

export const getSystemObjectTabTitles = (i18n: I18n) => {
  const translated = [
    i18n._(msg`Home`),
    i18n._(msg`Timeline`),
    i18n._(msg`Overview`),
    i18n._(msg`Flow`),
  ];

  return Array.from(
    new Set([...SYSTEM_OBJECT_TAB_SOURCE_TITLES, ...translated]),
  );
};

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
