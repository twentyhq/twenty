import { CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET } from '@/ui/layout/condition-builder/constants/ConditionBuilderDropdownSideOffset';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';

type ConditionBuilderRowMenuProps = {
  dropdownId: string;
  ariaLabel: string;
  deleteLabel: string;
  align: 'start' | 'end';
  onDelete: () => void;
};

export const ConditionBuilderRowMenu = ({
  dropdownId,
  ariaLabel,
  deleteLabel,
  align,
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
      align={align}
      sideOffset={CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET}
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
