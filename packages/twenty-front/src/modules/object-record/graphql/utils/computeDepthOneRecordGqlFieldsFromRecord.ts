import {
  GenerateDepthOneRecordGqlFields,
  generateDepthOneRecordGqlFields,
} from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type ComputeDepthOneRecordGqlFieldsFromRecordArgs =
  GenerateDepthOneRecordGqlFields & {
    record: Partial<ObjectRecord>;
  };
export const computeDepthOneRecordGqlFieldsFromRecord = ({
  objectMetadataItem,
  record,
}: ComputeDepthOneRecordGqlFieldsFromRecordArgs) => {
  const depthOneRecordGqlFields = generateDepthOneRecordGqlFields({
    objectMetadataItem,
  });
  const recordKeys = Object.keys(record);

  return Object.keys(depthOneRecordGqlFields).reduce<Record<string, boolean>>(
    (acc, key) => {
      return {
        ...acc,
        [key]: recordKeys.includes(key),
      };
    },
    depthOneRecordGqlFields,
  );
};
