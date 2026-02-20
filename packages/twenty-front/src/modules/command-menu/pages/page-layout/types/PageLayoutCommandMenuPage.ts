import { type CommandMenuPages } from 'twenty-shared/types';

export type PageLayoutCommandMenuPage =
  | CommandMenuPages.PageLayoutWidgetTypeSelect
  | CommandMenuPages.PageLayoutGraphTypeSelect
  | CommandMenuPages.PageLayoutIframeSettings
  | CommandMenuPages.PageLayoutGraphFilter
  | CommandMenuPages.PageLayoutTabSettings
  | CommandMenuPages.PageLayoutFieldsSettings
  | CommandMenuPages.PageLayoutFieldsLayout;
