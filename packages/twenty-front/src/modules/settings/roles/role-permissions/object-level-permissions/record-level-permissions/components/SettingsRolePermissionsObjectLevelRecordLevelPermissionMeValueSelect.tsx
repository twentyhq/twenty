/* @license Enterprise */

import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconUserCircle, IconX, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { getCompositeSubFieldType } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldType';
import { getFieldMetadataTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFieldMetadataTypeLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/constants/RecordLevelPermissionPredicateFieldTypes';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: inherit;
  margin: 0;
  max-width: 100%;
  min-height: 19px;
  outline: none;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};
  text-decoration: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

type SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelectProps =
  {
    onSelect: (
      workspaceMemberFieldMetadataId: string,
      workspaceMemberSubFieldName?: string | null,
    ) => void;
    recordFilterId: string;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect =
  ({
    onSelect,
    recordFilterId,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelectProps) => {
    const { getIcon } = useIcons();
    const { closeDropdown } = useCloseDropdown();
    const [searchInput, setSearchInput] = useState('');

    const { objectMetadataItem: workspaceMemberMetadataItem } =
      useObjectMetadataItem({
        objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
      });

    const selectedFieldMetadataItem = useRecoilComponentValue(
      fieldMetadataItemUsedInDropdownComponentSelector,
    );

    const currentRecordFilters = useRecoilComponentValue(
      currentRecordFiltersComponentState,
    );

    const recordFilter = currentRecordFilters.find(
      (filter) => filter.id === recordFilterId,
    );

    const selectedFieldType = selectedFieldMetadataItem?.type;
    const selectedSubFieldName = recordFilter?.subFieldName;

    let targetFieldType: FieldMetadataType | null = null;

    if (isDefined(selectedFieldType)) {
      if (
        isCompositeFieldType(selectedFieldType) &&
        isDefined(selectedFieldMetadataItem) &&
        isDefined(selectedSubFieldName)
      ) {
        targetFieldType = getCompositeSubFieldType(
          selectedFieldMetadataItem,
          selectedSubFieldName,
        );
      } else {
        targetFieldType = selectedFieldType;
      }
    }

    const compatibleWorkspaceMemberFields = !workspaceMemberMetadataItem
      ? []
      : workspaceMemberMetadataItem.fields.filter((field) => {
          if (
            field.name === 'createdAt' ||
            field.name === 'updatedAt' ||
            field.name === 'deletedAt' ||
            field.name === 'id'
          ) {
            return false;
          }

          if (!targetFieldType) {
            return true;
          }

          if (
            !RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES.includes(
              targetFieldType,
            )
          ) {
            return false;
          }

          if (field.type === targetFieldType) {
            return true;
          }

          if (isCompositeFieldType(field.type)) {
            const fieldCompositeType = compositeTypeDefinitions.get(field.type);

            if (isDefined(fieldCompositeType)) {
              return fieldCompositeType.properties.some(
                (property) => property.type === targetFieldType,
              );
            }
          }

          return false;
        });

    const handleSelectField = (
      fieldMetadataId: string,
      subFieldName?: string | null,
    ) => {
      onSelect(fieldMetadataId, subFieldName);
      closeDropdown();
    };

    const isRelationToWorkspaceMember =
      selectedFieldMetadataItem?.type === FieldMetadataType.RELATION &&
      selectedFieldMetadataItem.relation?.targetObjectMetadata.nameSingular ===
        CoreObjectNameSingular.WorkspaceMember;

    const menuItems: Array<{
      id: string;
      label: string;
      icon: string | null;
      fieldMetadataId: string;
      subFieldName?: string | null;
    }> = [];

    const idField = workspaceMemberMetadataItem?.fields.find(
      (field) => field.name === 'id',
    );

    if (isDefined(idField) && isRelationToWorkspaceMember) {
      menuItems.push({
        id: 'me-id',
        label: t`Me (User ID)`,
        icon: null,
        fieldMetadataId: idField.id,
        subFieldName: null,
      });
    }

    for (const field of compatibleWorkspaceMemberFields) {
      if (isCompositeFieldType(field.type)) {
        const compositeConfig =
          SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
            field.type as CompositeFieldType
          ];

        if (isDefined(compositeConfig)) {
          const compositeType = compositeTypeDefinitions.get(field.type);

          const filterableSubFields = compositeConfig.subFields.filter(
            (subField) => {
              if (!subField.isFilterable) {
                return false;
              }

              const subFieldProperty = compositeType?.properties.find(
                (property) => property.name === subField.subFieldName,
              );

              return subFieldProperty?.type !== FieldMetadataType.RAW_JSON;
            },
          );

          for (const subField of filterableSubFields) {
            if (isDefined(targetFieldType)) {
              const subFieldType = getCompositeSubFieldType(
                field,
                subField.subFieldName,
              );

              if (subFieldType !== targetFieldType) {
                continue;
              }
            }

            menuItems.push({
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
        menuItems.push({
          id: field.id,
          label: field.label,
          icon: field.icon ?? null,
          fieldMetadataId: field.id,
          subFieldName: null,
        });
      }
    }

    const filteredMenuItems = !searchInput
      ? menuItems
      : menuItems.filter((item) =>
          item.label.toLowerCase().includes(searchInput.toLowerCase()),
        );

    const fieldTypeLabel = targetFieldType
      ? getFieldMetadataTypeLabel(targetFieldType)
      : '';

    const fieldTypeLabelLowercase = fieldTypeLabel?.toLowerCase() ?? '';

    const headerText = fieldTypeLabel
      ? t`Select 1 ${fieldTypeLabelLowercase} field`
      : t`Select 1 field`;

    const placeholderText = fieldTypeLabel
      ? t`Search 1 ${fieldTypeLabelLowercase} field`
      : t`Search 1 field`;

    return (
      <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              onClick={() => closeDropdown()}
              Icon={IconX}
            />
          }
        >
          {headerText}
        </DropdownMenuHeader>
        <StyledSearchInput
          value={searchInput}
          autoFocus
          placeholder={placeholderText}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchInput(event.target.value)
          }
        />
        <DropdownMenuItemsContainer>
          {filteredMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              LeftIcon={item.icon ? getIcon(item.icon) : IconUserCircle}
              text={item.label}
              onClick={() =>
                handleSelectField(item.fieldMetadataId, item.subFieldName)
              }
            />
          ))}
          {filteredMenuItems.length === 0 && (
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
