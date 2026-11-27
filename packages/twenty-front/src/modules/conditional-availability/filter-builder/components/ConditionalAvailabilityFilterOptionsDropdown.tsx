import { useUpdateConditionalAvailabilityFilterSettings } from '@/conditional-availability/filter-builder/hooks/useUpdateConditionalAvailabilityFilterSettings';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { removeConditionalAvailabilityFilterOrGroup } from '@/conditional-availability/filter-builder/utils/removeConditionalAvailabilityFilterOrGroup';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';

type ConditionalAvailabilityFilterOptionsDropdownProps = {
  filterOrGroup:
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup;
};

export const ConditionalAvailabilityFilterOptionsDropdown = ({
  filterOrGroup,
}: ConditionalAvailabilityFilterOptionsDropdownProps) => {
  const { t } = useLingui();
  const { updateConditionalAvailabilityFilterSettings } =
    useUpdateConditionalAvailabilityFilterSettings();

  const isFilterGroup = filterOrGroup.type === 'filterGroup';

  const handleRemove = () => {
    updateConditionalAvailabilityFilterSettings(
      (currentConditionalAvailabilityFilterGroup) =>
        removeConditionalAvailabilityFilterOrGroup({
          filterGroup: currentConditionalAvailabilityFilterGroup,
          filterOrGroupId: filterOrGroup.id,
        }),
    );
  };

  return (
    <DropdownRoot
      dropdownId={`conditional-availability-filter-options-${filterOrGroup.id}`}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          <IconButton
            aria-label={isFilterGroup ? t`Rule group options` : t`Rule options`}
            variant="ghost"
          >
            <IconDotsVertical />
          </IconButton>
        }
      />
      <DropdownContent
        align="end"
        sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
      >
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconTrash />}
            onClick={handleRemove}
            color="danger"
          >
            {isFilterGroup ? t`Delete group` : t`Delete`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
