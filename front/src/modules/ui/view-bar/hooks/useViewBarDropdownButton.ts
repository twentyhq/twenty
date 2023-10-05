import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';

export const useViewBarDropdownButton = ({
  dropdownId,
}: {
  dropdownId: string;
}) => {
  return useDropdown({ dropdownId });
};
