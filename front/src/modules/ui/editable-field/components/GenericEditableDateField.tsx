import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { DateDisplay } from '@/ui/content-display/components/DateDisplay';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldDefinition } from '../../field/types/FieldDefinition';
import { FieldDateMetadata } from '../../field/types/FieldMetadata';
import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { FieldRecoilScopeContext } from '../states/recoil-scope-contexts/FieldRecoilScopeContext';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';

import { EditableField } from './EditableField';
import { GenericEditableDateFieldEditMode } from './GenericEditableDateFieldEditMode';

export const GenericEditableDateField = () => {
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
    <RecoilScope CustomRecoilScopeContext={FieldRecoilScopeContext}>
      <EditableField
        IconLabel={currentEditableFieldDefinition.Icon}
        editModeContent={<GenericEditableDateFieldEditMode />}
        displayModeContent={<DateDisplay value={fieldValue} />}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
};
