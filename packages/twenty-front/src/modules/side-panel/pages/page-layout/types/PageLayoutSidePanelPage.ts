import { type SidePanelPages } from 'twenty-shared/types';

export type PageLayoutSidePanelPage =
  | SidePanelPages.PageLayoutWidgetTypeSelect
  | SidePanelPages.PageLayoutGraphTypeSelect
  | SidePanelPages.PageLayoutIframeSettings
  | SidePanelPages.PageLayoutGraphFilter
  | SidePanelPages.PageLayoutTabSettings
  | SidePanelPages.PageLayoutFieldsSettings
  | SidePanelPages.PageLayoutFieldsLayout;
