import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldDoubleTextMetadata } from '@/ui/field/types/FieldMetadata';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { DoubleTextCellEdit } from './DoubleTextCellEdit';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldDoubleTextMetadata>;
};

export const GenericEditableDoubleTextCellEditMode = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [firstValue, setFirstValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue, setSecondValue] = useRecoilState<string>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.secondValueFieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

  const handleSubmit = (newFirstValue: string, newSecondValue: string) => {
    if (newFirstValue === firstValue && newSecondValue === secondValue) return;

    setFirstValue(newFirstValue);
    setSecondValue(newSecondValue);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, viewFieldDefinition, {
        firstValue: newFirstValue,
        secondValue: newSecondValue,
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
