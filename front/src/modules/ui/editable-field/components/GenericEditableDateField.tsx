import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { DateInputDisplay } from '@/ui/input/date/components/DateInputDisplay';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { parseDate } from '~/utils/date-utils';

import { EditableFieldContext } from '../states/EditableFieldContext';
import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldDateMetadata } from '../types/FieldMetadata';

import { EditableField } from './EditableField';
import { GenericEditableDateFieldEditMode } from './GenericEditableDateFieldEditMode';

export function GenericEditableDateField() {
  const currentEditableField = useContext(EditableFieldContext);
  const currentEditableFieldEntityId = currentEditableField.entityId;
  const currentEditableFieldDefinition =
    currentEditableField.fieldDefinition as FieldDefinition<FieldDateMetadata>;

  const fieldValue = useRecoilValue<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const internalDateValue = fieldValue
    ? parseDate(fieldValue).toJSDate()
    : null;

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={currentEditableFieldDefinition.icon}
        editModeContent={<GenericEditableDateFieldEditMode />}
        displayModeContent={<DateInputDisplay value={internalDateValue} />}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
}
