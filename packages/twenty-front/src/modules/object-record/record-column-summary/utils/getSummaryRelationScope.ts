import { type ViewFieldRelationScope } from 'twenty-shared/types';

// A summary covers every record its filters keep, so it stores no sort and no limit
export const getSummaryRelationScope = ({
  filters,
  filterGroups,
}: Pick<
  ViewFieldRelationScope,
  'filters' | 'filterGroups'
>): ViewFieldRelationScope => ({
  filters,
  filterGroups,
  sorts: [],
});
