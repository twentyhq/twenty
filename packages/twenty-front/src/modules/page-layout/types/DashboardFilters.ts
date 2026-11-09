import {
  type DashboardFilterValue,
  type FirstDayOfTheWeek,
  type PageLayoutFilterValue,
} from 'twenty-shared/types';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

export type DashboardFilters = {
  pageLayoutFilters: (Pick<PageLayoutFilter, 'id' | 'label' | 'type'> & {
    defaultValue?: PageLayoutFilterValue | null;
  })[];
  urlValueByPageLayoutFilterId: Record<string, PageLayoutFilterValue>;
  values: DashboardFilterValue[];
  timeZone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};
