import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type ConditionalDisplay, type Nullable } from 'twenty-shared/types';
import { type PageLayoutTab as PageLayoutTabGenerated } from '~/generated-metadata/graphql';

export type PageLayoutTab = Omit<
  PageLayoutTabGenerated,
  'widgets' | 'conditionalDisplay'
> & {
  widgets: PageLayoutWidget[];
  conditionalDisplay?: Nullable<ConditionalDisplay>;
};
