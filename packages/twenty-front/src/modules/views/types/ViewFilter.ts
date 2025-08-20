import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type ViewFilterOperand } from 'twenty-shared/types';

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
  viewFilterGroupId?: string;
  positionInViewFilterGroup?: number | null;
  subFieldName?: CompositeFieldSubFieldName | null;
};
