import { useMemo } from 'react';

import { Table } from '../../../components/Table';
import type { Fields } from '../../../types';
import { generateExampleRow } from '../utils/generateExampleRow';

import { generateColumns } from './columns';

interface Props<T extends string> {
  fields: Fields<T>;
}

export const ExampleTable = <T extends string>({ fields }: Props<T>) => {
  const data = useMemo(() => generateExampleRow(fields), [fields]);
  const columns = useMemo(() => generateColumns(fields), [fields]);

  return <Table rows={data} columns={columns} className={'rdg-example'} />;
};
