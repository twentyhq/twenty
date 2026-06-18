import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { useSortSubFieldChoicesForField } from '@/object-metadata/hooks/useSortSubFieldChoicesForField';
import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowDown, IconArrowUp } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { ViewSortDirection } from '~/generated-metadata/graphql';

type EditableSortChipProps = {
  recordSort: RecordSort;
};

export const EditableSortChip = ({ recordSort }: EditableSortChipProps) => {
  const { t } = useLingui();
  const { removeRecordSort } = useRemoveRecordSort();
  const { upsertRecordSort } = useUpsertRecordSort();
  const { closeDropdown } = useCloseDropdown();

  const { fieldMetadataItem } = useFieldMetadataItemByIdOrThrow(
    recordSort.fieldMetadataId,
  );

  const subFieldChoices = useSortSubFieldChoicesForField({
    fieldMetadataItem,
    primaryCompositeSubField: recordSort.subFieldName,
  });

  const dropdownId = `sort-chip-${recordSort.id}`;

  const setDirection = (direction: ViewSortDirection) => {
    upsertRecordSort({ ...recordSort, direction });
  };

  const toggleDirection = () => {
    setDirection(
      recordSort.direction === ViewSortDirection.ASC
        ? ViewSortDirection.DESC
        : ViewSortDirection.ASC,
    );
  };

  const handleRemove = () => {
    removeRecordSort(recordSort.fieldMetadataId);
  };

  const handleSubFieldSelect = (value: string) => {
    upsertRecordSort({ ...recordSort, subFieldName: value });
    closeDropdown(dropdownId);
  };

  const handleDirectionSelect = (direction: ViewSortDirection) => {
    setDirection(direction);
    closeDropdown(dropdownId);
  };

  const Icon =
    recordSort.direction === ViewSortDirection.DESC
      ? IconArrowDown
      : IconArrowUp;

  if (!isDefined(subFieldChoices)) {
    return (
      <SortOrFilterChip
        key={recordSort.fieldMetadataId}
        testId={recordSort.fieldMetadataId}
        labelValue={fieldMetadataItem.label}
        Icon={Icon}
        onRemove={handleRemove}
        onClick={toggleDirection}
        type="sort"
      />
    );
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <SortOrFilterChip
          key={recordSort.fieldMetadataId}
          testId={recordSort.fieldMetadataId}
          labelValue={fieldMetadataItem.label}
          labelSubField={subFieldChoices.selectedLabel}
          Icon={Icon}
          onRemove={handleRemove}
          type="sort"
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItemSelect
              LeftIcon={IconArrowUp}
              text={t`Ascending`}
              selected={recordSort.direction === ViewSortDirection.ASC}
              onClick={() => handleDirectionSelect(ViewSortDirection.ASC)}
            />
            <MenuItemSelect
              LeftIcon={IconArrowDown}
              text={t`Descending`}
              selected={recordSort.direction === ViewSortDirection.DESC}
              onClick={() => handleDirectionSelect(ViewSortDirection.DESC)}
            />
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            {subFieldChoices.options.map((option) => (
              <MenuItemSelect
                key={option.value}
                text={option.label}
                selected={option.value === subFieldChoices.selectedValue}
                onClick={() => handleSubFieldSelect(option.value)}
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
    />
  );
};
