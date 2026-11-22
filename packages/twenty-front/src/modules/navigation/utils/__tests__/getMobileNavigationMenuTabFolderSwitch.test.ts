import { getMobileNavigationMenuTabFolderSwitch } from '@/navigation/utils/getMobileNavigationMenuTabFolderSwitch';

describe('getMobileNavigationMenuTabFolderSwitch', () => {
  it('remembers the folder of the tab being left and reopens the next tab root', () => {
    expect(
      getMobileNavigationMenuTabFolderSwitch({
        folderIdByTabId: {},
        currentTabId: 'sales-tab',
        currentFolderId: 'deals-folder',
        nextTabId: null,
        isReopeningCurrentTab: false,
      }),
    ).toEqual({
      folderIdByTabId: { 'sales-tab': 'deals-folder' },
      nextFolderId: null,
    });
  });

  it('reopens the folder the next tab had open', () => {
    expect(
      getMobileNavigationMenuTabFolderSwitch({
        folderIdByTabId: { 'sales-tab': 'deals-folder' },
        currentTabId: null,
        currentFolderId: 'home-folder',
        nextTabId: 'sales-tab',
        isReopeningCurrentTab: false,
      }),
    ).toEqual({
      folderIdByTabId: { 'sales-tab': 'deals-folder', home: 'home-folder' },
      nextFolderId: 'deals-folder',
    });
  });

  it('goes back to the root when the current tab is tapped again', () => {
    expect(
      getMobileNavigationMenuTabFolderSwitch({
        folderIdByTabId: {},
        currentTabId: 'sales-tab',
        currentFolderId: 'deals-folder',
        nextTabId: 'sales-tab',
        isReopeningCurrentTab: true,
      }).nextFolderId,
    ).toBeNull();
  });
});
