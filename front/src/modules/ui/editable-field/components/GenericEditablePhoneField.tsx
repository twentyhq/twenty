import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { PhoneDisplay } from '@/ui/content-display/components/PhoneDisplay';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldDefinition } from '../../field/types/FieldDefinition';
import { FieldPhoneMetadata } from '../../field/types/FieldMetadata';
import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { FieldRecoilScopeContext } from '../states/recoil-scope-contexts/FieldRecoilScopeContext';

import { EditableField } from './EditableField';
import { GenericEditablePhoneFieldEditMode } from './GenericEditablePhoneFieldEditMode';

export const GenericEditablePhoneField = () => {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldPhoneMetadata>;

  const fieldValue = useRecoilValue<string>(
    entityFieldsFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  return (
    <RecoilScope CustomRecoilScopeContext={FieldRecoilScopeContext}>
      <EditableField
        useEditButton
        IconLabel={currentEditableFieldDefinition.Icon}
        editModeContent={<GenericEditablePhoneFieldEditMode />}
        displayModeContent={<PhoneDisplay value={fieldValue} />}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
};
