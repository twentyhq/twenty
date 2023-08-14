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
import { FieldDisplayURL } from './FieldDisplayURL';
import { GenericEditableURLFieldEditMode } from './GenericEditableURLFieldEditMode';

export function GenericEditableURLField() {
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
        useEditButton
        iconLabel={currentEditableFieldDefinition.icon}
        editModeContent={<GenericEditableURLFieldEditMode />}
        displayModeContent={<FieldDisplayURL URL={fieldValue} />}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
}
