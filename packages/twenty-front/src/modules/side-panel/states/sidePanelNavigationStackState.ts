import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import type {
  SIDE_PANEL_ARTIFACT_PAGE,
  SidePanelRegularPage,
} from '@/side-panel/constants/SidePanelArtifactPage';
import { type IconComponent } from 'twenty-ui/icon';

type SidePanelNavigationStackItemBase = {
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId: string;
};

export type SidePanelNavigationStackItem =
  | (SidePanelNavigationStackItemBase & {
      page: typeof SIDE_PANEL_ARTIFACT_PAGE;
      artifactPath: string;
    })
  | (SidePanelNavigationStackItemBase & {
      page: SidePanelRegularPage;
      artifactPath?: never;
    });

type ToNavigationTarget<NavigationStackItem> =
  NavigationStackItem extends SidePanelNavigationStackItem
    ? Omit<NavigationStackItem, 'pageId'> & { pageId?: string }
    : never;

export type SidePanelNavigationTarget =
  ToNavigationTarget<SidePanelNavigationStackItem>;

export const sidePanelNavigationStackState = createAtomState<
  SidePanelNavigationStackItem[]
>({
  key: 'side-panel/sidePanelNavigationStackState',
  defaultValue: [],
});
