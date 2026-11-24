import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';

type FormulaAggregateRelationFieldMetadataItem = Pick<
  FieldMetadataItem,
  'isActive' | 'type' | 'relation'
>;

export const getFormulaAggregateRelationFieldMetadataItems = <
  TFieldMetadataItem extends FormulaAggregateRelationFieldMetadataItem,
>(
  fieldMetadataItems: TFieldMetadataItem[],
): (TFieldMetadataItem & {
  relation: NonNullable<TFieldMetadataItem['relation']>;
})[] =>
  fieldMetadataItems.filter(
    (
      fieldMetadataItem,
    ): fieldMetadataItem is TFieldMetadataItem & {
      relation: NonNullable<TFieldMetadataItem['relation']>;
    } =>
      fieldMetadataItem.isActive === true &&
      isOneToManyRelationField(fieldMetadataItem),
  );
