import styled from '@emotion/styled';

import { RelationPicker } from '@/object-record/relation-picker/components/RelationPicker';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';

import { usePersistField } from '../../../hooks/usePersistField';
import { useRelationField } from '../../hooks/useRelationField';

import { FieldInputEvent } from './DateFieldInput';

const StyledRelationPickerContainer = styled.div`
  left: -1px;
  position: absolute;
  top: -1px;
`;

export type RelationFieldInputProps = {
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
};

export const RelationFieldInput = ({
  onSubmit,
  onCancel,
}: RelationFieldInputProps) => {
  const { fieldDefinition, initialSearchValue, fieldValue } =
    useRelationField();

  const persistField = usePersistField();

  const handleSubmit = (newEntity: EntityForSelect | null) => {
    onSubmit?.(() => persistField(newEntity?.record ?? null));
  };

  return (
    <StyledRelationPickerContainer>
      <RelationPicker
        fieldDefinition={fieldDefinition}
        recordId={fieldValue?.id}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        initialSearchFilter={initialSearchValue}
      />
    </StyledRelationPickerContainer>
  );
};
