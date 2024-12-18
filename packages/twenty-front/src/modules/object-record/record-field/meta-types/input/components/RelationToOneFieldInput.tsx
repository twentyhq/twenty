import { RelationPicker } from '@/object-record/relation-picker/components/RelationPicker';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';

import { usePersistField } from '../../../hooks/usePersistField';
import { useRelationField } from '../../hooks/useRelationField';

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
    useRelationField<RecordForSelect>();

  const persistField = usePersistField();

  const handleSubmit = (newEntity: RecordForSelect | null) => {
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
