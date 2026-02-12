import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayout as PageLayoutGenerated } from '~/generated-metadata/graphql';

export type PageLayout = Omit<PageLayoutGenerated, 'tabs'> & {
  tabs: PageLayoutTab[];
};
