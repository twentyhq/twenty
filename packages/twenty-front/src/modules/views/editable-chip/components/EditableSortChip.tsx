import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { useSortSubFieldChoicesForField } from '@/object-metadata/hooks/useSortSubFieldChoicesForField';
import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { Dropdown } from 'twenty-ui/components';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowDown, IconArrowUp } from 'twenty-ui/icon';
import { ViewSortDirection } from '~/generated-metadata/graphql';

type EditableSortChipProps = {
  recordSort: RecordSort;
};

export const EditableSortChip = ({ recordSort }: EditableSortChipProps) => {
  const { t } = useLingui();
  const { removeRecordSort } = useRemoveRecordSort();
  const { upsertRecordSort } = useUpsertRecordSort();

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
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger render={<div />} nativeButton={false}>
        <SortOrFilterChip
          key={recordSort.fieldMetadataId}
          testId={recordSort.fieldMetadataId}
          labelValue={fieldMetadataItem.label}
          labelSubField={subFieldChoices.selectedLabel}
          Icon={Icon}
          onRemove={handleRemove}
          type="sort"
        />
      </Dropdown.Trigger>
      <DropdownContent sideOffset={8}>
        <Dropdown.Section>
          <Dropdown.OptionItem
            onSelect={() => setDirection(ViewSortDirection.ASC)}
            selected={recordSort.direction === ViewSortDirection.ASC}
            startIcon={<SelectOptionIcon Icon={IconArrowUp} />}
          >{t`Ascending`}</Dropdown.OptionItem>
          <Dropdown.OptionItem
            onSelect={() => setDirection(ViewSortDirection.DESC)}
            selected={recordSort.direction === ViewSortDirection.DESC}
            startIcon={<SelectOptionIcon Icon={IconArrowDown} />}
          >{t`Descending`}</Dropdown.OptionItem>
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
          {subFieldChoices.options.map((option) => (
            <Dropdown.OptionItem
              key={option.value}
              onSelect={() => handleSubFieldSelect(option.value)}
              selected={option.value === subFieldChoices.selectedValue}
            >
              {option.label}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
