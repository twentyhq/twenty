import { type CommandMenuPages } from '@/command-menu/types/CommandMenuPages';

export type PageLayoutCommandMenuPage =
  | CommandMenuPages.PageLayoutWidgetTypeSelect
  | CommandMenuPages.PageLayoutGraphTypeSelect
  | CommandMenuPages.PageLayoutIframeSettings
  | CommandMenuPages.PageLayoutGraphFilter
  | CommandMenuPages.PageLayoutTabSettings;
