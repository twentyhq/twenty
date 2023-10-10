import styled from '@emotion/styled';

import { CompanyPicker } from '@/companies/components/CompanyPicker';
import { PeoplePicker } from '@/people/components/PeoplePicker';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { UserPicker } from '@/users/components/UserPicker';

import { usePersistField } from '../../../hooks/usePersistField';
import { useRelationField } from '../../hooks/useRelationField';

import { FieldInputEvent } from './DateFieldInput';

const StyledRelationPickerContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

type RelationFieldInputProps = {
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
};

export const RelationFieldInput = ({
  onSubmit,
  onCancel,
}: RelationFieldInputProps) => {
  const { fieldDefinition, fieldValue } = useRelationField();

  const persistField = usePersistField();

  const handleSubmit = (newEntity: EntityForSelect | null) => {
    onSubmit?.(() => persistField(newEntity?.originalEntity ?? null));
  };

  return (
    <StyledRelationPickerContainer>
      {fieldDefinition.metadata.relationType === Entity.Person ? (
        <PeoplePicker
          personId={fieldValue?.id ?? ''}
          companyId={fieldValue?.companyId ?? ''}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      ) : fieldDefinition.metadata.relationType === Entity.User ? (
        <UserPicker
          userId={fieldValue?.id ?? ''}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      ) : fieldDefinition.metadata.relationType === Entity.Company ? (
        <CompanyPicker
          companyId={fieldValue?.id ?? ''}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      ) : null}
    </StyledRelationPickerContainer>
  );
};
