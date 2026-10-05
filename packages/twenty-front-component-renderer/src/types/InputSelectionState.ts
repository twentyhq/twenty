import { type InputSelectionDirection } from '@/types/InputSelectionDirection';

export type InputSelectionState = {
  selectionStart: number | null;
  selectionEnd: number | null;
  selectionDirection: InputSelectionDirection | null;
};
