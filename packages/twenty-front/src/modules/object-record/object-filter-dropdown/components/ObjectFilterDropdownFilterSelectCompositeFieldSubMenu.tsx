import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterDropdown';
import { advancedFilterViewFilterGroupIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterGroupIdComponentState';
import { advancedFilterViewFilterIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterIdComponentState';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownFirstLevelFilterDefinitionComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFirstLevelFilterDefinitionComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { getFilterableFieldTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFilterableFieldTypeLabel';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useState } from 'react';
import { isDefined } from 'twenty-shared';
import { IconApps, IconChevronLeft, MenuItem, useIcons } from 'twenty-ui';

export const ObjectFilterDropdownFilterSelectCompositeFieldSubMenu = () => {
  const [searchText] = useState('');

  const { getIcon } = useIcons();

  const [
    objectFilterDropdownFirstLevelFilterDefinition,
    setObjectFilterDropdownFirstLevelFilterDefinition,
  ] = useRecoilComponentStateV2(
    objectFilterDropdownFirstLevelFilterDefinitionComponentState,
  );

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const setSubFieldNameUsedInDropdown = useSetRecoilComponentStateV2(
    subFieldNameUsedInDropdownComponentState,
  );

  const [, setObjectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const [
    objectFilterDropdownSubMenuFieldType,
    setObjectFilterDropdownSubMenuFieldType,
  ] = useRecoilComponentStateV2(
    objectFilterDropdownSubMenuFieldTypeComponentState,
  );

  const setFilterDefinitionUsedInDropdown = useSetRecoilComponentStateV2(
    filterDefinitionUsedInDropdownComponentState,
  );

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const setObjectFilterDropdownSearchInput = useSetRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const advancedFilterViewFilterId = useRecoilComponentValueV2(
    advancedFilterViewFilterIdComponentState,
  );

  const advancedFilterViewFilterGroupId = useRecoilComponentValueV2(
    advancedFilterViewFilterGroupIdComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  const { closeAdvancedFilterDropdown } = useAdvancedFilterDropdown(
    advancedFilterViewFilterId,
  );

  const handleSelectFilter = (
    fieldMetadataItem: FieldMetadataItem | null | undefined,
    subFieldName?: string | null | undefined,
  ) => {
    if (isDefined(fieldMetadataItem)) {
      const filterDefinition: RecordFilterDefinition = {
        fieldMetadataId: fieldMetadataItem.id,
        type: getFilterTypeFromFieldType(fieldMetadataItem.type),
        label: fieldMetadataItem.label,
        iconName: fieldMetadataItem.icon ?? '',
        compositeFieldName: subFieldName ?? undefined,
      };

      if (
        isDefined(advancedFilterViewFilterId) &&
        isDefined(advancedFilterViewFilterGroupId)
      ) {
        closeAdvancedFilterDropdown();

        const type = getFilterTypeFromFieldType(fieldMetadataItem.type);

        const operand = getRecordFilterOperands({
          filterType: type,
          subFieldName: subFieldName,
        })[0];

        const { value, displayValue } = getInitialFilterValue(type, operand);

        applyRecordFilter({
          id: advancedFilterViewFilterId,
          fieldMetadataId: fieldMetadataItem.id,
          value,
          operand,
          displayValue,
          definition: filterDefinition,
          viewFilterGroupId: advancedFilterViewFilterGroupId,
          subFieldName: subFieldName,
        });
      }

      setFilterDefinitionUsedInDropdown(filterDefinition);
      setFieldMetadataItemIdUsedInDropdown(fieldMetadataItem.id);

      const type = getFilterTypeFromFieldType(fieldMetadataItem.type);

      setSelectedOperandInDropdown(
        getRecordFilterOperands({
          filterType: type,
          subFieldName: subFieldName,
        })[0],
      );

      setSubFieldNameUsedInDropdown(subFieldName);

      setObjectFilterDropdownSearchInput('');

      setObjectFilterDropdownFilterIsSelected(true);
    }
  };

  const handleSubMenuBack = () => {
    setFieldMetadataItemIdUsedInDropdown(null);
    setFilterDefinitionUsedInDropdown(null);
    setObjectFilterDropdownSubMenuFieldType(null);
    setObjectFilterDropdownFirstLevelFilterDefinition(null);
    setObjectFilterDropdownIsSelectingCompositeField(false);
    setObjectFilterDropdownFilterIsSelected(false);
  };

  if (
    !isDefined(objectFilterDropdownSubMenuFieldType) ||
    !isDefined(objectFilterDropdownFirstLevelFilterDefinition)
  ) {
    return null;
  }

  const options = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    objectFilterDropdownSubMenuFieldType
  ].filterableSubFields
    .sort((a, b) => a.localeCompare(b))
    .filter((item) =>
      item.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    );

  return (
    <>
      <DropdownMenuHeader
        StartIcon={IconChevronLeft}
        onClick={handleSubMenuBack}
      >
        {getFilterableFieldTypeLabel(objectFilterDropdownSubMenuFieldType)}
      </DropdownMenuHeader>
      {/* <StyledInput
        value={searchText}
        autoFocus
        placeholder="Search fields"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setSearchText(event.target.value)
        }
      /> */}
      <DropdownMenuItemsContainer>
        <MenuItem
          key={`select-filter-${-1}`}
          testId={`select-filter-${-1}`}
          onClick={() => {
            handleSelectFilter(fieldMetadataItemUsedInDropdown);
          }}
          LeftIcon={IconApps}
          text={`Any ${getFilterableFieldTypeLabel(objectFilterDropdownSubMenuFieldType)} field`}
        />
        {/* TODO: fix this with a backend field on ViewFilter for composite field filter */}
        {fieldMetadataItemUsedInDropdown?.type === 'ACTOR' &&
          options.map((subFieldName, index) => (
            <MenuItem
              key={`select-filter-${index}`}
              testId={`select-filter-${index}`}
              onClick={() => {
                if (isDefined(fieldMetadataItemUsedInDropdown)) {
                  handleSelectFilter(
                    fieldMetadataItemUsedInDropdown,
                    subFieldName,
                  );
                }
              }}
              text={getCompositeSubFieldLabel(
                objectFilterDropdownSubMenuFieldType,
                subFieldName,
              )}
              LeftIcon={getIcon(fieldMetadataItemUsedInDropdown?.icon)}
            />
          ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
