import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useSelectFieldUsedInAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useSelectFieldUsedInAdvancedFilterDropdown';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownIsSelectingRelationSubFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingRelationSubFieldComponentState';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconFilterOff, IconFilterPlus, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type AdvancedFilterRelationSubFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterRelationSubFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterRelationSubFieldSelectMenuProps) => {
  const { getIcon } = useIcons();

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const [, setObjectFilterDropdownIsSelectingRelationSubField] =
    useRecoilComponentState(
      objectFilterDropdownIsSelectingRelationSubFieldComponentState,
    );

  const { closeAdvancedFilterFieldSelectDropdown, advancedFilterFieldSelectDropdownId } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const { selectFieldUsedInAdvancedFilterDropdown } =
    useSelectFieldUsedInAdvancedFilterDropdown();

  const { objectMetadataItems } = useObjectMetadataItems();

  const targetObjectMetadataId =
    fieldMetadataItemUsedInDropdown?.relation?.targetObjectMetadata.id;

  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    targetObjectMetadataId ?? '',
  );

  const targetObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === targetObjectMetadataId,
  );

  // Filter to only simple field types (exclude RELATION and composite types)
  const simpleFilterableFields = filterableFieldMetadataItems.filter(
    (field) =>
      field.type !== FieldMetadataType.RELATION &&
      field.type !== FieldMetadataType.MORPH_RELATION,
  );

  const handleSubMenuBack = () => {
    setObjectFilterDropdownIsSelectingRelationSubField(false);
  };

  const handleSelectHasAny = () => {
    if (!isDefined(fieldMetadataItemUsedInDropdown)) {
      return;
    }

    selectFieldUsedInAdvancedFilterDropdown({
      fieldMetadataItemId: fieldMetadataItemUsedInDropdown.id,
      recordFilterId,
    });

    closeAdvancedFilterFieldSelectDropdown();
  };

  const handleSelectSubField = (targetFieldName: string) => {
    if (!isDefined(fieldMetadataItemUsedInDropdown)) {
      return;
    }

    const targetField = simpleFilterableFields.find(
      (field) => field.name === targetFieldName,
    );

    if (!isDefined(targetField)) {
      return;
    }

    const subFieldFilterType = getFilterTypeFromFieldType(targetField.type);

    selectFieldUsedInAdvancedFilterDropdown({
      fieldMetadataItemId: fieldMetadataItemUsedInDropdown.id,
      recordFilterId,
      subFieldName: targetFieldName,
      relationSubFieldType: subFieldFilterType,
    });

    closeAdvancedFilterFieldSelectDropdown();
  };

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  if (!isDefined(fieldMetadataItemUsedInDropdown)) {
    return null;
  }

  const selectableItemIdArray = [
    'has-any',
    'has-none',
    ...simpleFilterableFields.map((field) => field.name),
  ];

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
        {fieldMetadataItemUsedInDropdown.label}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          focusId={advancedFilterFieldSelectDropdownId}
          selectableItemIdArray={selectableItemIdArray}
          selectableListInstanceId={advancedFilterFieldSelectDropdownId}
        >
          <SelectableListItem
            itemId="has-any"
            key="select-filter-has-any"
            onEnter={handleSelectHasAny}
          >
            <MenuItem
              focused={selectedItemId === 'has-any'}
              onClick={handleSelectHasAny}
              LeftIcon={IconFilterPlus}
              text={t`Has any ${targetObjectMetadataItem?.labelPlural ?? ''}`}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="has-none"
            key="select-filter-has-none"
            onEnter={handleSelectHasAny}
          >
            <MenuItem
              focused={selectedItemId === 'has-none'}
              onClick={handleSelectHasAny}
              LeftIcon={IconFilterOff}
              text={t`Has no ${targetObjectMetadataItem?.labelPlural ?? ''}`}
            />
          </SelectableListItem>
          {simpleFilterableFields.map((field, index) => (
            <SelectableListItem
              itemId={field.name}
              key={`select-filter-${index}`}
              onEnter={() => handleSelectSubField(field.name)}
            >
              <MenuItem
                focused={selectedItemId === field.name}
                onClick={() => handleSelectSubField(field.name)}
                LeftIcon={getIcon(field.icon)}
                text={field.label}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
