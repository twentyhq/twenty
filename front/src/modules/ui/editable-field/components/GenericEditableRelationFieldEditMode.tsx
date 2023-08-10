import { useContext } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { PeoplePicker } from '@/people/components/PeoplePicker';
import {
  ViewFieldDefinition,
  ViewFieldRelationMetadata,
  ViewFieldRelationValue,
} from '@/ui/editable-field/types/ViewField';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

import { useEditableField } from '../hooks/useEditableField';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';

const RelationPickerContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldRelationMetadata>;
};

function RelationPicker({
  fieldDefinition,
  fieldValue,
  handleEntitySubmit,
  handleCancel,
}: {
  fieldDefinition: ViewFieldDefinition<ViewFieldRelationMetadata>;
  fieldValue: ViewFieldRelationValue;
  handleEntitySubmit: (newRelationId: EntityForSelect | null) => void;
  handleCancel: () => void;
}) {
  switch (fieldDefinition.metadata.relationType) {
    case Entity.Person: {
      return (
        <PeoplePicker
          personId={fieldValue?.id ?? null}
          onSubmit={handleEntitySubmit}
          onCancel={handleCancel}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${fieldDefinition.metadata.relationType}" in GenericEditableRelationField`,
      );
      return <> </>;
  }
}

export function GenericEditableRelationFieldEditMode({ viewField }: OwnProps) {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<any | null>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
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
      updateField(currentEditableFieldEntityId, viewField, newRelation);
    }

    closeEditableField();
  }

  function handleCancel() {
    closeEditableField();
  }

  return (
    <RelationPickerContainer>
      <RelationPicker
        fieldDefinition={viewField}
        fieldValue={fieldValue}
        handleEntitySubmit={handleSubmit}
        handleCancel={handleCancel}
      />
    </RelationPickerContainer>
  );
}
