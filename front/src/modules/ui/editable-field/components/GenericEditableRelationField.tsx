import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldDefinitionContext } from '../states/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldRelationMetadata } from '../types/FieldMetadata';

import { EditableField } from './EditableField';
import { GenericEditableRelationFieldDisplayMode } from './GenericEditableRelationFieldDisplayMode';
import { GenericEditableRelationFieldEditMode } from './GenericEditableRelationFieldEditMode';

export function GenericEditableRelationField() {
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
          displayModeContent={<GenericEditableRelationFieldDisplayMode />}
          isDisplayModeContentEmpty={!fieldValue}
          isDisplayModeFixHeight
        />
      </RecoilScope>
    </RecoilScope>
  );
}
