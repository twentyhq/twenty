import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { isRecordGqlFieldsNode } from '@/object-record/graphql/utils/isRecordGraphlFieldsNode';

type MapObjectMetadataToGraphQLQueryArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'nameSingular' | 'fields'>;
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  isRootLevel?: boolean;
};
export const mapObjectMetadataToGraphQLQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  computeReferences = false,
  isRootLevel = true,
}: MapObjectMetadataToGraphQLQueryArgs): string => {
  const fieldsThatShouldBeQueried =
    objectMetadataItem?.fields
      .filter((field) => field.isActive)
      .sort((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name))
      .filter((field) =>
        shouldFieldBeQueried({
          field,
          recordGqlFields,
        }),
      ) ?? [];

  if (!isRootLevel && computeReferences) {
    return `{
      __ref
    }`;
  }

  return `{
__typename
${fieldsThatShouldBeQueried
  .map((field) => {
    const currentRecordGqlFields = recordGqlFields?.[field.name];
    const relationRecordGqlFields = isRecordGqlFieldsNode(
      currentRecordGqlFields,
    )
      ? currentRecordGqlFields
      : undefined;
    return mapFieldMetadataToGraphQLQuery({
      objectMetadataItems,
      field,
      relationRecordGqlFields,
      computeReferences,
    });
  })
  .join('\n')}
}`;
};
