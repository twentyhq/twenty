import { doesCommandMenuItemMatchActiveNavigationTarget } from '@/command-menu-item/utils/doesCommandMenuItemMatchActiveNavigationTarget';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

const buildCommandMenuItem = (
  navigationTargetObjectMetadataId: string | null,
) =>
  ({
    navigationTargetObjectMetadataId,
  }) as CommandMenuItemFieldsFragment;

describe('doesCommandMenuItemMatchActiveNavigationTarget', () => {
  const activeObjectMetadataItemIds = new Set(['active-object-id']);

  it('should keep an item without navigation target', () => {
    expect(
      doesCommandMenuItemMatchActiveNavigationTarget(
        activeObjectMetadataItemIds,
      )(buildCommandMenuItem(null)),
    ).toBe(true);
  });

  it('should keep an item navigating to an active object', () => {
    expect(
      doesCommandMenuItemMatchActiveNavigationTarget(
        activeObjectMetadataItemIds,
      )(buildCommandMenuItem('active-object-id')),
    ).toBe(true);
  });

  it('should drop an item navigating to an inactive object', () => {
    expect(
      doesCommandMenuItemMatchActiveNavigationTarget(
        activeObjectMetadataItemIds,
      )(buildCommandMenuItem('inactive-object-id')),
    ).toBe(false);
  });
});
