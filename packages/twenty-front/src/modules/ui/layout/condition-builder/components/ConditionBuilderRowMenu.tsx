import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';

type ConditionBuilderRowMenuProps = {
  dropdownId: string;
  ariaLabel: string;
  deleteLabel: string;
  onDelete: () => void;
};

export const ConditionBuilderRowMenu = ({
  dropdownId,
  ariaLabel,
  deleteLabel,
  onDelete,
}: ConditionBuilderRowMenuProps) => (
  <DropdownRoot dropdownId={dropdownId} type="menu">
    <Dropdown.Trigger
      render={
        <IconButton aria-label={ariaLabel} variant="ghost">
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
          onClick={onDelete}
          color="danger"
        >
          {deleteLabel}
        </Dropdown.ActionItem>
      </Dropdown.Section>
    </DropdownContent>
  </DropdownRoot>
);
