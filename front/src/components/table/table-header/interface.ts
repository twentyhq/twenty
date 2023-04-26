import { IconProp } from '@fortawesome/fontawesome-svg-core';

export type SortType<SortKey = string> = {
  label: string;
  key: SortKey;
  icon?: IconProp;
};

export type FilterType<FilterKey = string> = {
  label: string;
  key: FilterKey;
  icon: IconProp;
};

export type SelectedFilterType = {
  id: string;
  label: string;
  value: string;
  operand: { id: string; label: string };
  icon: IconProp;
};

export type SelectedSortType<SortField = string> = SortType<SortField> & {
  order: 'asc' | 'desc';
};
