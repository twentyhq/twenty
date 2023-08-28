import { useRecoilState } from 'recoil';

import type { ViewFieldMoneyMetadata } from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { TextCellEdit } from './TextCellEdit';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldMoneyMetadata>;
};

export function GenericEditableMoneyCellEditMode({
  fieldDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newText: string) {
    if (newText === fieldValue) return;

    try {
      const numberValue = parseInt(newText);

      if (isNaN(numberValue)) {
        throw new Error('Not a number');
      }

      if (numberValue > 2000000000) {
        throw new Error('Number too big');
      }

      setFieldValue(numberValue.toString());

      if (currentRowEntityId && updateField) {
        updateField(currentRowEntityId, fieldDefinition, numberValue);
      }
    } catch (error) {
      console.warn(
        `In GenericEditableMoneyCellEditMode, Invalid number: ${newText}, ${error}`,
      );
    }
  }

  return (
    <TextCellEdit autoFocus value={fieldValue ?? ''} onSubmit={handleSubmit} />
  );
}
