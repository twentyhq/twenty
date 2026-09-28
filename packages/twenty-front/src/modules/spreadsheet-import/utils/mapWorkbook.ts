import { cleanZWJFromImportedValue } from '@/spreadsheet-import/utils/cleanZWJFromImportedValue';
import { utils, type WorkBook } from 'xlsx-ugnis';
import { isDefined } from 'twenty-shared/utils';

export const mapWorkbook = (workbook: WorkBook, sheetName?: string) => {
  const resolvedSheetName = sheetName || workbook.SheetNames[0];
  const worksheet = isDefined(resolvedSheetName)
    ? workbook.Sheets[resolvedSheetName]
    : undefined;

  if (!isDefined(worksheet)) {
    return [];
  }

  const data = utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
    raw: false,
  });

  // Clean ZWJ characters from imported CSV data to restore original values
  // This reverses the ZWJ protection applied during export
  const cleanedData = (data as string[][]).map((row) =>
    row.map((cell) =>
      typeof cell === 'string' ? cleanZWJFromImportedValue(cell) : cell,
    ),
  );

  return cleanedData;
};
