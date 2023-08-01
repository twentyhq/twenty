import DataGrid, { DataGridProps } from 'react-data-grid';

import { useRsi } from '../hooks/useRsi';

interface Props<Data> extends DataGridProps<Data> {
  rowHeight?: number;
  hiddenHeader?: boolean;
}

export const Table = <Data,>({ className, ...props }: Props<Data>) => {
  const { rtl } = useRsi();
  return (
    <DataGrid
      className={'rdg-light ' + className || ''}
      direction={rtl ? 'rtl' : 'ltr'}
      {...props}
    />
  );
};
