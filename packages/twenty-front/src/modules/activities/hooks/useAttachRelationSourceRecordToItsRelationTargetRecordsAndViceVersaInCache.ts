import { useApolloClient } from '@apollo/client';
import { StringKeyOf } from 'type-fest';

import { getRelationDefinition } from '@/apollo/optimistic-effect/utils/getRelationTargetFromRelationSource';
import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectMetadataItemByNameSingular } from '@/object-metadata/utils/getObjectMetadataItemBySingularName';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

export const useAttachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache =
  () => {
    const { objectMetadataItems } = useObjectMetadataItems();

    const apolloClient = useApolloClient();

    const attachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache =
      <
        ParentRecord extends ObjectRecord = ObjectRecord,
        RelationRecord extends ObjectRecord = ObjectRecord,
      >({
        relationSourceRecord,
        relationTargetRecords,
        relationSourceNameSingular,
        relationTargetNameSingular,
        relationSourceFieldName,
        relationTargetFieldName,
      }: {
        relationSourceRecord: ParentRecord;
        relationTargetRecords: RelationRecord[];
        relationSourceNameSingular: string;
        relationTargetNameSingular: string;
        relationSourceFieldName: StringKeyOf<ParentRecord>;
        relationTargetFieldName: StringKeyOf<RelationRecord>;
      }) => {
        const relationSourceObjectMetadataItem =
          getObjectMetadataItemByNameSingular({
            objectMetadataItems,
            objectNameSingular: relationSourceNameSingular,
          });

        const relationTargetObjectMetadataItem =
          getObjectMetadataItemByNameSingular({
            objectMetadataItems,
            objectNameSingular: relationTargetNameSingular,
          });

        const relationSourceFieldMetadataItem =
          relationSourceObjectMetadataItem.fields.find(
            (field) => field.name === relationSourceFieldName,
          );

        if (!isDefined(relationSourceFieldMetadataItem)) {
          throw new Error(
            `Field ${relationSourceFieldName} not found on object ${relationSourceNameSingular}`,
          );
        }

        const relationTargetMetadata = getRelationDefinition({
          fieldMetadataItem: relationSourceFieldMetadataItem,
          objectMetadataItems,
        });

        if (!isDefined(relationTargetMetadata)) {
          throw new Error(
            `Relation metadata not found for field ${relationSourceFieldName} on object ${relationSourceNameSingular}`,
          );
        }

        // TODO: could we use triggerUpdateRelationsOptimisticEffect here?
        relationTargetRecords.forEach((relationTargetRecord) => {
          triggerAttachRelationOptimisticEffect({
            cache: apolloClient.cache,
            relationSourceObjectNameSingular:
              relationSourceObjectMetadataItem.nameSingular,
            relationSourceRecordIdToAttach: relationSourceRecord.id,
            relationTargetFieldName,
            relationTargetObjectNameSingular:
              relationTargetObjectMetadataItem.nameSingular,
            relationTargetRecordId: relationTargetRecord.id,
          });

          triggerAttachRelationOptimisticEffect({
            cache: apolloClient.cache,
            relationSourceObjectNameSingular:
              relationTargetObjectMetadataItem.nameSingular,
            relationSourceRecordIdToAttach: relationTargetRecord.id,
            relationTargetFieldName: relationSourceFieldName,
            relationTargetObjectNameSingular:
              relationSourceObjectMetadataItem.nameSingular,
            relationTargetRecordId: relationSourceRecord.id,
          });
        });
      };

    return {
      attachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache,
    };
  };
