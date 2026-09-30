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
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/constants/RecordLevelPermissionPredicateFieldTypes';
import { getComparableWorkspaceMemberRelationFields } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getComparableWorkspaceMemberRelationFields';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenuProps =
  {
    recordFilterId: string;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenu =
  ({
    recordFilterId,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenuProps) => {
    const { t } = useLingui();
    const { getIcon } = useIcons();
    const { goToPage } = useDropdownPage();

    const { closeAdvancedFilterFieldSelectDropdown } =
      useAdvancedFilterFieldSelectDropdown(recordFilterId);

    const [
      objectFilterDropdownSearchInput,
      setObjectFilterDropdownSearchInput,
    ] = useAtomComponentState(objectFilterDropdownSearchInputComponentState);

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
            .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()) &&
          isPredicateFieldMetadataItem(fieldMetadataItem),
      )
      .sort((a, b) => a.label.localeCompare(b.label));

    const { applyAdvancedFilterSourceField } =
      useApplyAdvancedFilterSourceField();

    const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
      fieldMetadataItemIdUsedInDropdownComponentState,
    );

    const { pushFocusForLeafFieldValuePicker } =
      usePushFocusForLeafFieldValuePicker();

    const handleFieldSelect = (
      selectedFieldMetadataItem: FieldMetadataItem,
    ) => {
      const filterType = getFilterTypeFromFieldType(
        selectedFieldMetadataItem.type,
      );

      if (isCompositeFilterableFieldType(filterType)) {
        setFieldMetadataItemIdUsedInDropdown(selectedFieldMetadataItem.id);
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
          value={objectFilterDropdownSearchInput}
          onValueChange={setObjectFilterDropdownSearchInput}
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
        />
        <Dropdown.Section label={t`Fields`}>
          {filteredFieldMetadataItems.map((fieldMetadataItem) => (
            <Dropdown.OptionItem
              key={fieldMetadataItem.id}
              selected={false}
              indicator="none"
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
