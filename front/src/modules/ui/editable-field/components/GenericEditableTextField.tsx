import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldDefinitionContext } from '../states/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldNumberMetadata } from '../types/FieldMetadata';

import { EditableField } from './EditableField';
import { GenericEditableTextFieldEditMode } from './GenericEditableTextFieldEditMode';

export function GenericEditableTextField() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldNumberMetadata>;

  const fieldValue = useRecoilValue<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={currentEditableFieldDefinition.icon}
        editModeContent={<GenericEditableTextFieldEditMode />}
        displayModeContent={fieldValue}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
}
