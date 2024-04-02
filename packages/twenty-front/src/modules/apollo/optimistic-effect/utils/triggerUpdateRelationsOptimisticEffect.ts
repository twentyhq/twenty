import { ApolloCache } from '@apollo/client';

import { getRelationDefinition } from '@/apollo/optimistic-effect/utils/getRelationDefinition';
import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH } from '@/apollo/types/coreObjectNamesToDeleteOnRelationDetach';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

export const triggerUpdateRelationsOptimisticEffect = ({
  cache,
  sourceObjectMetadataItem,
  currentSourceRecord,
  updatedSourceRecord,
  objectMetadataItems,
}: {
  cache: ApolloCache<unknown>;
  sourceObjectMetadataItem: ObjectMetadataItem;
  currentSourceRecord: CachedObjectRecord | null;
  updatedSourceRecord: CachedObjectRecord | null;
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  return sourceObjectMetadataItem.fields.forEach(
    (fieldMetadataItemOnSourceRecord) => {
      const notARelationField =
        fieldMetadataItemOnSourceRecord.type !== FieldMetadataType.Relation;

      if (notARelationField) {
        return;
      }

      const fieldDoesNotExist =
        isDefined(updatedSourceRecord) &&
        !(fieldMetadataItemOnSourceRecord.name in updatedSourceRecord);

      if (fieldDoesNotExist) {
        return;
      }

      const relationDefinition = getRelationDefinition({
        fieldMetadataItemOnSourceRecord,
        objectMetadataItems,
      });
      if (!relationDefinition) {
        return;
      }

      const { targetObjectMetadataItem, fieldMetadataItemOnTargetRecord } =
        relationDefinition;

      const currentFieldValueOnSourceRecord:
        | ObjectRecordConnection
        | CachedObjectRecord
        | null = currentSourceRecord?.[fieldMetadataItemOnSourceRecord.name];

      const updatedFieldValueOnSourceRecord:
        | ObjectRecordConnection
        | CachedObjectRecord
        | null = updatedSourceRecord?.[fieldMetadataItemOnSourceRecord.name];

      if (
        isDeeplyEqual(
          currentFieldValueOnSourceRecord,
          updatedFieldValueOnSourceRecord,
        )
      ) {
        return;
      }

      // TODO: replace this by a relation type check, if it's one to many,
      //   it's an object record connection (we can still check it though as a safeguard)
      const currentFieldValueOnSourceRecordIsARecordConnection =
        isObjectRecordConnection(
          targetObjectMetadataItem.nameSingular,
          currentFieldValueOnSourceRecord,
        );

      const targetRecordsToDetachFrom =
        currentFieldValueOnSourceRecordIsARecordConnection
          ? currentFieldValueOnSourceRecord.edges.map(
              ({ node }) => node as CachedObjectRecord,
            )
          : [currentFieldValueOnSourceRecord].filter(isDefined);

      const updatedFieldValueOnSourceRecordIsARecordConnection =
        isObjectRecordConnection(
          targetObjectMetadataItem.nameSingular,
          updatedFieldValueOnSourceRecord,
        );

      const targetRecordsToAttachTo =
        updatedFieldValueOnSourceRecordIsARecordConnection
          ? updatedFieldValueOnSourceRecord.edges.map(
              ({ node }) => node as CachedObjectRecord,
            )
          : [updatedFieldValueOnSourceRecord].filter(isDefined);

      const shouldDetachSourceFromAllTargets =
        isDefined(currentSourceRecord) && targetRecordsToDetachFrom.length > 0;

      if (shouldDetachSourceFromAllTargets) {
        // TODO: see if we can de-hardcode this, put cascade delete in relation metadata item
        //   Instead of hardcoding it here
        const shouldCascadeDeleteTargetRecords =
          CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH.includes(
            targetObjectMetadataItem.nameSingular as CoreObjectNameSingular,
          );

        if (shouldCascadeDeleteTargetRecords) {
          triggerDeleteRecordsOptimisticEffect({
            cache,
            objectMetadataItem: targetObjectMetadataItem,
            recordsToDelete: targetRecordsToDetachFrom,
            objectMetadataItems,
          });
        } else {
          targetRecordsToDetachFrom.forEach((targetRecordToDetachFrom) => {
            triggerDetachRelationOptimisticEffect({
              cache,
              sourceObjectNameSingular: sourceObjectMetadataItem.nameSingular,
              sourceRecordId: currentSourceRecord.id,
              fieldNameOnTargetRecord: fieldMetadataItemOnTargetRecord.name,
              targetObjectNameSingular: targetObjectMetadataItem.nameSingular,
              targetRecordId: targetRecordToDetachFrom.id,
            });
          });
        }
      }

      const shouldAttachSourceToAllTargets =
        isDefined(updatedSourceRecord) && targetRecordsToAttachTo.length > 0;

      if (shouldAttachSourceToAllTargets) {
        targetRecordsToAttachTo.forEach((targetRecordToAttachTo) =>
          triggerAttachRelationOptimisticEffect({
            cache,
            sourceObjectNameSingular: sourceObjectMetadataItem.nameSingular,
            sourceRecordId: updatedSourceRecord.id,
            fieldNameOnTargetRecord: fieldMetadataItemOnTargetRecord.name,
            targetObjectNameSingular: targetObjectMetadataItem.nameSingular,
            targetRecordId: targetRecordToAttachTo.id,
          }),
        );
      }
    },
  );
};
