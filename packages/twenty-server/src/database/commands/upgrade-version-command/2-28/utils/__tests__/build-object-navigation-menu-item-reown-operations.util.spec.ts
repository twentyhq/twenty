import { getObjectNavigationMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { buildObjectNavigationMenuItemReownOperations } from 'src/database/commands/upgrade-version-command/2-28/utils/build-object-navigation-menu-item-reown-operations.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const APPLICATION_ID = 'a1a2a3a4-a5a6-4000-8000-0000000000f1';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'a1a2a3a4-a5a6-4000-8000-0000000000f2';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const DERIVED_UNIVERSAL_IDENTIFIER =
  getObjectNavigationMenuItemUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

type FlatNavigationMenuItemFixture = {
  id: string;
  universalIdentifier: string;
  type?: NavigationMenuItemType;
  userWorkspaceId?: string | null;
  targetObjectMetadataUniversalIdentifier?: string | null;
  isSystemSideEffect?: boolean;
  position?: number;
  applicationId?: string;
};

const buildOperations = (
  flatNavigationMenuItems: FlatNavigationMenuItemFixture[],
) =>
  buildObjectNavigationMenuItemReownOperations({
    flatNavigationMenuItemMaps: {
      byUniversalIdentifier: Object.fromEntries(
        flatNavigationMenuItems.map((flatNavigationMenuItem) => [
          flatNavigationMenuItem.universalIdentifier,
          {
            type: NavigationMenuItemType.OBJECT,
            userWorkspaceId: null,
            targetObjectMetadataUniversalIdentifier:
              OBJECT_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: false,
            position: 0,
            applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
            ...flatNavigationMenuItem,
          },
        ]),
      ),
    } as never,
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [OBJECT_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          applicationId: APPLICATION_ID,
        },
      },
    } as never,
    isFlatObjectMetadataInScope: () => true,
  });

describe('buildObjectNavigationMenuItemReownOperations', () => {
  it('should re-own an underived item onto the derived identifier and the object application', () => {
    const { updates, claimedObjectUniversalIdentifiers } = buildOperations([
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000001',
        universalIdentifier: 'd1d2d3d4-d5d6-4000-8000-000000000001',
        position: 3,
      },
    ]);

    expect(updates).toEqual([
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000001',
        update: {
          universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
          isSystemSideEffect: true,
          applicationId: APPLICATION_ID,
        },
      },
    ]);
    expect(claimedObjectUniversalIdentifiers).toEqual(
      new Set([OBJECT_UNIVERSAL_IDENTIFIER]),
    );
  });

  it('should produce no update for an already converged item', () => {
    const { updates, claimedObjectUniversalIdentifiers } = buildOperations([
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000001',
        universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
        applicationId: APPLICATION_ID,
      },
    ]);

    expect(updates).toEqual([]);
    expect(claimedObjectUniversalIdentifiers).toEqual(
      new Set([OBJECT_UNIVERSAL_IDENTIFIER]),
    );
  });

  it('should claim exactly one item when an object holds several', () => {
    const { updates } = buildOperations([
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000001',
        universalIdentifier: 'd1d2d3d4-d5d6-4000-8000-000000000001',
        position: 5,
      },
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000002',
        universalIdentifier: 'd1d2d3d4-d5d6-4000-8000-000000000002',
        position: 1,
      },
    ]);

    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe('c1c2c3c4-c5c6-4000-8000-000000000002');
  });

  it('should skip an object whose derived identifier is held by another row', () => {
    const { updates, skippedObjectUniversalIdentifiers } = buildOperations([
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000001',
        universalIdentifier: 'd1d2d3d4-d5d6-4000-8000-000000000001',
      },
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000002',
        universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
        type: NavigationMenuItemType.VIEW,
        targetObjectMetadataUniversalIdentifier: null,
      },
    ]);

    expect(updates).toEqual([]);
    expect(skippedObjectUniversalIdentifiers).toEqual(
      new Set([OBJECT_UNIVERSAL_IDENTIFIER]),
    );
  });

  it('should leave user-scoped items alone', () => {
    const { updates, claimedObjectUniversalIdentifiers } = buildOperations([
      {
        id: 'c1c2c3c4-c5c6-4000-8000-000000000001',
        universalIdentifier: 'd1d2d3d4-d5d6-4000-8000-000000000001',
        userWorkspaceId: 'e1e2e3e4-e5e6-4000-8000-000000000001',
      },
    ]);

    expect(updates).toEqual([]);
    expect(claimedObjectUniversalIdentifiers.size).toBe(0);
  });
});
