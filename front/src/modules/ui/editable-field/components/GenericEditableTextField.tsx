import { useContext } from 'react';

import { TextDisplay } from '@/ui/content-display/components/TextDisplay';
import { useGenericTextFieldInContext } from '@/ui/table/hooks/useGenericTextFieldInContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { FieldRecoilScopeContext } from '../states/recoil-scope-contexts/FieldRecoilScopeContext';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldNumberMetadata } from '../types/FieldMetadata';

import { EditableField } from './EditableField';
import { GenericEditableTextFieldEditMode } from './GenericEditableTextFieldEditMode';

export function GenericEditableTextField() {
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldNumberMetadata>;

  const { fieldValue } = useGenericTextFieldInContext();

  return (
    <RecoilScope SpecificContext={FieldRecoilScopeContext}>
      <EditableField
        IconLabel={currentEditableFieldDefinition.Icon}
        editModeContent={<GenericEditableTextFieldEditMode />}
        displayModeContent={<TextDisplay text={fieldValue} />}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
}
