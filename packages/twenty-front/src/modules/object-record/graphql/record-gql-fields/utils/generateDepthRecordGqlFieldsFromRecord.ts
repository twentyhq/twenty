import { type RecordGqlFields } from 'twenty-shared/types';
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

  return Object.fromEntries(
    Object.keys(depthRecordGqlFields)
      .filter((key) => Object.hasOwn(record, key))
      .map((key) => [key, true]),
  );
};
