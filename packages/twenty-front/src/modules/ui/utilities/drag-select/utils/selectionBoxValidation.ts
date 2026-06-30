import { type SelectionBox } from '@/ui/utilities/drag-select/types/SelectionBox';

const calculateBoxArea = (box: SelectionBox): number => {
  return box.width * box.height;
};

export const isValidSelectionStart = (box: SelectionBox): boolean => {
  return calculateBoxArea(box) > 10;
};
