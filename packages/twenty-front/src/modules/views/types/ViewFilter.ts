import { ViewFilterValueType } from '@/views/types/ViewFilterValueType';
import { ViewFilterOperand } from './ViewFilterOperand';

export type ViewFilter = {
  __typename: 'ViewFilter';
  id: string;
  variant?: 'default' | 'danger';
  fieldMetadataId: string;
  operand: ViewFilterOperand;
  value: string;
  displayValue: string;
  createdAt?: string;
  updatedAt?: string;
  viewId?: string;
  valueType?: ViewFilterValueType;
};
