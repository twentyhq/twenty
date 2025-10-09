import { type RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import {
  generateDepthRecordGqlFields,
  type GenerateDepthRecordGqlFields,
} from '@/object-record/graphql/utils/generateDepthRecordGqlFields';
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
  const depthRecordGqlFields = generateDepthRecordGqlFields({
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
