import { FilterType } from './FilterType';

export type FilterDefinition = {
  field: string;
  label: string;
  icon: JSX.Element;
  type: FilterType;
  entitySelectComponent?: JSX.Element;
};
