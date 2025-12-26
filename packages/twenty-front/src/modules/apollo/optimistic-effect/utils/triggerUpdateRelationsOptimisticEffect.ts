import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH } from '@/apollo/types/coreObjectNamesToDeleteOnRelationDetach';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ApolloCache } from '@apollo/client';
import { isArray } from '@sniptt/guards';
import {
  FieldMetadataType,
  RelationType,
  type ObjectPermissions,
} from 'twenty-shared/types';
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
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
};

export const triggerUpdateRelationsOptimisticEffect = ({
  cache,
  sourceObjectMetadataItem,
  currentSourceRecord,
  updatedSourceRecord,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  upsertRecordsInStore,
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
        upsertRecordsInStore,
        objectPermissionsByObjectMetadataId,
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
        upsertRecordsInStore,
        objectPermissionsByObjectMetadataId,
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
  upsertRecordsInStore,
  objectPermissionsByObjectMetadataId,
}: {
  fieldMetadataItemOnSourceRecord: FieldMetadataItem;
  updatedSourceRecord: RecordGqlNode | null;
  currentSourceRecord: RecordGqlNode | null;
  objectMetadataItems: ObjectMetadataItem[];
  sourceObjectMetadataItem: ObjectMetadataItem;
  cache: ApolloCache<unknown>;
  isDeletion: boolean;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
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
    | RecordGqlConnectionEdgesRequired
    | RecordGqlNode
    | null = currentSourceRecord?.[fieldMetadataItemOnSourceRecord.name];

  const updatedFieldValueOnSourceRecord:
    | RecordGqlConnectionEdgesRequired
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

  const gqlFieldNameOnTargetRecord =
    targetFieldMetadataFullObject.type === FieldMetadataType.RELATION
      ? targetFieldMetadataFullObject.name
      : computeMorphRelationFieldName({
          fieldName: targetFieldMetadataFullObject.name,
          relationType: targetFieldMetadataFullObject.settings?.relationType,
          targetObjectMetadataNameSingular:
            sourceObjectMetadataItem.nameSingular,
          targetObjectMetadataNamePlural: sourceObjectMetadataItem.namePlural,
        });
  if (
    shouldCascadeDeleteTargetRecords &&
    targetRecordsToDetachFrom.length > 0
  ) {
    triggerDestroyRecordsOptimisticEffect({
      cache,
      objectMetadataItem: fullTargetObjectMetadataItem,
      recordsToDestroy: targetRecordsToDetachFrom,
      objectMetadataItems,
      upsertRecordsInStore,
      objectPermissionsByObjectMetadataId,
    });
  } else if (
    isDefined(currentSourceRecord) &&
    targetRecordsToDetachFrom.length > 0
  ) {
    targetRecordsToDetachFrom.forEach((targetRecordToDetachFrom) => {
      triggerDetachRelationOptimisticEffect({
        cache,
        sourceObjectNameSingular: sourceObjectMetadataItem.nameSingular,
        sourceRecordId: currentSourceRecord.id,
        fieldNameOnTargetRecord: gqlFieldNameOnTargetRecord,
        targetObjectMetadataItem: fullTargetObjectMetadataItem,
        targetRecordId: targetRecordToDetachFrom.id,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
        upsertRecordsInStore,
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
        fieldNameOnTargetRecord: gqlFieldNameOnTargetRecord,
        targetObjectMetadataItem: fullTargetObjectMetadataItem,
        targetRecordId: targetRecordToAttachTo.id,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
        upsertRecordsInStore,
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
  objectPermissionsByObjectMetadataId,
  upsertRecordsInStore,
}: {
  fieldMetadataItemOnSourceRecord: FieldMetadataItem;
  updatedSourceRecord: RecordGqlNode | null;
  currentSourceRecord: RecordGqlNode | null;
  objectMetadataItems: ObjectMetadataItem[];
  sourceObjectMetadataItem: ObjectMetadataItem;
  cache: ApolloCache<unknown>;
  isDeletion: boolean;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
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
      | RecordGqlConnectionEdgesRequired
      | RecordGqlNode
      | null = currentSourceRecord?.[gqlFieldMorphRelation];

    const updatedFieldValueOnSourceRecord:
      | RecordGqlConnectionEdgesRequired
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
    if (
      shouldCascadeDeleteTargetRecords &&
      targetRecordsToDetachFrom.length > 0
    ) {
      triggerDestroyRecordsOptimisticEffect({
        cache,
        objectMetadataItem: fullTargetObjectMetadataItem,
        recordsToDestroy: targetRecordsToDetachFrom,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
        upsertRecordsInStore,
      });
    } else if (
      isDefined(currentSourceRecord) &&
      targetRecordsToDetachFrom.length > 0
    ) {
      targetRecordsToDetachFrom.forEach((targetRecordToDetachFrom) => {
        triggerDetachRelationOptimisticEffect({
          cache,
          sourceObjectNameSingular: sourceObjectMetadataItem.nameSingular,
          sourceRecordId: currentSourceRecord.id,
          fieldNameOnTargetRecord: targetFieldMetadata.name,
          targetObjectMetadataItem: fullTargetObjectMetadataItem,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          targetRecordId: targetRecordToDetachFrom.id,
          upsertRecordsInStore,
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
          targetObjectMetadataItem: fullTargetObjectMetadataItem,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          targetRecordId: targetRecordToAttachTo.id,
          upsertRecordsInStore,
        }),
      );
    }
  });
};

const extractTargetRecordsFromRelation = (
  value: RecordGqlConnectionEdgesRequired | RecordGqlNode | null,
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
  if (relation.type === RelationType.ONE_TO_MANY) {
    return value.edges.map(({ node }: { node: RecordGqlNode }) => node);
  }

  return [value as RecordGqlNode];
};
