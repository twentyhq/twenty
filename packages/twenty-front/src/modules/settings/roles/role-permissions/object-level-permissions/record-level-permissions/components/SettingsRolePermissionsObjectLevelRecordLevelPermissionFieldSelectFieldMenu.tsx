/* @license Enterprise */

import { useLingui } from '@lingui/react/macro';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedFilterFieldSelectSearchInput } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectSearchInput';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useSelectFieldUsedInAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useSelectFieldUsedInAdvancedFilterDropdown';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { ObjectFilterDropdownFilterSelectMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectMenuItem';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/constants/RecordLevelPermissionPredicateFieldTypes';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useContext } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenuProps =
  {
    recordFilterId: string;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenu =
  ({
    recordFilterId,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenuProps) => {
    const { t } = useLingui();

    const {
      closeAdvancedFilterFieldSelectDropdown,
      advancedFilterFieldSelectDropdownId,
    } = useAdvancedFilterFieldSelectDropdown(recordFilterId);

    const [objectFilterDropdownSearchInput] = useRecoilComponentState(
      objectFilterDropdownSearchInputComponentState,
    );

    const { objectMetadataItem } = useContext(AdvancedFilterContext);

    const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
      objectMetadataItem.id,
    );

    const filteredFieldMetadataItems = filterableFieldMetadataItems
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.label
            .toLocaleLowerCase()
            .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()) &&
          (RECORD_LEVEL_PERMISSION_PREDICATE_FIELD_TYPES.includes(
            fieldMetadataItem.type,
          ) ||
            (fieldMetadataItem.type === FieldMetadataType.RELATION &&
              fieldMetadataItem.relation?.targetObjectMetadata.nameSingular ===
                CoreObjectNameSingular.WorkspaceMember)),
      )
      .sort((a, b) => a.label.localeCompare(b.label));

    const { resetSelectedItem } = useSelectableList(
      advancedFilterFieldSelectDropdownId,
    );

    const { selectFieldUsedInAdvancedFilterDropdown } =
      useSelectFieldUsedInAdvancedFilterDropdown();

    const [, setObjectFilterDropdownSubMenuFieldType] = useRecoilComponentState(
      objectFilterDropdownSubMenuFieldTypeComponentState,
    );

    const [, setObjectFilterDropdownIsSelectingCompositeField] =
      useRecoilComponentState(
        objectFilterDropdownIsSelectingCompositeFieldComponentState,
      );

    const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentState(
      fieldMetadataItemIdUsedInDropdownComponentState,
    );

    const handleFieldSelect = (
      selectedFieldMetadataItem: FieldMetadataItem,
    ) => {
      resetSelectedItem();

      const filterType = getFilterTypeFromFieldType(
        selectedFieldMetadataItem.type,
      );

      if (isCompositeFilterableFieldType(filterType)) {
        setObjectFilterDropdownSubMenuFieldType(filterType);
        setFieldMetadataItemIdUsedInDropdown(selectedFieldMetadataItem.id);
        setObjectFilterDropdownIsSelectingCompositeField(true);
      } else {
        selectFieldUsedInAdvancedFilterDropdown({
          fieldMetadataItemId: selectedFieldMetadataItem.id,
          recordFilterId,
        });
        closeAdvancedFilterFieldSelectDropdown();
      }
    };

    const selectableItemIdArray = filteredFieldMetadataItems.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    );

    return (
      <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
        <AdvancedFilterFieldSelectSearchInput />
        <SelectableList
          focusId={advancedFilterFieldSelectDropdownId}
          selectableItemIdArray={selectableItemIdArray}
          selectableListInstanceId={advancedFilterFieldSelectDropdownId}
        >
          <DropdownMenuSectionLabel label={t`Fields`} />
          <DropdownMenuItemsContainer>
            {filteredFieldMetadataItems.map((fieldMetadataItem) => (
              <SelectableListItem
                itemId={fieldMetadataItem.id}
                key={fieldMetadataItem.id}
                onEnter={() => {
                  handleFieldSelect(fieldMetadataItem);
                }}
              >
                <ObjectFilterDropdownFilterSelectMenuItem
                  fieldMetadataItemToSelect={fieldMetadataItem}
                  onClick={handleFieldSelect}
                />
              </SelectableListItem>
            ))}
          </DropdownMenuItemsContainer>
        </SelectableList>
      </DropdownContent>
    );
  };
