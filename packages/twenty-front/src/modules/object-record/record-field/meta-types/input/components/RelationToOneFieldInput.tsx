import { RelationPicker } from '@/object-record/record-field/meta-types/input/components/RelationPicker';
import { usePersistField } from '../../../hooks/usePersistField';
import { useRelationField } from '../../hooks/useRelationField';

import { SingleRecordPickerRecord } from '@/object-record/record-picker/types/SingleRecordPickerRecord';
import { FieldInputEvent } from './DateTimeFieldInput';

export type RelationToOneFieldInputProps = {
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
};

export const RelationToOneFieldInput = ({
  onSubmit,
  onCancel,
}: RelationToOneFieldInputProps) => {
  const { fieldDefinition, initialSearchValue, fieldValue } =
    useRelationField<SingleRecordPickerRecord>();

  const persistField = usePersistField();

  const handleSubmit = (newEntity: SingleRecordPickerRecord | null) => {
    onSubmit?.(() => persistField(newEntity?.record ?? null));
  };

  return (
    <RelationPicker
      fieldDefinition={fieldDefinition}
      selectedRecordId={fieldValue?.id}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      initialSearchFilter={initialSearchValue}
    />
  );
};
