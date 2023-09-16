import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { FilterDropdownId } from '../constants/FilterDropdownId';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';

type MultipleFiltersDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const MultipleFiltersDropdownButton = ({
  hotkeyScope,
}: MultipleFiltersDropdownButtonProps) => {
  const { resetState } = useDropdownButton({
    dropdownId: FilterDropdownId,
  });

  return (
    <DropdownButton
      dropdownId={FilterDropdownId}
      buttonComponents={<MultipleFiltersButton />}
      dropdownComponents={<MultipleFiltersDropdownContent />}
      dropdownHotkeyScope={hotkeyScope}
      onClose={resetState}
    />
  );
};
