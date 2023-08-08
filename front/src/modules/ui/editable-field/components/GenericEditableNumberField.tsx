import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { BoardCardIdContext } from '@/ui/board/states/BoardCardIdContext';
import {
  ViewFieldDefinition,
  ViewFieldNumberMetadata,
} from '@/ui/editable-field/types/ViewField';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';

import { EditableField } from './EditableField';
import { GenericEditableNumberFieldEditMode } from './GenericEditableNumberFieldEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldNumberMetadata>;
};

export function GenericEditableNumberField({ viewField }: OwnProps) {
  const currentEntityId = useContext(BoardCardIdContext);

  const fieldValue = useRecoilValue<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEntityId ?? '',
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
