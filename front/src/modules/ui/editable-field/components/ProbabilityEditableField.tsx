import { useContext } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldDefinitionContext } from '../states/EditableFieldDefinitionContext';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldProbabilityMetadata } from '../types/FieldMetadata';

import { ProbabilityEditableFieldEditMode } from './ProbabilityEditableFieldEditMode';

export function ProbabilityEditableField() {
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldProbabilityMetadata>;

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
