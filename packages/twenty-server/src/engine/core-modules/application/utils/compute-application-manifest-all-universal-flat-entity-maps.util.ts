import { type Manifest } from 'twenty-shared/application';

import { type ApplicationManifestMetadataName } from 'src/engine/core-modules/application/constants/application-manifest-metadata-names.constant';
import { fromFieldManifestToUniversalFlatFieldMetadata } from 'src/engine/core-modules/application/utils/from-field-manifest-to-universal-flat-field-metadata.util';
import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/utils/from-front-component-manifest-to-universal-flat-front-component.util';
import { fromLogicFunctionManifestToUniversalFlatLogicFunction } from 'src/engine/core-modules/application/utils/from-logic-function-manifest-to-universal-flat-logic-function.util';
import { fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem } from 'src/engine/core-modules/application/utils/from-navigation-menu-item-manifest-to-universal-flat-navigation-menu-item.util';
import { fromObjectManifestToUniversalFlatObjectMetadata } from 'src/engine/core-modules/application/utils/from-object-manifest-to-universal-flat-object-metadata.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/utils/from-role-manifest-to-universal-flat-role.util';
import { fromViewFieldGroupManifestToUniversalFlatViewFieldGroup } from 'src/engine/core-modules/application/utils/from-view-field-group-manifest-to-universal-flat-view-field-group.util';
import { fromViewFieldManifestToUniversalFlatViewField } from 'src/engine/core-modules/application/utils/from-view-field-manifest-to-universal-flat-view-field.util';
import { fromViewFilterGroupManifestToUniversalFlatViewFilterGroup } from 'src/engine/core-modules/application/utils/from-view-filter-group-manifest-to-universal-flat-view-filter-group.util';
import { fromViewFilterManifestToUniversalFlatViewFilter } from 'src/engine/core-modules/application/utils/from-view-filter-manifest-to-universal-flat-view-filter.util';
import { fromViewGroupManifestToUniversalFlatViewGroup } from 'src/engine/core-modules/application/utils/from-view-group-manifest-to-universal-flat-view-group.util';
import { fromViewManifestToUniversalFlatView } from 'src/engine/core-modules/application/utils/from-view-manifest-to-universal-flat-view.util';
import { getEmptyApplicationManifestAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/utils/get-empty-application-manifest-all-universal-flat-entity-maps.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';

export type ApplicationManifestAllUniversalFlatEntityMaps = Pick<
  AllUniversalFlatEntityMaps,
  MetadataToFlatEntityMapsKey<ApplicationManifestMetadataName>
>;

export type ApplicationManifestAllFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  MetadataToFlatEntityMapsKey<ApplicationManifestMetadataName>
>;

export const computeApplicationManifestAllUniversalFlatEntityMaps = ({
  manifest,
  applicationUniversalIdentifier,
  now,
}: {
  manifest: Manifest;
  applicationUniversalIdentifier: string;
  now: string;
}): ApplicationManifestAllUniversalFlatEntityMaps => {
  const allUniversalFlatEntityMaps =
    getEmptyApplicationManifestAllUniversalFlatEntityMaps();

  for (const objectManifest of manifest.objects) {
    addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName: 'objectMetadata',
        universalFlatEntity: fromObjectManifestToUniversalFlatObjectMetadata({
          objectManifest,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
      },
    );

    for (const fieldManifest of objectManifest.fields) {
      addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
        {
          metadataName: 'fieldMetadata',
          universalFlatEntity: fromFieldManifestToUniversalFlatFieldMetadata({
            fieldManifest: {
              ...fieldManifest,
              objectUniversalIdentifier: objectManifest.universalIdentifier,
            },
            applicationUniversalIdentifier,
            now,
          }),
          universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
        },
      );
    }
  }

  for (const fieldManifest of manifest.fields) {
    addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName: 'fieldMetadata',
        universalFlatEntity: fromFieldManifestToUniversalFlatFieldMetadata({
          fieldManifest: fieldManifest,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
      },
    );
  }

  for (const logicFunctionManifest of manifest.logicFunctions) {
    addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName: 'logicFunction',
        universalFlatEntity:
          fromLogicFunctionManifestToUniversalFlatLogicFunction({
            logicFunctionManifest,
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
      },
    );
  }

  for (const frontComponentManifest of manifest.frontComponents) {
    addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName: 'frontComponent',
        universalFlatEntity:
          fromFrontComponentManifestToUniversalFlatFrontComponent({
            frontComponentManifest,
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
      },
    );
  }

  for (const roleManifest of manifest.roles) {
    addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName: 'role',
        universalFlatEntity: fromRoleManifestToUniversalFlatRole({
          roleManifest,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
      },
    );
  }

  for (const viewManifest of manifest.views ?? []) {
    addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName: 'view',
        universalFlatEntity: fromViewManifestToUniversalFlatView({
          viewManifest,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
      },
    );

    for (const viewFieldGroupManifest of viewManifest.fieldGroups ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
        {
          metadataName: 'viewFieldGroup',
          universalFlatEntity:
            fromViewFieldGroupManifestToUniversalFlatViewFieldGroup({
              viewFieldGroupManifest,
              viewUniversalIdentifier: viewManifest.universalIdentifier,
              applicationUniversalIdentifier,
              now,
            }),
          universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
        },
      );
    }

    for (const viewFieldManifest of viewManifest.fields ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
        {
          metadataName: 'viewField',
          universalFlatEntity: fromViewFieldManifestToUniversalFlatViewField({
            viewFieldManifest,
            viewUniversalIdentifier: viewManifest.universalIdentifier,
            applicationUniversalIdentifier,
            now,
          }),
          universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
        },
      );
    }

    for (const viewFilterGroupManifest of viewManifest.filterGroups ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
        {
          metadataName: 'viewFilterGroup',
          universalFlatEntity:
            fromViewFilterGroupManifestToUniversalFlatViewFilterGroup({
              viewFilterGroupManifest,
              viewUniversalIdentifier: viewManifest.universalIdentifier,
              applicationUniversalIdentifier,
              now,
            }),
          universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
        },
      );
    }

    for (const viewFilterManifest of viewManifest.filters ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
        {
          metadataName: 'viewFilter',
          universalFlatEntity: fromViewFilterManifestToUniversalFlatViewFilter({
            viewFilterManifest,
            viewUniversalIdentifier: viewManifest.universalIdentifier,
            applicationUniversalIdentifier,
            now,
          }),
          universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
        },
      );
    }

    for (const viewGroupManifest of viewManifest.groups ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
        {
          metadataName: 'viewGroup',
          universalFlatEntity: fromViewGroupManifestToUniversalFlatViewGroup({
            viewGroupManifest,
            viewUniversalIdentifier: viewManifest.universalIdentifier,
            applicationUniversalIdentifier,
            now,
          }),
          universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
        },
      );
    }
  }

  for (const navigationMenuItemManifest of manifest.navigationMenuItems ?? []) {
    addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName: 'navigationMenuItem',
        universalFlatEntity:
          fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem({
            navigationMenuItemManifest,
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
      },
    );
  }

  return allUniversalFlatEntityMaps;
};
