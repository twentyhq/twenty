import { ApolloCache } from '@apollo/client';

import { getRelationDefinition } from '@/apollo/optimistic-effect/utils/getRelationDefinition';
import { isObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isObjectRecordConnection';
import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CORE_OBJECT_NAMES_TO_DELETE_ON_TRIGGER_RELATION_DETACH as CORE_OBJECT_NAMES_TO_DELETE_ON_OPTIMISTIC_RELATION_DETACH } from '@/apollo/types/coreObjectNamesToDeleteOnRelationDetach';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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
}) =>
  sourceObjectMetadataItem.fields.forEach((fieldMetadataItemOnSourceRecord) => {
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
      const shouldStartByDeletingRelationTargetRecordsFromCache =
        CORE_OBJECT_NAMES_TO_DELETE_ON_OPTIMISTIC_RELATION_DETACH.includes(
          targetObjectMetadataItem.nameSingular as CoreObjectNameSingular,
        );

      if (shouldStartByDeletingRelationTargetRecordsFromCache) {
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
      updatedSourceRecord && targetRecordsToAttachTo.length;

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
  });
