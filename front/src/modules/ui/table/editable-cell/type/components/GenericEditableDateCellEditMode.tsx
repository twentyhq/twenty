import { DateTime } from 'luxon';
import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldDateMetadata } from '@/ui/field/types/FieldMetadata';
import { DateInput } from '@/ui/input/components/DateInput';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { Nullable } from '~/types/Nullable';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldDateMetadata>;
};

export const GenericEditableDateCellEditMode = ({
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

  // Wrap this into a hook
  const handleSubmit = (newDate: Nullable<Date>) => {
    const fieldValueDate = fieldValue
      ? DateTime.fromISO(fieldValue).toJSDate()
      : null;

    const newDateISO = newDate ? DateTime.fromJSDate(newDate).toISO() : null;

    if (newDate === fieldValueDate || !newDateISO) return;

    setFieldValue(newDateISO);

    if (currentRowEntityId && updateField && newDateISO) {
      updateField(currentRowEntityId, viewFieldDefinition, newDateISO);
    }
  };

  const { handleEnter, handleEscape, handleClickOutside } =
    useCellInputEventHandlers({
      onSubmit: handleSubmit,
    });

  return (
    <DateInput
      value={DateTime.fromISO(fieldValue).toJSDate()}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      hotkeyScope={TableHotkeyScope.CellEditMode}
    />
  );
};
