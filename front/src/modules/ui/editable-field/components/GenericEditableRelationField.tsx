import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { FieldRecoilScopeContext } from '../states/recoil-scope-contexts/FieldRecoilScopeContext';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
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
    <RecoilScope SpecificContext={FieldRecoilScopeContext}>
      <RecoilScope>
        <EditableField
          useEditButton={currentEditableFieldDefinition.metadata.useEditButton}
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
