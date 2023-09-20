import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { FieldEmailMetadata } from '@/ui/field/types/FieldMetadata';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { ViewFieldDefinition } from '@/views/types/ViewFieldDefinition';

import { TextInput } from '../../../../input/components/TextInput';

type OwnProps = {
  columnDefinition: ViewFieldDefinition<FieldEmailMetadata>;
};

export const GenericEditableEmailCellEditMode = ({
  columnDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

  const handleSubmit = (newEmail: string) => {
    if (newEmail === fieldValue) return;

    setFieldValue(newEmail);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, columnDefinition, newEmail);
    }
  };

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
};
