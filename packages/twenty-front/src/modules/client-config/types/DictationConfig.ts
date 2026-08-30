import { type DictationMode } from 'twenty-shared/ai';

export type DictationConfig = {
  mode: DictationMode;
  maxDurationSeconds: number;
};
