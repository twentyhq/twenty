import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH } from '@/apollo/types/coreObjectNamesToDeleteOnRelationDetach';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { ApolloCache } from '@apollo/client';
import { isArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type triggerUpdateRelationsOptimisticEffectArgs = {
  cache: ApolloCache<unknown>;
  sourceObjectMetadataItem: ObjectMetadataItem;
  currentSourceRecord: RecordGqlNode | null;
  updatedSourceRecord: RecordGqlNode | null;
  objectMetadataItems: ObjectMetadataItem[];
};
export const triggerUpdateRelationsOptimisticEffect = ({
  cache,
  sourceObjectMetadataItem,
  currentSourceRecord,
  updatedSourceRecord,
  objectMetadataItems,
}: triggerUpdateRelationsOptimisticEffectArgs) => {
  const isDeletion =
    isDefined(updatedSourceRecord) &&
    isDefined(updatedSourceRecord['deletedAt']);

  return sourceObjectMetadataItem.fields.forEach(
    (fieldMetadataItemOnSourceRecord) => {
      const notARelationField =
        fieldMetadataItemOnSourceRecord.type !== FieldMetadataType.RELATION;

      if (notARelationField) {
        return;
      }

      const fieldDoesNotExist =
        isDefined(updatedSourceRecord) &&
        !(fieldMetadataItemOnSourceRecord.name in updatedSourceRecord);

      if (fieldDoesNotExist) {
        return;
      }

      const relation = fieldMetadataItemOnSourceRecord.relation;

      if (!relation) {
        return;
      }

      const { targetObjectMetadata, targetFieldMetadata } = relation;

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

      const noDiff = isDeeplyEqual(
        currentFieldValueOnSourceRecord,
        updatedFieldValueOnSourceRecord,
        { strict: true },
      );
      if (noDiff && !isDeletion) {
        return;
      }

      const extractTargetRecordsFromRelation = (
        value: RecordGqlConnection | RecordGqlNode | null,
      ): RecordGqlNode[] => {
        // TODO investigate on the root cause of array injection here, should never occurs
        // Cache might be corrupted somewhere due to ObjectRecord and RecordGqlNode inclusion
        if (!isDefined(value) || isArray(value)) {
          return [];
        }

        if (isObjectRecordConnection(relation, value)) {
          return value.edges.map(({ node }) => node);
        }

        return [value];
      };

      const recordToExtractDetachFrom = isDeletion
        ? updatedFieldValueOnSourceRecord
        : currentFieldValueOnSourceRecord;
      const targetRecordsToDetachFrom = extractTargetRecordsFromRelation(
        recordToExtractDetachFrom,
      );

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
      } else if (isDefined(currentSourceRecord)) {
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

      if (!isDeletion && isDefined(updatedSourceRecord)) {
        const targetRecordsToAttachTo = extractTargetRecordsFromRelation(
          updatedFieldValueOnSourceRecord,
        );

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
