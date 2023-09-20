import { useContext } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { CompanyPicker } from '@/companies/components/CompanyPicker';
import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import { PeoplePicker } from '@/people/components/PeoplePicker';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { UserPicker } from '@/users/components/UserPicker';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useEditableField } from '../hooks/useEditableField';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../../field/types/FieldDefinition';
import {
  FieldRelationMetadata,
  FieldRelationValue,
} from '../../field/types/FieldMetadata';

const StyledRelationPickerContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

const RelationPicker = ({
  fieldDefinition,
  fieldValue,
  handleEntitySubmit,
  handleCancel,
}: {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  fieldValue: FieldRelationValue & { companyId?: string };
  handleEntitySubmit: (newRelationId: EntityForSelect | null) => void;
  handleCancel: () => void;
}) => {
  switch (fieldDefinition.metadata.relationType) {
    case Entity.Person: {
      return (
        <PeoplePicker
          personId={fieldValue ? fieldValue.id : ''}
          companyId={fieldValue?.companyId ?? ''}
          onSubmit={handleEntitySubmit}
          onCancel={handleCancel}
        />
      );
    }
    case Entity.User: {
      return (
        <UserPicker
          userId={fieldValue ? fieldValue.id : ''}
          onSubmit={handleEntitySubmit}
          onCancel={handleCancel}
        />
      );
    }
    case Entity.Company: {
      return (
        <CompanyPicker
          companyId={fieldValue ? fieldValue.id : ''}
          onSubmit={handleEntitySubmit}
          onCancel={handleCancel}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${fieldDefinition.metadata.relationType}" in GenericEditableRelationField`,
      );
      return <></>;
  }
};

export const GenericEditableRelationFieldEditMode = () => {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldRelationMetadata>;

  const [companyProgress] = useRecoilState(
    companyProgressesFamilyState(currentEditableFieldEntityId ?? ''),
  );
  const { company } = companyProgress ?? {};

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<any | null>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const updateField = useUpdateGenericEntityField();
  const { closeEditableField } = useEditableField();

  const handleSubmit = (newRelation: EntityForSelect | null) => {
    if (newRelation?.id === fieldValue?.id) return;

    setFieldValue({
      id: newRelation?.id ?? null,
      displayName: newRelation?.name ?? null,
      avatarUrl: newRelation?.avatarUrl ?? null,
    });

    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        newRelation,
      );
    }

    closeEditableField();
  };

  const handleCancel = () => {
    closeEditableField();
  };

  return (
    <StyledRelationPickerContainer>
      <RelationPicker
        fieldDefinition={currentEditableFieldDefinition}
        fieldValue={{ ...fieldValue, companyId: company?.id }}
        handleEntitySubmit={handleSubmit}
        handleCancel={handleCancel}
      />
    </StyledRelationPickerContainer>
  );
};
