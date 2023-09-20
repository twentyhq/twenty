import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { FieldChipMetadata } from '@/ui/field/types/FieldMetadata';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';
import { TextInput } from '../../../../input/components/TextInput';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldChipMetadata>;
};

export const GenericEditableChipCellEditMode = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.contentFieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

  const handleSubmit = (newText: string) => {
    if (newText === fieldValue) return;

    setFieldValue(newText);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, viewFieldDefinition, newText);
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
      placeholder={viewFieldDefinition.metadata.placeHolder ?? ''}
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
