import {
  IconArrowDown,
  IconArrowUp,
  IconGripVertical,
  IconTrendingDown,
  IconTrendingUp,
} from 'twenty-ui/display';
import { GraphOrderBy } from '~/generated/graphql';

export const X_SORT_BY_OPTIONS = [
  {
    value: GraphOrderBy.FIELD_ASC,
    icon: IconArrowUp,
  },
  {
    value: GraphOrderBy.FIELD_DESC,
    icon: IconArrowDown,
  },
  {
    value: GraphOrderBy.VALUE_ASC,
    icon: IconTrendingUp,
  },
  {
    value: GraphOrderBy.VALUE_DESC,
    icon: IconTrendingDown,
  },
  {
    value: GraphOrderBy.MANUAL,
    icon: IconGripVertical,
  },
];
