import { SpreadsheetImportField } from '@/spreadsheet-import/types/SpreadsheetImportField';
import { ReadonlyDeep } from 'type-fest';

export type SpreadsheetImportFields<T extends string> = ReadonlyDeep<
  SpreadsheetImportField<T>[]
>;
