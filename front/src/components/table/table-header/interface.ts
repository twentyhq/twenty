import { ReactNode } from 'react';

export type SortType<SortKey = string> = {
  label: string;
  key: SortKey;
  icon?: ReactNode;
};

export type FilterType<FilterKey = string> = {
  label: string;
  key: FilterKey;
  icon: ReactNode;
};

export type SelectedFilterType = {
  id: string;
  label: string;
  value: string;
  operand: { id: string; label: string };
  icon: ReactNode;
};

export type SelectedSortType<SortField = string> = SortType<SortField> & {
  order: 'asc' | 'desc';
};
