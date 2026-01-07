import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useSelectFieldUsedInAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useSelectFieldUsedInAdvancedFilterDropdown';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { areCompositeTypeSubFieldsFilterable } from '@/object-record/record-filter/utils/areCompositeTypeSubFieldsFilterable';
import { isCompositeTypeNonFilterableByAnySubField } from '@/object-record/record-filter/utils/isCompositeTypeNonFilterableByAnySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { t } from '@lingui/core/macro';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type AdvancedFilterSubFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterSubFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterSubFieldSelectMenuProps) => {
  const { getIcon } = useIcons();

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentState(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const [
    objectFilterDropdownSubMenuFieldType,
    setObjectFilterDropdownSubMenuFieldType,
  ] = useRecoilComponentState(
    objectFilterDropdownSubMenuFieldTypeComponentState,
  );

  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const { selectFieldUsedInAdvancedFilterDropdown } =
    useSelectFieldUsedInAdvancedFilterDropdown();

  const handleSelectFilter = (
    selectedFieldMetadataItem: FieldMetadataItem | null | undefined,
    subFieldName?: CompositeFieldSubFieldName | null | undefined,
  ) => {
    if (!isDefined(selectedFieldMetadataItem)) {
      return;
    }

    selectFieldUsedInAdvancedFilterDropdown({
      fieldMetadataItemId: selectedFieldMetadataItem.id,
      recordFilterId,
      subFieldName,
    });

    closeAdvancedFilterFieldSelectDropdown();
  };

  const handleSubMenuBack = () => {
    setObjectFilterDropdownSubMenuFieldType(null);
    setObjectFilterDropdownIsSelectingCompositeField(false);
  };

  const { advancedFilterFieldSelectDropdownId } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  if (!isDefined(objectFilterDropdownSubMenuFieldType)) {
    return null;
  }

  const subFieldNames = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    objectFilterDropdownSubMenuFieldType
  ].subFields
    .filter((subField) => subField.isFilterable === true)
    .map((subField) => subField.subFieldName);

  const subFieldsAreFilterable =
    isDefined(fieldMetadataItemUsedInDropdown) &&
    areCompositeTypeSubFieldsFilterable(fieldMetadataItemUsedInDropdown.type);

  const compositeFieldTypeIsFilterableByAnySubField =
    isDefined(fieldMetadataItemUsedInDropdown) &&
    !isCompositeTypeNonFilterableByAnySubField(
      fieldMetadataItemUsedInDropdown.type,
    );

  const selectableItemIdArray = [
    '-1',
    ...subFieldNames.map((subFieldName) => subFieldName),
  ];

  const fieldLabel = fieldMetadataItemUsedInDropdown?.label;

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={handleSubMenuBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {fieldMetadataItemUsedInDropdown?.label}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          focusId={advancedFilterFieldSelectDropdownId}
          selectableItemIdArray={selectableItemIdArray}
          selectableListInstanceId={advancedFilterFieldSelectDropdownId}
        >
          {compositeFieldTypeIsFilterableByAnySubField && (
            <SelectableListItem
              itemId="-1"
              key={`select-filter-${-1}`}
              onEnter={() => {
                handleSelectFilter(fieldMetadataItemUsedInDropdown);
              }}
            >
              <MenuItem
                key={`select-filter-${-1}`}
                testId={`select-filter-${-1}`}
                focused={selectedItemId === '-1'}
                onClick={() => {
                  handleSelectFilter(fieldMetadataItemUsedInDropdown);
                }}
                LeftIcon={getIcon(fieldMetadataItemUsedInDropdown.icon)}
                text={t`Any ${fieldLabel} field`}
              />
            </SelectableListItem>
          )}
          {subFieldsAreFilterable &&
            subFieldNames.map((subFieldName, index) => (
              <SelectableListItem
                itemId={subFieldName}
                key={`select-filter-${index}`}
                onEnter={() => {
                  handleSelectFilter(
                    fieldMetadataItemUsedInDropdown,
                    subFieldName,
                  );
                }}
              >
                <MenuItem
                  focused={selectedItemId === subFieldName}
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
                  LeftIcon={getIcon(
                    ICON_NAME_BY_SUB_FIELD[subFieldName] ??
                      fieldMetadataItemUsedInDropdown?.icon,
                  )}
                />
              </SelectableListItem>
            ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
