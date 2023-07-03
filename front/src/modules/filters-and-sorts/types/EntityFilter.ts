import { EntityFilterType } from './EntityFilterType';

export type EntityFilter = {
  field: string;
  label: string;
  icon: JSX.Element;
  type: EntityFilterType;
  searchSelectComponent?: JSX.Element;
};
