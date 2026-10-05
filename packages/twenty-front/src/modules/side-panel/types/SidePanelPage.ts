import { type SidePanelPages } from 'twenty-shared/types';

type LegacySidePanelPage =
  | SidePanelPages.ViewRecord
  | SidePanelPages.ViewRecords
  | SidePanelPages.Copilot;

export type PurposeBuiltSidePanelPage = Exclude<
  SidePanelPages,
  LegacySidePanelPage | SidePanelPages.RoutedPage
>;

export type ActiveSidePanelPage =
  | PurposeBuiltSidePanelPage
  | SidePanelPages.RoutedPage;
