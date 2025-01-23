import { ApolloCache } from '@apollo/client';

import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH } from '@/apollo/types/coreObjectNamesToDeleteOnRelationDetach';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import isEmpty from 'lodash.isempty';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

// TODO should be extracted outside of the file
type ToNameNode = RecordGqlConnection | RecordGqlNode | null;
type GetDetachMetricsArgs = {
  relationDefinition: NonNullable<FieldMetadataItem['relationDefinition']>;
  currentFieldValueOnSourceRecord: ToNameNode;
  updatedFieldValueOnSourceRecord: ToNameNode;
};
type GetDetachMetricsReport = {
  targetRecordsToDetachFrom: RecordGqlNode[];
  targetRecordsToAttachTo: RecordGqlNode[];
};
const getDetachMetricsToRename = ({
  currentFieldValueOnSourceRecord,
  relationDefinition,
  updatedFieldValueOnSourceRecord,
}: GetDetachMetricsArgs): GetDetachMetricsReport => {
  // console.log(
  //   relationDefinition,
  //   currentFieldValueOnSourceRecord,
  //   updatedFieldValueOnSourceRecord,
  // );
  const computeIsRecordConnection = () => {
    switch (relationDefinition.direction) {
      case RelationDefinitionType.MANY_TO_MANY:
      case RelationDefinitionType.ONE_TO_MANY: {
        return true;
      }
      case RelationDefinitionType.MANY_TO_ONE:
      case RelationDefinitionType.ONE_TO_ONE: {
        return false;
      }
      default: {
        return assertUnreachable(relationDefinition.direction);
      }
    }
  };
  const isRecordConnection = computeIsRecordConnection();
  const functionToGiveANameTo = (value: ToNameNode): RecordGqlNode[] => {
    console.log(value, relationDefinition.direction);
    // I don't understand typing here, we sometimes received empty array ?
    // Zod schema validation was stripping this use case before
    if (!isDefined(value) || isEmpty(value)) {
      return [];
    }

    if (isRecordConnection) {
      return value?.edges.map(({ node }: any) => node as RecordGqlNode);
    }

    return [value] as RecordGqlNode[];
  };

  const targetRecordsToDetachFrom = functionToGiveANameTo(
    currentFieldValueOnSourceRecord,
  );
  const targetRecordsToAttachTo = functionToGiveANameTo(
    updatedFieldValueOnSourceRecord,
  );

  return {
    targetRecordsToDetachFrom,
    targetRecordsToAttachTo,
  };
};

type triggerUpdateRelationsOptimisticEffectArgs = {
  cache: ApolloCache<unknown>;
  sourceObjectMetadataItem: ObjectMetadataItem;
  currentSourceRecord: ObjectRecord | null;
  updatedSourceRecord: ObjectRecord | null;
  objectMetadataItems: ObjectMetadataItem[];
};
export const triggerUpdateRelationsOptimisticEffect = ({
  cache,
  sourceObjectMetadataItem,
  currentSourceRecord,
  updatedSourceRecord,
  objectMetadataItems,
}: triggerUpdateRelationsOptimisticEffectArgs) => {
  console.log({
    cache,
    sourceObjectMetadataItem,
    currentSourceRecord,
    updatedSourceRecord,
    objectMetadataItems,
  });
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
      const { targetRecordsToAttachTo, targetRecordsToDetachFrom } =
        getDetachMetricsToRename({
          currentFieldValueOnSourceRecord,
          relationDefinition,
          updatedFieldValueOnSourceRecord,
        });

      // From my understanding could be named
      // hasCachedSourceThatCouldBeDetach
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
        targetRecordsToAttachTo.forEach((targetRecordsToAttachTo) =>
          triggerAttachRelationOptimisticEffect({
            cache,
            sourceObjectNameSingular: sourceObjectMetadataItem.nameSingular,
            sourceRecordId: updatedSourceRecord.id,
            fieldNameOnTargetRecord: targetFieldMetadata.name,
            targetObjectNameSingular: targetObjectMetadata.nameSingular,
            targetRecordId: targetRecordsToAttachTo.id,
          }),
        );
      }
    },
  );
};
