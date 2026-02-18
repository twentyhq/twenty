import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutTab as PageLayoutTabGenerated } from '~/generated-metadata/graphql';

export type PageLayoutTab = Omit<PageLayoutTabGenerated, 'widgets'> & {
  widgets: PageLayoutWidget[];
};
