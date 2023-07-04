import { TableFilterType } from './TableFilterType';

export type TableFilterDefinition = {
  field: string;
  label: string;
  icon: JSX.Element;
  type: TableFilterType;
  entitySelectComponent?: JSX.Element;
};
