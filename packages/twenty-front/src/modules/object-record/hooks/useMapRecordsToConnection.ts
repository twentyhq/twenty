import { useCallback } from 'react';
import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldRelationDirections } from '@/object-metadata/utils/getFieldRelationDirections';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useMapRecordsToConnection = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const mapRecordsToConnection = useCallback(
    <T extends ObjectRecord>({
      objectRecords,
      objectNameSingular,
      objectNamePlural,
      depth,
    }: {
      objectRecords: T[] | undefined | null;
      objectNameSingular: string;
      objectNamePlural?: string;
      depth: number;
    }): ObjectRecordConnection<T> => {
      if (!isDefined(objectRecords) || !isNonEmptyArray(objectMetadataItems)) {
        const objectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular === objectNameSingular,
        );

        if (!objectMetadataItem) {
          throw new Error(
            `Could not find object metadata item for object name singular "${objectNameSingular}" in mapConnectionToRecords`,
          );
        }

        return getRecordConnectionFromRecords({
          objectMetadataItems,
          objectMetadataItem,
          records: [],
        });
      }

      const currentLevelObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === objectNameSingular ||
          objectMetadataItem.namePlural === objectNamePlural,
      );

      if (!currentLevelObjectMetadataItem) {
        throw new Error(
          `Could not find object metadata item for object name singular "${objectNameSingular}" in mapConnectionToRecords`,
        );
      }

      const relationFields = currentLevelObjectMetadataItem.fields.filter(
        (field) => field.type === FieldMetadataType.Relation,
      );

      const newRecordsWithRelationConnection = produce(
        objectRecords,
        (objectRecordsDraft) => {
          for (const objectRecordDraft of objectRecordsDraft) {
            for (const relationField of relationFields) {
              const relationDirections =
                getFieldRelationDirections(relationField);

              if (relationDirections.to !== 'TO_MANY_OBJECTS') {
                continue;
              }

              const relatedObjectMetadataSingularName =
                relationField.relationDefinition?.targetObjectMetadata
                  .nameSingular;

              const relationFieldMetadataItem = objectMetadataItems.find(
                (objectMetadataItem) =>
                  objectMetadataItem.nameSingular ===
                  relatedObjectMetadataSingularName,
              );

              if (
                !isDefined(relationFieldMetadataItem) ||
                !isDefined(relatedObjectMetadataSingularName)
              ) {
                throw new Error(
                  `Could not find relation object metadata item for object name plural ${relationField.name} in mapConnectionToRecords`,
                );
              }

              const relationRecords = objectRecordDraft?.[
                relationField.name
              ] as ObjectRecord[] | undefined | null;

              if (!isNonEmptyArray(relationRecords)) {
                (objectRecordDraft as any)[relationField.name] =
                  getRecordConnectionFromRecords({
                    objectMetadataItems,
                    objectMetadataItem: relationFieldMetadataItem,
                    records: [],
                  });
              } else {
                const relationConnection = mapRecordsToConnection({
                  objectRecords: relationRecords,
                  objectNameSingular: relatedObjectMetadataSingularName,
                  depth: depth - 1,
                });

                (objectRecordDraft as any)[relationField.name] =
                  relationConnection;
              }
            }
          }
        },
      ) as T[];

      const newConnection = getRecordConnectionFromRecords({
        objectMetadataItems,
        objectMetadataItem: currentLevelObjectMetadataItem,
        records: newRecordsWithRelationConnection,
      });

      return newConnection;
    },
    [objectMetadataItems],
  );

  return mapRecordsToConnection;
};
