import { useContext } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldContext } from '../states/EditableFieldContext';

import { ProbabilityEditableFieldEditMode } from './ProbabilityEditableFieldEditMode';

export function ProbabilityEditableField() {
  const currentEditableField = useContext(EditableFieldContext);
  const currentEditableFieldDefinition = currentEditableField.fieldDefinition;

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={currentEditableFieldDefinition.icon}
        displayModeContent={<ProbabilityEditableFieldEditMode />}
        displayModeContentOnly
        disableHoverEffect
      />
    </RecoilScope>
  );
}
