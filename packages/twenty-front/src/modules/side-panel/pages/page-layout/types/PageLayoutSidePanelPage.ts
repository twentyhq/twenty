import { type SidePanelPages } from 'twenty-shared/types';

export type PageLayoutSidePanelPage =
  | SidePanelPages.PageLayoutWidgetTypeSelect
  | SidePanelPages.PageLayoutGraphTypeSelect
  | SidePanelPages.PageLayoutIframeSettings
  | SidePanelPages.PageLayoutTabSettings
  | SidePanelPages.PageLayoutFieldsSettings
  | SidePanelPages.PageLayoutFieldSettings
  | SidePanelPages.PageLayoutRecordTableSettings;
