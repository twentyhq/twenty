import { useRecoilState } from 'recoil';

import type { ViewFieldNumberMetadata } from '@/ui/editable-field/types/ViewField';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import {
  canBeCastAsPositiveIntegerOrNull,
  castAsPositiveIntegerOrNull,
} from '~/utils/cast-as-positive-integer-or-null';

import { TextInput } from '../../../../input/components/TextInput';
import type { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldNumberMetadata>;
};

export const GenericEditableNumberCellEditMode = ({
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

  const updateField = useUpdateEntityField();

  const handleSubmit = (newText: string) => {
    if (newText === fieldValue) return;

    try {
      let numberValue = parseInt(newText);

      if (isNaN(numberValue)) {
        throw new Error('Not a number');
      }

      if (columnDefinition.metadata.isPositive) {
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
        updateField(currentRowEntityId, columnDefinition, numberValue);
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
