import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ApolloClient } from '@apollo/client';
import {
  FieldMetadataType,
  type ObjectPermissions,
  RelationType,
} from 'twenty-shared/types';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

export const updateRecordRelationInCache = ({
  sourceObjectMetadataItem,
  sourceRecordId,
  apolloCoreClient,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  sourceFieldMetadataType,
  sourceFieldMetadataName,
  targetObjectNameSingular,
  targetObjectNamePlural,
  cachedTargetRecord,
}: {
  sourceObjectMetadataItem: ObjectMetadataItem;
  sourceRecordId: string;
  apolloCoreClient: ApolloClient<object>;
  objectMetadataItems: ObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  sourceFieldMetadataType: FieldMetadataType;
  sourceFieldMetadataName: string;
  targetObjectNameSingular: string;
  targetObjectNamePlural: string;
  cachedTargetRecord: ObjectRecord;
}) => {
  const previousRecord = getRecordFromCache({
    objectMetadataItem: sourceObjectMetadataItem,
    recordId: sourceRecordId,
    cache: apolloCoreClient.cache,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
  });

  if (!previousRecord) {
    throw new Error('Could not find cached source record');
  }
  // getRecordFromCache acts diffferently for a morph relation and for a relation field
  // so we need to deduplicate
  const sourceFieldMetadataNameComputed =
    sourceFieldMetadataType === FieldMetadataType.RELATION
      ? sourceFieldMetadataName
      : computeMorphRelationFieldName({
          fieldName: sourceFieldMetadataName,
          relationType: RelationType.ONE_TO_MANY,
          targetObjectMetadataNameSingular: targetObjectNameSingular,
          targetObjectMetadataNamePlural: targetObjectNamePlural,
        });
  const deduplicatedRecords = [
    ...previousRecord[sourceFieldMetadataNameComputed],
    cachedTargetRecord,
  ].reduce<ObjectRecord[]>((deduplicatedArray, record) => {
    if (
      !deduplicatedArray.some(
        (deduplicatedRecord) => deduplicatedRecord.id === record.id,
      )
    ) {
      deduplicatedArray.push(record);
    }
    return deduplicatedArray;
  }, []);

  const previousRecordWithUpdatedRelation = {
    ...previousRecord,
    [sourceFieldMetadataNameComputed]: deduplicatedRecords,
  };

  const gqlFields = computeDepthOneRecordGqlFieldsFromRecord({
    objectMetadataItem: sourceObjectMetadataItem,
    record: previousRecord,
  });

  updateRecordFromCache({
    objectMetadataItems,
    objectMetadataItem: sourceObjectMetadataItem,
    cache: apolloCoreClient.cache,
    record: previousRecordWithUpdatedRelation,
    recordGqlFields: gqlFields,
    objectPermissionsByObjectMetadataId,
  });
};

export default updateRecordRelationInCache;
