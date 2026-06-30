import { isUndefined } from '@sniptt/guards';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import {
  computeMorphRelationGqlFieldName,
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type PrefillRecordArgs = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  input: Record<string, unknown>;
};
export const prefillRecord = <T extends ObjectRecord>({
  objectMetadataItem,
  input,
}: PrefillRecordArgs) => {
  return Object.fromEntries(
    objectMetadataItem.fields
      .map((fieldMetadataItem) => {
        const inputValue = input[fieldMetadataItem.name];
        const fieldValue = isUndefined(inputValue)
          ? generateEmptyFieldValue({ fieldMetadataItem })
          : inputValue;
        if (isManyToOneRelationField(fieldMetadataItem)) {
          const joinColumnName = computeRelationGqlFieldJoinColumnName({
            name: fieldMetadataItem.name,
          });
          const joinColumnValue = input[joinColumnName] ?? null;
          throwIfInputRelationDataIsInconsistent(input, fieldMetadataItem);

          return [
            [fieldMetadataItem.name, fieldValue],
            [joinColumnName, joinColumnValue],
          ];
        }
        if (
          fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION &&
          fieldMetadataItem.settings?.relationType === RelationType.MANY_TO_ONE
        ) {
          const gqlFields = fieldMetadataItem.morphRelations?.map(
            (morphRelation) => {
              return computeMorphRelationGqlFieldName({
                fieldName: fieldMetadataItem.name,
                relationType: morphRelation.type,
                targetObjectMetadataNameSingular:
                  morphRelation.targetObjectMetadata.nameSingular,
                targetObjectMetadataNamePlural:
                  morphRelation.targetObjectMetadata.namePlural,
              });
            },
          );

          return gqlFields?.flatMap((gqlField) => {
            const joinColumnName = computeRelationGqlFieldJoinColumnName({
              name: gqlField,
            });
            return [
              [gqlField, fieldValue],
              [joinColumnName, input[joinColumnName] ?? null],
            ];
          });
        }

        return [[fieldMetadataItem.name, fieldValue]];
      })
      .flat()
      .filter(isDefined),
  ) as T;
};

const throwIfInputRelationDataIsInconsistent = (
  input: Record<string, unknown>,
  fieldMetadataItem: FieldMetadataItem,
) => {
  const inputValue = input[fieldMetadataItem.name];
  const relationIdFieldName = computeRelationGqlFieldJoinColumnName({
    name: fieldMetadataItem.name,
  });
  if (isDefined(inputValue) && !isDefined(input[relationIdFieldName])) {
    throw new Error(
      `Inconsistent input: ${fieldMetadataItem.name} is specified but ${relationIdFieldName} is missing`,
    );
  }
};
