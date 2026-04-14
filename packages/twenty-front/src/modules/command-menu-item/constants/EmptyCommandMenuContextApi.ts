import {
  CommandMenuContextApiPageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';

export const EMPTY_COMMAND_MENU_CONTEXT_API: CommandMenuContextApi = {
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
