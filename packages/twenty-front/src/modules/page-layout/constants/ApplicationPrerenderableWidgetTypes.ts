import { WidgetType } from '~/generated-metadata/graphql';

// Workspace-installed application content is trusted, so it prerenders
// CSS-hidden with effects mounted: the front-component sandbox worker boots
// and iframes load while the tab is still hidden.
export const APPLICATION_PRERENDERABLE_WIDGET_TYPES: WidgetType[] = [
  WidgetType.FRONT_COMPONENT,
  WidgetType.IFRAME,
];
