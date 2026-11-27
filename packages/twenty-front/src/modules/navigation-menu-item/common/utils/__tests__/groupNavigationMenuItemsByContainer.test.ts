import { groupNavigationMenuItemsByContainer } from '@/navigation-menu-item/common/utils/groupNavigationMenuItemsByContainer';

const buildItem = (id: string, parentId: string | null) => ({ id, parentId });

describe('groupNavigationMenuItemsByContainer', () => {
  it('should split root items from folder children', () => {
    const { topLevelItems, folderChildrenById } =
      groupNavigationMenuItemsByContainer({
        items: [
          buildItem('folder', null),
          buildItem('link', 'folder'),
          buildItem('root-link', null),
        ],
        containerId: null,
      });

    expect(topLevelItems.map((item) => item.id)).toEqual([
      'folder',
      'root-link',
    ]);
    expect(folderChildrenById.get('folder')?.map((item) => item.id)).toEqual([
      'link',
    ]);
  });

  it('should treat items of the container as top level', () => {
    const { topLevelItems, folderChildrenById } =
      groupNavigationMenuItemsByContainer({
        items: [
          buildItem('folder', 'section'),
          buildItem('link', 'folder'),
          buildItem('section-link', 'section'),
        ],
        containerId: 'section',
      });

    expect(topLevelItems.map((item) => item.id)).toEqual([
      'folder',
      'section-link',
    ]);
    expect([...folderChildrenById.keys()]).toEqual(['folder']);
  });
});
