import { ApolloCache } from '@apollo/client';

import { isObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isObjectRecordConnection';
import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { coreObjectNamesToDeleteOnRelationDetach } from '@/apollo/types/coreObjectNamesToDeleteOnRelationDetach';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

export const triggerUpdateRelationsOptimisticEffect = ({
  cache,
  objectMetadataItem,
  previousRecord,
  nextRecord,
  getRelationMetadata,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  previousRecord: CachedObjectRecord | null;
  nextRecord: CachedObjectRecord | null;
  getRelationMetadata: ReturnType<typeof useGetRelationMetadata>;
}) =>
  // Optimistically update relation records
  objectMetadataItem.fields.forEach((fieldMetadataItem) => {
    if (nextRecord && !(fieldMetadataItem.name in nextRecord)) return;

    const relationMetadata = getRelationMetadata({
      fieldMetadataItem,
    });

    if (!relationMetadata) return;

    const {
      // Object metadata for the related record
      relationObjectMetadataItem,
      // Field on the related record
      relationFieldMetadataItem,
    } = relationMetadata;

    const previousFieldValue:
      | ObjectRecordConnection
      | CachedObjectRecord
      | null = previousRecord?.[fieldMetadataItem.name];
    const nextFieldValue: ObjectRecordConnection | CachedObjectRecord | null =
      nextRecord?.[fieldMetadataItem.name];

    if (isDeeplyEqual(previousFieldValue, nextFieldValue)) return;

    const isPreviousFieldValueRecordConnection = isObjectRecordConnection(
      relationObjectMetadataItem.nameSingular,
      previousFieldValue,
    );
    const relationRecordsToDetach = isPreviousFieldValueRecordConnection
      ? previousFieldValue.edges.map(({ node }) => node as CachedObjectRecord)
      : [previousFieldValue].filter(isDefined);

    const isNextFieldValueRecordConnection = isObjectRecordConnection(
      relationObjectMetadataItem.nameSingular,
      nextFieldValue,
    );
    const relationRecordsToAttach = isNextFieldValueRecordConnection
      ? nextFieldValue.edges.map(({ node }) => node as CachedObjectRecord)
      : [nextFieldValue].filter(isDefined);

    if (previousRecord && relationRecordsToDetach.length) {
      const shouldDeleteRelationRecord =
        coreObjectNamesToDeleteOnRelationDetach.includes(
          relationObjectMetadataItem.nameSingular as CoreObjectNameSingular,
        );

      if (shouldDeleteRelationRecord) {
        triggerDeleteRecordsOptimisticEffect({
          cache,
          objectMetadataItem: relationObjectMetadataItem,
          records: relationRecordsToDetach,
          getRelationMetadata,
        });
      } else {
        relationRecordsToDetach.forEach((relationRecordToDetach) => {
          triggerDetachRelationOptimisticEffect({
            cache,
            objectNameSingular: objectMetadataItem.nameSingular,
            recordId: previousRecord.id,
            relationFieldName: relationFieldMetadataItem.name,
            relationObjectMetadataNameSingular:
              relationObjectMetadataItem.nameSingular,
            relationRecordId: relationRecordToDetach.id,
          });
        });
      }
    }

    if (nextRecord && relationRecordsToAttach.length) {
      relationRecordsToAttach.forEach((relationRecordToAttach) =>
        triggerAttachRelationOptimisticEffect({
          cache,
          objectNameSingular: objectMetadataItem.nameSingular,
          recordId: nextRecord.id,
          relationFieldName: relationFieldMetadataItem.name,
          relationObjectMetadataNameSingular:
            relationObjectMetadataItem.nameSingular,
          relationRecordId: relationRecordToAttach.id,
        }),
      );
    }
  });
