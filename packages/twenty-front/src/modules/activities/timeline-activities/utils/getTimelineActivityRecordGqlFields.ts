import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import {
  generateDepthRecordGqlFieldsFromFields,
  type GenerateDepthRecordGqlFieldsFromFields,
} from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { FieldMetadataType } from 'twenty-shared/types';

type GetTimelineActivityRecordGqlFieldsParams = Pick<
  GenerateDepthRecordGqlFieldsFromFields,
  'objectMetadataItems' | 'fields'
>;

// Cached linked labels are captured before record permissions are applied, so
// only the authorized live record identifier may reach the native renderer.
// Morph targets are resolved separately because each target has its own query.
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
