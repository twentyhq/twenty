import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { type SidePanelPages } from 'twenty-shared/types';

type LegacySidePanelPage =
  | SidePanelPages.ViewRecord
  | SidePanelPages.ViewRecords
  | SidePanelPages.Copilot;

export type PurposeBuiltSidePanelPage = Exclude<
  SidePanelPages,
  LegacySidePanelPage | SidePanelPages.RoutedPage
>;

// Page layout pages can only be opened along with the layout they edit
export type NonPageLayoutPurposeBuiltSidePanelPage = Exclude<
  PurposeBuiltSidePanelPage,
  PageLayoutSidePanelPage
>;

export type ActiveSidePanelPage =
  | PurposeBuiltSidePanelPage
  | SidePanelPages.RoutedPage;
