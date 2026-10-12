import { type InputSelectionDirection } from '@/types/InputSelectionDirection';
import { isInputSelectionDirection } from '@/utils/isInputSelectionDirection';

export const normalizeInputSelectionDirection = (
  direction: unknown,
): InputSelectionDirection =>
  isInputSelectionDirection(direction) ? direction : 'none';
