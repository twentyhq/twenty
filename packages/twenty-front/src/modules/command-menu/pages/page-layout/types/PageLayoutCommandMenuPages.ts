import { type CommandMenuPages } from '@/command-menu/types/CommandMenuPages';

export type PageLayoutCommandMenuPages =
  | CommandMenuPages.PageLayoutWidgetTypeSelect
  | CommandMenuPages.PageLayoutGraphTypeSelect
  | CommandMenuPages.PageLayoutIframeConfig;
