import {
  type AllMetadataName,
  ALL_METADATA_NAME,
} from 'twenty-shared/metadata';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

// Metadata types whose entities, when they exist in the workspace under the
// workspace-custom application's ownership with a matching universalIdentifier,
// should be silently ADOPTED into the syncing app on sync rather than rejected
// as a 'create' conflict. These are view-structure metadata that the Twenty UI
// creates when a user adds columns / filters / sorts / groupings to a view.
//
// Rationale: forcing the user to either uninstall the entire app or manually
// delete each UI-added column before re-syncing is disproportionate. The
// adoption just transfers `applicationId` from workspace-custom to the syncing
// app via the regular update action handler, preserving the row (and therefore
// the user's local UI configuration).
//
// We deliberately exclude `objectMetadata`, `fieldMetadata`, `view`,
// `pageLayout*`, `navigationMenuItem`, `commandMenuItem`, etc. from this list.
// Those have semantic meaning attached to ownership (relations, validation,
// role assignment) and the strict "create conflicts" check should remain for
// them so the user is informed of true intent mismatches.
export const WORKSPACE_CUSTOM_ADOPTABLE_METADATA_NAMES: readonly AllMetadataName[] =
  ['viewField', 'viewFieldGroup', 'viewFilter', 'viewSort'];

export type ApplicationScopedFlatEntityMapsOptions = {
  ownerApplicationId: string;
  workspaceCustomApplicationId: string | null;
  adoptableMetadataNames?: readonly AllMetadataName[];
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  // The manifest's intended state, used to constrain adoption: for adoptable
  // metadata types we only pull workspace-custom entities whose universalIdentifier
  // also appears in this map. This prevents the dispatcher from later
  // classifying unrelated workspace-custom entities as 'delete' just because
  // they happen to live in the same workspace (see #23192 follow-up).
  toAllUniversalFlatEntityMaps?: AllUniversalFlatEntityMaps;
};

// Build the per-application "from" slice used by the workspace migration
// builder to classify entities as create/update/delete.
//
// By default this only includes entities owned by `ownerApplicationId`, which
// forces any workspace-custom-owned entity (e.g. a UI-added viewField) to be
// classified as a 'create' even when the manifest declares the same
// universalIdentifier. That is what causes #23192.
//
// When `adoptableMetadataNames` is provided AND `toAllUniversalFlatEntityMaps`
// is supplied, this function ALSO includes workspace-custom-owned entities for
// those specific metadata types — but ONLY when the entity's
// universalIdentifier is also present in the corresponding manifest `to` map.
// This keeps the adoption behaviour (a matching manifest entry sees the
// existing workspace-custom row as an `update` and transfers ownership) while
// leaving undeclared workspace-custom rows alone (they are not in `from`, so
// the dispatcher ignores them rather than marking them for deletion).
export const getApplicationScopedAllFlatEntityMapsForOwnerAndWorkspaceCustom =
  ({
    ownerApplicationId,
    workspaceCustomApplicationId,
    adoptableMetadataNames = WORKSPACE_CUSTOM_ADOPTABLE_METADATA_NAMES,
    fromAllFlatEntityMaps,
    toAllUniversalFlatEntityMaps,
  }: ApplicationScopedFlatEntityMapsOptions): AllFlatEntityMaps => {
    const subAllFlatEntityMaps: Partial<AllFlatEntityMaps> = {};

    for (const metadataName of Object.values(ALL_METADATA_NAME)) {
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
      const fromFlatEntityMaps = fromAllFlatEntityMaps[flatEntityMapsKey];

      if (fromFlatEntityMaps === undefined) {
        continue;
      }

      const slice = createEmptyFlatEntityMaps();

      const ownerEntities = findFlatEntitiesByApplicationId({
        applicationId: ownerApplicationId,
        flatEntityMaps: fromFlatEntityMaps,
      });

      for (const entity of ownerEntities) {
        addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
          flatEntity: entity,
          flatEntityMapsToMutate: slice,
        });
      }

      if (
        workspaceCustomApplicationId !== null &&
        adoptableMetadataNames.includes(metadataName)
      ) {
        // Constrain adoption to entities the manifest actually declares. This
        // prevents the dispatcher from later inferring deletes for workspace-
        // custom rows the manifest doesn't mention — for example, a viewField
        // that is a label identifier and so cannot be deleted (#23192).
        const toFlatEntityMaps =
          toAllUniversalFlatEntityMaps?.[flatEntityMapsKey];
        const declaredUniversalIdentifiers = isDefined(toFlatEntityMaps)
          ? new Set(Object.keys(toFlatEntityMaps.byUniversalIdentifier ?? {}))
          : null;

        const workspaceCustomEntities = findFlatEntitiesByApplicationId({
          applicationId: workspaceCustomApplicationId,
          flatEntityMaps: fromFlatEntityMaps,
        });

        for (const entity of workspaceCustomEntities) {
          // Skip entities already owned by the syncing app; they are already
          // in the slice above and re-adding would be a no-op for the
          // universalIdentifier key but could trip uniqueness invariants.
          if (entity.applicationId === ownerApplicationId) {
            continue;
          }

          // If we have a manifest `to` map, skip entities the manifest does
          // not declare. We are NOT deleting them — they just don't belong in
          // the per-app `from` slice. They will remain under the workspace-
          // custom application untouched.
          if (
            declaredUniversalIdentifiers !== null &&
            !declaredUniversalIdentifiers.has(entity.universalIdentifier)
          ) {
            continue;
          }

          addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
            flatEntity: entity,
            flatEntityMapsToMutate: slice,
          });
        }
      }

      // The slice is `FlatEntityMaps<T>` for the current metadataName; the
      // outer `AllFlatEntityMaps` keys are per-metadata too, so the union
      // is correct at runtime. The cast documents the type-system constraint
      // (a single per-key assignment can't be narrowed to a specific T).
      subAllFlatEntityMaps[flatEntityMapsKey] = slice as never;
    }

    return subAllFlatEntityMaps as AllFlatEntityMaps;
  };

// Local helper to avoid importing `isDefined` from `twenty-shared/utils` only for one call.
const isDefined = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;
