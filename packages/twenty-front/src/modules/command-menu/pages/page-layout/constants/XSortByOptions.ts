import {
  type IconComponent,
  IconHandMove,
  IconSortAscending,
  IconSortDescending,
  IconTrendingDown,
  IconTrendingUp,
} from 'twenty-ui/display';
import { GraphOrderBy } from '~/generated/graphql';

type XSortByOption = {
  value: GraphOrderBy;
  icon: IconComponent | null;
};

export const X_SORT_BY_OPTIONS: XSortByOption[] = [
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
    value: GraphOrderBy.VALUE_ASC,
    icon: IconTrendingUp,
  },
  {
    value: GraphOrderBy.VALUE_DESC,
    icon: IconTrendingDown,
  },
  {
    value: GraphOrderBy.MANUAL,
    icon: IconHandMove,
  },
];
