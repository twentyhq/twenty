import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH } from '@/apollo/types/coreObjectNamesToDeleteOnRelationDetach';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { computePossibleMorphGqlFieldForFieldName } from '@/object-record/cache/utils/computePossibleMorphGqlFieldForFieldName';
import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';
import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type ApolloCache } from '@apollo/client';
import { isArray } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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
      if (
        fieldMetadataItemOnSourceRecord.type ===
        FieldMetadataType.MORPH_RELATION
      ) {
        debugger;
      }
      if (
        !isFieldMorphRelation(fieldMetadataItemOnSourceRecord) &&
        !isFieldRelation(fieldMetadataItemOnSourceRecord)
      ) {
        return;
      }

      let relationFound;
      if (isFieldRelation(fieldMetadataItemOnSourceRecord)) {
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
        // const { targetObjectMetadata, targetFieldMetadata } = relation;
        relationFound = relation;
      }

      if (isFieldMorphRelation(fieldMetadataItemOnSourceRecord)) {
        const morphRelations = fieldMetadataItemOnSourceRecord.morphRelations;
        if (!morphRelations) {
          return;
        }
        const possibleMorphRelationsNames =
          computePossibleMorphGqlFieldForFieldName({
            morphRelations,
            fieldName: fieldMetadataItemOnSourceRecord.name,
          });

        const morphRelationFound = isDefined(updatedSourceRecord)
          ? possibleMorphRelationsNames.find(
              (possibleMorphRelationName) =>
                possibleMorphRelationName in updatedSourceRecord,
            )
          : undefined;

        const fieldDoesNotExist =
          isDefined(updatedSourceRecord) && !morphRelationFound;

        if (fieldDoesNotExist) {
          return;
        }

        if (!morphRelationFound) {
          return;
        }

        const morphRelation = morphRelations.find(
          (morphRelation) =>
            morphRelation.sourceFieldMetadata.id ===
            fieldMetadataItemOnSourceRecord.id,
        );

        relationFound = morphRelation;
      }
      if (!relationFound) {
        return;
      }
      const { targetObjectMetadata, targetFieldMetadata } = relationFound;

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

        if (isObjectRecordConnection(relationFound, value)) {
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
