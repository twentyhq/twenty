import { useRecoilState } from 'recoil';

import { CompanyPickerCell } from '@/companies/components/CompanyPickerCell';
import { useUpdateEntityField } from '@/people/hooks/useUpdateEntityField';
import { EntityForSelect } from '@/ui/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import { useEditableCell } from '@/ui/table/editable-cell/hooks/useEditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';
import {
  ViewFieldDefinition,
  ViewFieldRelationMetadata,
} from '@/ui/table/types/ViewField';

type OwnProps = {
  fieldDefinition: ViewFieldDefinition<ViewFieldRelationMetadata>;
};

export function GenericEditableRelationCellEditMode({
  fieldDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const { closeEditableCell } = useEditableCell();

  const [fieldValueEntity] = useRecoilState<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.fieldName,
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
        fieldDefinition.metadata.fieldName,
        newFieldEntity,
      );
    }

    closeEditableCell();
  }

  function handleCancel() {
    closeEditableCell();
  }

  switch (fieldDefinition.metadata.relationType) {
    case Entity.Company: {
      return (
        <CompanyPickerCell
          companyId={fieldValueEntity?.id ?? null}
          onSubmit={handleEntitySubmit}
          onCancel={handleCancel}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${fieldDefinition.metadata.relationType}" in GenericEditableRelationCellEditMode`,
      );
      return <></>;
  }
}
