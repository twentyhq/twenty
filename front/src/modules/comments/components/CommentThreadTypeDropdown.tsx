import {
  DropdownButton,
  DropdownOptionType,
} from '@/ui/components/buttons/DropdownButton';
import { IconNotes, IconPhone } from '@/ui/icons/index';

export function CommentThreadTypeDropdown() {
  const options: DropdownOptionType[] = [
    { label: 'Notes', icon: <IconNotes /> },
    // { label: 'Call', icon: <IconPhone /> },
  ];

  const handleSelect = (selectedOption: DropdownOptionType) => {
    console.log(`You selected: ${selectedOption.label}`);
  };

  return <DropdownButton options={options} onSelection={handleSelect} />;
}
