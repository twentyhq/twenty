import { DateTime } from 'luxon';
import { useRecoilState } from 'recoil';

import type { ViewFieldDateMetadata } from '@/ui/editable-field/types/ViewField';
import { DateInput } from '@/ui/input/components/DateInput';
import { useCellInputEventHandlers } from '@/ui/table/hooks/useCellInputEventHandlers';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { Nullable } from '~/types/Nullable';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldDateMetadata>;
};

export function GenericEditableDateCellEditMode({
  columnDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  // Wrap this into a hook
  function handleSubmit(newDate: Nullable<Date>) {
    const fieldValueDate = fieldValue
      ? DateTime.fromISO(fieldValue).toJSDate()
      : null;

    const newDateISO = newDate ? DateTime.fromJSDate(newDate).toISO() : null;

    if (newDate === fieldValueDate || !newDateISO) return;

    setFieldValue(newDateISO);

    if (currentRowEntityId && updateField && newDateISO) {
      updateField(currentRowEntityId, columnDefinition, newDateISO);
    }
  }

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
}
