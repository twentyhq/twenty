/* @license Enterprise */

import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';

import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconUserCircle, useIcons } from 'twenty-ui/icon';
import { Field } from 'twenty-ui/primitives/input';
import {
  CoreObjectNameSingular,
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { getCompositeSubFieldType } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldType';
import { getFieldMetadataTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFieldMetadataTypeLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RLSDynamicValue } from '@/object-record/record-filter/types/RecordFilter';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/constants/RecordLevelPermissionPredicateFieldTypes';
import { getComparableWorkspaceMemberRelationFields } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getComparableWorkspaceMemberRelationFields';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelectProps =
  {
    onSelect: (selection: RLSDynamicValue) => void;
    recordFilterId: string;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelect =
  ({
    onSelect,
    recordFilterId,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionMeValueSelectProps) => {
    const { getIcon } = useIcons();
    const [searchInput, setSearchInput] = useState('');

    const { objectMetadataItem: workspaceMemberMetadataItem } =
      useObjectMetadataItem({
        objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
      });

    const selectedFieldMetadataItem = useAtomComponentSelectorValue(
      fieldMetadataItemUsedInDropdownComponentSelector,
    );

    const currentRecordFilters = useAtomComponentStateValue(
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

    const isRelationToWorkspaceMember =
      selectedFieldMetadataItem?.type === FieldMetadataType.RELATION &&
      selectedFieldMetadataItem.relation?.targetObjectMetadata.nameSingular ===
        CoreObjectNameSingular.WorkspaceMember;

    const getCompatibleWorkspaceMemberFields = () => {
      if (!isDefined(workspaceMemberMetadataItem)) {
        return [];
      }

      if (selectedFieldMetadataItem?.type === FieldMetadataType.RELATION) {
        return getComparableWorkspaceMemberRelationFields({
          workspaceMemberFieldMetadataItems: workspaceMemberMetadataItem.fields,
          targetObjectMetadataId:
            selectedFieldMetadataItem.relation?.targetObjectMetadata.id,
        });
      }

      return workspaceMemberMetadataItem.fields.filter((field) => {
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
    };

    const compatibleWorkspaceMemberFields =
      getCompatibleWorkspaceMemberFields();

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
      <>
        <Dropdown.Header>
          <Dropdown.Title>{headerText}</Dropdown.Title>
          <Dropdown.Close aria-label={t`Close`} />
        </Dropdown.Header>
        <Field.Root>
          <Dropdown.Search
            value={searchInput}
            placeholder={placeholderText}
            aria-label={placeholderText}
            onValueChange={setSearchInput}
          />
        </Field.Root>
        <Dropdown.Section>
          {filteredMenuItems.map((item) => (
            <Dropdown.OptionItem
              key={item.id}
              startIcon={
                <SelectOptionIcon
                  Icon={
                    isNonEmptyString(item.icon)
                      ? getIcon(item.icon)
                      : IconUserCircle
                  }
                />
              }
              onSelect={() =>
                onSelect({
                  workspaceMemberFieldMetadataId: item.fieldMetadataId,
                  workspaceMemberSubFieldName: item.subFieldName,
                })
              }
            >
              {item.label}
            </Dropdown.OptionItem>
          ))}
          {!isNonEmptyArray(filteredMenuItems) && (
            <Dropdown.Empty>{t`No compatible fields`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </>
    );
  };
