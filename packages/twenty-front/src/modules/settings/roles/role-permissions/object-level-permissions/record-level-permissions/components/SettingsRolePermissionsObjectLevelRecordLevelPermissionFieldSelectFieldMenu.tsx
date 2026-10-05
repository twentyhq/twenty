/* @license Enterprise */

import { useLingui } from '@lingui/react/macro';
import {
  getFilterTypeFromFieldType,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Dropdown, useDropdownPage } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';

import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useApplyAdvancedFilterSourceField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterSourceField';
import { usePushFocusForLeafFieldValuePicker } from '@/object-record/advanced-filter/hooks/usePushFocusForLeafFieldValuePicker';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/constants/RecordLevelPermissionPredicateFieldTypes';
import { getComparableWorkspaceMemberRelationFields } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getComparableWorkspaceMemberRelationFields';
import { useContext } from 'react';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenuProps =
  {
    recordFilterId: string;
    searchInput: string;
    onSearchInputChange: (searchInput: string) => void;
    onSubPageFieldMetadataItemSelect: (
      fieldMetadataItem: FieldMetadataItem,
    ) => void;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenu =
  ({
    recordFilterId,
    searchInput,
    onSearchInputChange,
    onSubPageFieldMetadataItemSelect,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenuProps) => {
    const { t } = useLingui();
    const { getIcon } = useIcons();
    const { goToPage } = useDropdownPage();

    const { closeAdvancedFilterFieldSelectDropdown } =
      useAdvancedFilterFieldSelectDropdown(recordFilterId);

    const { objectMetadataItem } = useContext(AdvancedFilterContext);

    const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
      objectMetadataItem.id,
    );

    const { objectMetadataItem: workspaceMemberObjectMetadataItem } =
      useObjectMetadataItem({
        objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
      });

    const isPredicateFieldMetadataItem = (
      fieldMetadataItem: FieldMetadataItem,
    ) => {
      if (
        RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES.includes(
          fieldMetadataItem.type,
        )
      ) {
        return true;
      }

      if (fieldMetadataItem.type !== FieldMetadataType.RELATION) {
        return false;
      }

      if (
        fieldMetadataItem.relation?.targetObjectMetadata.nameSingular ===
        CoreObjectNameSingular.WorkspaceMember
      ) {
        return true;
      }

      return isNonEmptyArray(
        getComparableWorkspaceMemberRelationFields({
          workspaceMemberFieldMetadataItems:
            workspaceMemberObjectMetadataItem?.fields ?? [],
          targetObjectMetadataId:
            fieldMetadataItem.relation?.targetObjectMetadata.id,
        }),
      );
    };

    const filteredFieldMetadataItems = filterableFieldMetadataItems
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.label
            .toLocaleLowerCase()
            .includes(searchInput.toLocaleLowerCase()) &&
          isPredicateFieldMetadataItem(fieldMetadataItem),
      )
      .sort((a, b) => a.label.localeCompare(b.label));

    const { applyAdvancedFilterSourceField } =
      useApplyAdvancedFilterSourceField();

    const { pushFocusForLeafFieldValuePicker } =
      usePushFocusForLeafFieldValuePicker();

    const handleFieldSelect = (
      selectedFieldMetadataItem: FieldMetadataItem,
    ) => {
      const filterType = getFilterTypeFromFieldType(
        selectedFieldMetadataItem.type,
      );

      if (isCompositeFilterableFieldType(filterType)) {
        onSubPageFieldMetadataItemSelect(selectedFieldMetadataItem);
        goToPage('composite');
        return;
      }

      applyAdvancedFilterSourceField({
        sourceFieldMetadataItem: selectedFieldMetadataItem,
        recordFilterId,
      });

      pushFocusForLeafFieldValuePicker(selectedFieldMetadataItem);

      closeAdvancedFilterFieldSelectDropdown();
    };

    return (
      <>
        <Dropdown.Search
          value={searchInput}
          onValueChange={onSearchInputChange}
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
        />
        <Dropdown.Section label={t`Fields`}>
          {filteredFieldMetadataItems.map((fieldMetadataItem) => (
            <Dropdown.OptionItem
              key={fieldMetadataItem.id}
              closeOnSelect={false}
              hasSubmenu={isCompositeFilterableFieldType(
                getFilterTypeFromFieldType(fieldMetadataItem.type),
              )}
              startIcon={
                <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
              }
              onSelect={() => handleFieldSelect(fieldMetadataItem)}
            >
              {fieldMetadataItem.label}
            </Dropdown.OptionItem>
          ))}
          {!isNonEmptyArray(filteredFieldMetadataItems) && (
            <Dropdown.Empty>{t`No compatible fields`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </>
    );
  };
