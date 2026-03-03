// Typed variable paths for expr-eval conditional availability expressions.
// These produce plain strings that map to the evaluation context properties.
export const ConditionalAvailabilityVariables = {
  isShowPage: 'isShowPage',
  isInRightDrawer: 'isInRightDrawer',
  isFavorite: 'isFavorite',
  isRemote: 'isRemote',
  isNoteOrTask: 'isNoteOrTask',
  isSelectAll: 'isSelectAll',
  hasAnySoftDeleteFilterOnView: 'hasAnySoftDeleteFilterOnView',
  numberOfSelectedRecords: 'numberOfSelectedRecords',

  objectPermissions: {
    canReadObjectRecords: 'objectPermissions.canReadObjectRecords',
    canUpdateObjectRecords: 'objectPermissions.canUpdateObjectRecords',
    canSoftDeleteObjectRecords: 'objectPermissions.canSoftDeleteObjectRecords',
    canDestroyObjectRecords: 'objectPermissions.canDestroyObjectRecords',
  },

  selectedRecord: {
    deletedAt: 'selectedRecord.deletedAt',
    isRemote: 'selectedRecord.isRemote',
  },

  featureFlags: {
    isAiEnabled: 'featureFlags.IS_AI_ENABLED',
    isApplicationEnabled: 'featureFlags.IS_APPLICATION_ENABLED',
    isMarketplaceEnabled: 'featureFlags.IS_MARKETPLACE_ENABLED',
    isCommandMenuItemEnabled: 'featureFlags.IS_COMMAND_MENU_ITEM_ENABLED',
  },

  targetObjectReadPermissions: (objectNameSingular: string) =>
    `targetObjectReadPermissions.${objectNameSingular}`,
  targetObjectWritePermissions: (objectNameSingular: string) =>
    `targetObjectWritePermissions.${objectNameSingular}`,
} as const;
