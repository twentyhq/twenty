import styled from '@emotion/styled';

import { RelationPicker } from '@/object-record/relation-picker/components/RelationPicker';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';

import { usePersistField } from '../../../hooks/usePersistField';
import { useRelationField } from '../../hooks/useRelationField';

import { FieldInputEvent } from './DateTimeFieldInput';

const StyledRelationPickerContainer = styled.div`
  left: -1px;
  position: absolute;
  top: -1px;
`;

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
    <StyledRelationPickerContainer>
      <RelationPicker
        fieldDefinition={fieldDefinition}
        selectedRecordId={fieldValue?.id}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        initialSearchFilter={initialSearchValue}
      />
    </StyledRelationPickerContainer>
  );
};
