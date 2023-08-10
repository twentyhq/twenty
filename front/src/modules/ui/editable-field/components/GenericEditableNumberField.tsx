import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldContext } from '../states/EditableFieldContext';
import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldNumberMetadata } from '../types/FieldMetadata';

import { EditableField } from './EditableField';
import { GenericEditableNumberFieldEditMode } from './GenericEditableNumberFieldEditMode';

export function GenericEditableNumberField() {
  const currentEditableField = useContext(EditableFieldContext);
  const currentEditableFieldEntityId = currentEditableField.entityId;
  const currentEditableFieldDefinition =
    currentEditableField.fieldDefinition as FieldDefinition<FieldNumberMetadata>;

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
        editModeContent={<GenericEditableNumberFieldEditMode />}
        displayModeContent={fieldValue}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
}
