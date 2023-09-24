import { useRecoilState } from 'recoil';

import { type ViewFieldDoubleTextChipMetadata } from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { type ColumnDefinition } from '../../../types/ColumnDefinition';

import { DoubleTextCellEdit } from './DoubleTextCellEdit';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldDoubleTextChipMetadata>;
};

export const GenericEditableDoubleTextChipCellEditMode = ({
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
    const firstValueChanged = newFirstValue !== firstValue;
    const secondValueChanged = newSecondValue !== secondValue;

    if (firstValueChanged) {
      setFirstValue(newFirstValue);
    }

    if (secondValueChanged) {
      setSecondValue(newSecondValue);
    }

    if (
      currentRowEntityId &&
      updateField &&
      (firstValueChanged || secondValueChanged)
    ) {
      updateField(currentRowEntityId, columnDefinition, {
        firstValue: firstValueChanged ? newFirstValue : firstValue,
        secondValue: secondValueChanged ? newSecondValue : secondValue,
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
