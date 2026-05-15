import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useSelectFieldUsedInAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useSelectFieldUsedInAdvancedFilterDropdown';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import {
  RELATION_SUB_MENU_FIELD_TYPE,
  objectFilterDropdownSubMenuFieldTypeComponentState,
} from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
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

  const fieldMetadataItemUsedInDropdown = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useAtomComponentState(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const [
    objectFilterDropdownSubMenuFieldType,
    setObjectFilterDropdownSubMenuFieldType,
  ] = useAtomComponentState(objectFilterDropdownSubMenuFieldTypeComponentState);

  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const { selectFieldUsedInAdvancedFilterDropdown } =
    useSelectFieldUsedInAdvancedFilterDropdown();

  const isRelationSubMenu =
    objectFilterDropdownSubMenuFieldType === RELATION_SUB_MENU_FIELD_TYPE &&
    isDefined(fieldMetadataItemUsedInDropdown) &&
    isManyToOneRelationField(fieldMetadataItemUsedInDropdown);

  const targetObjectMetadataId = isRelationSubMenu
    ? (fieldMetadataItemUsedInDropdown?.relation?.targetObjectMetadata.id ?? '')
    : '';

  const { filterableFieldMetadataItems: relationTargetFields } =
    useFilterableFieldMetadataItems(targetObjectMetadataId);

  const handleSelectFilter = ({
    fieldMetadataItem,
    subFieldName,
    relationTargetFieldMetadataItem,
  }: {
    fieldMetadataItem: FieldMetadataItem;
    subFieldName?: CompositeFieldSubFieldName | null;
    relationTargetFieldMetadataItem?: FieldMetadataItem | null;
  }) => {
    selectFieldUsedInAdvancedFilterDropdown({
      fieldMetadataItemId: fieldMetadataItem.id,
      recordFilterId,
      subFieldName,
      relationTargetFieldMetadataItem,
      // The field-select dropdown is closing here and the next value picker
      // (driven by the target's type) sets up its own focus when opened.
      skipFocusPush: isDefined(relationTargetFieldMetadataItem),
    });

    closeAdvancedFilterFieldSelectDropdown();
  };

  const handleSubMenuBack = () => {
    setObjectFilterDropdownSubMenuFieldType(null);
    setObjectFilterDropdownIsSelectingCompositeField(false);
  };

  const { advancedFilterFieldSelectDropdownId } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  if (!isDefined(objectFilterDropdownSubMenuFieldType)) {
    return null;
  }

  if (isRelationSubMenu && isDefined(fieldMetadataItemUsedInDropdown)) {
    const fieldLabel = fieldMetadataItemUsedInDropdown.label;
    const selectableItemIdArray = relationTargetFields.map((field) => field.id);

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
          {fieldLabel}
        </DropdownMenuHeader>
        <DropdownMenuItemsContainer>
          <SelectableList
            focusId={advancedFilterFieldSelectDropdownId}
            selectableItemIdArray={selectableItemIdArray}
            selectableListInstanceId={advancedFilterFieldSelectDropdownId}
          >
            {relationTargetFields.map((targetField, index) => (
              <SelectableListItem
                itemId={targetField.id}
                key={`select-filter-relation-${index}`}
                onEnter={() => {
                  handleSelectFilter({
                    fieldMetadataItem: fieldMetadataItemUsedInDropdown,
                    relationTargetFieldMetadataItem: targetField,
                  });
                }}
              >
                <MenuItem
                  focused={selectedItemId === targetField.id}
                  key={`select-filter-relation-${index}`}
                  testId={`select-filter-relation-${index}`}
                  onClick={() => {
                    handleSelectFilter({
                      fieldMetadataItem: fieldMetadataItemUsedInDropdown,
                      relationTargetFieldMetadataItem: targetField,
                    });
                  }}
                  text={targetField.label}
                  LeftIcon={getIcon(targetField.icon)}
                />
              </SelectableListItem>
            ))}
          </SelectableList>
        </DropdownMenuItemsContainer>
      </DropdownContent>
    );
  }

  const compositeSubMenuFieldType =
    objectFilterDropdownSubMenuFieldType === RELATION_SUB_MENU_FIELD_TYPE
      ? null
      : objectFilterDropdownSubMenuFieldType;

  if (!isDefined(compositeSubMenuFieldType)) {
    return null;
  }

  const subFieldNames = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    compositeSubMenuFieldType
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
          {compositeFieldTypeIsFilterableByAnySubField &&
            isDefined(fieldMetadataItemUsedInDropdown) && (
              <SelectableListItem
                itemId="-1"
                key={`select-filter-${-1}`}
                onEnter={() => {
                  handleSelectFilter({
                    fieldMetadataItem: fieldMetadataItemUsedInDropdown,
                  });
                }}
              >
                <MenuItem
                  key={`select-filter-${-1}`}
                  testId={`select-filter-${-1}`}
                  focused={selectedItemId === '-1'}
                  onClick={() => {
                    handleSelectFilter({
                      fieldMetadataItem: fieldMetadataItemUsedInDropdown,
                    });
                  }}
                  LeftIcon={getIcon(fieldMetadataItemUsedInDropdown.icon)}
                  text={t`Any ${fieldLabel} field`}
                />
              </SelectableListItem>
            )}
          {subFieldsAreFilterable &&
            isDefined(fieldMetadataItemUsedInDropdown) &&
            subFieldNames.map((subFieldName, index) => (
              <SelectableListItem
                itemId={subFieldName}
                key={`select-filter-${index}`}
                onEnter={() => {
                  handleSelectFilter({
                    fieldMetadataItem: fieldMetadataItemUsedInDropdown,
                    subFieldName,
                  });
                }}
              >
                <MenuItem
                  focused={selectedItemId === subFieldName}
                  key={`select-filter-${index}`}
                  testId={`select-filter-${index}`}
                  onClick={() => {
                    handleSelectFilter({
                      fieldMetadataItem: fieldMetadataItemUsedInDropdown,
                      subFieldName,
                    });
                  }}
                  text={getCompositeSubFieldLabel(
                    compositeSubMenuFieldType,
                    subFieldName,
                  )}
                  LeftIcon={getIcon(
                    ICON_NAME_BY_SUB_FIELD[subFieldName] ??
                      fieldMetadataItemUsedInDropdown.icon,
                  )}
                />
              </SelectableListItem>
            ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
