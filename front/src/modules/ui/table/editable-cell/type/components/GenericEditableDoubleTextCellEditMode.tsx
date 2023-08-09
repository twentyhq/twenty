import { useRecoilState } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldDoubleTextMetadata,
} from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { DoubleTextCellEdit } from './DoubleTextCellEdit';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDoubleTextMetadata>;
};

export function GenericEditableDoubleTextCellEditMode({ viewField }: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [firstValue, setFirstValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.firstValueFieldName,
    }),
  );

  const [secondValue, setSecondValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.firstValueFieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newFirstValue: string, newSecondValue: string) {
    if (newFirstValue === firstValue && newSecondValue === secondValue) return;

    setFirstValue(newFirstValue);
    setSecondValue(newSecondValue);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, viewField, {
        firstValue: newFirstValue,
        secondValue: newSecondValue,
      });
    }
  }

  return (
    <DoubleTextCellEdit
      firstValuePlaceholder={viewField.metadata.firstValuePlaceholder}
      secondValuePlaceholder={viewField.metadata.secondValuePlaceholder}
      firstValue={firstValue ?? ''}
      secondValue={secondValue ?? ''}
      onSubmit={handleSubmit}
    />
  );
}
