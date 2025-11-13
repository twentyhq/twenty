import { isUndefined } from '@sniptt/guards';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated/graphql';

type PrefillRecordArgs = {
  objectMetadataItem: ObjectMetadataItem;
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
        if (
          fieldMetadataItem.type === FieldMetadataType.RELATION &&
          fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE
        ) {
          const joinColumnValue =
            input[fieldMetadataItem.settings?.joinColumnName] ?? null;
          throwIfInputRelationDataIsInconsistent(input, fieldMetadataItem);

          return [
            [fieldMetadataItem.name, fieldValue],
            [fieldMetadataItem.settings?.joinColumnName, joinColumnValue],
          ];
        }
        if (
          fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION &&
          fieldMetadataItem.settings?.relationType === RelationType.MANY_TO_ONE
        ) {
          const gqlFields = fieldMetadataItem.morphRelations?.map(
            (morphRelation) => {
              return computeMorphRelationFieldName({
                fieldName: fieldMetadataItem.name,
                relationType: morphRelation.type,
                targetObjectMetadataNameSingular:
                  morphRelation.targetObjectMetadata.nameSingular,
                targetObjectMetadataNamePlural:
                  morphRelation.targetObjectMetadata.namePlural,
              });
            },
          );

          return gqlFields?.flatMap((gqlField) => [
            [gqlField, fieldValue],
            [`${gqlField}Id`, input[`${gqlField}Id`] ?? null],
          ]);
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
  const relationIdFieldName = `${fieldMetadataItem.name}Id`;
  if (isDefined(inputValue) && !isDefined(input[relationIdFieldName])) {
    throw new Error(
      `Inconsistent input: ${fieldMetadataItem.name} is specified but ${relationIdFieldName} is missing`,
    );
  }
};
