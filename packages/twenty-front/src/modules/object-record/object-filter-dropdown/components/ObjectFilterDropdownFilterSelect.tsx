import styled from '@emotion/styled';

import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { AdvancedFilterButton } from '@/object-record/object-filter-dropdown/components/AdvancedFilterButton';
import { ObjectFilterDropdownFilterSelectMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectMenuItem';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

import { useSelectFilterUsedInDropdown } from '@/object-record/object-filter-dropdown/hooks/useSelectFilterUsedInDropdown';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-top: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  border-top-left-radius: ${({ theme }) => theme.border.radius.md};
  border-top-right-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  min-height: 19px;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

type ObjectFilterDropdownFilterSelectProps = {
  isAdvancedFilterButtonVisible?: boolean;
};

export const ObjectFilterDropdownFilterSelect = ({
  isAdvancedFilterButtonVisible,
}: ObjectFilterDropdownFilterSelectProps) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const [objectFilterDropdownSearchInput, setObjectFilterDropdownSearchInput] =
    useRecoilComponentStateV2(objectFilterDropdownSearchInputComponentState);

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
    recordIndexId,
  );
  const visibleColumnsIds = visibleTableColumns.map(
    (column) => column.fieldMetadataId,
  );

  const filteredSearchInputFieldMetadataItems =
    filterableFieldMetadataItems.filter((fieldMetadataItem) =>
      fieldMetadataItem.label
        .toLocaleLowerCase()
        .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()),
    );

  const visibleColumnsFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .sort((a, b) => {
      return visibleColumnsIds.indexOf(a.id) - visibleColumnsIds.indexOf(b.id);
    })
    .filter((fieldMetadataItem) =>
      visibleColumnsIds.includes(fieldMetadataItem.id),
    );

  const hiddenColumnsFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter(
      (fieldMetadataItem) => !visibleColumnsIds.includes(fieldMetadataItem.id),
    );

  const selectableFieldMetadataItemIds = filterableFieldMetadataItems.map(
    (fieldMetadataItem) => fieldMetadataItem.id,
  );

  const { selectFilterUsedInDropdown } = useSelectFilterUsedInDropdown();

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const { resetSelectedItem } = useSelectableList(OBJECT_FILTER_DROPDOWN_ID);

  const handleEnter = (fieldMetadataItemId: string) => {
    const selectedFieldMetadataItem = filterableFieldMetadataItems.find(
      (fieldMetadataItem) => fieldMetadataItem.id === fieldMetadataItemId,
    );

    if (!isDefined(selectedFieldMetadataItem)) {
      return;
    }

    resetSelectedItem();

    selectFilterUsedInDropdown({
      fieldMetadataItemId,
    });

    setFieldMetadataItemIdUsedInDropdown(fieldMetadataItemId);
  };

  const shouldShowSeparator =
    visibleColumnsFieldMetadataItems.length > 0 &&
    hiddenColumnsFieldMetadataItems.length > 0;

  const { currentView } = useGetCurrentViewOnly();

  const shouldShowAdvancedFilterButton =
    isDefined(currentView?.objectMetadataId) && isAdvancedFilterButtonVisible;

  const { t } = useLingui();

  return (
    <>
      <StyledInput
        value={objectFilterDropdownSearchInput}
        autoFocus
        placeholder={t`Search fields`}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setObjectFilterDropdownSearchInput(event.target.value)
        }
      />
      <SelectableList
        hotkeyScope={FiltersHotkeyScope.ObjectFilterDropdownButton}
        selectableItemIdArray={selectableFieldMetadataItemIds}
        selectableListInstanceId={OBJECT_FILTER_DROPDOWN_ID}
        onEnter={handleEnter}
      >
        <DropdownMenuItemsContainer>
          {visibleColumnsFieldMetadataItems.map(
            (visibleFieldMetadataItem, index) => (
              <SelectableItem
                itemId={visibleFieldMetadataItem.id}
                key={`visible-select-filter-${index}`}
              >
                <ObjectFilterDropdownFilterSelectMenuItem
                  fieldMetadataItemToSelect={visibleFieldMetadataItem}
                />
              </SelectableItem>
            ),
          )}
          {shouldShowSeparator && <DropdownMenuSeparator />}
          {hiddenColumnsFieldMetadataItems.map(
            (hiddenFieldMetadataItem, index) => (
              <SelectableItem
                itemId={hiddenFieldMetadataItem.id}
                key={`hidden-select-filter-${index}`}
              >
                <ObjectFilterDropdownFilterSelectMenuItem
                  fieldMetadataItemToSelect={hiddenFieldMetadataItem}
                />
              </SelectableItem>
            ),
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
      {shouldShowAdvancedFilterButton && <AdvancedFilterButton />}
    </>
  );
};
