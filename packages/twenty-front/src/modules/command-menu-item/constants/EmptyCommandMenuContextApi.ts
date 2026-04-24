import {
  ContextStorePageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';

export const EMPTY_COMMAND_MENU_CONTEXT_API: CommandMenuContextApi = {
  pageType: ContextStorePageType.Index,
  isInSidePanel: false,
  isDashboardPageLayoutInEditMode: false,
  isLayoutCustomizationModeEnabled: false,
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
  permissionFlags: {},
  targetObjectReadPermissions: {},
  targetObjectWritePermissions: {},
  objectMetadataItem: {},
  objectMetadataLabel: '',
};
