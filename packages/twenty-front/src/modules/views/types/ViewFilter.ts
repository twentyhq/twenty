import { type ViewFilterOperand } from 'twenty-shared/types';

export type ViewFilter = {
  id: string;
  fieldMetadataId: string;
  operand: ViewFilterOperand;
  value: string;
  displayValue?: string;
  createdAt?: string;
  updatedAt?: string;
  viewId?: string;
  viewFilterGroupId?: string | null;
  positionInViewFilterGroup?: number | null;
  subFieldName?: string | null;
};
