import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';

export const collectRecordsByObjectNameSingular = ({
  records,
  flatObjectMetadata,
  selection,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectNameSingulars,
}: {
  records: ObjectRecord[];
  flatObjectMetadata: FlatObjectMetadata;
  selection: CommonSelection;
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
    selection,
  }: {
    record: ObjectRecord;
    objectMetadata: FlatObjectMetadata;
    selection: CommonSelection;
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

    for (const { key, relationSelection } of getRelationSelectionEntries(
      selection,
    )) {
      const relationValue = record[key];

      if (!isDefined(relationValue)) {
        continue;
      }

      const fieldId = fieldIdByName[relationSelection.fieldName];

      const relationTargetObjectMetadataId = isDefined(fieldId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldId,
            flatEntityMaps: flatFieldMetadataMaps,
          })?.relationTargetObjectMetadataId
        : undefined;

      const targetObjectMetadata = isDefined(relationTargetObjectMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

      // Rows under a relation nobody can resolve would skip the visibility check
      if (!isDefined(targetObjectMetadata)) {
        throw new CommonQueryRunnerException(
          `Target object of relation ${relationSelection.fieldName} on ${objectMetadata.nameSingular} not found`,
          CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      const relationRecords: ObjectRecord[] = Array.isArray(relationValue)
        ? relationValue.filter(isDefined)
        : [relationValue];

      for (const relationRecord of relationRecords) {
        visit({
          record: relationRecord,
          objectMetadata: targetObjectMetadata,
          selection: relationSelection.selection,
        });
      }
    }
  };

  for (const record of records) {
    visit({ record, objectMetadata: flatObjectMetadata, selection });
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
