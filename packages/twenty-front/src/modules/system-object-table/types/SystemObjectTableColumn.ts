import { type ReactNode } from 'react';

export type SystemObjectTableSortValue =
  | string
  | number
  | Date
  | boolean
  | null
  | undefined;

export type SystemObjectTableColumnAlign = 'left' | 'right';

export type SystemObjectTableColumn<TItem> = {
  key: string;
  label: string;
  width?: number;
  align?: SystemObjectTableColumnAlign;
  getSortValue?: (item: TItem) => SystemObjectTableSortValue;
  render: (item: TItem) => ReactNode;
};
