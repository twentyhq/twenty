import { type InputSelectionDirection } from '@/types/InputSelectionDirection';

const INPUT_SELECTION_DIRECTIONS = new Set<unknown>([
  'forward',
  'backward',
  'none',
]);

export const isInputSelectionDirection = (
  value: unknown,
): value is InputSelectionDirection => INPUT_SELECTION_DIRECTIONS.has(value);
