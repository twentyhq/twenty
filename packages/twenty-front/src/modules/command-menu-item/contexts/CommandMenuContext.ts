import { type CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { createContext } from 'react';
import {
  CommandMenuContextApiPageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export type CommandMenuContextType = {
  displayType: 'button' | 'listItem' | 'dropdownItem';
  containerType: CommandMenuItemContainerType;
  commandMenuItems: CommandMenuItemFieldsFragment[];
  commandMenuContextApi: CommandMenuContextApi;
};

const EMPTY_COMMAND_MENU_CONTEXT_API: CommandMenuContextApi = {
  pageType: CommandMenuContextApiPageType.INDEX_PAGE,
  isInSidePanel: false,
  isPageInEditMode: false,
  favoriteRecordIds: [],
  isSelectAll: false,
  hasAnySoftDeleteFilterOnView: false,
  numberOfSelectedRecords: 0,
  objectPermissions: {
    canReadObjectRecords: false,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    objectMetadataId: '',
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
  selectedRecords: [],
  featureFlags: {},
  targetObjectReadPermissions: {},
  targetObjectWritePermissions: {},
  objectMetadataItem: {},
  objectMetadataLabel: '',
};

export const CommandMenuContext = createContext<CommandMenuContextType>({
  containerType: 'command-menu-list',
  displayType: 'button',
  commandMenuItems: [],
  commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
});
