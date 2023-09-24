import { useRecoilState } from 'recoil';

import {
  CompanyPickerCell,
  CompanyPickerSelectedCompany,
} from '@/companies/components/CompanyPickerCell';
import { type ViewFieldRelationMetadata } from '@/ui/editable-field/types/ViewField';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useEditableCell } from '@/ui/table/editable-cell/hooks/useEditableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { UserPicker } from '@/users/components/UserPicker';

import { type ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldRelationMetadata>;
};

export const GenericEditableRelationCellEditMode = ({
  columnDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const { closeEditableCell } = useEditableCell();

  const [fieldValueEntity, setFieldValueEntity] = useRecoilState<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.fieldName,
    }),
  );
  const updateEntityField = useUpdateEntityField();

  const updateCachedPersonField = (newFieldEntity: EntityForSelect | null) => {
    setFieldValueEntity({
      avatarUrl: newFieldEntity?.avatarUrl ?? '',
      entityType: Entity.Company,
      id: newFieldEntity?.id ?? '',
      displayName: newFieldEntity?.name ?? '',
    });
  };

  const updateCachedCompanyField = (
    newFieldEntity: CompanyPickerSelectedCompany | null,
  ) => {
    setFieldValueEntity({
      id: newFieldEntity?.id ?? '',
      name: newFieldEntity?.name ?? '',
      domainName: newFieldEntity?.domainName ?? '',
    });
  };

  const handleCompanySubmit = (
    newFieldEntity: CompanyPickerSelectedCompany | null,
  ) => {
    if (
      newFieldEntity?.id !== fieldValueEntity?.id &&
      currentRowEntityId &&
      updateEntityField
    ) {
      updateCachedCompanyField(newFieldEntity);
      updateEntityField<ViewFieldRelationMetadata, EntityForSelect>(
        currentRowEntityId,
        columnDefinition,
        newFieldEntity,
      );
    }

    closeEditableCell();
  };

  const handlePersonSubmit = (newFieldEntity: EntityForSelect | null) => {
    if (
      newFieldEntity?.id !== fieldValueEntity?.id &&
      currentRowEntityId &&
      updateEntityField
    ) {
      updateCachedPersonField(newFieldEntity);
      updateEntityField(currentRowEntityId, columnDefinition, newFieldEntity);
    }

    closeEditableCell();
  };

  const handleCancel = () => {
    closeEditableCell();
  };

  switch (columnDefinition.metadata.relationType) {
    case Entity.Company: {
      return (
        <CompanyPickerCell
          companyId={fieldValueEntity?.id ?? null}
          onSubmit={handleCompanySubmit}
          onCancel={handleCancel}
          width={columnDefinition.size}
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
          width={columnDefinition.size}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${columnDefinition.metadata.relationType}" in GenericEditableRelationCellEditMode`,
      );
      return <></>;
  }
};
