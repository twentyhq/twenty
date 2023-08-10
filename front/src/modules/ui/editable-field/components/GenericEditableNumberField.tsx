import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldNumberMetadata,
} from '@/ui/editable-field/types/ViewField';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';

import { EditableField } from './EditableField';
import { GenericEditableNumberFieldEditMode } from './GenericEditableNumberFieldEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldNumberMetadata>;
};

export function GenericEditableNumberField({ viewField }: OwnProps) {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);

  const fieldValue = useRecoilValue<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={viewField.columnIcon}
        editModeContent={
          <GenericEditableNumberFieldEditMode viewField={viewField} />
        }
        displayModeContent={fieldValue}
        isDisplayModeContentEmpty={!fieldValue}
      />
    </RecoilScope>
  );
}
