import { type PageLayoutTabWithData } from '@/page-layout/types/pageLayoutTypes';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { type PageLayout } from '~/generated/graphql';

export type PageLayoutTabWithValidatedWidgets = Omit<
  PageLayoutTabWithData,
  'widgets'
> & {
  widgets: Widget[];
};

export type PageLayoutWithValidatedWidgets = Omit<PageLayout, 'tabs'> & {
  tabs: PageLayoutTabWithValidatedWidgets[];
};
