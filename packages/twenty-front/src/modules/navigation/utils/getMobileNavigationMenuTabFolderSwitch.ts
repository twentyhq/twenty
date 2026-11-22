const HOME_TAB_KEY = 'home';

export const getMobileNavigationMenuTabFolderSwitch = ({
  folderIdByTabId,
  currentTabId,
  currentFolderId,
  nextTabId,
  isReopeningCurrentTab,
}: {
  folderIdByTabId: Record<string, string | null>;
  currentTabId: string | null;
  currentFolderId: string | null;
  nextTabId: string | null;
  isReopeningCurrentTab: boolean;
}) => {
  const nextFolderIdByTabId = {
    ...folderIdByTabId,
    [currentTabId ?? HOME_TAB_KEY]: currentFolderId,
  };

  return {
    folderIdByTabId: nextFolderIdByTabId,
    nextFolderId: isReopeningCurrentTab
      ? null
      : (nextFolderIdByTabId[nextTabId ?? HOME_TAB_KEY] ?? null),
  };
};
