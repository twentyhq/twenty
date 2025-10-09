import { type RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import {
  type GenerateDepthOneRecordGqlFields,
  generateDepthOneRecordGqlFields,
} from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type ComputeDepthOneRecordGqlFieldsFromRecordArgs =
  GenerateDepthOneRecordGqlFields & {
    record: Partial<ObjectRecord>;
  };
export const computeDepthOneRecordGqlFieldsFromRecord = ({
  objectMetadataItem,
  record,
}: ComputeDepthOneRecordGqlFieldsFromRecordArgs): RecordGqlFields => {
  const depthOneRecordGqlFields = generateDepthOneRecordGqlFields({
    objectMetadataItem,
  });
  const recordKeys = Object.keys(record);

  return Object.keys(depthOneRecordGqlFields).reduce<RecordGqlFields>(
    (acc, key) => {
      return {
        ...acc,
        [key]: recordKeys.includes(key),
      };
    },
    depthOneRecordGqlFields,
  );
};
