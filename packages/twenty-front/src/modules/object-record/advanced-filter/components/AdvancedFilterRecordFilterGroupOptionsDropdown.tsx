import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { useRemoveRootRecordFilterGroupIfEmpty } from '@/object-record/record-filter-group/hooks/useRemoveRootRecordFilterGroupIfEmpty';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';

import { Dropdown, IconButton } from 'twenty-ui/components';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';

type AdvancedFilterRecordFilterGroupOptionsDropdownProps = {
  recordFilterGroupId: string;
};

export const AdvancedFilterRecordFilterGroupOptionsDropdown = ({
  recordFilterGroupId,
}: AdvancedFilterRecordFilterGroupOptionsDropdownProps) => {
  const dropdownId = `advanced-filter-record-filter-group-options-${recordFilterGroupId}`;

  const { removeRecordFilter } = useRemoveRecordFilter();
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();
  const { removeRootRecordFilterGroupIfEmpty } =
    useRemoveRootRecordFilterGroupIfEmpty();

  const { childRecordFilters } = useChildRecordFiltersAndRecordFilterGroups({
    recordFilterGroupId,
  });

  const handleRemove = () => {
    for (const childRecordFilter of childRecordFilters ?? []) {
      removeRecordFilter({ recordFilterId: childRecordFilter.id });
    }

    removeRecordFilterGroup(recordFilterGroupId);

    removeRootRecordFilterGroupIfEmpty();
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger
        render={
          <IconButton aria-label={t`Filter group rule options`} variant="ghost">
            <IconDotsVertical />
          </IconButton>
        }
      />
      <DropdownContent
        sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
      >
        <Dropdown.Section>
          <Dropdown.ActionItem
            onClick={handleRemove}
            startIcon={<IconTrash />}
            color="danger"
          >
            {t`Remove rule group`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
