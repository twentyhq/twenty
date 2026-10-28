import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordBoardCardAmountRecordField = () => {
  const {
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  return visibleRecordFields.find((recordField) => {
    const fieldDefinition =
      fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

    return (
      recordField.fieldMetadataItemId !==
        labelIdentifierFieldMetadataItem?.id &&
      isDefined(fieldDefinition) &&
      isFieldCurrency(fieldDefinition)
    );
  });
};
