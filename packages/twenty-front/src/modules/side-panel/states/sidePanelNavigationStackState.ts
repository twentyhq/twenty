import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type PurposeBuiltSidePanelPage } from '@/side-panel/types/SidePanelPage';
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

export type SidePanelNavigationStackItem =
  | (SidePanelNavigationStackItemBase & {
      page: SidePanelPages.RoutedPage;
      routedLocation: SidePanelRoutedLocation;
    })
  | (SidePanelNavigationStackItemBase & {
      page: PurposeBuiltSidePanelPage;
      routedLocation?: never;
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
