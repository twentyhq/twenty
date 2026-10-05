import { type InputSelectionDirection } from '@/types/InputSelectionDirection';

export type InputSelectionRequest =
  | { method: 'select' }
  | {
      method: 'setSelectionRange';
      start: number;
      end: number;
      direction: InputSelectionDirection;
    }
  | { property: 'selectionStart' | 'selectionEnd'; value: number }
  | { property: 'selectionDirection'; value: InputSelectionDirection };
