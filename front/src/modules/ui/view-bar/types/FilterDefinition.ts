import { FilterType } from './FilterType';

export type FilterDefinition = {
  key: string;
  label: string;
  icon: JSX.Element;
  type: FilterType;
  entitySelectComponent?: JSX.Element;
};
