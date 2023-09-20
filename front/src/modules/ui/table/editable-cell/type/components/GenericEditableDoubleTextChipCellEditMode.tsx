import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { FieldDoubleTextChipMetadata } from '@/ui/field/types/FieldMetadata';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

import { DoubleTextCellEdit } from './DoubleTextCellEdit';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldDoubleTextChipMetadata>;
};

export const GenericEditableDoubleTextChipCellEditMode = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [firstValue, setFirstValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue, setSecondValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.secondValueFieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

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
      updateField(currentRowEntityId, viewFieldDefinition, {
        firstValue: firstValueChanged ? newFirstValue : firstValue,
        secondValue: secondValueChanged ? newSecondValue : secondValue,
      });
    }
  };

  return (
    <DoubleTextCellEdit
      firstValuePlaceholder={viewFieldDefinition.metadata.firstValuePlaceholder}
      secondValuePlaceholder={
        viewFieldDefinition.metadata.secondValuePlaceholder
      }
      firstValue={firstValue ?? ''}
      secondValue={secondValue ?? ''}
      onSubmit={handleSubmit}
    />
  );
};
