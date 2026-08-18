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

// Timeline rows render scalars and the author only, and the server resolves every requested morph target with its own relation query.
export const getTimelineActivityRecordGqlFields = ({
  objectMetadataItems,
  fields,
}: GetTimelineActivityRecordGqlFieldsParams): RecordGqlFields =>
  generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: fields.filter(
      (field) => field.type !== FieldMetadataType.MORPH_RELATION,
    ),
    depth: 1,
  });
