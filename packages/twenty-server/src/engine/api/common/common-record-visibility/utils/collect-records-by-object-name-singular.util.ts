import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getRecordFieldEntries } from 'src/engine/api/common/utils/get-record-field-entries.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
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
  const relationFieldByNameByObjectMetadataId = new Map<
    string,
    Map<string, OrmFlatFieldMetadata>
  >();

  const getRelationFieldByName = (objectMetadata: FlatObjectMetadata) => {
    const cachedRelationFieldByName = relationFieldByNameByObjectMetadataId.get(
      objectMetadata.id,
    );

    if (isDefined(cachedRelationFieldByName)) {
      return cachedRelationFieldByName;
    }

    const relationFieldByName = new Map(
      getFlatFieldsFromFlatObjectMetadata(objectMetadata, flatFieldMetadataMaps)
        .filter(isMorphOrRelationFlatFieldMetadata)
        .map((relationField) => [relationField.name, relationField]),
    );

    relationFieldByNameByObjectMetadataId.set(
      objectMetadata.id,
      relationFieldByName,
    );

    return relationFieldByName;
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

    for (const { fieldName, value: relationValue } of getRecordFieldEntries(
      record,
    )) {
      const relationField =
        getRelationFieldByName(objectMetadata).get(fieldName);

      if (
        !isDefined(relationValue) ||
        !isDefined(relationField?.relationTargetObjectMetadataId)
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
