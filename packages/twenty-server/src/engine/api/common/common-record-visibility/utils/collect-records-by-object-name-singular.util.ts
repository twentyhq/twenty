import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const collectRecordsByObjectNameSingular = ({
  records,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectNameSingulars,
}: {
  records: ObjectRecord[];
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectNameSingulars: ReadonlySet<string>;
}): Map<string, ObjectRecord[]> => {
  const collectedRecordsByObjectNameSingular = new Map<
    string,
    Set<ObjectRecord>
  >();
  const relationFieldsByObjectMetadataId = new Map<
    string,
    OrmFlatFieldMetadata[]
  >();

  const getRelationFields = (objectMetadata: FlatObjectMetadata) => {
    const cachedRelationFields = relationFieldsByObjectMetadataId.get(
      objectMetadata.id,
    );

    if (isDefined(cachedRelationFields)) {
      return cachedRelationFields;
    }

    const relationFields = getFlatFieldsFromFlatObjectMetadata(
      objectMetadata,
      flatFieldMetadataMaps,
    ).filter(isMorphOrRelationFlatFieldMetadata);

    relationFieldsByObjectMetadataId.set(objectMetadata.id, relationFields);

    return relationFields;
  };

  const visit = ({
    record,
    objectMetadata,
  }: {
    record: ObjectRecord;
    objectMetadata: FlatObjectMetadata;
  }) => {
    if (objectNameSingulars.has(objectMetadata.nameSingular)) {
      const collectedRecords =
        collectedRecordsByObjectNameSingular.get(objectMetadata.nameSingular) ??
        new Set<ObjectRecord>();

      collectedRecords.add(record);
      collectedRecordsByObjectNameSingular.set(
        objectMetadata.nameSingular,
        collectedRecords,
      );
    }

    for (const relationField of getRelationFields(objectMetadata)) {
      const relationValue = record[relationField.name];

      if (
        !isDefined(relationValue) ||
        !isDefined(relationField.relationTargetObjectMetadataId)
      ) {
        continue;
      }

      const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationField.relationTargetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(targetObjectMetadata)) {
        continue;
      }

      const relationRecords: ObjectRecord[] = Array.isArray(relationValue)
        ? relationValue.filter(isDefined)
        : [relationValue];

      for (const relationRecord of relationRecords) {
        visit({ record: relationRecord, objectMetadata: targetObjectMetadata });
      }
    }
  };

  for (const record of records) {
    visit({ record, objectMetadata: flatObjectMetadata });
  }

  return new Map(
    [...collectedRecordsByObjectNameSingular].map(
      ([objectNameSingular, collectedRecords]) => [
        objectNameSingular,
        [...collectedRecords],
      ],
    ),
  );
};
