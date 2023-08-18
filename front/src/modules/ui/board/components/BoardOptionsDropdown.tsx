import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';

import { BoardOptionsDropdownButton } from './BoardOptionsDropdownButton';
import { BoardOptionsDropdownContent } from './BoardOptionsDropdownContent';

export function BoardOptionsDropdown() {
  return (
    <DropdownButton
      buttonComponents={<BoardOptionsDropdownButton />}
      dropdownComponents={<BoardOptionsDropdownContent />}
    ></DropdownButton>
  );
}
