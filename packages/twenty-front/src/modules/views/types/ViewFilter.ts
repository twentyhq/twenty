import { ViewFilterOperand } from './ViewFilterOperand';

export type ViewFilter = {
  __typename: 'ViewFilter';
  id: string;
  variant?: 'default' | 'trash';
  fieldMetadataId: string;
  operand: ViewFilterOperand;
  value: string;
  displayValue: string;
  createdAt?: string;
  updatedAt?: string;
  viewId?: string;
};
