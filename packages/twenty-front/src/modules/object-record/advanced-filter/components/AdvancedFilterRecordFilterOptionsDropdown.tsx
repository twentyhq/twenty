import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { useRemoveRootRecordFilterGroupIfEmpty } from '@/object-record/record-filter-group/hooks/useRemoveRootRecordFilterGroupIfEmpty';

import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';

import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';

type AdvancedFilterRecordFilterOptionsDropdownProps = {
  recordFilterId: string;
};

export const AdvancedFilterRecordFilterOptionsDropdown = ({
  recordFilterId,
}: AdvancedFilterRecordFilterOptionsDropdownProps) => {
  const dropdownId = `advanced-filter-record-filter-options-${recordFilterId}`;

  const { removeRecordFilter } = useRemoveRecordFilter();
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: currentRecordFilter?.recordFilterGroupId,
    });

  const { removeRootRecordFilterGroupIfEmpty } =
    useRemoveRootRecordFilterGroupIfEmpty();

  const handleRemove = () => {
    const isOnlyViewFilterInGroup =
      childRecordFiltersAndRecordFilterGroups?.length === 1;

    if (
      isDefined(currentRecordFilter?.recordFilterGroupId) &&
      isOnlyViewFilterInGroup
    ) {
      removeRecordFilterGroup(currentRecordFilter.recordFilterGroupId);
    }

    removeRecordFilter({ recordFilterId: recordFilterId });

    removeRootRecordFilterGroupIfEmpty();
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger
        render={
          <IconButton
            aria-label={t`Record filter rule options`}
            variant="ghost"
          >
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
            {t`Remove rule`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
