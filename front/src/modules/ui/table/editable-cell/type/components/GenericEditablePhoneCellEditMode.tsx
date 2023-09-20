import { isPossiblePhoneNumber } from 'libphonenumber-js';
import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { FieldPhoneMetadata } from '@/ui/field/types/FieldMetadata';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import type { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';
import { PhoneInput } from '../../../../input/components/PhoneInput';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldPhoneMetadata>;
};

export const GenericEditablePhoneCellEditMode = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

  const handleSubmit = (newValue: string) => {
    if (!isPossiblePhoneNumber(newValue)) return;

    if (newValue === fieldValue) return;

    setFieldValue(newValue);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, viewFieldDefinition, newValue);
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
      placeholder={viewFieldDefinition.metadata.placeHolder ?? ''}
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
