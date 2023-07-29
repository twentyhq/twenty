import { useRecoilState } from 'recoil';

import { CompanyPickerCell } from '@/companies/components/CompanyPickerCell';
import { EntityForSelect } from '@/ui/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import { useEditableCell } from '@/ui/table/editable-cell/hooks/useEditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';
import {
  ViewFieldDefinition,
  ViewFieldRelationMetadata,
} from '@/ui/table/types/ViewField';
import { UserPicker } from '@/users/components/UserPicker';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<ViewFieldRelationMetadata>;
};

export function GenericEditableRelationCellEditMode({
  viewFieldDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const { closeEditableCell } = useEditableCell();

  const [fieldValueEntity] = useRecoilState<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  const updateEntityField = useUpdateEntityField();

  function handleEntitySubmit(newFieldEntity: EntityForSelect | null) {
    if (
      newFieldEntity?.id !== fieldValueEntity?.id &&
      currentRowEntityId &&
      updateEntityField
    ) {
      updateEntityField(
        currentRowEntityId,
        viewFieldDefinition,
        newFieldEntity,
      );
    }

    closeEditableCell();
  }

  function handleCancel() {
    closeEditableCell();
  }

  console.log({ fieldValueEntity });

  switch (viewFieldDefinition.metadata.relationType) {
    case Entity.Company: {
      return (
        <CompanyPickerCell
          companyId={fieldValueEntity?.id ?? null}
          onSubmit={handleEntitySubmit}
          onCancel={handleCancel}
        />
      );
    }
    case Entity.User: {
      return (
        <UserPicker
          userId={fieldValueEntity?.id ?? null}
          onSubmit={handleEntitySubmit}
          onCancel={handleCancel}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${viewFieldDefinition.metadata.relationType}" in GenericEditableRelationCellEditMode`,
      );
      return <></>;
  }
}
