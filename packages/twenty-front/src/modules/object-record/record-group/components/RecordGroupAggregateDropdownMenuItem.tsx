import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { Dropdown } from 'twenty-ui/components/navigation';
import { type IconComponent } from 'twenty-ui/icon';

type RecordGroupAggregateDropdownMenuItemProps = {
  onClick: () => void;
  text: string;
  page?: string;
  RightIcon?: IconComponent | null;
};

export const RecordGroupAggregateDropdownMenuItem = ({
  onClick,
  text,
  page,
  RightIcon,
}: RecordGroupAggregateDropdownMenuItemProps) => {
  return (
    <Dropdown.ActionItem
      onClick={onClick}
      page={page}
      endIcon={<SelectOptionIcon Icon={RightIcon} />}
    >
      {text}
    </Dropdown.ActionItem>
  );
};
