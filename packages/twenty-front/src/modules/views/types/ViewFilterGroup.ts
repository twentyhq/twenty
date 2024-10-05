import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';

export type ViewFilterGroup = {
  __typename: 'ViewFilterGroup';
  id: string;
  viewId: string;
  parentViewFilterGroupId: string;
  logicalOperator: ViewFilterGroupLogicalOperator;
};
