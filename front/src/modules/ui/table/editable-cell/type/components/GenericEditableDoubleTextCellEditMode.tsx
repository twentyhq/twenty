import { useRecoilState } from 'recoil';

import type { ViewFieldDoubleTextMetadata } from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { DoubleTextCellEdit } from './DoubleTextCellEdit';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldDoubleTextMetadata>;
};

export function GenericEditableDoubleTextCellEditMode({
  fieldDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [firstValue, setFirstValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue, setSecondValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.secondValueFieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newFirstValue: string, newSecondValue: string) {
    if (newFirstValue === firstValue && newSecondValue === secondValue) return;

    setFirstValue(newFirstValue);
    setSecondValue(newSecondValue);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, fieldDefinition, {
        firstValue: newFirstValue,
        secondValue: newSecondValue,
      });
    }
  }

  return (
    <DoubleTextCellEdit
      firstValuePlaceholder={fieldDefinition.metadata.firstValuePlaceholder}
      secondValuePlaceholder={fieldDefinition.metadata.secondValuePlaceholder}
      firstValue={firstValue ?? ''}
      secondValue={secondValue ?? ''}
      onSubmit={handleSubmit}
    />
  );
}
