import { ApolloCache } from '@apollo/client';

import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH } from '@/apollo/types/coreObjectNamesToDeleteOnRelationDetach';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
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
  currentSourceRecord: ObjectRecord | null;
  updatedSourceRecord: ObjectRecord | null;
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

      const relationDefinition =
        fieldMetadataItemOnSourceRecord.relationDefinition;

      if (!relationDefinition) {
        return;
      }

      const { targetObjectMetadata, targetFieldMetadata } = relationDefinition;

      const fullTargetObjectMetadataItem = objectMetadataItems.find(
        ({ nameSingular }) =>
          nameSingular === targetObjectMetadata.nameSingular,
      );

      if (!fullTargetObjectMetadataItem) {
        return;
      }

      const currentFieldValueOnSourceRecord:
        | RecordGqlConnection
        | RecordGqlNode
        | null = currentSourceRecord?.[fieldMetadataItemOnSourceRecord.name];

      const updatedFieldValueOnSourceRecord:
        | RecordGqlConnection
        | RecordGqlNode
        | null = updatedSourceRecord?.[fieldMetadataItemOnSourceRecord.name];

      if (
        isDeeplyEqual(
          currentFieldValueOnSourceRecord,
          updatedFieldValueOnSourceRecord,
          { strict: true },
        )
      ) {
        return;
      }

      // TODO: replace this by a relation type check, if it's one to many,
      //   it's an object record connection (we can still check it though as a safeguard)
      const currentFieldValueOnSourceRecordIsARecordConnection =
        isObjectRecordConnection(
          targetObjectMetadata.nameSingular,
          currentFieldValueOnSourceRecord,
        );

      const targetRecordsToDetachFrom =
        currentFieldValueOnSourceRecordIsARecordConnection
          ? currentFieldValueOnSourceRecord.edges.map(
              ({ node }) => node as RecordGqlNode,
            )
          : [currentFieldValueOnSourceRecord].filter(isDefined);

      const updatedFieldValueOnSourceRecordIsARecordConnection =
        isObjectRecordConnection(
          targetObjectMetadata.nameSingular,
          updatedFieldValueOnSourceRecord,
        );

      const targetRecordsToAttachTo =
        updatedFieldValueOnSourceRecordIsARecordConnection
          ? updatedFieldValueOnSourceRecord.edges.map(
              ({ node }) => node as RecordGqlNode,
            )
          : [updatedFieldValueOnSourceRecord].filter(isDefined);

      const shouldDetachSourceFromAllTargets =
        isDefined(currentSourceRecord) && targetRecordsToDetachFrom.length > 0;

      if (shouldDetachSourceFromAllTargets) {
        // TODO: see if we can de-hardcode this, put cascade delete in relation metadata item
        //   Instead of hardcoding it here
        const shouldCascadeDeleteTargetRecords =
          CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH.includes(
            targetObjectMetadata.nameSingular as CoreObjectNameSingular,
          );

        if (shouldCascadeDeleteTargetRecords) {
          triggerDestroyRecordsOptimisticEffect({
            cache,
            objectMetadataItem: fullTargetObjectMetadataItem,
            recordsToDestroy: targetRecordsToDetachFrom,
            objectMetadataItems,
          });
        } else {
          targetRecordsToDetachFrom.forEach((targetRecordToDetachFrom) => {
            triggerDetachRelationOptimisticEffect({
              cache,
              sourceObjectNameSingular: sourceObjectMetadataItem.nameSingular,
              sourceRecordId: currentSourceRecord.id,
              fieldNameOnTargetRecord: targetFieldMetadata.name,
              targetObjectNameSingular: targetObjectMetadata.nameSingular,
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
            fieldNameOnTargetRecord: targetFieldMetadata.name,
            targetObjectNameSingular: targetObjectMetadata.nameSingular,
            targetRecordId: targetRecordToAttachTo.id,
          }),
        );
      }
    },
  );
};
