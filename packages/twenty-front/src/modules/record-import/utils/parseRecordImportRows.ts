import { type ImportedStructuredRowMetadata } from '@/spreadsheet-import/steps/components/ValidationStep/types';
import { type ImportedStructuredRow } from '@/spreadsheet-import/types';
import { z } from 'zod';

const recordImportRowsSchema = z.array(
  z.object({
    rowNumber: z.number(),
    values: z.record(z.string(), z.union([z.string(), z.boolean()]).optional()),
    errors: z.record(
      z.string(),
      z.object({
        level: z.enum(['info', 'warning', 'error']),
        message: z.string(),
      }),
    ),
  }),
);

// The grid keys rows by their original row number, stable across pages and
// filters, and the edits sent back identify rows by it
export const parseRecordImportRows = (
  rows: unknown,
): (ImportedStructuredRow & ImportedStructuredRowMetadata)[] =>
  recordImportRowsSchema.parse(rows ?? []).map(
    ({ rowNumber, values, errors }) =>
      ({
        ...values,
        __index: String(rowNumber),
        __errors: Object.keys(errors).length > 0 ? errors : null,
      }) as ImportedStructuredRow & ImportedStructuredRowMetadata,
  );
