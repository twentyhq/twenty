import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldDefinitionContext } from '../states/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldDateMetadata } from '../types/FieldMetadata';

import { EditableField } from './EditableField';
import { GenericEditableDateFieldDisplayMode } from './GenericEditableDateFieldDisplayMode';
import { GenericEditableDateFieldEditMode } from './GenericEditableDateFieldEditMode';

export function GenericEditableDateField() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldDateMetadata>;

  const fieldValue = useRecoilValue<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={currentEditableFieldDefinition.icon}
        editModeContent={<GenericEditableDateFieldEditMode />}
        displayModeContent={<GenericEditableDateFieldDisplayMode />}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
}
