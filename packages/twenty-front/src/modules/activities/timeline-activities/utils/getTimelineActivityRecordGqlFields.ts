import {
  type RecordGqlFields,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { computeMorphRelationGqlFieldName } from 'twenty-shared/utils';
import { type GenerateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/types/GenerateDepthRecordGqlFieldsFromFields';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';

type GetTimelineActivityRecordGqlFieldsParams = Pick<
  GenerateDepthRecordGqlFieldsFromFields,
  'objectMetadataItems' | 'fields'
>;

// Cached linked labels predate permission checks, so only the authorized live record identifier may render.
// Morph relations are skipped because each morph target is resolved by its own query.
export const getTimelineActivityRecordGqlFields = ({
  objectMetadataItems,
  fields,
}: GetTimelineActivityRecordGqlFieldsParams): RecordGqlFields => ({
  ...generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: fields.filter(
      (field) =>
        field.type !== FieldMetadataType.MORPH_RELATION &&
        field.name !== 'linkedRecordCachedName',
    ),
    depth: 1,
  }),
  ...Object.fromEntries(
    fields
      .filter((field) => field.type === FieldMetadataType.MORPH_RELATION)
      .flatMap((field) =>
        (field.morphRelations ?? [])
          .filter(
            (morphRelation) => morphRelation.type === RelationType.MANY_TO_ONE,
          )
          .map((morphRelation) => [
            `${computeMorphRelationGqlFieldName({
              fieldName: field.name,
              relationType: morphRelation.type,
              targetObjectMetadataNameSingular:
                morphRelation.targetObjectMetadata.nameSingular,
              targetObjectMetadataNamePlural:
                morphRelation.targetObjectMetadata.namePlural,
            })}Id`,
            true,
          ]),
      ),
  ),
});
