import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { PersonChip } from '@/people/components/PersonChip';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { UserChip } from '@/users/components/UserChip';

import { EditableFieldDefinitionContext } from '../states/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldRelationMetadata } from '../types/FieldMetadata';

export function GenericEditableRelationFieldDisplayMode() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldRelationMetadata>;

  const fieldValue = useRecoilValue<any | null>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  switch (currentEditableFieldDefinition.metadata.relationType) {
    case Entity.Person: {
      return (
        <PersonChip
          id={fieldValue?.id ?? ''}
          name={fieldValue?.displayName ?? ''}
          pictureUrl={fieldValue?.avatarUrl ?? ''}
        />
      );
    }
    case Entity.User: {
      return (
        <UserChip
          id={fieldValue?.id ?? ''}
          name={fieldValue?.displayName ?? ''}
          pictureUrl={fieldValue?.avatarUrl ?? ''}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${currentEditableFieldDefinition.metadata.relationType}"
          in GenericEditableRelationField`,
      );
      return <> </>;
  }
}
