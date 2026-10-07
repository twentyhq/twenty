import { type InputSelectionSnapshot } from '@/types/InputSelectionSnapshot';

export type InputSelectionUpdateListener = (
  snapshot: InputSelectionSnapshot,
) => void;
