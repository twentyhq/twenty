import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useApplyAdvancedFilterCompositeSubField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterCompositeSubField';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { areCompositeTypeSubFieldsFilterable } from '@/object-record/record-filter/utils/areCompositeTypeSubFieldsFilterable';
import { isCompositeTypeNonFilterableByAnySubField } from '@/object-record/record-filter/utils/isCompositeTypeNonFilterableByAnySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { t } from '@lingui/core/macro';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

type AdvancedFilterCompositeSubFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterCompositeSubFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterCompositeSubFieldSelectMenuProps) => {
  const { getIcon } = useIcons();
  const fieldMetadataItemUsedInDropdown = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );
  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);
  const { applyAdvancedFilterCompositeSubField } =
    useApplyAdvancedFilterCompositeSubField();

  const handleSelectFilter = ({
    fieldMetadataItem,
    subFieldName,
  }: {
    fieldMetadataItem: FieldMetadataItem;
    subFieldName?: CompositeFieldSubFieldName;
  }) => {
    applyAdvancedFilterCompositeSubField({
      sourceFieldMetadataItem: fieldMetadataItem,
      subFieldName: subFieldName ?? null,
      recordFilterId,
    });
    closeAdvancedFilterFieldSelectDropdown();
  };

  if (!isDefined(fieldMetadataItemUsedInDropdown)) {
    return null;
  }

  const filterType = getFilterTypeFromFieldType(
    fieldMetadataItemUsedInDropdown.type,
  );

  if (!isCompositeFilterableFieldType(filterType)) {
    return null;
  }

  const subFieldNames = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    filterType
  ].subFields
    .filter((subField) => subField.isFilterable === true)
    .map((subField) => subField.subFieldName);
  const subFieldsAreFilterable = areCompositeTypeSubFieldsFilterable(
    fieldMetadataItemUsedInDropdown.type,
  );
  const compositeFieldTypeIsFilterableByAnySubField =
    !isCompositeTypeNonFilterableByAnySubField(
      fieldMetadataItemUsedInDropdown.type,
    );
  const fieldLabel = fieldMetadataItemUsedInDropdown.label;

  return (
    <>
      <Dropdown.Back aria-label={t`Back to fields`}>{fieldLabel}</Dropdown.Back>
      <Dropdown.Section>
        {compositeFieldTypeIsFilterableByAnySubField && (
          <Dropdown.OptionItem
            selected={false}
            indicator="none"
            closeOnSelect={false}
            onSelect={() => {
              handleSelectFilter({
                fieldMetadataItem: fieldMetadataItemUsedInDropdown,
              });
            }}
            startIcon={
              <SelectOptionIcon
                Icon={getIcon(fieldMetadataItemUsedInDropdown.icon)}
              />
            }
          >
            <OverflowingTextWithTooltip text={t`Any ${fieldLabel} field`} />
          </Dropdown.OptionItem>
        )}
        {subFieldsAreFilterable &&
          subFieldNames.map((subFieldName) => (
            <Dropdown.OptionItem
              key={subFieldName}
              selected={false}
              indicator="none"
              closeOnSelect={false}
              onSelect={() => {
                handleSelectFilter({
                  fieldMetadataItem: fieldMetadataItemUsedInDropdown,
                  subFieldName,
                });
              }}
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(
                    ICON_NAME_BY_SUB_FIELD[subFieldName] ??
                      fieldMetadataItemUsedInDropdown.icon,
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
