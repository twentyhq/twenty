import { useContext } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { CompanyPicker } from '@/companies/components/CompanyPicker';
import { PeoplePicker } from '@/people/components/PeoplePicker';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { UserPicker } from '@/users/components/UserPicker';

import { useEditableField } from '../hooks/useEditableField';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { EditableFieldDefinitionContext } from '../states/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import {
  FieldRelationMetadata,
  FieldRelationValue,
} from '../types/FieldMetadata';

const RelationPickerContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

function RelationPicker({
  fieldDefinition,
  fieldValue,
  handleEntitySubmit,
  handleCancel,
}: {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  fieldValue: FieldRelationValue;
  handleEntitySubmit: (newRelationId: EntityForSelect | null) => void;
  handleCancel: () => void;
}) {
  switch (fieldDefinition.metadata.relationType) {
    case Entity.Person: {
      return (
        <PeoplePicker
          personId={fieldValue ? fieldValue.id : ''}
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
}

export function GenericEditableRelationFieldEditMode() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldRelationMetadata>;

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

  function handleSubmit(newRelation: EntityForSelect | null) {
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
  }

  function handleCancel() {
    closeEditableField();
  }

  return (
    <RelationPickerContainer>
      <RelationPicker
        fieldDefinition={currentEditableFieldDefinition}
        fieldValue={fieldValue}
        handleEntitySubmit={handleSubmit}
        handleCancel={handleCancel}
      />
    </RelationPickerContainer>
  );
}
