import { EntityFilterType } from './EntityFilterType';

export type EntityFilterWithField<T> = {
  field: keyof T;
  label: string;
  icon: JSX.Element;
  type: EntityFilterType;
  searchSelectComponent?: JSX.Element;
};
