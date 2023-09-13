import type { ViewFieldTextMetadata } from '@/ui/editable-field/types/ViewField';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useGenericTextFieldInContext } from '@/ui/table/hooks/useGenericTextFieldInContext';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import { TextInput } from '../../../../input/components/TextInput';
import type { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldTextMetadata>;
};

export function GenericEditableTextCellEditMode({
  columnDefinition,
}: OwnProps) {
  const { fieldValue, setFieldValue, updateTextField } =
    useGenericTextFieldInContext();

  function handleSubmit(newText: string) {
    if (newText === fieldValue) return;

    setFieldValue(newText);

    updateTextField(newText);
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

  return (
    <TextInput
      placeholder={columnDefinition.metadata.placeHolder ?? ''}
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
