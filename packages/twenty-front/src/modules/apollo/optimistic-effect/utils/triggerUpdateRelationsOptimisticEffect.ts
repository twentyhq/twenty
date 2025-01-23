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

// TODO relocate
const computeIsRecordConnection = (
  relationDefinition: NonNullable<FieldMetadataItem['relationDefinition']>,
) => {
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
      const isRecordConnection = computeIsRecordConnection(relationDefinition);
      // TODO refactor typing as possible ? review  RecordGqlConnection | RecordGqlNode | null
      const extractTargetFromFieldValue = (
        value: RecordGqlConnection | RecordGqlNode | null,
      ): RecordGqlNode[] => {
        // I don't understand typing here, we sometimes received empty array ?
        // Zod schema validation was stripping this use case before
        if (!isDefined(value) || isEmpty(value)) {
          return [];
        }

        if (isRecordConnection) {
          return value.edges.map(({ node }: any) => node as RecordGqlNode);
        }

        return [value] as RecordGqlNode[];
      };
      const targetRecordsToDetachFrom = extractTargetFromFieldValue(
        currentFieldValueOnSourceRecord,
      );
      const targetRecordsToAttachTo = extractTargetFromFieldValue(
        updatedFieldValueOnSourceRecord,
      );

      // Is something like hasCachedSourceThatCouldBeDetach ?
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
