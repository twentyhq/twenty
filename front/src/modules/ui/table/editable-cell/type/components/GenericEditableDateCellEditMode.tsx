import { DateTime } from 'luxon';
import { useRecoilState } from 'recoil';

import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
} from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { DateCellEdit } from './DateCellEdit';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDateMetadata>;
};

export function GenericEditableDateCellEditMode({ viewField }: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newDate: Date) {
    const fieldValueDate = fieldValue
      ? DateTime.fromISO(fieldValue).toJSDate()
      : null;

    const newDateISO = DateTime.fromJSDate(newDate).toISO();

    if (newDate === fieldValueDate || !newDateISO) return;

    setFieldValue(newDateISO);

    if (currentRowEntityId && updateField && newDateISO) {
      updateField(currentRowEntityId, viewField, newDateISO);
    }
  }

  return (
    <DateCellEdit
      value={DateTime.fromISO(fieldValue).toJSDate()}
      onSubmit={handleSubmit}
    />
  );
}
