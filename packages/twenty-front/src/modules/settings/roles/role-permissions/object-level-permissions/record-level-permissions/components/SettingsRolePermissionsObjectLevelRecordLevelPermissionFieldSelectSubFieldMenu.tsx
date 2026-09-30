/* @license Enterprise */

import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';

import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useApplyAdvancedFilterCompositeSubField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterCompositeSubField';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenuProps =
  {
    recordFilterId: string;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenu =
  ({
    recordFilterId,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenuProps) => {
    const { getIcon } = useIcons();
    const fieldMetadataItem = useAtomComponentSelectorValue(
      fieldMetadataItemUsedInDropdownComponentSelector,
    );
    const { closeAdvancedFilterFieldSelectDropdown } =
      useAdvancedFilterFieldSelectDropdown(recordFilterId);
    const { applyAdvancedFilterCompositeSubField } =
      useApplyAdvancedFilterCompositeSubField();

    if (!isDefined(fieldMetadataItem)) {
      return null;
    }

    const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

    if (!isCompositeFilterableFieldType(filterType)) {
      return null;
    }

    const compositeType = compositeTypeDefinitions.get(fieldMetadataItem.type);
    const subFields = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
      filterType
    ].subFields.filter((subField) => {
      const subFieldProperty = compositeType?.properties.find(
        (property) => property.name === subField.subFieldName,
      );

      return (
        subField.isFilterable &&
        subFieldProperty?.type !== FieldMetadataType.RAW_JSON
      );
    });

    const handleSelectFilter = (subFieldName: CompositeFieldSubFieldName) => {
      applyAdvancedFilterCompositeSubField({
        sourceFieldMetadataItem: fieldMetadataItem,
        subFieldName,
        recordFilterId,
      });
      closeAdvancedFilterFieldSelectDropdown();
    };

    return (
      <>
        <Dropdown.Back>{fieldMetadataItem.label}</Dropdown.Back>
        <Dropdown.Section>
          {subFields.map(({ subFieldName }) => (
            <Dropdown.OptionItem
              key={subFieldName}
              selected={false}
              indicator="none"
              closeOnSelect={false}
              onSelect={() => handleSelectFilter(subFieldName)}
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(
                    ICON_NAME_BY_SUB_FIELD[subFieldName] ??
                      fieldMetadataItem.icon,
                  )}
                />
              }
            >
              {getCompositeSubFieldLabel(filterType, subFieldName)}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </>
    );
  };
