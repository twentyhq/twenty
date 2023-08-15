import { useRecoilState } from 'recoil';

import { CompanyPickerCell } from '@/companies/components/CompanyPickerCell';
import {
  ViewFieldDefinition,
  ViewFieldRelationMetadata,
} from '@/ui/editable-field/types/ViewField';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useEditableCell } from '@/ui/table/editable-cell/hooks/useEditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { UserPicker } from '@/users/components/UserPicker';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldRelationMetadata>;
};

export function GenericEditableRelationCellEditMode({ viewField }: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const { closeEditableCell } = useEditableCell();

  const [fieldValueEntity] = useRecoilState<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  const updateEntityField = useUpdateEntityField();

  function handleEntitySubmit(newFieldEntity: EntityForSelect | null) {
    if (
      newFieldEntity?.id !== fieldValueEntity?.id &&
      currentRowEntityId &&
      updateEntityField
    ) {
      updateEntityField(currentRowEntityId, viewField, newFieldEntity);
    }

    closeEditableCell();
  }

  function handleCancel() {
    closeEditableCell();
  }

  switch (viewField.metadata.relationType) {
    case Entity.Company: {
      return (
        <CompanyPickerCell
          companyId={fieldValueEntity?.id ?? null}
          onSubmit={handleEntitySubmit}
          onCancel={handleCancel}
          width={viewField.columnSize}
          createModeEnabled
        />
      );
    }
    case Entity.User: {
      return (
        <UserPicker
          userId={fieldValueEntity?.id ?? null}
          onSubmit={handleEntitySubmit}
          onCancel={handleCancel}
          width={viewField.columnSize}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${viewField.metadata.relationType}" in GenericEditableRelationCellEditMode`,
      );
      return <></>;
  }
}
