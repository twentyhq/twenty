import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getSpreadsheetImportValidationMessageText } from '@/object-record/spreadsheet-import/utils/getSpreadsheetImportValidationMessageText';
import { type SpreadsheetImportTableHook } from '@/spreadsheet-import/types';
import { getSpreadsheetImportUnicityTableHook } from 'twenty-shared/utils';

export const spreadsheetImportGetUnicityTableHook = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): SpreadsheetImportTableHook => {
  const unicityTableHook =
    getSpreadsheetImportUnicityTableHook(objectMetadataItem);

  return (table, addError) =>
    unicityTableHook(table, (rowIndex, fieldKey, { level, message }) =>
      addError(rowIndex, fieldKey, {
        level,
        message: getSpreadsheetImportValidationMessageText(message),
      }),
    );
};
