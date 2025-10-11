import { IconArrowDown, IconArrowUp } from 'twenty-ui/display';
import { GraphOrderBy } from '~/generated/graphql';

export const AGGREGATE_SORT_BY_OPTIONS = [
  {
    value: GraphOrderBy.FIELD_ASC,
    icon: IconArrowUp,
  },
  {
    value: GraphOrderBy.FIELD_DESC,
    icon: IconArrowDown,
  },
];
