import { useRecoilState } from 'recoil';

import type { ViewFieldDoubleTextMetadata } from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { DoubleTextCellEdit } from './DoubleTextCellEdit';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldDoubleTextMetadata>;
};

export const GenericEditableDoubleTextCellEditMode = ({
  columnDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [firstValue, setFirstValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue, setSecondValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.secondValueFieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  const handleSubmit = (newFirstValue: string, newSecondValue: string) => {
    if (newFirstValue === firstValue && newSecondValue === secondValue) return;

    setFirstValue(newFirstValue);
    setSecondValue(newSecondValue);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, columnDefinition, {
        firstValue: newFirstValue,
        secondValue: newSecondValue,
      });
    }
  };

  return (
    <DoubleTextCellEdit
      firstValuePlaceholder={columnDefinition.metadata.firstValuePlaceholder}
      secondValuePlaceholder={columnDefinition.metadata.secondValuePlaceholder}
      firstValue={firstValue ?? ''}
      secondValue={secondValue ?? ''}
      onSubmit={handleSubmit}
    />
  );
};
