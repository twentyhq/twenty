import { type SidePanelPages } from 'twenty-shared/types';

export const SIDE_PANEL_ARTIFACT_PAGE = 'artifact' as const;

export type SidePanelRegularPage = Exclude<
  SidePanelPages,
  SidePanelPages.ViewRecord | SidePanelPages.ViewRecords
>;

export type SidePanelPage =
  | SidePanelRegularPage
  | typeof SIDE_PANEL_ARTIFACT_PAGE;
