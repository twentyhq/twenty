import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

export const STANDARD_COMMAND_MENU_ITEM_CONDITIONAL_EXPRESSIONS: Partial<
  Record<
    string,
    {
      conditionalAvailabilityExpression?: string;
      conditionalPinnedExpression?: string;
    }
  >
> = {
  [STANDARD_COMMAND_MENU_ITEMS.navigateToNextRecord.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "RECORD_PAGE" and not isInSidePanel and objectMetadataItem.nameSingular != "messageCampaign" and objectMetadataItem.nameSingular != "agentChatThread"',
  },
  [STANDARD_COMMAND_MENU_ITEMS.navigateToPreviousRecord.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "RECORD_PAGE" and not isInSidePanel and objectMetadataItem.nameSingular != "messageCampaign" and objectMetadataItem.nameSingular != "agentChatThread"',
  },
  [STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "INDEX_PAGE" and objectPermissions.canUpdateObjectRecords and not hasAnySoftDeleteFilterOnView and objectMetadataItem.isUICreatable and objectMetadataItem.isUIEditable and not objectMetadataItem.isRemote',
    conditionalPinnedExpression: 'numberOfSelectedRecords == 0',
  },
  [STANDARD_COMMAND_MENU_ITEMS.deleteRecords.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and not hasAnySoftDeleteFilterOnView and objectPermissions.canSoftDeleteObjectRecords and (isSelectAll or noneDefined(selectedRecords, "deletedAt")) and (isSelectAll or noneEquals(selectedRecords, "recordPermissions.canSoftDelete", false))',
  },
  [STANDARD_COMMAND_MENU_ITEMS.restoreRecords.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and (isSelectAll or everyDefined(selectedRecords, "deletedAt")) and objectPermissions.canSoftDeleteObjectRecords and (pageType == "RECORD_PAGE" or hasAnySoftDeleteFilterOnView) and (isSelectAll or noneEquals(selectedRecords, "recordPermissions.canSoftDelete", false))',
  },
  [STANDARD_COMMAND_MENU_ITEMS.destroyRecords.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and objectPermissions.canDestroyObjectRecords and (isSelectAll or everyDefined(selectedRecords, "deletedAt")) and (pageType == "RECORD_PAGE" or hasAnySoftDeleteFilterOnView) and (isSelectAll or noneEquals(selectedRecords, "recordPermissions.canDelete", false))',
  },
  [STANDARD_COMMAND_MENU_ITEMS.addToFavorites.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'arrayLength(favoriteRecordIds) < numberOfSelectedRecords and noneDefined(selectedRecords, "deletedAt") and not hasAnySoftDeleteFilterOnView and objectMetadataItem.nameSingular != "messageCampaign" and objectMetadataItem.nameSingular != "workflow"',
  },
  [STANDARD_COMMAND_MENU_ITEMS.removeFromFavorites.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'arrayLength(favoriteRecordIds) == numberOfSelectedRecords and noneDefined(selectedRecords, "deletedAt") and not hasAnySoftDeleteFilterOnView and objectMetadataItem.nameSingular != "messageCampaign" and objectMetadataItem.nameSingular != "workflow"',
  },
  [STANDARD_COMMAND_MENU_ITEMS.exportRecords.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "INDEX_PAGE" and permissionFlags.EXPORT_CSV',
  },
  [STANDARD_COMMAND_MENU_ITEMS.updateMultipleRecords.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 2 and objectPermissions.canUpdateObjectRecords',
  },
  [STANDARD_COMMAND_MENU_ITEMS.mergeMultipleRecords.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'not isSelectAll and numberOfSelectedRecords >= 2 and not objectMetadataItem.isSystem and objectMetadataItem.nameSingular != "workflow" and objectMetadataItem.nameSingular != "dashboard" and objectPermissions.canUpdateObjectRecords and objectPermissions.canDestroyObjectRecords and numberOfSelectedRecords <= 9 and noneEquals(selectedRecords, "recordPermissions.canUpdate", false) and noneEquals(selectedRecords, "recordPermissions.canDelete", false)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.mergeWithRecord.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "RECORD_PAGE" and numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt") and not objectMetadataItem.isSystem and objectMetadataItem.nameSingular != "workflow" and objectMetadataItem.nameSingular != "dashboard" and objectPermissions.canUpdateObjectRecords and objectPermissions.canDestroyObjectRecords and noneEquals(selectedRecords, "recordPermissions.canUpdate", false) and noneEquals(selectedRecords, "recordPermissions.canDelete", false)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.importRecords.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "INDEX_PAGE" and not hasAnySoftDeleteFilterOnView and permissionFlags.IMPORT_CSV',
  },
  [STANDARD_COMMAND_MENU_ITEMS.exportView.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "INDEX_PAGE" and permissionFlags.EXPORT_CSV',
  },
  [STANDARD_COMMAND_MENU_ITEMS.seeDeletedRecords.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "INDEX_PAGE" and not hasAnySoftDeleteFilterOnView',
  },
  [STANDARD_COMMAND_MENU_ITEMS.createNewView.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "INDEX_PAGE" and not hasAnySoftDeleteFilterOnView',
  },
  [STANDARD_COMMAND_MENU_ITEMS.hideDeletedRecords.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "INDEX_PAGE" and hasAnySoftDeleteFilterOnView',
  },
  [STANDARD_COMMAND_MENU_ITEMS.editRecordPageLayout.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType != "SETTINGS_PAGE" and not isLayoutCustomizationModeEnabled and permissionFlags.LAYOUTS',
  },
  [STANDARD_COMMAND_MENU_ITEMS.editDashboardLayout.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "RECORD_PAGE" and not isDashboardPageLayoutInEditMode and not isLayoutCustomizationModeEnabled and noneDefined(selectedRecords, "deletedAt") and everyDefined(selectedRecords, "pageLayoutId") and objectPermissions.canUpdateObjectRecords',
  },
  [STANDARD_COMMAND_MENU_ITEMS.saveDashboardLayout.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "RECORD_PAGE" and isDashboardPageLayoutInEditMode and noneDefined(selectedRecords, "deletedAt") and everyDefined(selectedRecords, "pageLayoutId") and objectPermissions.canUpdateObjectRecords',
  },
  [STANDARD_COMMAND_MENU_ITEMS.cancelDashboardLayout.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "RECORD_PAGE" and isDashboardPageLayoutInEditMode and noneDefined(selectedRecords, "deletedAt") and everyDefined(selectedRecords, "pageLayoutId") and objectPermissions.canUpdateObjectRecords',
  },
  [STANDARD_COMMAND_MENU_ITEMS.duplicateDashboard.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords',
  },
  [STANDARD_COMMAND_MENU_ITEMS.activateWorkflow.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and (everyEquals(selectedRecords, "currentVersion.status", "DRAFT") or includesNone(selectedRecords, "statuses", "ACTIVE")) and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.deactivateWorkflow.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "currentVersion.status", "ACTIVE") or includesEvery(selectedRecords, "statuses", "ACTIVE")) and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.discardDraftWorkflow.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'every(selectedRecords, "lastPublishedVersionId") and everyEquals(selectedRecords, "currentVersion.status", "DRAFT") and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.testWorkflow.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and ((everyEquals(selectedRecords, "currentVersion.trigger.type", "MANUAL") and noneDefined(selectedRecords, "currentVersion.trigger.settings.objectType")) or everyEquals(selectedRecords, "currentVersion.trigger.type", "WEBHOOK") or everyEquals(selectedRecords, "currentVersion.trigger.type", "CRON")) and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.seeRunsWorkflow.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.seeVersionsWorkflow.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.tidyUpWorkflow.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "RECORD_PAGE" and everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.duplicateWorkflow.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'everyDefined(selectedRecords, "currentVersion") and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.makeWorkflowPrivate.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "visibility", "WORKSPACE") and every(selectedRecords, "canChangeVisibility") and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.shareWorkflowWithWorkspace.universalIdentifier]:
    {
      conditionalAvailabilityExpression:
        'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "visibility", "PRIVATE") and every(selectedRecords, "canChangeVisibility") and noneDefined(selectedRecords, "deletedAt")',
    },
  [STANDARD_COMMAND_MENU_ITEMS.stopWorkflowRun.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'isSelectAll or someEquals(selectedRecords, "status", "NOT_STARTED") or someEquals(selectedRecords, "status", "ENQUEUED") or someEquals(selectedRecords, "status", "RUNNING")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.retryWorkflowRun.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'someEquals(selectedRecords, "status", "FAILED")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.seeRunsWorkflowVersion.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'everyDefined(selectedRecords, "workflow")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.seeWorkflowWorkflowVersion.universalIdentifier]:
    {
      conditionalAvailabilityExpression:
        'everyDefined(selectedRecords, "workflow.id")',
    },
  [STANDARD_COMMAND_MENU_ITEMS.useAsDraftWorkflowVersion.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'noneEquals(selectedRecords, "status", "DRAFT")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.seeVersionsWorkflowVersion.universalIdentifier]:
    {
      conditionalAvailabilityExpression:
        'everyDefined(selectedRecords, "workflow")',
    },
  [STANDARD_COMMAND_MENU_ITEMS.askAi.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'permissionFlags.AI and not isInSidePanel and objectMetadataItem.nameSingular != "agentChatThread"',
  },
  [STANDARD_COMMAND_MENU_ITEMS.viewPreviousAiChats.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.AI',
  },
  [STANDARD_COMMAND_MENU_ITEMS.newAiChat.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.AI',
    conditionalPinnedExpression:
      'pageType == "RECORD_PAGE" and objectMetadataItem.nameSingular == "agentChatThread" and not isInSidePanel',
  },
  [STANDARD_COMMAND_MENU_ITEMS.shareRecord.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.markAiChatAsRead.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and every(selectedRecords, "inboxStatus.isUnread")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.markAiChatAsUnread.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and everyEquals(selectedRecords, "inboxStatus.isUnread", false)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.markAiChatAsDone.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and everyEquals(selectedRecords, "inboxStatus.scope", "INBOX")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.reopenAiChat.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and everyEquals(selectedRecords, "inboxStatus.scope", "ARCHIVED")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.unsnoozeAiChat.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and everyEquals(selectedRecords, "inboxStatus.scope", "SNOOZED")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.snoozeAiChat.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and everyDefined(selectedRecords, "inboxStatus") and noneEquals(selectedRecords, "inboxStatus.scope", "SNOOZED")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.subscribeToAiChat.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and everyEquals(selectedRecords, "inboxStatus.isSubscribed", false)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.unsubscribeFromAiChat.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and everyEquals(selectedRecords, "inboxStatus.isSubscribed", true) and noneEquals(selectedRecords, "inboxStatus.isAssignedToMe", true)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.assignAiChat.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)',
  },
  [STANDARD_COMMAND_MENU_ITEMS.shareAnyRecord.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and featureFlags.IS_RECORD_LEVEL_SHARING_ENABLED and not objectMetadataItem.isSystem and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.replyToEmailThread.universalIdentifier]: {
    conditionalAvailabilityExpression: 'numberOfSelectedRecords == 1',
  },
  [STANDARD_COMMAND_MENU_ITEMS.composeEmail.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.SEND_EMAIL_TOOL',
  },
  [STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned.universalIdentifier]: {
    conditionalAvailabilityExpression: 'pageType == "INDEX_PAGE"',
    conditionalPinnedExpression: 'numberOfSelectedRecords == 0',
  },
  [STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "DRAFT") or everyEquals(selectedRecords, "status", "SCHEDULED")) and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "DRAFT") or everyEquals(selectedRecords, "status", "SCHEDULED")) and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "SCHEDULED") or everyEquals(selectedRecords, "status", "SENDING")) and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords',
    conditionalPinnedExpression:
      'everyEquals(selectedRecords, "status", "SENT")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.emailBlockSettings.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "RECORD_PAGE" and numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "status", "DRAFT") and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.emailPageStyle.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'pageType == "RECORD_PAGE" and numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "status", "DRAFT") and noneDefined(selectedRecords, "deletedAt")',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsAccounts.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.CONNECTED_ACCOUNTS',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsAccountsEmails.universalIdentifier]:
    {
      conditionalAvailabilityExpression: 'permissionFlags.CONNECTED_ACCOUNTS',
    },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsAccountsCalendars
    .universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.CONNECTED_ACCOUNTS',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsGeneral.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.WORKSPACE',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsObjects.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.DATA_MODEL',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsMembers.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.WORKSPACE_MEMBERS',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsRoles.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.WORKSPACE_MEMBERS',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsDomains.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.WORKSPACE',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsBilling.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.WORKSPACE',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsApiWebhooks.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.API_KEYS_AND_WEBHOOKS',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsApplications.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.APPLICATIONS',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsAI.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.WORKSPACE',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsSecurity.universalIdentifier]: {
    conditionalAvailabilityExpression: 'permissionFlags.SECURITY',
  },
  [STANDARD_COMMAND_MENU_ITEMS.goToSettingsAdminPanel.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'canImpersonate or canAccessFullAdminPanel',
  },
  [STANDARD_COMMAND_MENU_ITEMS.composeEmailToPerson.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords >= 1 and permissionFlags.SEND_EMAIL_TOOL',
  },
  [STANDARD_COMMAND_MENU_ITEMS.composeEmailToCompany.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and permissionFlags.SEND_EMAIL_TOOL',
  },
  [STANDARD_COMMAND_MENU_ITEMS.composeEmailToOpportunity.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and permissionFlags.SEND_EMAIL_TOOL',
  },
  [STANDARD_COMMAND_MENU_ITEMS.duplicateMessageList.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords',
  },
  [STANDARD_COMMAND_MENU_ITEMS.addToMessageList.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'targetObjectWritePermissions.messageListMember and numberOfSelectedRecords >= 1 and not hasAnySoftDeleteFilterOnView and (isSelectAll or noneDefined(selectedRecords, "deletedAt"))',
  },
  [STANDARD_COMMAND_MENU_ITEMS.addViewToMessageList.universalIdentifier]: {
    conditionalAvailabilityExpression:
      'targetObjectWritePermissions.messageListMember and pageType == "INDEX_PAGE" and not hasAnySoftDeleteFilterOnView',
  },
};
