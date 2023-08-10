import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { PersonChip } from '@/people/components/PersonChip';
import { ViewFieldRelationMetadata } from '@/ui/editable-field/types/ViewField';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldContext } from '../states/EditableFieldContext';
import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldRelationMetadata } from '../types/FieldMetadata';

import { EditableField } from './EditableField';
import { GenericEditableRelationFieldEditMode } from './GenericEditableRelationFieldEditMode';

function RelationChip({
  fieldDefinition,
  fieldValue,
}: {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  fieldValue: any | null;
}) {
  switch (fieldDefinition.metadata.relationType) {
    case Entity.Person: {
      return (
        <PersonChip
          id={fieldValue?.id ?? ''}
          name={fieldValue?.displayName ?? ''}
          pictureUrl={fieldValue?.avatarUrl ?? ''}
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

export function GenericEditableRelationField() {
  const currentEditableField = useContext(EditableFieldContext);
  const currentEditableFieldEntityId = currentEditableField.entityId;
  const currentEditableFieldDefinition =
    currentEditableField.fieldDefinition as FieldDefinition<ViewFieldRelationMetadata>;

  const fieldValue = useRecoilValue<any | null>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <RecoilScope>
        <EditableField
          useEditButton
          customEditHotkeyScope={{
            scope: RelationPickerHotkeyScope.RelationPicker,
          }}
          iconLabel={currentEditableFieldDefinition.icon}
          editModeContent={<GenericEditableRelationFieldEditMode />}
          displayModeContent={
            <RelationChip
              fieldDefinition={currentEditableFieldDefinition}
              fieldValue={fieldValue}
            />
          }
          isDisplayModeContentEmpty={!fieldValue}
          isDisplayModeFixHeight
        />
      </RecoilScope>
    </RecoilScope>
  );
}
