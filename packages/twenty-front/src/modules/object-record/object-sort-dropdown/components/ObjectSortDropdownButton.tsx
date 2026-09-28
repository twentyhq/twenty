import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useCloseSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useCloseSortDropdown';
import { useResetRecordSortDropdownSearchInput } from '@/object-record/object-sort-dropdown/hooks/useResetRecordSortDropdownSearchInput';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { selectedRecordSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedRecordSortDirectionComponentState';
import { getObjectSortDropdownId } from '@/object-record/object-sort-dropdown/utils/getObjectSortDropdownId';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { Dropdown } from 'twenty-ui/components';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { Trans, useLingui } from '@lingui/react/macro';
import { findByProperty, isNonEmptyArray } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { ViewSortDirection } from '~/generated-metadata/graphql';

export const ObjectSortDropdownButton = () => {
  const { resetRecordSortDropdownSearchInput } =
    useResetRecordSortDropdownSearchInput();

  const setObjectSortDropdownSearchInput = useSetAtomComponentState(
    objectSortDropdownSearchInputComponentState,
  );

  const { resetSortDropdown } = useResetSortDropdown();

  const { recordIndexId, objectMetadataItem } = useRecordIndexContextOrThrow();
  const dropdownId = getObjectSortDropdownId(recordIndexId);

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
    isNonEmptyArray(visibleFieldMetadataItems) &&
    isNonEmptyArray(hiddenFieldMetadataItemsSorted);

  const handleOpenChange = (open: boolean) => {
    resetSortDropdown();
    if (!open) {
      resetRecordSortDropdownSearchInput();
    }
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

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { t } = useLingui();

  const shouldShowHiddenFields = isNonEmptyArray(
    hiddenFieldMetadataItemsSorted,
  );
  const shouldShowVisibleFields = isNonEmptyArray(visibleFieldMetadataItems);

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onOpenChange={handleOpenChange}
    >
      <Dropdown.Trigger
        render={
          <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
            <Trans>Sort</Trans>
          </StyledHeaderDropdownButton>
        }
      />
      <DropdownContent
        width={GenericDropdownContentWidth.ExtraLarge}
        align="end"
        sideOffset={8}
      >
        <Dropdown.Header>
          <Dropdown.Close aria-label={t`Close`} />
          <Dropdown.Title>{t`Sort`}</Dropdown.Title>
        </Dropdown.Header>
        <DropdownMenuInnerSelect
          dropdownId={`${dropdownId}-direction`}
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
            setSelectedRecordSortDirection(
              sortDirection.value as ViewSortDirection,
            )
          }
          widthInPixels={GenericDropdownContentWidth.ExtraLarge}
        />
        <Dropdown.Separator />
        <Dropdown.Search
          value={objectSortDropdownSearchInput}
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
          onValueChange={setObjectSortDropdownSearchInput}
        />
        {shouldShowVisibleFields && (
          <Dropdown.Section label={t`Visible fields`}>
            {visibleFieldMetadataItems.map((fieldMetadataItem, index) => (
              <Dropdown.OptionItem
                key={fieldMetadataItem.id}
                selected={false}
                data-testid={`visible-select-sort-${index}`}
                onSelect={() => handleAddSort(fieldMetadataItem)}
                startIcon={
                  <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
                }
              >
                {fieldMetadataItem.label}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        )}
        {shouldShowSeparator && <Dropdown.Separator />}
        {shouldShowHiddenFields && (
          <Dropdown.Section label={t`Hidden fields`}>
            {hiddenFieldMetadataItemsSorted.map((fieldMetadataItem, index) => (
              <Dropdown.OptionItem
                key={fieldMetadataItem.id}
                selected={false}
                data-testid={`hidden-select-sort-${index}`}
                onSelect={() => handleAddSort(fieldMetadataItem)}
                startIcon={
                  <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
                }
              >
                {fieldMetadataItem.label}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
