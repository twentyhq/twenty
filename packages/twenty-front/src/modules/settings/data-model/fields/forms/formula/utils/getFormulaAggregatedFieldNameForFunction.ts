import {
  type FieldMetadataType,
  type FormulaAggregateFunctionName,
} from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFormulaAggregatableFieldMetadataItems } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregatableFieldMetadataItems';

export const getFormulaAggregatedFieldNameForFunction = ({
  functionName,
  fieldType,
  currentAggregatedFieldName,
  relatedFieldMetadataItems,
}: {
  functionName: FormulaAggregateFunctionName;
  fieldType: FieldMetadataType;
  currentAggregatedFieldName?: string;
  relatedFieldMetadataItems: Pick<
    FieldMetadataItem,
    'name' | 'isActive' | 'isSystem' | 'type' | 'settings'
  >[];
}): string | undefined => {
  const aggregatableFieldMetadataItems =
    getFormulaAggregatableFieldMetadataItems({
      fieldMetadataItems: relatedFieldMetadataItems,
      functionName,
      fieldType,
    });

  const currentStillAggregatable = aggregatableFieldMetadataItems.find(
    ({ name }) => name === currentAggregatedFieldName,
  );

  return (
    currentStillAggregatable?.name ?? aggregatableFieldMetadataItems[0]?.name
  );
};
