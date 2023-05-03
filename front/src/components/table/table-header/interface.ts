import { IconType } from 'react-icons/lib';

export type SortType<SortKey = string> = {
  label: string;
  key: SortKey;
  icon?: IconType;
};

export type FilterType<FilterKey = string> = {
  label: string;
  key: FilterKey;
  icon: IconType;
};

export type SelectedFilterType = {
  id: string;
  label: string;
  value: string;
  operand: { id: string; label: string };
  icon: IconType;
};

export type SelectedSortType<SortField = string> = SortType<SortField> & {
  order: 'asc' | 'desc';
};
