import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';

type FindNextActiveTabAfterDeleteParams = {
  tabs: PageLayoutTab[];
  deletedTabId: string;
};

export const findNextActiveTabAfterDelete = ({
  tabs,
  deletedTabId,
}: FindNextActiveTabAfterDeleteParams): string | null => {
  const deletedTabIndex = tabs.findIndex((tab) => tab.id === deletedTabId);

  if (deletedTabIndex === -1) {
    return null;
  }

  const remainingTabs = tabs.filter((tab) => tab.id !== deletedTabId);

  if (remainingTabs.length === 0) {
    return null;
  }

  const newActiveIndex = deletedTabIndex > 0 ? deletedTabIndex - 1 : 0;

  return remainingTabs[newActiveIndex]?.id ?? null;
};
