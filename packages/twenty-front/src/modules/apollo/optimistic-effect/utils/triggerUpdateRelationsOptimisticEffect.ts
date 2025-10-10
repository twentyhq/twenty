import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH } from '@/apollo/types/coreObjectNamesToDeleteOnRelationDetach';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';
import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type ApolloCache } from '@apollo/client';
import { isArray } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  computeMorphRelationFieldName,
  CustomError,
  isDefined,
} from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type TriggerUpdateRelationsOptimisticEffectArgs = {
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
}: TriggerUpdateRelationsOptimisticEffectArgs) => {
  const isDeletion =
    isDefined(updatedSourceRecord) &&
    isDefined(updatedSourceRecord['deletedAt']);

  sourceObjectMetadataItem.fields.forEach((fieldMetadataItemOnSourceRecord) => {
    if (
      !isFieldMorphRelation(fieldMetadataItemOnSourceRecord) &&
      !isFieldRelation(fieldMetadataItemOnSourceRecord)
    ) {
      return;
    }

    if (isFieldRelation(fieldMetadataItemOnSourceRecord)) {
      triggerUpdateRelationOptimisticEffect({
        fieldMetadataItemOnSourceRecord,
        updatedSourceRecord,
        currentSourceRecord,
        objectMetadataItems,
        sourceObjectMetadataItem,
        cache,
        isDeletion,
      });
    }

    if (isFieldMorphRelation(fieldMetadataItemOnSourceRecord)) {
      triggerUpdateMorphRelationOptimisticEffect({
        fieldMetadataItemOnSourceRecord,
        updatedSourceRecord,
        currentSourceRecord,
        objectMetadataItems,
        sourceObjectMetadataItem,
        cache,
        isDeletion,
      });
    }
  });
};

const triggerUpdateRelationOptimisticEffect = ({
  fieldMetadataItemOnSourceRecord,
  updatedSourceRecord,
  currentSourceRecord,
  objectMetadataItems,
  sourceObjectMetadataItem,
  cache,
  isDeletion,
}: {
  fieldMetadataItemOnSourceRecord: FieldMetadataItem;
  updatedSourceRecord: RecordGqlNode | null;
  currentSourceRecord: RecordGqlNode | null;
  objectMetadataItems: ObjectMetadataItem[];
  sourceObjectMetadataItem: ObjectMetadataItem;
  cache: ApolloCache<unknown>;
  isDeletion: boolean;
}) => {
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

  const { fieldMetadataItem: targetFieldMetadataFullObject } =
    getFieldMetadataItemById({
      fieldMetadataId: targetFieldMetadata.id,
      objectMetadataItems,
    });
  if (!targetFieldMetadataFullObject) {
    throw new CustomError(
      'Target field metadata full object not found',
      'TARGET_FIELD_METADATA_FULL_OBJECT_NOT_FOUND',
    );
  }

  const fullTargetObjectMetadataItem = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === targetObjectMetadata.nameSingular,
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

  const recordToExtractDetachFrom = isDeletion
    ? updatedFieldValueOnSourceRecord
    : currentFieldValueOnSourceRecord;
  const targetRecordsToDetachFrom = extractTargetRecordsFromRelation(
    recordToExtractDetachFrom,
    relation,
  );

  // TODO: see if we can de-hardcode this, put cascade delete in relation metadata item
  //   Instead of hardcoding it here
  const shouldCascadeDeleteTargetRecords =
    CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH.includes(
      targetObjectMetadata.nameSingular as CoreObjectNameSingular,
    );
  const fieldNameOnTargetRecord =
    targetFieldMetadataFullObject.type === FieldMetadataType.RELATION
      ? targetFieldMetadataFullObject.name
      : computeMorphRelationFieldName({
          fieldName: targetFieldMetadataFullObject.name,
          relationType: targetFieldMetadataFullObject.settings?.relationType,
          targetObjectMetadataNameSingular:
            sourceObjectMetadataItem.nameSingular,
          targetObjectMetadataNamePlural: sourceObjectMetadataItem.namePlural,
        });
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
        fieldNameOnTargetRecord: fieldNameOnTargetRecord,
        targetObjectNameSingular: targetObjectMetadata.nameSingular,
        targetRecordId: targetRecordToDetachFrom.id,
      });
    });
  }

  if (!isDeletion && isDefined(updatedSourceRecord)) {
    const targetRecordsToAttachTo = extractTargetRecordsFromRelation(
      updatedFieldValueOnSourceRecord,
      relation,
    );

    targetRecordsToAttachTo.forEach((targetRecordToAttachTo) =>
      triggerAttachRelationOptimisticEffect({
        cache,
        sourceObjectNameSingular: sourceObjectMetadataItem.nameSingular,
        sourceRecordId: updatedSourceRecord.id,
        fieldNameOnTargetRecord: fieldNameOnTargetRecord,
        targetObjectNameSingular: targetObjectMetadata.nameSingular,
        targetRecordId: targetRecordToAttachTo.id,
      }),
    );
  }
};

