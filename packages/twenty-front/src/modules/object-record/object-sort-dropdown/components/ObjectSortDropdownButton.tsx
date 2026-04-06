import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useCloseSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useCloseSortDropdown';
import { useResetRecordSortDropdownSearchInput } from '@/object-record/object-sort-dropdown/hooks/useResetRecordSortDropdownSearchInput';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { isRecordSortDirectionDropdownMenuUnfoldedComponentState } from '@/object-record/object-sort-dropdown/states/isRecordSortDirectionDropdownMenuUnfoldedComponentState';
import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { selectedRecordSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedRecordSortDirectionComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAICElement } from '@aicorg/sdk-react';
import { Trans, useLingui } from '@lingui/react/macro';
import { type ComponentType } from 'react';
import { findByProperty } from 'twenty-shared/utils';
import { IconX, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { v4 } from 'uuid';
import { ViewSortDirection } from '~/generated-metadata/graphql';

type SortFieldMenuItemProps = {
  fieldMetadataItem: FieldMetadataItem;
  focused: boolean;
  onClick: () => void;
  testId: string;
  objectNameSingular: string;
  objectLabelPlural: string;
  LeftIcon: ComponentType<any>;
};

const SortFieldMenuItem = ({
  fieldMetadataItem,
  focused,
  onClick,
  testId,
  objectNameSingular,
  objectLabelPlural,
  LeftIcon,
}: SortFieldMenuItemProps) => {
  const { attributes } = useAICElement({
    agentId: `${objectNameSingular}.view.sort.field.${fieldMetadataItem.name}`,
    agentAction: 'select',
    agentDescription: `Apply a sort on the ${fieldMetadataItem.label} field for the current ${objectLabelPlural} view.`,
    agentEntityId: fieldMetadataItem.id,
    agentEntityLabel: fieldMetadataItem.label,
    agentEntityType: `${objectNameSingular}_field`,
    agentLabel: `Sort ${objectLabelPlural} by ${fieldMetadataItem.label}`,
    agentRisk: 'low',
    agentWorkflowStep: `${objectNameSingular}.view.select_sort_field`,
  });

  return (
    <MenuItem
      focused={focused}
      testId={testId}
      onClick={onClick}
      LeftIcon={LeftIcon}
      text={fieldMetadataItem.label}
      {...attributes}
    />
  );
};

export const ObjectSortDropdownButton = () => {
  const { resetRecordSortDropdownSearchInput } =
    useResetRecordSortDropdownSearchInput();

  const setObjectSortDropdownSearchInput = useSetAtomComponentState(
    objectSortDropdownSearchInputComponentState,
  );

  const { resetSortDropdown } = useResetSortDropdown();

  const { recordIndexId, objectMetadataItem } = useRecordIndexContextOrThrow();

  const objectSortDropdownSearchInput = useAtomComponentStateValue(
    objectSortDropdownSearchInputComponentState,
  );

  const sortableFieldMetadataItems = useAtomFamilySelectorValue(
    availableFieldMetadataItemsForSortFamilySelector,
    {
      objectMetadataItemId: objectMetadataItem.id,
    },
  );

  const { getIcon } = useIcons();

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );

  const visibleFieldMetadataItemIds = visibleRecordFields.map(
    (recordField) => recordField.fieldMetadataItemId,
  );

  const filteredSearchInputFieldMetadataItems =
    sortableFieldMetadataItems.filter((item) =>
      item.label
        .toLocaleLowerCase()
        .includes(objectSortDropdownSearchInput.toLocaleLowerCase()),
    );

  const visibleFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .sort((fieldMetadataItemA, fieldMetadataItemB) => {
      return (
        visibleFieldMetadataItemIds.indexOf(fieldMetadataItemA.id) -
        visibleFieldMetadataItemIds.indexOf(fieldMetadataItemB.id)
      );
    })
    .filter((fieldMetadataItem) =>
      visibleFieldMetadataItemIds.includes(fieldMetadataItem.id),
    );

  const hiddenFieldMetadataItemsSorted = filteredSearchInputFieldMetadataItems
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.label.localeCompare(fieldMetadataItemB.label),
    )
    .filter(
      (fieldMetadataItem) =>
        !visibleRecordFields.some(
          findByProperty('fieldMetadataItemId', fieldMetadataItem.id),
        ),
    );

  const shouldShowSeparator =
    visibleFieldMetadataItems.length > 0 &&
    hiddenFieldMetadataItemsSorted.length > 0;

  const handleDropdownButtonClose = () => {
    resetRecordSortDropdownSearchInput();
    resetSortDropdown();
  };

  const handleDropdownOpen = () => {
    resetSortDropdown();
    setSelectedItemId(selectableItemIdArray[0]);
  };

  const { closeSortDropdown } = useCloseSortDropdown();

  const { upsertRecordSort } = useUpsertRecordSort();

  const handleAddSort = (fieldMetadataItem: FieldMetadataItem) => {
    setObjectSortDropdownSearchInput('');
    closeSortDropdown();
    upsertRecordSort({
      id: v4(),
      fieldMetadataId: fieldMetadataItem.id,
      direction: selectedRecordSortDirection,
    });
  };

  const [selectedRecordSortDirection, setSelectedRecordSortDirection] =
    useAtomComponentState(selectedRecordSortDirectionComponentState);

  const setIsRecordSortDirectionDropdownMenuUnfolded = useSetAtomComponentState(
    isRecordSortDirectionDropdownMenuUnfoldedComponentState,
  );

  const handleSortDirectionClick = (sortDirection: ViewSortDirection) => {
    setSelectedRecordSortDirection(sortDirection);
    setIsRecordSortDirectionDropdownMenuUnfolded(false);
  };

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    OBJECT_SORT_DROPDOWN_ID,
  );

  const { t } = useLingui();

  const selectableItemIdArray = [
    ...visibleFieldMetadataItems.map((item) => item.id),
    ...hiddenFieldMetadataItemsSorted.map((item) => item.id),
  ];

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    OBJECT_SORT_DROPDOWN_ID,
  );

  const setSelectedItemId = useSetAtomComponentState(
    selectedItemIdComponentState,
    OBJECT_SORT_DROPDOWN_ID,
  );

  const shouldShowHiddenFields = hiddenFieldMetadataItemsSorted.length > 0;
  const shouldShowVisibleFields = visibleFieldMetadataItems.length > 0;
  const sortAction = useAICElement({
    agentId: `${objectMetadataItem.nameSingular}.view.sort.open`,
    agentAction: 'open',
    agentDescription:
      'Open the current record list sort controls for this object view.',
    agentEntityId: objectMetadataItem.id,
    agentEntityLabel: objectMetadataItem.labelPlural,
    agentEntityType: `${objectMetadataItem.nameSingular}_view`,
    agentLabel: `Open ${objectMetadataItem.labelPlural} sort controls`,
    agentRisk: 'low',
    agentWorkflowStep: `${objectMetadataItem.nameSingular}.view.open_sort`,
  });

  return (
    <Dropdown
      dropdownId={OBJECT_SORT_DROPDOWN_ID}
      dropdownOffset={{ y: 8 }}
      onOpen={handleDropdownOpen}
      clickableComponentProps={sortAction.attributes}
      clickableComponent={
        <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
          <Trans>Sort</Trans>
        </StyledHeaderDropdownButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
          <DropdownMenuHeader
            StartComponent={
              <DropdownMenuHeaderLeftComponent
                onClick={() => closeSortDropdown()}
                Icon={IconX}
              />
            }
          >
            {t`Sort`}
          </DropdownMenuHeader>
          <DropdownMenuInnerSelect
            dropdownId="record-sort-direction-dropdown"
            options={[ViewSortDirection.ASC, ViewSortDirection.DESC].map(
              (sortDirection) => ({
                value: sortDirection,
                label:
                  sortDirection === ViewSortDirection.ASC
                    ? t`Ascending`
                    : t`Descending`,
              }),
            )}
            selectedOption={{
              value: selectedRecordSortDirection,
              label:
                selectedRecordSortDirection === ViewSortDirection.ASC
                  ? t`Ascending`
                  : t`Descending`,
            }}
            onChange={(sortDirection) =>
              handleSortDirectionClick(sortDirection.value as ViewSortDirection)
            }
            widthInPixels={GenericDropdownContentWidth.ExtraLarge}
          />
          <DropdownMenuSeparator />
          <DropdownMenuSearchInput
            autoFocus
            value={objectSortDropdownSearchInput}
            placeholder={t`Search fields`}
            onChange={(event) =>
              setObjectSortDropdownSearchInput(event.target.value)
            }
          />
          <SelectableList
            selectableListInstanceId={OBJECT_SORT_DROPDOWN_ID}
            selectableItemIdArray={selectableItemIdArray}
            focusId={OBJECT_SORT_DROPDOWN_ID}
          >
            {shouldShowVisibleFields && (
              <>
                <DropdownMenuSectionLabel label={t`Visible fields`} />
                <DropdownMenuItemsContainer>
                  {visibleFieldMetadataItems.map(
                    (visibleFieldMetadataItem, index) => (
                      <SelectableListItem
                        key={visibleFieldMetadataItem.id}
                        itemId={visibleFieldMetadataItem.id}
                        onEnter={() => handleAddSort(visibleFieldMetadataItem)}
                      >
                        <SortFieldMenuItem
                          fieldMetadataItem={visibleFieldMetadataItem}
                          focused={
                            selectedItemId === visibleFieldMetadataItem.id
                          }
                          testId={`visible-select-sort-${index}`}
                          onClick={() =>
                            handleAddSort(visibleFieldMetadataItem)
                          }
                          LeftIcon={getIcon(visibleFieldMetadataItem.icon)}
                          objectNameSingular={objectMetadataItem.nameSingular}
                          objectLabelPlural={objectMetadataItem.labelPlural}
                        />
                      </SelectableListItem>
                    ),
                  )}
                </DropdownMenuItemsContainer>
              </>
            )}
            {shouldShowSeparator && <DropdownMenuSeparator />}
            {shouldShowHiddenFields && (
              <>
                <DropdownMenuSectionLabel label={t`Hidden fields`} />
                <DropdownMenuItemsContainer>
                  {hiddenFieldMetadataItemsSorted.map(
                    (hiddenFieldMetadataItem, index) => (
                      <SelectableListItem
                        key={hiddenFieldMetadataItem.id}
                        itemId={hiddenFieldMetadataItem.id}
                        onEnter={() => handleAddSort(hiddenFieldMetadataItem)}
                      >
                        <SortFieldMenuItem
                          fieldMetadataItem={hiddenFieldMetadataItem}
                          focused={
                            selectedItemId === hiddenFieldMetadataItem.id
                          }
                          testId={`hidden-select-sort-${index}`}
                          onClick={() => handleAddSort(hiddenFieldMetadataItem)}
                          LeftIcon={getIcon(hiddenFieldMetadataItem.icon)}
                          objectNameSingular={objectMetadataItem.nameSingular}
                          objectLabelPlural={objectMetadataItem.labelPlural}
                        />
                      </SelectableListItem>
                    ),
                  )}
                </DropdownMenuItemsContainer>
              </>
            )}
          </SelectableList>
        </DropdownContent>
      }
      onClose={handleDropdownButtonClose}
    />
  );
};
