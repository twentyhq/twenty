import { createContext, RefObject } from 'react';

type ScrollWrapperContextValue = {
  ref: RefObject<HTMLDivElement>;
  id: string;
};

export type ContextProviderName =
  | 'eventList'
  | 'commandMenu'
  | 'recordBoard'
  | 'recordTableWithWrappers'
  | 'settingsPageContainer'
  | 'dropdownMenuItemsContainer'
  | 'showPageContainer'
  | 'showPageLeftContainer'
  | 'tabList'
  | 'releases'
  | 'test'
  | 'showPageActivityContainer'
  | 'navigationDrawer'
  | 'aggregateFooterCell'
  | 'modalContent';

const createScrollWrapperContext = (id: string) =>
  createContext<ScrollWrapperContextValue>({
    ref: { current: null },
    id,
  });

export const EventListScrollWrapperContext =
  createScrollWrapperContext('eventList');
export const CommandMenuScrollWrapperContext =
  createScrollWrapperContext('commandMenu');
export const RecordBoardScrollWrapperContext =
  createScrollWrapperContext('recordBoard');
export const RecordTableWithWrappersScrollWrapperContext =
  createScrollWrapperContext('recordTableWithWrappers');
export const SettingsPageContainerScrollWrapperContext =
  createScrollWrapperContext('settingsPageContainer');
export const DropdownMenuItemsContainerScrollWrapperContext =
  createScrollWrapperContext('dropdownMenuItemsContainer');
export const ShowPageContainerScrollWrapperContext =
  createScrollWrapperContext('showPageContainer');
export const ShowPageLeftContainerScrollWrapperContext =
  createScrollWrapperContext('showPageLeftContainer');
export const TabListScrollWrapperContext =
  createScrollWrapperContext('tabList');
export const ReleasesScrollWrapperContext =
  createScrollWrapperContext('releases');
export const ShowPageActivityContainerScrollWrapperContext =
  createScrollWrapperContext('showPageActivityContainer');
export const NavigationDrawerScrollWrapperContext =
  createScrollWrapperContext('navigationDrawer');
export const TestScrollWrapperContext = createScrollWrapperContext('test');
export const AggregateFooterCellScrollWrapperContext =
  createScrollWrapperContext('aggregateFooterCell');
export const ModalContentScrollWrapperContext =
  createScrollWrapperContext('modalContent');

export const getContextByProviderName = (
  contextProviderName: ContextProviderName,
) => {
  switch (contextProviderName) {
    case 'eventList':
      return EventListScrollWrapperContext;
    case 'commandMenu':
      return CommandMenuScrollWrapperContext;
    case 'recordBoard':
      return RecordBoardScrollWrapperContext;
    case 'recordTableWithWrappers':
      return RecordTableWithWrappersScrollWrapperContext;
    case 'settingsPageContainer':
      return SettingsPageContainerScrollWrapperContext;
    case 'dropdownMenuItemsContainer':
      return DropdownMenuItemsContainerScrollWrapperContext;
    case 'showPageContainer':
      return ShowPageContainerScrollWrapperContext;
    case 'showPageLeftContainer':
      return ShowPageLeftContainerScrollWrapperContext;
    case 'tabList':
      return TabListScrollWrapperContext;
    case 'releases':
      return ReleasesScrollWrapperContext;
    case 'test':
      return TestScrollWrapperContext;
    case 'showPageActivityContainer':
      return ShowPageActivityContainerScrollWrapperContext;
    case 'navigationDrawer':
      return NavigationDrawerScrollWrapperContext;
    case 'aggregateFooterCell':
      return AggregateFooterCellScrollWrapperContext;
    case 'modalContent':
      return ModalContentScrollWrapperContext;
    default:
      throw new Error('Context Provider not available');
  }
};
