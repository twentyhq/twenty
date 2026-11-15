import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommonRelationSelections } from 'src/engine/api/common/types/common-relation-selection.type';
import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const collectRecordsByObjectNameSingular = ({
  records,
  flatObjectMetadata,
  relationSelections,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectNameSingulars,
}: {
  records: ObjectRecord[];
  flatObjectMetadata: FlatObjectMetadata;
  relationSelections: CommonRelationSelections;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectNameSingulars: ReadonlySet<string>;
}): Map<string, ObjectRecord[]> => {
  const collectedRecordsByObjectNameSingular = new Map<
    string,
    Set<ObjectRecord>
  >();

  const visit = ({
    record,
    objectMetadata,
    relationSelections,
  }: {
    record: ObjectRecord;
    objectMetadata: FlatObjectMetadata;
    relationSelections: CommonRelationSelections;
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

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      objectMetadata,
    );

    for (const {
      responseKey,
      relationSelection,
    } of getRelationSelectionEntries(relationSelections)) {
      const relationValue = record[responseKey];
      const fieldId = fieldIdByName[relationSelection.fieldName];

      if (!isDefined(relationValue) || !isDefined(fieldId)) {
        continue;
      }

      const relationField = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(relationField?.relationTargetObjectMetadataId)) {
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
        visit({
          record: relationRecord,
          objectMetadata: targetObjectMetadata,
          relationSelections: relationSelection.relationSelections,
        });
      }
    }
  };

  for (const record of records) {
    visit({ record, objectMetadata: flatObjectMetadata, relationSelections });
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
