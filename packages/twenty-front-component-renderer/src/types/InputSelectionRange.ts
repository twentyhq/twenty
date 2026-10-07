import { type InputSelectionDirection } from '@/types/InputSelectionDirection';

export type InputSelectionRange = {
  selectionStart: number;
  selectionEnd: number;
  selectionDirection: InputSelectionDirection;
};
