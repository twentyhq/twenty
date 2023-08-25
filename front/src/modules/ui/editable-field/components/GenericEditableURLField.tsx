import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { FieldRecoilScopeContext } from '../states/recoil-scope-contexts/FieldRecoilScopeContext';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
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
    <RecoilScope SpecificContext={FieldRecoilScopeContext}>
      <EditableField
        useEditButton
        iconLabel={currentEditableFieldDefinition.icon}
        editModeContent={<GenericEditableURLFieldEditMode />}
        displayModeContent={<FieldDisplayURL URL={fieldValue} />}
        isDisplayModeContentEmpty={!fieldValue}
        isDisplayModeFixHeight
      />
    </RecoilScope>
  );
}
