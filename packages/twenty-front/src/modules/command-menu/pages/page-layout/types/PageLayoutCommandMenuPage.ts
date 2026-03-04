import { type SidePanelPages } from 'twenty-shared/types';

export type PageLayoutCommandMenuPage =
  | SidePanelPages.PageLayoutWidgetTypeSelect
  | SidePanelPages.PageLayoutGraphTypeSelect
  | SidePanelPages.PageLayoutIframeSettings
  | SidePanelPages.PageLayoutGraphFilter
  | SidePanelPages.PageLayoutTabSettings
  | SidePanelPages.PageLayoutFieldsSettings
  | SidePanelPages.PageLayoutFieldsLayout;
