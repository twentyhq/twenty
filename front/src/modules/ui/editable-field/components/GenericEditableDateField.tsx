import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
} from '@/ui/editable-field/types/ViewField';
import { DateInputDisplay } from '@/ui/input/date/components/DateInputDisplay';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { parseDate } from '~/utils/date-utils';

import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';

import { EditableField } from './EditableField';
import { GenericEditableDateFieldEditMode } from './GenericEditableDateFieldEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDateMetadata>;
};

export function GenericEditableDateField({ viewField }: OwnProps) {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);

  const fieldValue = useRecoilValue<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  const internalDateValue = fieldValue
    ? parseDate(fieldValue).toJSDate()
    : null;

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={viewField.columnIcon}
        editModeContent={
          <GenericEditableDateFieldEditMode viewField={viewField} />
        }
        displayModeContent={<DateInputDisplay value={internalDateValue} />}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
}
