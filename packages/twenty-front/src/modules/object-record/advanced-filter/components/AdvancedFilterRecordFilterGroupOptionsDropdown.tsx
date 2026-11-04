import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { useRemoveRootRecordFilterGroupIfEmpty } from '@/object-record/record-filter-group/hooks/useRemoveRootRecordFilterGroupIfEmpty';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { getAllRecordFilterGroupDescendantsOfRecordFilterGroup } from '@/object-record/record-filter-group/utils/getAllRecordFilterGroupDescendantsOfRecordFilterGroup';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getAllRecordFilterDescendantsOfRecordFilterGroup } from '@/object-record/record-filter/utils/getAllRecordFilterDescendantsOfRecordFilterGroup';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

type AdvancedFilterRecordFilterGroupOptionsDropdownProps = {
  recordFilterGroupId: string;
};

export const AdvancedFilterRecordFilterGroupOptionsDropdown = ({
  recordFilterGroupId,
}: AdvancedFilterRecordFilterGroupOptionsDropdownProps) => {
  const { t } = useLingui();
  const dropdownId = `advanced-filter-record-filter-group-options-${recordFilterGroupId}`;

  const { removeRecordFilter } = useRemoveRecordFilter();
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();
  const { removeRootRecordFilterGroupIfEmpty } =
    useRemoveRootRecordFilterGroupIfEmpty();

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );

  const handleRemove = () => {
    const descendantRecordFilters =
      getAllRecordFilterDescendantsOfRecordFilterGroup({
        recordFilterGroupId,
        recordFilterGroups: currentRecordFilterGroups,
        recordFilters: currentRecordFilters,
      });

    for (const descendantRecordFilter of descendantRecordFilters) {
      removeRecordFilter({ recordFilterId: descendantRecordFilter.id });
    }

    const descendantRecordFilterGroups =
      getAllRecordFilterGroupDescendantsOfRecordFilterGroup({
        recordFilterGroupId,
        recordFilterGroups: currentRecordFilterGroups,
      });

    for (const descendantRecordFilterGroup of descendantRecordFilterGroups) {
      removeRecordFilterGroup(descendantRecordFilterGroup.id);
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
