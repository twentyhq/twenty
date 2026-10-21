import { type InputSelectionState } from '@/types/InputSelectionState';

export type InputSelectionSnapshot = InputSelectionState & {
  selectionCommandSequence?: number;
};
