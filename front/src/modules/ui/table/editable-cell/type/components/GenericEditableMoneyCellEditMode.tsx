import { useRecoilState } from 'recoil';

import type { ViewFieldMoneyMetadata } from '@/ui/editable-field/types/ViewField';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import { TextInput } from '../../../../input/components/TextInput';
import type { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldMoneyMetadata>;
};

export function GenericEditableMoneyCellEditMode({
  columnDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  // TODO: handle this logic in a number input
  function handleSubmit(newText: string) {
    if (newText === fieldValue) return;

    try {
      const numberValue = newText !== '' ? parseInt(newText) : null;

      if (numberValue && isNaN(numberValue)) {
        throw new Error('Not a number');
      }

      if (numberValue && numberValue > 2000000000) {
        throw new Error('Number too big');
      }

      setFieldValue(numberValue ? numberValue.toString() : '');

      if (currentRowEntityId && updateField) {
        updateField(currentRowEntityId, columnDefinition, numberValue);
      }
    } catch (error) {
      console.warn(
        `In GenericEditableMoneyCellEditMode, Invalid number: ${newText}, ${error}`,
      );
    }
  }

  const {
    handleEnter,
    handleEscape,
    handleTab,
    handleShiftTab,
    handleClickOutside,
  } = useCellInputEventHandlers({
    onSubmit: handleSubmit,
  });

  // TODO: use a number input
  return (
    <TextInput
      autoFocus
      value={fieldValue ?? ''}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onTab={handleTab}
      onShiftTab={handleShiftTab}
      hotkeyScope={TableHotkeyScope.CellEditMode}
    />
  );
}
