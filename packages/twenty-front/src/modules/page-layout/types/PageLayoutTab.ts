import { type Widget } from '@/page-layout/widgets/types/Widget';
import { type PageLayoutTab as PageLayoutTabGenerated } from '~/generated/graphql';

export type PageLayoutTab = Omit<PageLayoutTabGenerated, 'widgets'> & {
  widgets: Widget[];
};
