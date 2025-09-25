import { type PageLayoutWidget, type WidgetType } from '~/generated/graphql';

export type IframeWidget = PageLayoutWidget & {
  type: WidgetType.IFRAME;
  configuration: {
    url: string;
  };
};
