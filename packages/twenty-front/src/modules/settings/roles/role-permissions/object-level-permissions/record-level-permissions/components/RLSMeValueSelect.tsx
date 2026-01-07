import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconUserCircle, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

const StyledHeader = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type RLSMeValueSelectProps = {
  onSelect: (
    workspaceMemberFieldMetadataId: string,
    workspaceMemberSubFieldName?: string | null,
  ) => void;
  recordFilterId: string;
};

export const RLSMeValueSelect = ({
  onSelect,
  recordFilterId,
}: RLSMeValueSelectProps) => {
  const { getIcon } = useIcons();
  const { closeDropdown } = useCloseDropdown();

  const { objectMetadataItem: workspaceMemberMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });

  // Get the selected field's type to filter compatible workspace member fields
  const selectedFieldMetadataItem = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const compatibleWorkspaceMemberFields = useMemo(() => {
    if (!workspaceMemberMetadataItem) {
      return [];
    }

    const selectedFieldType = selectedFieldMetadataItem?.type;

    // Filter workspace member fields that are compatible with the selected field type
    return workspaceMemberMetadataItem.fields.filter((field) => {
      // Skip system fields that don't make sense for comparison
      if (
        field.name === 'createdAt' ||
        field.name === 'updatedAt' ||
        field.name === 'deletedAt' ||
        field.name === 'id'
      ) {
        return false;
      }

      // If no selected field, show all filterable fields
      if (!selectedFieldType) {
        return true;
      }

      // For RELATION fields targeting WorkspaceMember, "Me" option handles ID comparison
      // Don't show other fields here since they wouldn't match a relation
      if (selectedFieldType === FieldMetadataType.RELATION) {
        return false;
      }

      // For other fields, match by type
      return field.type === selectedFieldType;
    });
  }, [workspaceMemberMetadataItem, selectedFieldMetadataItem?.type]);

  const handleSelectField = (
    fieldMetadataId: string,
    subFieldName?: string | null,
  ) => {
    onSelect(fieldMetadataId, subFieldName);
    closeDropdown(`workspace-member-field-select-${recordFilterId}`);
  };

  // Check if selected field is a relation to WorkspaceMember
  const isRelationToWorkspaceMember = useMemo(() => {
    if (selectedFieldMetadataItem?.type !== FieldMetadataType.RELATION) {
      return false;
    }
    return (
      selectedFieldMetadataItem.relation?.targetObjectMetadata.nameSingular ===
      CoreObjectNameSingular.WorkspaceMember
    );
  }, [selectedFieldMetadataItem]);

  // Build menu items including sub-fields for composite types
  const menuItems = useMemo(() => {
    const items: Array<{
      id: string;
      label: string;
      icon: string | null;
      fieldMetadataId: string;
      subFieldName?: string | null;
    }> = [];

    // Find the actual 'id' field metadata from workspace member
    const idField = workspaceMemberMetadataItem?.fields.find(
      (field) => field.name === 'id',
    );

    // Add "Me" option only for RELATION fields that target WorkspaceMember
    if (isDefined(idField) && isRelationToWorkspaceMember) {
      items.push({
        id: 'me-id',
        label: t`Me (User ID)`,
        icon: null,
        fieldMetadataId: idField.id,
        subFieldName: null,
      });
    }

    for (const field of compatibleWorkspaceMemberFields) {
      if (isCompositeFieldType(field.type)) {
        // For composite fields, add sub-fields
        const compositeConfig =
          SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
            field.type as CompositeFieldType
          ];

        if (compositeConfig) {
          const filterableSubFields = compositeConfig.subFields.filter(
            (subField) => subField.isFilterable === true,
          );

          for (const subField of filterableSubFields) {
            items.push({
              id: `${field.id}-${subField.subFieldName}`,
              label: `${field.label} / ${getCompositeSubFieldLabel(
                field.type as CompositeFieldType,
                subField.subFieldName as CompositeFieldSubFieldName,
              )}`,
              icon: field.icon ?? null,
              fieldMetadataId: field.id,
              subFieldName: subField.subFieldName,
            });
          }
        }
      } else {
        items.push({
          id: field.id,
          label: field.label,
          icon: field.icon ?? null,
          fieldMetadataId: field.id,
          subFieldName: null,
        });
      }
    }

    return items;
  }, [
    compatibleWorkspaceMemberFields,
    workspaceMemberMetadataItem?.fields,
    isRelationToWorkspaceMember,
  ]);

  return (
    <DropdownContent>
      <StyledHeader>{t`Compare to current user's...`}</StyledHeader>
      <DropdownMenuItemsContainer>
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            LeftIcon={item.icon ? getIcon(item.icon) : IconUserCircle}
            text={item.label}
            onClick={() =>
              handleSelectField(item.fieldMetadataId, item.subFieldName)
            }
          />
        ))}
        {menuItems.length === 0 && (
          <MenuItem
            text={t`No compatible fields`}
            onClick={() => {}}
            disabled
          />
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

