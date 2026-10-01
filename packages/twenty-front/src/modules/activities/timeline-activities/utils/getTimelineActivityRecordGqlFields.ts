import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { type GenerateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/types/GenerateDepthRecordGqlFieldsFromFields';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { FieldMetadataType } from 'twenty-shared/types';

type GetTimelineActivityRecordGqlFieldsParams = Pick<
  GenerateDepthRecordGqlFieldsFromFields,
  'objectMetadataItems' | 'fields'
>;

// Cached linked labels predate permission checks, so only the authorized live record identifier may render.
export const getTimelineActivityRecordGqlFields = ({
  objectMetadataItems,
  fields,
}: GetTimelineActivityRecordGqlFieldsParams): RecordGqlFields =>
  generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: fields.filter(
      (field) =>
        field.type !== FieldMetadataType.MORPH_RELATION &&
        field.name !== 'linkedRecordCachedName',
    ),
    depth: 1,
  });
