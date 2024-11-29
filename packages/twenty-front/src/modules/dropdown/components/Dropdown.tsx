import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { Dropdown as DropdownUi } from '@/ui/layout/dropdown/components/Dropdown';

const DROPDOWN_WIDTH = '200px';
const DROPDOWN_OFFSET_Y = 8;

type DropdownProps<T> = {
  dropdownId: string;
  clickableComponent: React.ReactNode;
  dropdownComponents: React.ReactNode;
  initialContentId?: T;
  onContentChange?: (contentId: T) => void;
  onResetContent?: () => void;
};

export const Dropdown = <T,>({
  dropdownId,
  clickableComponent,
  dropdownComponents,
}: DropdownProps<T>) => {
  return (
    <DropdownUi
      dropdownId={dropdownId}
      clickableComponent={clickableComponent}
      dropdownMenuWidth={DROPDOWN_WIDTH}
      dropdownHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
      dropdownOffset={{ y: DROPDOWN_OFFSET_Y }}
      dropdownComponents={dropdownComponents}
    />
  );
};
