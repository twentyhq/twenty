import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { URLDisplay } from '@/ui/content-display/components/URLDisplay';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldDefinition } from '../../field/types/FieldDefinition';
import { FieldNumberMetadata } from '../../field/types/FieldMetadata';
import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { FieldRecoilScopeContext } from '../states/recoil-scope-contexts/FieldRecoilScopeContext';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';

import { EditableField } from './EditableField';
import { GenericEditableURLFieldEditMode } from './GenericEditableURLFieldEditMode';

export const GenericEditableURLField = () => {
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
    <RecoilScope CustomRecoilScopeContext={FieldRecoilScopeContext}>
      <EditableField
        useEditButton
        IconLabel={currentEditableFieldDefinition.Icon}
        editModeContent={<GenericEditableURLFieldEditMode />}
        displayModeContent={<URLDisplay value={fieldValue} />}
        isDisplayModeContentEmpty={!fieldValue}
        isDisplayModeFixHeight
      />
    </RecoilScope>
  );
};
