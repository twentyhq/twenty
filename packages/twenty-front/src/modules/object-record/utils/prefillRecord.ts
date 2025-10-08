import { isUndefined } from '@sniptt/guards';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { isDefined } from 'twenty-shared/utils';
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
          const joinColumnName = fieldMetadataItem.settings?.joinColumnName;
          const joinColumnValue = input[joinColumnName as string];
          throwIfInputRelationDataIsInconsistent(input, fieldMetadataItem);

          const pairs: Array<[string, unknown]> = [
            [fieldMetadataItem.name, fieldValue],
          ];

          // Only include the join column when a concrete value is provided.
          // This avoids writing undefined values into the cache (which Apollo treats as missing fields),
          // and prevents generateDepthOneRecordGqlFieldsFromRecord from marking those fields as required.
          if (isDefined(joinColumnName) && isDefined(joinColumnValue)) {
            pairs.push([joinColumnName as string, joinColumnValue]);
          }

          return pairs;
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
