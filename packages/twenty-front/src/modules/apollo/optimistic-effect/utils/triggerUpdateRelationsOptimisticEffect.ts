import { ApolloCache } from '@apollo/client';

import { getRelationDefinition } from '@/apollo/optimistic-effect/utils/getRelationTargetFromRelationSource';
import { isObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isObjectRecordConnection';
import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { triggerDetachRelationSourceFromRelationTargetOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
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
  relationSourceObjectMetadataItem,
  currentRelationSourceRecord,
  updatedRelationSourceRecord,
  objectMetadataItems,
}: {
  cache: ApolloCache<unknown>;
  relationSourceObjectMetadataItem: ObjectMetadataItem;
  currentRelationSourceRecord: CachedObjectRecord | null;
  updatedRelationSourceRecord: CachedObjectRecord | null;
  objectMetadataItems: ObjectMetadataItem[];
}) =>
  relationSourceObjectMetadataItem.fields.forEach(
    (relationSourceFieldMetadataItem) => {
      const isNotARelationField =
        relationSourceFieldMetadataItem.type !== FieldMetadataType.Relation;

      if (isNotARelationField) {
        return;
      }

      const updatedRelationSourceRecordDoesNotHaveThisField =
        isDefined(updatedRelationSourceRecord) &&
        !(relationSourceFieldMetadataItem.name in updatedRelationSourceRecord);

      if (updatedRelationSourceRecordDoesNotHaveThisField) {
        return;
      }

      const relationTarget = getRelationDefinition({
        fieldMetadataItem: relationSourceFieldMetadataItem,
        objectMetadataItems,
      });

      if (!relationTarget) {
        return;
      }

      const {
        relationTargetObjectMetadataItem,
        relationTargetFieldMetadataItem,
      } = relationTarget;

      const currentRelationSourceFieldValue:
        | ObjectRecordConnection
        | CachedObjectRecord
        | null =
        currentRelationSourceRecord?.[relationSourceFieldMetadataItem.name];

      const updatedRelationSourceFieldValue:
        | ObjectRecordConnection
        | CachedObjectRecord
        | null =
        updatedRelationSourceRecord?.[relationSourceFieldMetadataItem.name];

      if (
        isDeeplyEqual(
          currentRelationSourceFieldValue,
          updatedRelationSourceFieldValue,
        )
      ) {
        return;
      }

      const isCurrentRelationSourceFieldValueARecordConnection =
        isObjectRecordConnection(
          relationTargetObjectMetadataItem.nameSingular,
          currentRelationSourceFieldValue,
        );

      const relationTargetRecordsToDetachFrom =
        isCurrentRelationSourceFieldValueARecordConnection
          ? currentRelationSourceFieldValue.edges.map(
              ({ node }) => node as CachedObjectRecord,
            )
          : [currentRelationSourceFieldValue].filter(isDefined);

      const isUpdatedRelationSourceFieldValueARecordConnection =
        isObjectRecordConnection(
          relationTargetObjectMetadataItem.nameSingular,
          updatedRelationSourceFieldValue,
        );

      const relationTargetRecordsToAttachTo =
        isUpdatedRelationSourceFieldValueARecordConnection
          ? updatedRelationSourceFieldValue.edges.map(
              ({ node }) => node as CachedObjectRecord,
            )
          : [updatedRelationSourceFieldValue].filter(isDefined);

      const shouldDetachSourceFromAllTargets =
        isDefined(currentRelationSourceRecord) &&
        relationTargetRecordsToDetachFrom.length > 0;

      if (shouldDetachSourceFromAllTargets) {
        const shouldStartByDeletingRelationTargetRecordsFromCache =
          CORE_OBJECT_NAMES_TO_DELETE_ON_OPTIMISTIC_RELATION_DETACH.includes(
            relationTargetObjectMetadataItem.nameSingular as CoreObjectNameSingular,
          );

        if (shouldStartByDeletingRelationTargetRecordsFromCache) {
          triggerDeleteRecordsOptimisticEffect({
            cache,
            objectMetadataItem: relationTargetObjectMetadataItem,
            recordsToDelete: relationTargetRecordsToDetachFrom,
            objectMetadataItems,
          });
        } else {
          relationTargetRecordsToDetachFrom.forEach(
            (relationTargetRecordToDetachFrom) => {
              triggerDetachRelationSourceFromRelationTargetOptimisticEffect({
                cache,
                relationSourceObjectNameSingular:
                  relationSourceObjectMetadataItem.nameSingular,
                relationSourceRecordIdToDetach: currentRelationSourceRecord.id,
                relationTargetFieldName: relationTargetFieldMetadataItem.name,
                relationTargetObjectNameSingular:
                  relationTargetObjectMetadataItem.nameSingular,
                relationTargetRecordId: relationTargetRecordToDetachFrom.id,
              });
            },
          );
        }
      }

      const shouldAttachSourceToAllTargets =
        updatedRelationSourceRecord && relationTargetRecordsToAttachTo.length;

      if (shouldAttachSourceToAllTargets) {
        relationTargetRecordsToAttachTo.forEach(
          (relationTargetRecordToAttachTo) =>
            triggerAttachRelationOptimisticEffect({
              cache,
              relationSourceObjectNameSingular:
                relationSourceObjectMetadataItem.nameSingular,
              relationSourceRecordIdToAttach: updatedRelationSourceRecord.id,
              relationTargetFieldName: relationTargetFieldMetadataItem.name,
              relationTargetObjectNameSingular:
                relationTargetObjectMetadataItem.nameSingular,
              relationTargetRecordId: relationTargetRecordToAttachTo.id,
            }),
        );
      }
    },
  );
