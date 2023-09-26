import { useContext } from 'react';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldDefinition } from '../../field/types/FieldDefinition';
import { FieldBooleanMetadata } from '../../field/types/FieldMetadata';
import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { FieldRecoilScopeContext } from '../states/recoil-scope-contexts/FieldRecoilScopeContext';

import { GenericEditableBooleanFieldDisplayMode } from './GenericEditableBooleanFieldDisplayMode';
import { InlineCellContainer } from './InlineCellContainer';

export const GenericEditableBooleanField = () => {
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldBooleanMetadata>;

  return (
    <RecoilScope CustomRecoilScopeContext={FieldRecoilScopeContext}>
      <InlineCellContainer
        IconLabel={currentEditableFieldDefinition.Icon}
        displayModeContent={<GenericEditableBooleanFieldDisplayMode />}
        editModeContentOnly
      />
    </RecoilScope>
  );
};
