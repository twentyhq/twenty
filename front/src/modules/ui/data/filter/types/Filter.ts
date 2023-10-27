import { ViewFilterOperand } from '~/generated/graphql';

import { FilterType } from './FilterType';

export type Filter = {
  key: string;
  type: FilterType;
  value: string;
  displayValue: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
};
