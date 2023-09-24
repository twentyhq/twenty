import { isPossiblePhoneNumber } from 'libphonenumber-js';
import { useRecoilState } from 'recoil';

import { type ViewFieldPhoneMetadata } from '@/ui/editable-field/types/ViewField';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import { PhoneInput } from '../../../../input/components/PhoneInput';
import { type ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldPhoneMetadata>;
};

export const GenericEditablePhoneCellEditMode = ({
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

  const handleSubmit = (newValue: string) => {
    if (!isPossiblePhoneNumber(newValue)) return;

    if (newValue === fieldValue) return;

    setFieldValue(newValue);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, columnDefinition, newValue);
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
    <PhoneInput
      placeholder={columnDefinition.metadata.placeHolder ?? ''}
      autoFocus
      value={fieldValue ?? ''}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      hotkeyScope={TableHotkeyScope.CellEditMode}
    />
  );
};
