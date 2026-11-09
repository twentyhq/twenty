import {
  type DashboardFilterValue,
  type FirstDayOfTheWeek,
  type PageLayoutFilter,
  type PageLayoutFilterValue,
} from 'twenty-shared/types';

export type DashboardFilters = {
  pageLayoutFilters: PageLayoutFilter[];
  urlValueByPageLayoutFilterId: Record<string, PageLayoutFilterValue>;
  values: DashboardFilterValue[];
  timeZone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};
