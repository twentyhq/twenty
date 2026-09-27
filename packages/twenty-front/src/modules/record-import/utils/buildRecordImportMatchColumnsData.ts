import { type ImportedRow } from '@/spreadsheet-import/types';

// Column matching reads its data for two things: the first rows as examples
// and each column's distinct values for option matching. The server sends
// exactly that, so it is laid out as rows the matching step can read.
export const buildRecordImportMatchColumnsData = ({
  exampleRows,
  distinctValuesByColumn,
}: {
  exampleRows: string[][];
  distinctValuesByColumn: string[][];
}): ImportedRow[] => {
  const distinctRowCount = Math.max(
    0,
    ...distinctValuesByColumn.map((distinctValues) => distinctValues.length),
  );

  return [
    ...exampleRows,
    ...Array.from({ length: distinctRowCount }, (_, rowIndex) =>
      distinctValuesByColumn.map((distinctValues) => distinctValues[rowIndex]),
    ),
  ];
};
