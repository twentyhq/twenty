import {
  type FirstDayOfTheWeek,
  type PageLayoutFilterValue,
} from 'twenty-shared/types';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

export type DashboardFilters = {
  pageLayoutFilters: Pick<PageLayoutFilter, 'id' | 'label' | 'position'>[];
  urlValueByPageLayoutFilterId: Record<string, PageLayoutFilterValue>;
  valueByPageLayoutFilterId: Record<string, PageLayoutFilterValue>;
  timeZone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};
