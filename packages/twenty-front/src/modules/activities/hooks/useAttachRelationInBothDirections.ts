import { useApolloClient } from '@apollo/client';
import { StringKeyOf } from 'type-fest';

import { getRelationDefinition } from '@/apollo/optimistic-effect/utils/getRelationDefinition';
import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectMetadataItemByNameSingular } from '@/object-metadata/utils/getObjectMetadataItemBySingularName';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

export const useAttachRelationInBothDirections = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const apolloClient = useApolloClient();

  const attachRelationInBothDirections = <
    Source extends ObjectRecord = ObjectRecord,
    Target extends ObjectRecord = ObjectRecord,
  >({
    sourceRecord,
    targetRecords,
    sourceObjectNameSingular,
    targetObjectNameSingular,
    fieldNameOnSourceRecord,
    fieldNameOnTargetRecord,
  }: {
    sourceRecord: Source;
    targetRecords: Target[];
    sourceObjectNameSingular: string;
    targetObjectNameSingular: string;
    fieldNameOnSourceRecord: StringKeyOf<Source>;
    fieldNameOnTargetRecord: StringKeyOf<Target>;
  }) => {
    const sourceObjectMetadataItem = getObjectMetadataItemByNameSingular({
      objectMetadataItems,
      objectNameSingular: sourceObjectNameSingular,
    });

    const targetObjectMetadataItem = getObjectMetadataItemByNameSingular({
      objectMetadataItems,
      objectNameSingular: targetObjectNameSingular,
    });

    const fieldMetadataItemOnSourceRecord =
      sourceObjectMetadataItem.fields.find(
        (field) => field.name === fieldNameOnSourceRecord,
      );

    if (!isDefined(fieldMetadataItemOnSourceRecord)) {
      throw new Error(
        `Field ${fieldNameOnSourceRecord} not found on object ${sourceObjectNameSingular}`,
      );
    }

    const relationDefinition = getRelationDefinition({
      fieldMetadataItemOnSourceRecord: fieldMetadataItemOnSourceRecord,
      objectMetadataItems,
    });

    if (!isDefined(relationDefinition)) {
      throw new Error(
        `Relation metadata not found for field ${fieldNameOnSourceRecord} on object ${sourceObjectNameSingular}`,
      );
    }

    // TODO: could we use triggerUpdateRelationsOptimisticEffect here?
    targetRecords.forEach((relationTargetRecord) => {
      triggerAttachRelationOptimisticEffect({
        cache: apolloClient.cache,
        sourceObjectNameSingular: sourceObjectMetadataItem.nameSingular,
        sourceRecordId: sourceRecord.id,
        fieldNameOnTargetRecord: fieldNameOnTargetRecord,
        targetObjectNameSingular: targetObjectMetadataItem.nameSingular,
        targetRecordId: relationTargetRecord.id,
      });

      triggerAttachRelationOptimisticEffect({
        cache: apolloClient.cache,
        sourceObjectNameSingular: targetObjectMetadataItem.nameSingular,
        sourceRecordId: relationTargetRecord.id,
        fieldNameOnTargetRecord: fieldNameOnSourceRecord,
        targetObjectNameSingular: sourceObjectMetadataItem.nameSingular,
        targetRecordId: sourceRecord.id,
      });
    });
  };

  return {
    attachRelationInBothDirections,
  };
};
