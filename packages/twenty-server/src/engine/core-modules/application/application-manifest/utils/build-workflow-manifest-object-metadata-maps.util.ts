import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type IdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';
import { type WorkflowObjectMetadataMaps } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';

const copyFlatEntityMaps = <T extends SyncableFlatEntity>(
  flatEntityMaps: FlatEntityMaps<T>,
): FlatEntityMaps<T> => ({
  ...flatEntityMaps,
  byUniversalIdentifier: { ...flatEntityMaps.byUniversalIdentifier },
  universalIdentifierById: { ...flatEntityMaps.universalIdentifierById },
});

const setFlatEntity = <T extends SyncableFlatEntity>(
  flatEntityMaps: FlatEntityMaps<T>,
  flatEntity: T,
) => {
  flatEntityMaps.byUniversalIdentifier[flatEntity.universalIdentifier] =
    flatEntity;
  flatEntityMaps.universalIdentifierById[flatEntity.id] =
    flatEntity.universalIdentifier;
};

export const buildWorkflowManifestObjectMetadataMaps = ({
  toAllUniversalFlatEntityMaps,
  existingAllFlatEntityMaps,
  ownerApplicationId,
  idByUniversalIdentifierByMetadataName,
}: {
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  ownerApplicationId: string;
  idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName;
}): WorkflowObjectMetadataMaps => {
  const existingObjectMaps = existingAllFlatEntityMaps.flatObjectMetadataMaps;
  const existingFieldMaps = existingAllFlatEntityMaps.flatFieldMetadataMaps;
  const flatObjectMetadataMaps = copyFlatEntityMaps(existingObjectMaps);
  const flatFieldMetadataMaps = copyFlatEntityMaps(existingFieldMaps);

  const applicationFields: (FlatFieldMetadata | UniversalFlatFieldMetadata)[] =
    Object.values(
      toAllUniversalFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

  for (const object of Object.values(
    toAllUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      isDefined(object) &&
      !isDefined(
        existingObjectMaps.byUniversalIdentifier[object.universalIdentifier],
      )
    ) {
      applicationFields.push(
        ...Object.values(
          buildReservedSystemFlatFieldMetadatasForCustomObject({
            flatObjectMetadata: object,
          }),
        ),
      );
    }
  }

  const applicationFieldsByObjectUniversalIdentifier = new Map<
    string,
    (FlatFieldMetadata | UniversalFlatFieldMetadata)[]
  >();

  for (const field of applicationFields) {
    const objectFields =
      applicationFieldsByObjectUniversalIdentifier.get(
        field.objectMetadataUniversalIdentifier,
      ) ?? [];

    objectFields.push(field);
    applicationFieldsByObjectUniversalIdentifier.set(
      field.objectMetadataUniversalIdentifier,
      objectFields,
    );
  }

  const isReplacedByApplicationFields = (field: FlatFieldMetadata) =>
    field.applicationId === ownerApplicationId && !field.isSystem;

  const objectUniversalIdentifiersToRebuild = new Set([
    ...Object.keys(
      toAllUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    ),
    ...applicationFieldsByObjectUniversalIdentifier.keys(),
    ...Object.values(existingFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(isReplacedByApplicationFields)
      .map((field) => field.objectMetadataUniversalIdentifier),
  ]);

  for (const objectUniversalIdentifier of objectUniversalIdentifiersToRebuild) {
    const existingObject =
      existingObjectMaps.byUniversalIdentifier[objectUniversalIdentifier];
    const object =
      toAllUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        objectUniversalIdentifier
      ] ?? existingObject;
    const objectId =
      idByUniversalIdentifierByMetadataName.objectMetadata?.[
        objectUniversalIdentifier
      ] ?? existingObject?.id;

    if (!isDefined(object) || !isDefined(objectId)) {
      continue;
    }

    const fieldIds = (existingObject?.fieldIds ?? []).filter((fieldId) => {
      const field = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: existingFieldMaps,
      });

      return isDefined(field) && !isReplacedByApplicationFields(field);
    });

    for (const field of applicationFieldsByObjectUniversalIdentifier.get(
      objectUniversalIdentifier,
    ) ?? []) {
      const fieldId =
        idByUniversalIdentifierByMetadataName.fieldMetadata?.[
          field.universalIdentifier
        ];

      if (!isDefined(fieldId)) {
        continue;
      }

      setFlatEntity(flatFieldMetadataMaps, {
        ...field,
        id: fieldId,
        objectMetadataId: objectId,
        settings: field.universalSettings,
      } as FlatFieldMetadata);
      fieldIds.push(fieldId);
    }

    setFlatEntity(flatObjectMetadataMaps, {
      ...existingObject,
      ...object,
      id: objectId,
      fieldIds,
    });
  }

  return {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular: buildObjectIdByNameMaps(flatObjectMetadataMaps)
      .idByNameSingular,
  };
};
