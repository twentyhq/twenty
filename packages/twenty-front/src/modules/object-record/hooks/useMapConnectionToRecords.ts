import { useCallback } from 'react';
import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useMapConnectionToRecords = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const mapConnectionToRecords = useCallback(
    <T extends ObjectRecord>({
      objectRecordConnection,
      objectNameSingular,
      objectNamePlural,
      depth,
    }: {
      objectRecordConnection: ObjectRecordConnection<T> | undefined | null;
      objectNameSingular?: string;
      objectNamePlural?: string;
      depth: number;
    }): ObjectRecord[] => {
      if (
        !isDefined(objectRecordConnection) ||
        !isNonEmptyArray(objectMetadataItems)
      ) {
        return [];
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

      const objectRecords = [
        ...(objectRecordConnection.edges?.map((edge) => edge.node) ?? []),
      ];

      return produce(objectRecords, (objectRecordsDraft) => {
        for (const objectRecordDraft of objectRecordsDraft) {
          for (const relationField of relationFields) {
            const relationType = parseFieldRelationType(relationField);

            if (
              relationType === 'TO_ONE_OBJECT' ||
              relationType === 'FROM_ONE_OBJECT'
            ) {
              continue;
            }

            const relatedObjectMetadataSingularName =
              relationField.toRelationMetadata?.fromObjectMetadata
                .nameSingular ??
              relationField.fromRelationMetadata?.toObjectMetadata
                .nameSingular ??
              null;

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

            const relationConnection = objectRecordDraft?.[
              relationField.name
            ] as ObjectRecordConnection | undefined | null;

            if (!isDefined(relationConnection)) {
              continue;
            }

            const relationConnectionMappedToRecords = mapConnectionToRecords({
              objectRecordConnection: relationConnection,
              objectNameSingular: relatedObjectMetadataSingularName,
              depth: depth - 1,
            });

            (objectRecordDraft as any)[relationField.name] =
              relationConnectionMappedToRecords;
          }
        }
      }) as ObjectRecord[];
    },
    [objectMetadataItems],
  );

  return mapConnectionToRecords;
};
