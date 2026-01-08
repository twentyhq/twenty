import {
  IconHandMove,
  IconSortAscending,
  IconSortDescending,
} from 'twenty-ui/display';
import { GraphOrderBy } from '~/generated/graphql';

export const AGGREGATE_SORT_BY_OPTIONS = [
  {
    value: GraphOrderBy.FIELD_POSITION_ASC,
    icon: IconSortAscending,
  },
  {
    value: GraphOrderBy.FIELD_POSITION_DESC,
    icon: IconSortDescending,
  },
  {
    value: GraphOrderBy.FIELD_ASC,
    icon: null,
  },
  {
    value: GraphOrderBy.FIELD_DESC,
    icon: null,
  },
  {
    value: GraphOrderBy.MANUAL,
    icon: IconHandMove,
  },
];
