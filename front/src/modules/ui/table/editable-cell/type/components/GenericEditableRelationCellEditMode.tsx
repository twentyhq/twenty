import { useRecoilState } from 'recoil';

import {
  CompanyPickerCell,
  CompanyPickerSelectedCompany,
} from '@/companies/components/CompanyPickerCell';
import type { ViewFieldRelationMetadata } from '@/ui/editable-field/types/ViewField';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useEditableCell } from '@/ui/table/editable-cell/hooks/useEditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { UserPicker } from '@/users/components/UserPicker';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldRelationMetadata>;
};

export function GenericEditableRelationCellEditMode({
  fieldDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const { closeEditableCell } = useEditableCell();

  const [fieldValueEntity, setFieldValueEntity] = useRecoilState<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );
  const updateEntityField = useUpdateEntityField();

  function updateCachedPersonField(newFieldEntity: EntityForSelect | null) {
    if (newFieldEntity === null) {
      return;
    }
    setFieldValueEntity({
      avatarUrl: newFieldEntity?.avatarUrl ?? '',
      entityType: Entity.Company,
      id: newFieldEntity?.id ?? '',
      displayName: newFieldEntity?.name ?? '',
    });
  }

  function updateCachedCompanyField(
    newFieldEntity: CompanyPickerSelectedCompany | null,
  ) {
    if (newFieldEntity === null) {
      return;
    }

    setFieldValueEntity({
      id: newFieldEntity?.id ?? '',
      name: newFieldEntity?.name ?? '',
      domainName: newFieldEntity?.domainName ?? '',
    });
  }

  function handleCompanySubmit(
    newFieldEntity: CompanyPickerSelectedCompany | null,
  ) {
    if (
      newFieldEntity &&
      newFieldEntity?.id !== fieldValueEntity?.id &&
      currentRowEntityId &&
      updateEntityField
    ) {
      updateCachedCompanyField(newFieldEntity);
      updateEntityField<ViewFieldRelationMetadata, EntityForSelect>(
        currentRowEntityId,
        fieldDefinition,
        newFieldEntity,
      );
    }

    closeEditableCell();
  }

  function handlePersonSubmit(newFieldEntity: EntityForSelect | null) {
    if (
      newFieldEntity?.id !== fieldValueEntity?.id &&
      currentRowEntityId &&
      updateEntityField
    ) {
      updateCachedPersonField(newFieldEntity);
      updateEntityField(currentRowEntityId, fieldDefinition, newFieldEntity);
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
          onSubmit={handleCompanySubmit}
          onCancel={handleCancel}
          width={fieldDefinition.size}
          createModeEnabled
        />
      );
    }
    case Entity.User: {
      return (
        <UserPicker
          userId={fieldValueEntity?.id ?? null}
          onSubmit={handlePersonSubmit}
          onCancel={handleCancel}
          width={fieldDefinition.size}
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
