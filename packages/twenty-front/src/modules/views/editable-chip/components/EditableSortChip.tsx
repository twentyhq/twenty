import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
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
import { IconArrowDown, IconArrowUp } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
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
            <ListItem
              onClick={() => handleDirectionSelect(ViewSortDirection.ASC)}
              role="option"
              aria-selected={recordSort.direction === ViewSortDirection.ASC}
              selected={recordSort.direction === ViewSortDirection.ASC}
              indicator="check"
              startIcon={<SelectOptionIcon Icon={IconArrowUp} />}
            >
              <OverflowingTextWithTooltip text={t`Ascending`} />
            </ListItem>
            <ListItem
              onClick={() => handleDirectionSelect(ViewSortDirection.DESC)}
              role="option"
              aria-selected={recordSort.direction === ViewSortDirection.DESC}
              selected={recordSort.direction === ViewSortDirection.DESC}
              indicator="check"
              startIcon={<SelectOptionIcon Icon={IconArrowDown} />}
            >
              <OverflowingTextWithTooltip text={t`Descending`} />
            </ListItem>
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            {subFieldChoices.options.map((option) => (
              <ListItem
                key={option.value}
                onClick={() => handleSubFieldSelect(option.value)}
                role="option"
                aria-selected={option.value === subFieldChoices.selectedValue}
                selected={option.value === subFieldChoices.selectedValue}
                indicator="check"
              >
                <OverflowingTextWithTooltip text={option.label} />
              </ListItem>
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
    />
  );
};
