import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import {
  generateDepthRecordGqlFieldsFromObject,
  type GenerateDepthRecordGqlFields,
} from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type ComputeDepthRecordGqlFieldsFromRecordArgs =
  GenerateDepthRecordGqlFields & {
    record: Partial<ObjectRecord>;
  };
export const generateDepthRecordGqlFieldsFromRecord = ({
  objectMetadataItem,
  objectMetadataItems,
  depth,
  record,
}: ComputeDepthRecordGqlFieldsFromRecordArgs): RecordGqlFields => {
  const depthRecordGqlFields = generateDepthRecordGqlFieldsFromObject({
    objectMetadataItem,
    objectMetadataItems,
    depth,
  });
  const recordKeys = Object.keys(record);

  return Object.keys(depthRecordGqlFields).reduce<RecordGqlFields>(
    (acc, key) => {
      return {
        ...acc,
        [key]: recordKeys.includes(key),
      };
    },
    depthRecordGqlFields,
  );
};
