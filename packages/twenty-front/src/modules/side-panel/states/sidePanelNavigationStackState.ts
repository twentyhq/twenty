import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { type PageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelTarget';
import { type NonPageLayoutPurposeBuiltSidePanelPage } from '@/side-panel/types/SidePanelPage';
import { type Location } from 'react-router-dom';
import type { SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';

type SidePanelNavigationStackItemBase = {
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId: string;
  // Unlike pageId, this stays stable across routed stack entries in one flow.
  routedFlowStateScopeId?: string;
};

export type SidePanelRoutedLocation = Pick<
  Location,
  'pathname' | 'search' | 'hash' | 'state' | 'key'
>;

export type PageLayoutSidePanelNavigationStackItem =
  SidePanelNavigationStackItemBase & {
    page: PageLayoutSidePanelPage;
    // The page behind the panel can change while this page is still mounted
    // (closing animation, history), so the edited layout is captured on open
    pageLayoutSidePanelTarget: PageLayoutSidePanelTarget;
    routedLocation?: never;
  };

export type SidePanelNavigationStackItem =
  | (SidePanelNavigationStackItemBase & {
      page: SidePanelPages.RoutedPage;
      routedLocation: SidePanelRoutedLocation;
      pageLayoutSidePanelTarget?: never;
    })
  | PageLayoutSidePanelNavigationStackItem
  | (SidePanelNavigationStackItemBase & {
      page: NonPageLayoutPurposeBuiltSidePanelPage;
      routedLocation?: never;
      pageLayoutSidePanelTarget?: never;
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
