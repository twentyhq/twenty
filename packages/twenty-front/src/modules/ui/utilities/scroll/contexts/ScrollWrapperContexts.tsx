import { createContext, RefObject } from 'react';

// Define the new interface for the context value
interface ScrollWrapperContextValue {
  ref: RefObject<HTMLDivElement>;
  id: string;
}

// Helper function to create a context with a unique ID
const createScrollWrapperContext = (id: string) =>
  createContext<ScrollWrapperContextValue>({
    ref: { current: null },
    id,
  });

// Define all context providers
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

// Function to get the context based on provider name
export const getContextByProviderName = (contextProviderName: string) => {
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
    default:
      return createScrollWrapperContext('awdawdawd');
  }
};
