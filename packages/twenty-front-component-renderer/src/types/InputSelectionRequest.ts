import { type InputSelectionState } from '@/types/InputSelectionState';

export type InputSelectionRequest =
  | { method: 'select' }
  | {
      method: 'setSelectionRange';
      start: number;
      end: number;
      direction?: string;
    }
  | { property: keyof InputSelectionState; value: number | string | null };
