/* @license Enterprise */

import { t } from '@lingui/core/macro';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useApplyAdvancedFilterCompositeSubField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterCompositeSubField';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenuProps =
  {
    recordFilterId: string;
    fieldMetadataItem: FieldMetadataItem;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenu =
  ({
    recordFilterId,
    fieldMetadataItem,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenuProps) => {
    const { getIcon } = useIcons();
    const { applyAdvancedFilterCompositeSubField } =
      useApplyAdvancedFilterCompositeSubField();

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
    };

    return (
      <>
        <Dropdown.Back
          aria-label={t`${fieldMetadataItem.label}, back to fields`}
        >
          {fieldMetadataItem.label}
        </Dropdown.Back>
        <Dropdown.Section>
          {subFields.map(({ subFieldName }) => (
            <Dropdown.ActionItem
              key={subFieldName}
              onClick={() => handleSelectFilter(subFieldName)}
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
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Section>
      </>
    );
  };
