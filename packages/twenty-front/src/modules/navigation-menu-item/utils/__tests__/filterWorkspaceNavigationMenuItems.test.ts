import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

describe('filterWorkspaceNavigationMenuItems', () => {
  it('should filter out items that have userWorkspaceId', () => {
    const items: NavigationMenuItem[] = [
      { id: '1', position: 1 } as NavigationMenuItem,
      { id: '2', position: 2, userWorkspaceId: 'ws-1' } as NavigationMenuItem,
      { id: '3', position: 3 } as NavigationMenuItem,
    ];

    const result = filterWorkspaceNavigationMenuItems(items);

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.id)).toEqual(['1', '3']);
  });
});
