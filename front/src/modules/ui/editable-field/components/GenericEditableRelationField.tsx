import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { PersonChip } from '@/people/components/PersonChip';
import {
  ViewFieldDefinition,
  ViewFieldRelationMetadata,
} from '@/ui/editable-field/types/ViewField';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { EntityIdContext } from '../states/EntityIdContext';
import { FieldContext } from '../states/FieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';

import { EditableField } from './EditableField';
import { GenericEditableRelationFieldEditMode } from './GenericEditableRelationFieldEditMode';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldRelationMetadata>;
};

function RelationChip({
  fieldDefinition,
  fieldValue,
}: {
  fieldDefinition: ViewFieldDefinition<ViewFieldRelationMetadata>;
  fieldValue: any | null;
}) {
  switch (fieldDefinition.metadata.relationType) {
    case Entity.Person: {
      return (
        <PersonChip
          id={fieldValue?.id ?? ''}
          name={fieldValue?.displayName ?? ''}
          pictureUrl={fieldValue?.avatarUrl ?? ''}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${fieldDefinition.metadata.relationType}" in GenericEditableRelationField`,
      );
      return <> </>;
  }
}

export function GenericEditableRelationField({ viewField }: OwnProps) {
  const currentEntityId = useContext(EntityIdContext);

  const fieldValue = useRecoilValue<any | null>(
    genericEntityFieldFamilySelector({
      entityId: currentEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <RecoilScope>
        <EditableField
          useEditButton
          customEditHotkeyScope={{
            scope: RelationPickerHotkeyScope.RelationPicker,
          }}
          iconLabel={viewField.columnIcon}
          editModeContent={
            <GenericEditableRelationFieldEditMode viewField={viewField} />
          }
          displayModeContent={
            <RelationChip fieldDefinition={viewField} fieldValue={fieldValue} />
          }
          isDisplayModeContentEmpty={!fieldValue}
          isDisplayModeFixHeight
        />
      </RecoilScope>
    </RecoilScope>
  );
}
