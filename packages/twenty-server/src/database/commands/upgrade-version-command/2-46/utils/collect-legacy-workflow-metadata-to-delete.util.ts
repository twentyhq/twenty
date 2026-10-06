import { isDefined } from 'twenty-shared/utils';

import {
  LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIERS,
  LEGACY_WORKFLOW_RELATION_FIELD_UNIVERSAL_IDENTIFIERS,
} from 'src/database/commands/upgrade-version-command/2-46/constants/legacy-workflow-object-universal-identifiers.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { fromDeleteObjectInputToFlatFieldMetadatasToDelete } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-delete-object-input-to-flat-field-metadatas-to-delete.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type LegacyWorkflowMetadataToDelete = {
  flatObjectMetadatasToDelete: FlatObjectMetadata[];
  flatFieldMetadatasToDelete: UniversalFlatFieldMetadata[];
  flatIndexMetadatasToDelete: FlatIndexMetadata[];
  flatPageLayoutWidgetsToDelete: FlatPageLayoutWidget[];
  flatNavigationMenuItemsToDelete: FlatNavigationMenuItem[];
};

const getConfigurationFieldMetadataId = (
  flatPageLayoutWidget: FlatPageLayoutWidget,
): unknown =>
  (flatPageLayoutWidget.configuration as { fieldMetadataId?: unknown } | null)
    ?.fieldMetadataId;

export const collectLegacyWorkflowMetadataToDelete = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  flatPageLayoutWidgetMaps,
  flatViewMaps,
  flatNavigationMenuItemMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  flatPageLayoutWidgetMaps: FlatEntityMaps<FlatPageLayoutWidget>;
  flatViewMaps: FlatEntityMaps<FlatView>;
  flatNavigationMenuItemMaps: FlatEntityMaps<FlatNavigationMenuItem>;
}): LegacyWorkflowMetadataToDelete => {
  const flatObjectMetadatasToDelete =
    LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIERS.map((universalIdentifier) =>
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier,
      }),
    ).filter(isDefined);

  const flatFieldMetadatasToDeleteByUniversalIdentifier = new Map<
    string,
    UniversalFlatFieldMetadata
  >();
  const flatIndexMetadatasToDeleteByUniversalIdentifier = new Map<
    string,
    FlatIndexMetadata
  >();

  for (const flatObjectMetadata of flatObjectMetadatasToDelete) {
    const { flatFieldMetadatasToDelete, flatIndexToDelete } =
      fromDeleteObjectInputToFlatFieldMetadatasToDelete({
        deleteObjectInput: { id: flatObjectMetadata.id },
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
      });

    for (const flatFieldMetadata of flatFieldMetadatasToDelete) {
      flatFieldMetadatasToDeleteByUniversalIdentifier.set(
        flatFieldMetadata.universalIdentifier,
        flatFieldMetadata,
      );
    }

    for (const flatIndexMetadata of flatIndexToDelete) {
      flatIndexMetadatasToDeleteByUniversalIdentifier.set(
        flatIndexMetadata.universalIdentifier,
        flatIndexMetadata,
      );
    }
  }

  const relationFieldsToDelete =
    LEGACY_WORKFLOW_RELATION_FIELD_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);

  for (const flatFieldMetadata of relationFieldsToDelete) {
    flatFieldMetadatasToDeleteByUniversalIdentifier.set(
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    );
  }

  const relationFieldIdsToDelete = new Set(
    relationFieldsToDelete.map(({ id }) => id),
  );

  for (const flatIndexMetadata of Object.values(
    flatIndexMaps.byUniversalIdentifier,
  )) {
    if (
      isDefined(flatIndexMetadata) &&
      flatIndexMetadata.flatIndexFieldMetadatas.some(({ fieldMetadataId }) =>
        relationFieldIdsToDelete.has(fieldMetadataId),
      )
    ) {
      flatIndexMetadatasToDeleteByUniversalIdentifier.set(
        flatIndexMetadata.universalIdentifier,
        flatIndexMetadata,
      );
    }
  }

  const deletedFieldIds = new Set(
    [...flatFieldMetadatasToDeleteByUniversalIdentifier.keys()]
      .map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier,
          })?.id,
      )
      .filter(isDefined),
  );

  const deletedObjectIds = new Set(
    flatObjectMetadatasToDelete.map(({ id }) => id),
  );

  const flatPageLayoutWidgetsToDelete = Object.values(
    flatPageLayoutWidgetMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((flatPageLayoutWidget) => {
      const fieldMetadataId =
        getConfigurationFieldMetadataId(flatPageLayoutWidget);

      return (
        typeof fieldMetadataId === 'string' &&
        deletedFieldIds.has(fieldMetadataId) &&
        !(
          isDefined(flatPageLayoutWidget.objectMetadataId) &&
          deletedObjectIds.has(flatPageLayoutWidget.objectMetadataId)
        )
      );
    });

  const deletedViewIds = new Set(
    Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(({ objectMetadataId }) => deletedObjectIds.has(objectMetadataId))
      .map(({ id }) => id),
  );

  const flatNavigationMenuItemsToDelete = Object.values(
    flatNavigationMenuItemMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      ({ targetObjectMetadataId, viewId }) =>
        (isDefined(targetObjectMetadataId) &&
          deletedObjectIds.has(targetObjectMetadataId)) ||
        (isDefined(viewId) && deletedViewIds.has(viewId)),
    );

  return {
    flatObjectMetadatasToDelete,
    flatFieldMetadatasToDelete: [
      ...flatFieldMetadatasToDeleteByUniversalIdentifier.values(),
    ],
    flatIndexMetadatasToDelete: [
      ...flatIndexMetadatasToDeleteByUniversalIdentifier.values(),
    ],
    flatPageLayoutWidgetsToDelete,
    flatNavigationMenuItemsToDelete,
  };
};
