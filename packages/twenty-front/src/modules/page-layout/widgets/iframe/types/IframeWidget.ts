import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { type WidgetType } from '~/generated/graphql';

export type IframeWidget = PageLayoutWidgetWithData & {
  type: WidgetType.IFRAME;
  configuration: {
    url: string;
  };
};
