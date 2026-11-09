import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutFilter } from 'twenty-shared/types';
import { type PageLayout as PageLayoutGenerated } from '~/generated-metadata/graphql';

export type PageLayout = Omit<PageLayoutGenerated, 'tabs' | 'filters'> & {
  tabs: PageLayoutTab[];
  filters?: PageLayoutFilter[] | null;
};
