import * as XLSX from 'xlsx-ugnis';

export const mapWorkbook = (workbook: XLSX.WorkBook, sheetName?: string) => {
  const worksheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
    raw: false,
  });
  return data as string[][];
};
