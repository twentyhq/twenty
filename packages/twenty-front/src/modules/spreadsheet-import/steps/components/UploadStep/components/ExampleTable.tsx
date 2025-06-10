import { useMemo } from 'react';

import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
import { SpreadsheetImportFields } from '@/spreadsheet-import/types';
import { generateExampleRow } from '@/spreadsheet-import/utils/generateExampleRow';

import { generateColumns } from './columns';

interface ExampleTableProps<T extends string> {
  fields: SpreadsheetImportFields<T>;
}

export const ExampleTable = <T extends string>({
  fields,
}: ExampleTableProps<T>) => {
  const data = useMemo(() => generateExampleRow(fields), [fields]);
  const columns = useMemo(() => generateColumns(fields), [fields]);

  return (
    <SpreadsheetImportTable
      rows={data}
      columns={columns}
      className={'rdg-example'}
    />
  );
};
