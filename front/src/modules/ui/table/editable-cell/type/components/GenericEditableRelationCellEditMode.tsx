import { useRecoilState } from 'recoil';

import {
  CompanyPickerCell,
  CompanyPickerSelectedCompany,
} from '@/companies/components/CompanyPickerCell';
import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldRelationMetadata } from '@/ui/field/types/FieldMetadata';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useTableCell } from '@/ui/table/editable-cell/hooks/useTableCell';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { UserPicker } from '@/users/components/UserPicker';

import { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  viewFieldDefinition: ColumnDefinition<FieldRelationMetadata>;
};

export const GenericEditableRelationCellEditMode = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const { closeTableCell: closeEditableCell } = useTableCell();

  const [fieldValueEntity, setFieldValueEntity] = useRecoilState<any | null>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  const updateEntityField = useUpdateGenericEntityField();

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
      updateEntityField(
        currentRowEntityId,
        viewFieldDefinition,
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
      updateEntityField(
        currentRowEntityId,
        viewFieldDefinition,
        newFieldEntity,
      );
    }

    closeEditableCell();
  };

  const handleCancel = () => {
    closeEditableCell();
  };

  switch (viewFieldDefinition.metadata.relationType) {
    case Entity.Company: {
      return (
        <CompanyPickerCell
          companyId={fieldValueEntity?.id ?? null}
          onSubmit={handleCompanySubmit}
          onCancel={handleCancel}
          width={viewFieldDefinition.size}
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
          width={viewFieldDefinition.size}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${viewFieldDefinition.metadata.relationType}" in GenericEditableRelationCellEditMode`,
      );
      return <></>;
  }
};
