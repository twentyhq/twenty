import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldMoneyMetadata } from '@/ui/field/types/FieldMetadata';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import type { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';
import { TextInput } from '../../../../input/components/TextInput';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldMoneyMetadata>;
};

export const GenericEditableMoneyCellEditMode = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

  // TODO: handle this logic in a number input
  const handleSubmit = (newText: string) => {
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
        updateField(currentRowEntityId, viewFieldDefinition, numberValue);
      }
    } catch (error) {
      console.warn(
        `In GenericEditableMoneyCellEditMode, Invalid number: ${newText}, ${error}`,
      );
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
};
