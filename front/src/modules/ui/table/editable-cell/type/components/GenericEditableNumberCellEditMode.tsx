import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldNumberMetadata } from '@/ui/field/types/FieldMetadata';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import {
  canBeCastAsPositiveIntegerOrNull,
  castAsPositiveIntegerOrNull,
} from '~/utils/cast-as-positive-integer-or-null';

import { TextInput } from '../../../../input/components/TextInput';
import { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldNumberMetadata>;
};

export const GenericEditableNumberCellEditMode = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

  const handleSubmit = (newText: string) => {
    if (newText === fieldValue) return;

    try {
      let numberValue = parseInt(newText);

      if (isNaN(numberValue)) {
        throw new Error('Not a number');
      }

      if (viewFieldDefinition.metadata.isPositive) {
        if (!canBeCastAsPositiveIntegerOrNull(newText)) {
          return;
        }

        const valueCastedAsPositiveNumberOrNull =
          castAsPositiveIntegerOrNull(newText);

        if (valueCastedAsPositiveNumberOrNull === null) {
          throw Error('Not a number');
        }

        numberValue = valueCastedAsPositiveNumberOrNull;
      }

      // TODO: find a way to store this better in DB
      if (numberValue > 2000000000) {
        throw new Error('Number too big');
      }

      setFieldValue(numberValue.toString());

      if (currentRowEntityId && updateField) {
        updateField(currentRowEntityId, viewFieldDefinition, numberValue);
      }
    } catch (error) {
      console.warn(
        `In GenericEditableNumberCellEditMode, Invalid number: ${newText}, ${error}`,
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
