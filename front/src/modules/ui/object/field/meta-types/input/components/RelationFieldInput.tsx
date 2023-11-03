import { useEffect } from 'react';
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
  const { fieldDefinition, initialValue, initialSearchValue } =
    useRelationField();

  const persistField = usePersistField();

  const handleSubmit = (newEntity: EntityForSelect | null) => {
    onSubmit?.(() => persistField(newEntity?.originalEntity ?? null));
  };

  useEffect(() => {}, [initialSearchValue]);

  return (
    <StyledRelationPickerContainer>
      {fieldDefinition.metadata.relationType === Entity.Person ? (
        <PeoplePicker
          personId={initialValue?.id ?? ''}
          companyId={initialValue?.companyId ?? ''}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          initialSearchFilter={initialSearchValue}
        />
      ) : fieldDefinition.metadata.relationType === Entity.User ? (
        <UserPicker
          userId={initialValue?.id ?? ''}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          initialSearchFilter={initialSearchValue}
        />
      ) : fieldDefinition.metadata.relationType === Entity.Company ? (
        <CompanyPicker
          companyId={initialValue?.id ?? ''}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          initialSearchFilter={initialSearchValue}
        />
      ) : null}
    </StyledRelationPickerContainer>
  );
};
