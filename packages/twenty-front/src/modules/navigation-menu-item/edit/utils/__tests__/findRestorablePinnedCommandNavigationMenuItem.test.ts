import { findRestorablePinnedCommandNavigationMenuItem } from '@/navigation-menu-item/edit/utils/findRestorablePinnedCommandNavigationMenuItem';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const buildPinnedCommand = ({
  id,
  commandMenuItemId,
  isActive = true,
}: {
  id: string;
  commandMenuItemId: string;
  isActive?: boolean;
}): NavigationMenuItem => ({
  __typename: 'NavigationMenuItem',
  id,
  type: NavigationMenuItemType.COMMAND,
  commandMenuItemId,
  position: 0,
  isActive,
  createdAt: '',
  updatedAt: '',
});

describe('findRestorablePinnedCommandNavigationMenuItem', () => {
  it('should find a hidden pinned command for the command', () => {
    const hiddenSearch = buildPinnedCommand({
      id: 'hidden-search',
      commandMenuItemId: 'search',
      isActive: false,
    });

    expect(
      findRestorablePinnedCommandNavigationMenuItem({
        savedWorkspaceNavigationMenuItems: [hiddenSearch],
        draftNavigationMenuItems: [],
        commandMenuItemId: 'search',
      }),
    ).toBe(hiddenSearch);
  });

  it('should find a pinned command removed from the draft before saving', () => {
    const removedSearch = buildPinnedCommand({
      id: 'removed-search',
      commandMenuItemId: 'search',
    });

    expect(
      findRestorablePinnedCommandNavigationMenuItem({
        savedWorkspaceNavigationMenuItems: [removedSearch],
        draftNavigationMenuItems: [],
        commandMenuItemId: 'search',
      }),
    ).toBe(removedSearch);
  });

  it('should find nothing when the pinned command is still in the draft or targets another command', () => {
    const search = buildPinnedCommand({
      id: 'search-item',
      commandMenuItemId: 'search',
    });

    expect(
      findRestorablePinnedCommandNavigationMenuItem({
        savedWorkspaceNavigationMenuItems: [search],
        draftNavigationMenuItems: [search],
        commandMenuItemId: 'search',
      }),
    ).toBeUndefined();
    expect(
      findRestorablePinnedCommandNavigationMenuItem({
        savedWorkspaceNavigationMenuItems: [search],
        draftNavigationMenuItems: [],
        commandMenuItemId: 'new-chat',
      }),
    ).toBeUndefined();
  });
});
