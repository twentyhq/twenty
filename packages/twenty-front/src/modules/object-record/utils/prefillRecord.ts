import { isUndefined } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateDefaultFieldValue } from '@/object-record/utils/generateDefaultFieldValue';
import { FieldMetadataType, RelationDefinitionType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const prefillRecord = <T extends ObjectRecord>({
  objectMetadataItem,
  input,
}: {
  objectMetadataItem: ObjectMetadataItem;
  input: Record<string, unknown>;
}) => {
  return Object.fromEntries(
    objectMetadataItem.fields
      .map((fieldMetadataItem) => {
        let inputValue = input[fieldMetadataItem.name];
        if (
          !inputValue &&
          fieldMetadataItem.type === FieldMetadataType.Relation &&
          fieldMetadataItem.relationDefinition?.direction ===
            RelationDefinitionType.ManyToOne
        ) {
          const relationIdFieldName = `${fieldMetadataItem.name}Id`;
          const relationIdFieldMetadataItem = objectMetadataItem.fields.find(
            (field) => field.name === relationIdFieldName,
          );
          inputValue = input[relationIdFieldName];

          return relationIdFieldMetadataItem
            ? [relationIdFieldName, inputValue]
            : undefined;
        }

        return [
          fieldMetadataItem.name,
          isUndefined(inputValue)
            ? generateDefaultFieldValue(fieldMetadataItem)
            : inputValue,
        ];
      })
      .filter(isDefined),
  ) as T;
};
