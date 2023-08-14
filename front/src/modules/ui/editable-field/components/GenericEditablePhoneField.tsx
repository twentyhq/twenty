import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { PhoneInputDisplay } from '@/ui/input/phone/components/PhoneInputDisplay';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { FieldRecoilScopeContext } from '../states/recoil-scope-contexts/FieldRecoilScopeContext';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldPhoneMetadata } from '../types/FieldMetadata';

import { EditableField } from './EditableField';
import { GenericEditablePhoneFieldEditMode } from './GenericEditablePhoneFieldEditMode';

export function GenericEditablePhoneField() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldPhoneMetadata>;

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
        editModeContent={<GenericEditablePhoneFieldEditMode />}
        displayModeContent={<PhoneInputDisplay value={fieldValue} />}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
}
