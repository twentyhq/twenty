import { useCallback } from 'react';
import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldRelationDirections } from '@/object-metadata/utils/getFieldRelationDirections';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { useMapRecordsToConnection } from '@/object-record/hooks/useMapRecordsToConnection';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useMapRelationRecordsToRelationConnection = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const mapRecordsToConnection = useMapRecordsToConnection();

  const mapRecordRelationRecordsToRelationConnection = useCallback(
    <T extends Partial<ObjectRecord>>({
      objectRecord,
      objectNameSingular,
      depth = 5,
    }: {
      objectRecord: T | undefined | null;
      objectNameSingular: string;
      depth?: number;
    }): T | null => {
      if (!isDefined(objectRecord) || !isNonEmptyArray(objectMetadataItems)) {
        return null;
      }

      const currentLevelObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === objectNameSingular,
      );

      if (!currentLevelObjectMetadataItem) {
        throw new Error(
          `Could not find object metadata item for object name singular "${objectNameSingular}" in mapConnectionToRecords`,
        );
      }

      const relationFields = currentLevelObjectMetadataItem.fields.filter(
        (field) => field.type === FieldMetadataType.Relation,
      );

      return produce(objectRecord, (objectRecordDraft) => {
        for (const relationField of relationFields) {
          const relationDirections = getFieldRelationDirections(relationField);

          if (relationDirections.to !== 'TO_MANY_OBJECTS') {
            continue;
          }

          const relatedObjectMetadataSingularName =
            relationField.relationDefinition?.targetObjectMetadata.nameSingular;

          const relationFieldMetadataItem = objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.nameSingular ===
              relatedObjectMetadataSingularName,
          );

          if (
            !relationFieldMetadataItem ||
            !isDefined(relatedObjectMetadataSingularName)
          ) {
            throw new Error(
              `Could not find relation object metadata item for object name plural ${relationField.name} in mapConnectionToRecords`,
            );
          }

          const relationRecords = objectRecord?.[relationField.name] as
            | ObjectRecord[]
            | undefined
            | null;

          if (!isNonEmptyArray(relationRecords)) {
            (objectRecordDraft as any)[relationField.name] =
              getRecordConnectionFromRecords({
                objectNameSingular: relatedObjectMetadataSingularName,
                records: [],
              });
          } else {
            const relationConnection = mapRecordsToConnection({
              objectRecords: relationRecords,
              objectNameSingular: relatedObjectMetadataSingularName,
              depth: depth - 1,
            });

            (objectRecordDraft as any)[relationField.name] = relationConnection;
          }
        }
      }) as T;
    },
    [objectMetadataItems, mapRecordsToConnection],
  );

  return {
    mapRecordRelationRecordsToRelationConnection,
  };
};
