import { NavigationMenuItemType } from 'twenty-shared/types';

import { defineNavigationMenuItem } from '@/sdk/define/navigation-menu-items/define-navigation-menu-item';

const LINK_ITEM_CONFIG = {
  universalIdentifier: '0c4f6a5e-3e57-4b9a-9f0c-2a8b6c1d4e7f',
  type: NavigationMenuItemType.LINK,
  name: 'Docs',
  link: 'https://example.com',
  position: 0,
};

describe('defineNavigationMenuItem', () => {
  it('should keep parentUniversalIdentifier', () => {
    const result = defineNavigationMenuItem({
      ...LINK_ITEM_CONFIG,
      parentUniversalIdentifier: 'folder',
    });

    expect(result.success).toBe(true);
    expect(result.config).toEqual({
      ...LINK_ITEM_CONFIG,
      parentUniversalIdentifier: 'folder',
    });
  });

  it('should turn the deprecated folderUniversalIdentifier into parentUniversalIdentifier', () => {
    const result = defineNavigationMenuItem({
      ...LINK_ITEM_CONFIG,
      folderUniversalIdentifier: 'folder',
    });

    expect(result.success).toBe(true);
    expect(result.config).toEqual({
      ...LINK_ITEM_CONFIG,
      parentUniversalIdentifier: 'folder',
    });
  });
});
