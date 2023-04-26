import { IconProp } from '@fortawesome/fontawesome-svg-core';

export type SortType<SortIds = string> = {
  label: string;
  id: SortIds;
  icon?: IconProp;
};

export type FilterType<KeyOfFilter = string> = {
  label: string;
  key: KeyOfFilter;
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
