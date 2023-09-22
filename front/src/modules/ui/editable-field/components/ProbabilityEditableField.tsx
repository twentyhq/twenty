import { useContext } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldRecoilScopeContext } from '@/ui/editable-field/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldDefinition } from '../../field/types/FieldDefinition';
import { FieldProbabilityMetadata } from '../../field/types/FieldMetadata';
import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';

import { ProbabilityEditableFieldEditMode } from './ProbabilityEditableFieldEditMode';

export const ProbabilityEditableField = () => {
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldProbabilityMetadata>;

  return (
    <RecoilScope CustomRecoilScopeContext={FieldRecoilScopeContext}>
      <EditableField
        IconLabel={currentEditableFieldDefinition.Icon}
        displayModeContent={<ProbabilityEditableFieldEditMode />}
        displayModeContentOnly
        disableHoverEffect
      />
    </RecoilScope>
  );
};