const triggerUpdateMorphRelationOptimisticEffect = ({
  fieldMetadataItemOnSourceRecord,
  updatedSourceRecord,
  currentSourceRecord,
  objectMetadataItems,
  sourceObjectMetadataItem,
  cache,
  isDeletion,
}: {
  fieldMetadataItemOnSourceRecord: FieldMetadataItem;
  updatedSourceRecord: RecordGqlNode | null;
  currentSourceRecord: RecordGqlNode | null;
  objectMetadataItems: ObjectMetadataItem[];
  sourceObjectMetadataItem: ObjectMetadataItem;
  cache: ApolloCache<unknown>;
  isDeletion: boolean;
}) => {
  const morphRelations = fieldMetadataItemOnSourceRecord.morphRelations;
  if (!morphRelations) {
    return;
  }

  morphRelations.forEach((morphRelation) => {
    const gqlFieldMorphRelation = computeMorphRelationFieldName({
      fieldName: fieldMetadataItemOnSourceRecord.name,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular:
        morphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        morphRelation.targetObjectMetadata.namePlural,
    });

    const { fieldMetadataItem: targetFieldMetadataFullObject } =
      getFieldMetadataItemById({
        fieldMetadataId: morphRelation.targetFieldMetadata.id,
        objectMetadataItems,
      });
    if (!targetFieldMetadataFullObject) {
      throw new CustomError(
        'Target field metadata full object not found',
        'TARGET_FIELD_METADATA_FULL_OBJECT_NOT_FOUND',
      );
    }

    const fieldDoesNotExist =
      isDefined(updatedSourceRecord) &&
      !(gqlFieldMorphRelation in updatedSourceRecord);

    if (fieldDoesNotExist) {
      return;
    }

    const { targetObjectMetadata, targetFieldMetadata } = morphRelation;

    const fullTargetObjectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === targetObjectMetadata.nameSingular,
    );

    if (!fullTargetObjectMetadataItem) {
      return;
    }

    const currentFieldValueOnSourceRecord:
      | RecordGqlConnection
      | RecordGqlNode
      | null = currentSourceRecord?.[gqlFieldMorphRelation];

    const updatedFieldValueOnSourceRecord:
      | RecordGqlConnection
      | RecordGqlNode
      | null = updatedSourceRecord?.[gqlFieldMorphRelation];

    const noDiff = isDeeplyEqual(
      currentFieldValueOnSourceRecord,
      updatedFieldValueOnSourceRecord,
      { strict: true },
    );
    if (noDiff && !isDeletion) {
      return;
    }

    const recordToExtractDetachFrom = isDeletion
      ? updatedFieldValueOnSourceRecord
      : currentFieldValueOnSourceRecord;
    const targetRecordsToDetachFrom = extractTargetRecordsFromRelation(
      recordToExtractDetachFrom,
      morphRelation,
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
        morphRelation,
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
  });
};

const extractTargetRecordsFromRelation = (
  value: RecordGqlConnection | RecordGqlNode | null,
  relation: FieldMetadataItemRelation,
): RecordGqlNode[] => {
  // TODO investigate on the root cause of array injection here, should never occurs
  // Cache might be corrupted somewhere due to ObjectRecord and RecordGqlNode inclusion
  if (!isDefined(value) || isArray(value)) {
    return [];
  }
  if (!isDefined(relation)) {
    throw new Error('Relation found is undefined');
  }
  if (isObjectRecordConnection(relation, value)) {
    return value.edges.map(({ node }) => node);
  }

  return [value];
};
