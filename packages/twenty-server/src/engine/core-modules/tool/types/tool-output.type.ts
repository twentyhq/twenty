import { type ModelInputFile } from 'src/engine/core-modules/tool/types/model-input-file.type';
import { type RecordReference } from 'src/engine/core-modules/tool/types/record-reference.type';

export type ToolOutput<T = object> = {
  success: boolean;
  message: string;
  error?: string;
  result?: T;
  warnings?: string[];
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  recordReferences?: RecordReference[];
  modelInputFile?: ModelInputFile;
};
