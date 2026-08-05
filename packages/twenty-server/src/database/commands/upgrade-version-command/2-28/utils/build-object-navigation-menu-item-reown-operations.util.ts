import { getObjectNavigationMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

type FlatNavigationMenuItemFromMaps = NonNullable<
  AllFlatEntityMaps['flatNavigationMenuItemMaps']['byUniversalIdentifier'][string]
>;

type FlatObjectMetadataFromMaps = NonNullable<
  AllFlatEntityMaps['flatObjectMetadataMaps']['byUniversalIdentifier'][string]
>;

export type ObjectNavigationMenuItemReownUpdate = {
  id: string;
  update: {
    universalIdentifier?: string;
    isSystemSideEffect?: boolean;
    applicationId?: string;
  };
};

export type ObjectNavigationMenuItemReownOperations = {
  updates: ObjectNavigationMenuItemReownUpdate[];
  claimedObjectUniversalIdentifiers: Set<string>;
  skippedObjectUniversalIdentifiers: Set<string>;
};

// A workspace can already hold several workspace-level OBJECT items for the
// same object: the derived identifier is 1:1 per (application, object), so
// exactly one is claimed for the engine and the others stay caller rows.
const pickFlatNavigationMenuItemToClaim = ({
  candidates,
  derivedUniversalIdentifier,
}: {
  candidates: FlatNavigationMenuItemFromMaps[];
  derivedUniversalIdentifier: string;
}): FlatNavigationMenuItemFromMaps =>
  [...candidates].sort((left, right) => {
    const leftScore = Number(
      left.universalIdentifier === derivedUniversalIdentifier,
    );
    const rightScore = Number(
      right.universalIdentifier === derivedUniversalIdentifier,
    );

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    if (left.isSystemSideEffect !== right.isSystemSideEffect) {
      return left.isSystemSideEffect ? -1 : 1;
    }

    if (left.position !== right.position) {
      return left.position - right.position;
    }

    return left.id.localeCompare(right.id);
  })[0];

export const buildObjectNavigationMenuItemReownOperations = ({
  flatNavigationMenuItemMaps,
  flatObjectMetadataMaps,
  isFlatObjectMetadataInScope,
}: {
  flatNavigationMenuItemMaps: AllFlatEntityMaps['flatNavigationMenuItemMaps'];
  flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
  isFlatObjectMetadataInScope: (
    flatObjectMetadata: FlatObjectMetadataFromMaps,
  ) => boolean;
}): ObjectNavigationMenuItemReownOperations => {
  const candidatesByObjectUniversalIdentifier = new Map<
    string,
    FlatNavigationMenuItemFromMaps[]
  >();

  for (const flatNavigationMenuItem of Object.values(
    flatNavigationMenuItemMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(flatNavigationMenuItem) ||
      flatNavigationMenuItem.type !== NavigationMenuItemType.OBJECT ||
      isDefined(flatNavigationMenuItem.userWorkspaceId) ||
      !isDefined(
        flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier,
      )
    ) {
      continue;
    }

    const { targetObjectMetadataUniversalIdentifier } = flatNavigationMenuItem;

    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        targetObjectMetadataUniversalIdentifier
      ];

    if (
      !isDefined(flatObjectMetadata) ||
      !isFlatObjectMetadataInScope(flatObjectMetadata)
    ) {
      continue;
    }

    candidatesByObjectUniversalIdentifier.set(
      targetObjectMetadataUniversalIdentifier,
      [
        ...(candidatesByObjectUniversalIdentifier.get(
          targetObjectMetadataUniversalIdentifier,
        ) ?? []),
        flatNavigationMenuItem,
      ],
    );
  }

  const updates: ObjectNavigationMenuItemReownUpdate[] = [];
  const claimedObjectUniversalIdentifiers = new Set<string>();
  const skippedObjectUniversalIdentifiers = new Set<string>();
  const claimedUniversalIdentifiers = new Set<string>();

  for (const [
    objectUniversalIdentifier,
    candidates,
  ] of candidatesByObjectUniversalIdentifier.entries()) {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier];

    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    const derivedUniversalIdentifier =
      getObjectNavigationMenuItemUniversalIdentifier({
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      });

    const flatNavigationMenuItemToClaim = pickFlatNavigationMenuItemToClaim({
      candidates,
      derivedUniversalIdentifier,
    });

    const isDerivedUniversalIdentifierTaken =
      (isDefined(
        flatNavigationMenuItemMaps.byUniversalIdentifier[
          derivedUniversalIdentifier
        ],
      ) &&
        flatNavigationMenuItemToClaim.universalIdentifier !==
          derivedUniversalIdentifier) ||
      claimedUniversalIdentifiers.has(derivedUniversalIdentifier);

    if (isDerivedUniversalIdentifierTaken) {
      skippedObjectUniversalIdentifiers.add(objectUniversalIdentifier);
      continue;
    }

    claimedUniversalIdentifiers.add(derivedUniversalIdentifier);
    claimedObjectUniversalIdentifiers.add(objectUniversalIdentifier);

    const update: ObjectNavigationMenuItemReownUpdate['update'] = {};

    if (
      flatNavigationMenuItemToClaim.universalIdentifier !==
      derivedUniversalIdentifier
    ) {
      update.universalIdentifier = derivedUniversalIdentifier;
    }

    if (flatNavigationMenuItemToClaim.isSystemSideEffect !== true) {
      update.isSystemSideEffect = true;
    }

    // The item belongs to the application owning the object: items minted next
    // to the create-object input transpiler were always attributed to the
    // workspace custom application, app-owned objects included.
    if (
      flatNavigationMenuItemToClaim.applicationId !==
      flatObjectMetadata.applicationId
    ) {
      update.applicationId = flatObjectMetadata.applicationId;
    }

    if (Object.keys(update).length === 0) {
      continue;
    }

    updates.push({ id: flatNavigationMenuItemToClaim.id, update });
  }

  return {
    updates,
    claimedObjectUniversalIdentifiers,
    skippedObjectUniversalIdentifiers,
  };
};
