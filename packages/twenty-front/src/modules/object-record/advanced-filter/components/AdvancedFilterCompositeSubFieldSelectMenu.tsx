import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useApplyAdvancedFilterCompositeSubField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterCompositeSubField';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { areCompositeTypeSubFieldsFilterable } from '@/object-record/record-filter/utils/areCompositeTypeSubFieldsFilterable';
import { isCompositeTypeNonFilterableByAnySubField } from '@/object-record/record-filter/utils/isCompositeTypeNonFilterableByAnySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { t } from '@lingui/core/macro';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

type AdvancedFilterCompositeSubFieldSelectMenuProps = {
  recordFilterId: string;
  fieldMetadataItem: FieldMetadataItem;
};

export const AdvancedFilterCompositeSubFieldSelectMenu = ({
  recordFilterId,
  fieldMetadataItem,
}: AdvancedFilterCompositeSubFieldSelectMenuProps) => {
  const { getIcon } = useIcons();
  const { applyAdvancedFilterCompositeSubField } =
    useApplyAdvancedFilterCompositeSubField();

  const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

  if (!isCompositeFilterableFieldType(filterType)) {
    return null;
  }

  const handleSelectFilter = (
    subFieldName: CompositeFieldSubFieldName | null,
  ) => {
    applyAdvancedFilterCompositeSubField({
      sourceFieldMetadataItem: fieldMetadataItem,
      subFieldName,
      recordFilterId,
    });
  };

  const subFieldNames = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    filterType
  ].subFields
    .filter((subField) => subField.isFilterable === true)
    .map((subField) => subField.subFieldName);
  const subFieldsAreFilterable = areCompositeTypeSubFieldsFilterable(
    fieldMetadataItem.type,
  );
  const compositeFieldTypeIsFilterableByAnySubField =
    !isCompositeTypeNonFilterableByAnySubField(fieldMetadataItem.type);

  return (
    <>
      <Dropdown.Back aria-label={t`${fieldMetadataItem.label}, back to fields`}>
        {fieldMetadataItem.label}
      </Dropdown.Back>
      <Dropdown.Section>
        {compositeFieldTypeIsFilterableByAnySubField && (
          <Dropdown.ActionItem
            onClick={() => handleSelectFilter(null)}
            startIcon={
              <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
            }
          >
            <OverflowingTextWithTooltip
              text={t`Any ${fieldMetadataItem.label} field`}
            />
          </Dropdown.ActionItem>
        )}
        {subFieldsAreFilterable &&
          subFieldNames.map((subFieldName) => (
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
