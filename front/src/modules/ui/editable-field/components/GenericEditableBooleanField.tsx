import { useContext } from 'react';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { FieldRecoilScopeContext } from '../states/recoil-scope-contexts/FieldRecoilScopeContext';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldBooleanMetadata } from '../types/FieldMetadata';

import { EditableField } from './EditableField';
import { GenericEditableBooleanFieldDisplayMode } from './GenericEditableBooleanFieldDisplayMode';

export function GenericEditableBooleanField() {
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldBooleanMetadata>;

  return (
    <RecoilScope SpecificContext={FieldRecoilScopeContext}>
      <EditableField
        IconLabel={currentEditableFieldDefinition.Icon}
        displayModeContent={<GenericEditableBooleanFieldDisplayMode />}
        displayModeContentOnly
      />
    </RecoilScope>
  );
}
