import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

export const SelectAutoScrollEffect = ({
  selectedOptionLabel,
  dropdownId,
}: {
  selectedOptionLabel: string;
  dropdownId: string;
}): null => {
  const { setSelectedItemId } = useSelectableList(dropdownId);
  setSelectedItemId(selectedOptionLabel);
  return null;
};
