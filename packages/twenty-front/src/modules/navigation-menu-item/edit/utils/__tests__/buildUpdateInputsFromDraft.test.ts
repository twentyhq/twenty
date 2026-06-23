import { NAVIGATION_MENU_ITEM_SEARCH_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemSearchLink';
import { buildUpdateInputsFromDraft } from '@/navigation-menu-item/edit/utils/buildUpdateInputsFromDraft';
import {
  type NavigationMenuItem,
  NavigationMenuItemType,
} from '~/generated-metadata/graphql';

const buildLinkNavigationMenuItem = ({
  id,
  link,
}: {
  id: string;
  link: string;
}): NavigationMenuItem =>
  ({
    id,
    type: NavigationMenuItemType.LINK,
    name: 'Search',
    link,
    position: 0,
    createdAt: '',
    updatedAt: '',
  }) as NavigationMenuItem;

describe('buildUpdateInputsFromDraft', () => {
  it('should preserve the search navigation action link', () => {
    const draftItem = buildLinkNavigationMenuItem({
      id: 'navigation-menu-item-id',
      link: NAVIGATION_MENU_ITEM_SEARCH_LINK,
    });

    expect(
      buildUpdateInputsFromDraft({
        draft: [draftItem],
        workspaceItemsById: new Map([
          [
            draftItem.id,
            buildLinkNavigationMenuItem({
              id: draftItem.id,
              link: 'https://example.com',
            }),
          ],
        ]),
        idsToRecreateSet: new Set(),
        resolveFolderId: (folderId) => folderId,
      }),
    ).toEqual([
      {
        id: draftItem.id,
        update: {
          link: NAVIGATION_MENU_ITEM_SEARCH_LINK,
        },
      },
    ]);
  });

  it('should still make regular link navigation menu item updates absolute', () => {
    const draftItem = buildLinkNavigationMenuItem({
      id: 'navigation-menu-item-id',
      link: 'example.com',
    });

    expect(
      buildUpdateInputsFromDraft({
        draft: [draftItem],
        workspaceItemsById: new Map([
          [
            draftItem.id,
            buildLinkNavigationMenuItem({
              id: draftItem.id,
              link: 'https://old.example.com',
            }),
          ],
        ]),
        idsToRecreateSet: new Set(),
        resolveFolderId: (folderId) => folderId,
      }),
    ).toEqual([
      {
        id: draftItem.id,
        update: {
          link: 'https://example.com',
        },
      },
    ]);
  });
});
