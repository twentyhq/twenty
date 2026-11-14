export default {
    "scalars": [
        1,
        2,
        4,
        8,
        9,
        12,
        14,
        16,
        19,
        30,
        32,
        33,
        40,
        44,
        46,
        53,
        69,
        77,
        87,
        93,
        106,
        110,
        111,
        113,
        118,
        124,
        130,
        135,
        141,
        144,
        145,
        146,
        147,
        155,
        157,
        171,
        176,
        178,
        180,
        227,
        228,
        255,
        259,
        260,
        262,
        273,
        279,
        283,
        287,
        290,
        297,
        314,
        316,
        322,
        324,
        337,
        344,
        345,
        346,
        358,
        360,
        378,
        379,
        380,
        381,
        382,
        383,
        385,
        386,
        387,
        390,
        391,
        393,
        396,
        401,
        405,
        414,
        421,
        423,
        426,
        430,
        431,
        436,
        440,
        463,
        465,
        466,
        474,
        486,
        488,
        494,
        499,
        523,
        537,
        538,
        540,
        567,
        569,
        571,
        636,
        656,
        663,
        665,
        669,
        680,
        686,
        687,
        689,
        690,
        692,
        693,
        694,
        697,
        698,
        699,
        704,
        706,
        709,
        714,
        715,
        716,
        719,
        720
    ],
    "types": {
        "AccessGroupPropagationProgress": {
            "isInProgress": [
                1
            ],
            "remainingRecordCount": [
                2
            ],
            "totalRecordCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "Boolean": {},
        "Int": {},
        "ActivateWorkspaceInput": {
            "displayName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "String": {},
        "AddQuerySubscriptionInput": {
            "eventStreamId": [
                4
            ],
            "operationSignature": [
                344
            ],
            "queryId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Agent": {
            "applicationId": [
                567
            ],
            "avatarColor": [
                4
            ],
            "avatarShape": [
                4
            ],
            "createdAt": [
                228
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isCustom": [
                1
            ],
            "isSystem": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                344
            ],
            "modelId": [
                4
            ],
            "name": [
                4
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                344
            ],
            "roleId": [
                567
            ],
            "triggers": [
                344
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannel": {
            "applicationId": [
                567
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isAccessible": [
                1
            ],
            "isCustom": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                8
            ],
            "roleIds": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "Float": {},
        "AgentChatChannelAssignmentFilter": {},
        "AgentChatChannelRole": {
            "canAccessAllAgentChatChannels": [
                1
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelSummary": {
            "assignedCount": [
                2
            ],
            "assignedToMeCount": [
                2
            ],
            "channelId": [
                567
            ],
            "doneCount": [
                2
            ],
            "hasUnreadAssignedToMe": [
                1
            ],
            "hasUnreadOpen": [
                1
            ],
            "mentionedCount": [
                2
            ],
            "needsInputCount": [
                2
            ],
            "openCount": [
                2
            ],
            "snoozedCount": [
                2
            ],
            "unassignedCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadFilter": {},
        "AgentChatChannelThreadIds": {
            "endCursor": [
                4
            ],
            "hasNextPage": [
                1
            ],
            "threadIds": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                344
            ],
            "threadId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatInboxAction": {},
        "AgentChatOpenThreadsSummary": {
            "assignedThreadCount": [
                2
            ],
            "assignedToMeThreadCount": [
                2
            ],
            "hasUnreadAssignedThread": [
                1
            ],
            "hasUnreadMentionThread": [
                1
            ],
            "hasUnreadOpenThread": [
                1
            ],
            "mentionThreadCount": [
                2
            ],
            "needsInputThreadCount": [
                2
            ],
            "openThreadCount": [
                2
            ],
            "unassignedThreadCount": [
                2
            ],
            "unreadOpenThreadCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatThread": {
            "contextWindowTokens": [
                2
            ],
            "conversationSize": [
                2
            ],
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "id": [
                19
            ],
            "isAssistantParticipant": [
                1
            ],
            "title": [
                4
            ],
            "totalCacheReadTokens": [
                2
            ],
            "totalInputCredits": [
                8
            ],
            "totalInputTokens": [
                2
            ],
            "totalOutputCredits": [
                8
            ],
            "totalOutputTokens": [
                2
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                228
            ],
            "id": [
                567
            ],
            "isSubscribed": [
                1
            ],
            "lastMentionedAt": [
                228
            ],
            "lastReadAt": [
                228
            ],
            "mentionsResolvedAt": [
                228
            ],
            "snoozedUntil": [
                228
            ],
            "threadId": [
                567
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "AgentDailyRunCount": {
            "completedRunCount": [
                2
            ],
            "credits": [
                8
            ],
            "day": [
                4
            ],
            "failedRunCount": [
                2
            ],
            "otherRunCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AgentIdInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                567
            ],
            "createdAt": [
                228
            ],
            "id": [
                567
            ],
            "isBuiltInAssistant": [
                1
            ],
            "parts": [
                24
            ],
            "processedAt": [
                228
            ],
            "reactions": [
                25
            ],
            "role": [
                4
            ],
            "senderApplicationId": [
                567
            ],
            "senderUserWorkspaceId": [
                567
            ],
            "senderWorkspaceMemberId": [
                567
            ],
            "status": [
                4
            ],
            "threadId": [
                567
            ],
            "turnId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                228
            ],
            "errorMessage": [
                4
            ],
            "fileFilename": [
                4
            ],
            "fileId": [
                567
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                567
            ],
            "messageId": [
                567
            ],
            "orderIndex": [
                2
            ],
            "providerExecuted": [
                1
            ],
            "providerMetadata": [
                344
            ],
            "reasoningContent": [
                4
            ],
            "sourceDocumentFilename": [
                4
            ],
            "sourceDocumentMediaType": [
                4
            ],
            "sourceDocumentSourceId": [
                4
            ],
            "sourceDocumentTitle": [
                4
            ],
            "sourceUrlSourceId": [
                4
            ],
            "sourceUrlTitle": [
                4
            ],
            "sourceUrlUrl": [
                4
            ],
            "state": [
                4
            ],
            "textContent": [
                4
            ],
            "toolCallId": [
                4
            ],
            "toolInput": [
                344
            ],
            "toolName": [
                4
            ],
            "toolOutput": [
                344
            ],
            "type": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessageReactionSummary": {
            "agentIds": [
                567
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "AgentRecentRun": {
            "createdAt": [
                228
            ],
            "id": [
                567
            ],
            "status": [
                30
            ],
            "__typename": [
                4
            ]
        },
        "AgentRun": {
            "canReadThread": [
                1
            ],
            "createdAt": [
                228
            ],
            "creatorName": [
                4
            ],
            "creatorSource": [
                4
            ],
            "credits": [
                8
            ],
            "endedAt": [
                228
            ],
            "errorMessage": [
                4
            ],
            "id": [
                567
            ],
            "input": [
                4
            ],
            "inputTokens": [
                2
            ],
            "modelId": [
                4
            ],
            "outputTokens": [
                2
            ],
            "reply": [
                4
            ],
            "startedAt": [
                228
            ],
            "status": [
                30
            ],
            "threadId": [
                567
            ],
            "threadTitle": [
                4
            ],
            "toolNames": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AgentRunInsights": {
            "agentId": [
                567
            ],
            "averageDurationInMs": [
                8
            ],
            "credits": [
                8
            ],
            "dailyRunCounts": [
                21
            ],
            "runCount": [
                2
            ],
            "tokenCount": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "AgentRunSummary": {
            "agentId": [
                567
            ],
            "recentRuns": [
                26
            ],
            "runCountLast14Days": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AgentTurnStatus": {},
        "AggregateChartConfiguration": {
            "aggregateFieldMetadataId": [
                567
            ],
            "aggregateOperation": [
                32
            ],
            "configurationType": [
                697
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "filter": [
                344
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "label": [
                4
            ],
            "numberFormat": [
                157
            ],
            "prefix": [
                4
            ],
            "ratioAggregateConfig": [
                458
            ],
            "suffix": [
                4
            ],
            "timezone": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AggregateOperations": {},
        "AiChatAssistantMode": {},
        "AiChatAssistantProfile": {
            "avatarColor": [
                4
            ],
            "avatarFace": [
                4
            ],
            "avatarShape": [
                4
            ],
            "displayName": [
                4
            ],
            "isAvatarAnimated": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "AiChatAssistantProfileInput": {
            "avatarColor": [
                4
            ],
            "avatarFace": [
                4
            ],
            "avatarShape": [
                4
            ],
            "displayName": [
                4
            ],
            "isAvatarAnimated": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "AiChatUsage": {
            "consumedValue": [
                113
            ],
            "kind": [
                4
            ],
            "limitValue": [
                113
            ],
            "periodEnd": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                113
            ],
            "limitValue": [
                113
            ],
            "periodEnd": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "AiDataPolicy": {
            "isProductImprovementDataSharingEnabled": [
                1
            ],
            "isZeroDataRetentionRequired": [
                1
            ],
            "requiredDataResidencyRegion": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AiDataPolicyInput": {
            "isProductImprovementDataSharingEnabled": [
                1
            ],
            "isZeroDataRetentionRequired": [
                1
            ],
            "requiredDataResidencyRegion": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AiModelTier": {},
        "AiRunUsage": {
            "inputTokens": [
                2
            ],
            "outputTokens": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                2
            ],
            "sections": [
                43
            ],
            "__typename": [
                4
            ]
        },
        "AiSystemPromptSection": {
            "content": [
                4
            ],
            "estimatedTokenCount": [
                2
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AllMetadataName": {},
        "Analytics": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "AnalyticsType": {},
        "ApiConfig": {
            "mutationMaximumAffectedRecords": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "ApiKey": {
            "createdAt": [
                228
            ],
            "expiresAt": [
                228
            ],
            "id": [
                567
            ],
            "name": [
                4
            ],
            "revokedAt": [
                228
            ],
            "role": [
                480
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                228
            ],
            "id": [
                567
            ],
            "name": [
                4
            ],
            "revokedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "ApiKeyToken": {
            "token": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppConnection": {
            "accessToken": [
                4
            ],
            "authFailedAt": [
                4
            ],
            "authFailedReason": [
                4
            ],
            "externalAccountId": [
                4
            ],
            "handle": [
                4
            ],
            "id": [
                19
            ],
            "name": [
                4
            ],
            "providerName": [
                4
            ],
            "providerType": [
                4
            ],
            "scope": [
                176
            ],
            "scopes": [
                4
            ],
            "userWorkspaceId": [
                4
            ],
            "visibility": [
                4
            ],
            "workspaceMemberId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValue": {
            "key": [
                4
            ],
            "scope": [
                53
            ],
            "value": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                567
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppMessageFolderInput": {
            "externalId": [
                4
            ],
            "isSynced": [
                1
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppMessageInput": {
            "attachments": [
                54
            ],
            "externalId": [
                4
            ],
            "folderExternalIds": [
                4
            ],
            "isRead": [
                1
            ],
            "participants": [
                57
            ],
            "receivedAt": [
                228
            ],
            "subject": [
                4
            ],
            "text": [
                4
            ],
            "threadExternalId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppMessageParticipantInput": {
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "personId": [
                567
            ],
            "role": [
                387
            ],
            "workspaceMemberId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "Application": {
            "agents": [
                6
            ],
            "applicationRegistration": [
                89
            ],
            "applicationRegistrationId": [
                567
            ],
            "applicationVariables": [
                92
            ],
            "autoUpgrade": [
                1
            ],
            "availablePackages": [
                344
            ],
            "canBeUninstalled": [
                1
            ],
            "commandMenuItems": [
                170
            ],
            "content": [
                64
            ],
            "createdAt": [
                228
            ],
            "defaultLogicFunctionRole": [
                480
            ],
            "defaultRoleId": [
                4
            ],
            "description": [
                4
            ],
            "frontComponents": [
                304
            ],
            "grantRoleId": [
                567
            ],
            "grantedIframeMediaPermissions": [
                326
            ],
            "healthCheckLogicFunctionId": [
                567
            ],
            "id": [
                567
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                357
            ],
            "logoFileId": [
                567
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                407
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                567
            ],
            "requestedIframeMediaPermissions": [
                326
            ],
            "runOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                567
            ],
            "settingsMenuItems": [
                522
            ],
            "universalIdentifier": [
                4
            ],
            "version": [
                4
            ],
            "yarnLockChecksum": [
                4
            ],
            "yarnLockFileId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                567
            ],
            "applicationName": [
                4
            ],
            "applicationUniversalIdentifier": [
                4
            ],
            "createdAt": [
                228
            ],
            "id": [
                567
            ],
            "lastAuthorizedAt": [
                228
            ],
            "lastUsedAt": [
                228
            ],
            "marketplaceAppUniversalIdentifier": [
                4
            ],
            "scopes": [
                4
            ],
            "userId": [
                567
            ],
            "workspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationCapabilityGrant": {
            "grantedCapabilities": [
                4
            ],
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                567
            ],
            "archivedAt": [
                228
            ],
            "authFailedAt": [
                228
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                454
            ],
            "connectionProviderId": [
                567
            ],
            "createdAt": [
                228
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                567
            ],
            "isOwnedByCurrentUser": [
                1
            ],
            "lastCredentialsRefreshedAt": [
                228
            ],
            "lastSignedInAt": [
                228
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                176
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                228
            ],
            "userWorkspaceId": [
                567
            ],
            "visibility": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectionProvider": {
            "applicationId": [
                4
            ],
            "displayName": [
                4
            ],
            "id": [
                567
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "oauth": [
                63
            ],
            "scope": [
                180
            ],
            "type": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectionProviderOAuthConfig": {
            "isClientCredentialsConfigured": [
                1
            ],
            "scopes": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationContent": {
            "agents": [
                65
            ],
            "commandMenuItems": [
                65
            ],
            "connectionProviders": [
                65
            ],
            "fields": [
                65
            ],
            "frontComponents": [
                65
            ],
            "indexes": [
                65
            ],
            "logicFunctions": [
                65
            ],
            "navigationMenuItems": [
                65
            ],
            "objects": [
                65
            ],
            "pageLayoutTabs": [
                65
            ],
            "pageLayouts": [
                65
            ],
            "permissionFlags": [
                65
            ],
            "publicAssets": [
                65
            ],
            "roles": [
                65
            ],
            "skills": [
                65
            ],
            "translations": [
                65
            ],
            "viewFields": [
                65
            ],
            "views": [
                65
            ],
            "workflows": [
                65
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationContentItem": {
            "color": [
                4
            ],
            "count": [
                2
            ],
            "description": [
                4
            ],
            "fieldUniversalIdentifier": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                4
            ],
            "label": [
                4
            ],
            "objectUniversalIdentifier": [
                4
            ],
            "parentLabel": [
                4
            ],
            "parentUniversalIdentifier": [
                4
            ],
            "position": [
                8
            ],
            "tag": [
                4
            ],
            "timeoutSeconds": [
                2
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationExport": {
            "application": [
                67
            ],
            "coverage": [
                68
            ],
            "files": [
                70
            ],
            "manifest": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationExportApplication": {
            "displayName": [
                4
            ],
            "sourceType": [
                87
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationExportCoverageEntry": {
            "metadataName": [
                4
            ],
            "reason": [
                4
            ],
            "status": [
                69
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationExportCoverageStatus": {},
        "ApplicationExportFile": {
            "content": [
                4
            ],
            "folder": [
                4
            ],
            "path": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationFileCompletionError": {
            "fileId": [
                567
            ],
            "message": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationFileUploadError": {
            "fileFolder": [
                297
            ],
            "filePath": [
                4
            ],
            "message": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationFileUploadRequestInput": {
            "fileFolder": [
                297
            ],
            "filePath": [
                4
            ],
            "size": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationFileUploadTarget": {
            "contentType": [
                4
            ],
            "expiresAt": [
                228
            ],
            "fileFolder": [
                297
            ],
            "fileId": [
                567
            ],
            "filePath": [
                4
            ],
            "uploadUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationHealthCheckAction": {
            "label": [
                4
            ],
            "location": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationHealthCheckResult": {
            "action": [
                75
            ],
            "description": [
                4
            ],
            "status": [
                77
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationHealthStatus": {},
        "ApplicationMonitoring": {
            "activity": [
                79
            ],
            "bucketSizeInSeconds": [
                2
            ],
            "creditUsage": [
                80
            ],
            "creditsUsed": [
                8
            ],
            "failedRunCount": [
                2
            ],
            "functions": [
                81
            ],
            "issues": [
                82
            ],
            "lifecycle": [
                83
            ],
            "lifecycleFailureCount": [
                2
            ],
            "lookbackInHours": [
                2
            ],
            "periodEnd": [
                228
            ],
            "periodStart": [
                228
            ],
            "rateLimitEventCount": [
                2
            ],
            "runCount": [
                2
            ],
            "versions": [
                84
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                228
            ],
            "errorCount": [
                2
            ],
            "rateLimitedJobCount": [
                2
            ],
            "rateLimitedRequestCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringCreditBucket": {
            "bucketStart": [
                228
            ],
            "creditsUsed": [
                8
            ],
            "operationLabel": [
                4
            ],
            "operationType": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringFunction": {
            "failedRunCount": [
                2
            ],
            "logicFunctionName": [
                4
            ],
            "p95DurationMs": [
                8
            ],
            "runCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringIssue": {
            "affectedInstallCount": [
                2
            ],
            "errorCode": [
                4
            ],
            "eventCount": [
                2
            ],
            "lastSeenAt": [
                228
            ],
            "level": [
                4
            ],
            "logicFunctionName": [
                4
            ],
            "source": [
                4
            ],
            "versions": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringLifecycleBucket": {
            "bucketStart": [
                228
            ],
            "failedCount": [
                2
            ],
            "installCount": [
                2
            ],
            "uninstallCount": [
                2
            ],
            "upgradeCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringVersion": {
            "activeInstallCount": [
                2
            ],
            "failedRunCount": [
                2
            ],
            "runCount": [
                2
            ],
            "version": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationPreferences": {
            "applicationId": [
                567
            ],
            "connectionProviders": [
                62
            ],
            "hasUserHealthCheck": [
                1
            ],
            "settingsMenuItems": [
                522
            ],
            "variables": [
                668
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                228
            ],
            "galleryImagesUrls": [
                4
            ],
            "id": [
                567
            ],
            "isConfigured": [
                1
            ],
            "isListed": [
                1
            ],
            "isPreInstalled": [
                1
            ],
            "latestAvailableVersion": [
                4
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "oAuthClientId": [
                4
            ],
            "oAuthRedirectUris": [
                4
            ],
            "oAuthScopes": [
                4
            ],
            "ownerWorkspaceId": [
                567
            ],
            "sourcePackage": [
                4
            ],
            "sourceType": [
                87
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSourceType": {},
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                2
            ],
            "autoUpdateEnabled": [
                2
            ],
            "creditsUsedBreakdown": [
                225
            ],
            "mostInstalledVersion": [
                4
            ],
            "suspendedInstalls": [
                2
            ],
            "totalCreditsUsed": [
                8
            ],
            "versionDistribution": [
                678
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                567
            ],
            "latestAvailableVersion": [
                4
            ],
            "logoUrl": [
                4
            ],
            "sourceType": [
                87
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                228
            ],
            "description": [
                4
            ],
            "id": [
                567
            ],
            "isDeprecated": [
                1
            ],
            "isFilled": [
                1
            ],
            "isRequired": [
                1
            ],
            "isSecret": [
                1
            ],
            "key": [
                4
            ],
            "options": [
                344
            ],
            "type": [
                4
            ],
            "updatedAt": [
                228
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationTokenPair": {
            "applicationAccessToken": [
                98
            ],
            "applicationRefreshToken": [
                98
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationVariable": {
            "description": [
                4
            ],
            "id": [
                567
            ],
            "isDeprecated": [
                1
            ],
            "isRequired": [
                1
            ],
            "isSecret": [
                1
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "options": [
                344
            ],
            "scope": [
                93
            ],
            "type": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationVariableScope": {},
        "ApprovedAccessDomain": {
            "createdAt": [
                228
            ],
            "domain": [
                4
            ],
            "id": [
                567
            ],
            "isValidated": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ArchiveInboxThreadInput": {
            "threadId": [
                567
            ],
            "workspaceMemberIds": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "AuthBypassProviders": {
            "google": [
                1
            ],
            "microsoft": [
                1
            ],
            "password": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "AuthProviders": {
            "google": [
                1
            ],
            "magicLink": [
                1
            ],
            "microsoft": [
                1
            ],
            "password": [
                1
            ],
            "sso": [
                498
            ],
            "__typename": [
                4
            ]
        },
        "AuthToken": {
            "expiresAt": [
                228
            ],
            "token": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AuthTokenPair": {
            "accessOrWorkspaceAgnosticToken": [
                98
            ],
            "refreshToken": [
                98
            ],
            "__typename": [
                4
            ]
        },
        "AuthTokens": {
            "tokens": [
                99
            ],
            "__typename": [
                4
            ]
        },
        "AuthorizeApp": {
            "redirectUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AutocompleteResult": {
            "placeId": [
                4
            ],
            "text": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspace": {
            "displayName": [
                4
            ],
            "id": [
                567
            ],
            "inviteHash": [
                4
            ],
            "loginToken": [
                4
            ],
            "logo": [
                4
            ],
            "personalInviteToken": [
                4
            ],
            "sso": [
                497
            ],
            "workspaceUrls": [
                721
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                103
            ],
            "availableWorkspacesForSignUp": [
                103
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                104
            ],
            "tokens": [
                99
            ],
            "__typename": [
                4
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                567
            ],
            "aggregateOperation": [
                32
            ],
            "axisNameDisplay": [
                106
            ],
            "color": [
                4
            ],
            "configurationType": [
                697
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "displayLegend": [
                1
            ],
            "filter": [
                344
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupMode": [
                110
            ],
            "isCumulative": [
                1
            ],
            "layout": [
                111
            ],
            "numberFormat": [
                157
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                421
            ],
            "primaryAxisGroupByFieldMetadataId": [
                567
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                322
            ],
            "rangeMax": [
                8
            ],
            "rangeMin": [
                8
            ],
            "secondaryAxisGroupByDateGranularity": [
                421
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                567
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                322
            ],
            "splitMultiValueFields": [
                1
            ],
            "timezone": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BarChartData": {
            "data": [
                344
            ],
            "formattedToRawLookup": [
                344
            ],
            "groupMode": [
                110
            ],
            "hasTooManyGroups": [
                1
            ],
            "indexBy": [
                4
            ],
            "keys": [
                4
            ],
            "layout": [
                111
            ],
            "series": [
                112
            ],
            "showDataLabels": [
                1
            ],
            "showLegend": [
                1
            ],
            "xAxisLabel": [
                4
            ],
            "yAxisLabel": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BarChartDataInput": {
            "configuration": [
                344
            ],
            "objectMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "BarChartSeries": {
            "key": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BigInt": {},
        "Billing": {
            "billingUrl": [
                4
            ],
            "isBillingEnabled": [
                1
            ],
            "stripePublishableKey": [
                4
            ],
            "trialPeriods": [
                139
            ],
            "__typename": [
                4
            ]
        },
        "BillingCustomer": {
            "hasPaymentMethod": [
                1
            ],
            "id": [
                567
            ],
            "userCreditsFallback": [
                669
            ],
            "__typename": [
                4
            ]
        },
        "BillingEndTrialPeriod": {
            "billingPortalUrl": [
                4
            ],
            "billingSubscriptions": [
                134
            ],
            "currentBillingSubscription": [
                134
            ],
            "hasPaymentMethod": [
                1
            ],
            "status": [
                538
            ],
            "__typename": [
                4
            ]
        },
        "BillingEntitlement": {
            "key": [
                118
            ],
            "value": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "BillingEntitlementKey": {},
        "BillingLicensedProduct": {
            "description": [
                4
            ],
            "images": [
                4
            ],
            "metadata": [
                131
            ],
            "name": [
                4
            ],
            "prices": [
                125
            ],
            "__typename": [
                4
            ]
        },
        "BillingMeteredProduct": {
            "description": [
                4
            ],
            "images": [
                4
            ],
            "metadata": [
                131
            ],
            "name": [
                4
            ],
            "prices": [
                126
            ],
            "__typename": [
                4
            ]
        },
        "BillingPartnerCode": {
            "isEditable": [
                1
            ],
            "partnerCode": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BillingPaymentIntent": {
            "clientSecret": [
                4
            ],
            "paymentIntentType": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BillingPlan": {
            "baseProducts": [
                119
            ],
            "downgradePlanKeys": [
                124
            ],
            "isCheckoutDefault": [
                1
            ],
            "isSellable": [
                1
            ],
            "meteredProducts": [
                120
            ],
            "planKey": [
                124
            ],
            "resourceCreditProducts": [
                119
            ],
            "upgradePlanKeys": [
                124
            ],
            "__typename": [
                4
            ]
        },
        "BillingPlanKey": {},
        "BillingPriceLicensed": {
            "creditAmount": [
                8
            ],
            "isSellable": [
                1
            ],
            "priceUsageType": [
                141
            ],
            "recurringInterval": [
                537
            ],
            "stripePriceId": [
                4
            ],
            "unitAmount": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "BillingPriceMetered": {
            "priceUsageType": [
                141
            ],
            "recurringInterval": [
                537
            ],
            "stripePriceId": [
                4
            ],
            "tiers": [
                127
            ],
            "__typename": [
                4
            ]
        },
        "BillingPriceTier": {
            "flatAmount": [
                8
            ],
            "unitAmount": [
                8
            ],
            "upTo": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "BillingProduct": {
            "description": [
                4
            ],
            "images": [
                4
            ],
            "metadata": [
                131
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BillingProductDTO": {
            "description": [
                4
            ],
            "images": [
                4
            ],
            "metadata": [
                131
            ],
            "name": [
                4
            ],
            "on_BillingLicensedProduct": [
                119
            ],
            "on_BillingMeteredProduct": [
                120
            ],
            "__typename": [
                4
            ]
        },
        "BillingProductKey": {},
        "BillingProductMetadata": {
            "isLegacy": [
                4
            ],
            "planKey": [
                124
            ],
            "priceUsageBased": [
                141
            ],
            "productKey": [
                130
            ],
            "__typename": [
                4
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                228
            ],
            "periodStart": [
                228
            ],
            "productKey": [
                130
            ],
            "unitPriceCents": [
                8
            ],
            "userCreditsUsed": [
                8
            ],
            "workspaceCreditsExtraGranted": [
                8
            ],
            "workspaceCreditsGranted": [
                8
            ],
            "workspaceCreditsGrantedForSeats": [
                8
            ],
            "workspaceCreditsSeats": [
                2
            ],
            "workspaceCreditsTotalGranted": [
                8
            ],
            "workspaceCreditsUsed": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "BillingSession": {
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BillingSubscription": {
            "billingSubscriptionItems": [
                136
            ],
            "cancelAt": [
                228
            ],
            "collectionMethod": [
                135
            ],
            "currentPeriodEnd": [
                228
            ],
            "hasUserCredits": [
                1
            ],
            "id": [
                567
            ],
            "interval": [
                537
            ],
            "metadata": [
                344
            ],
            "phases": [
                137
            ],
            "status": [
                538
            ],
            "__typename": [
                4
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                129
            ],
            "creditAmount": [
                8
            ],
            "hasReachedCurrentPeriodCap": [
                1
            ],
            "id": [
                567
            ],
            "quantity": [
                8
            ],
            "stripePriceId": [
                4
            ],
            "unitAmount": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                8
            ],
            "items": [
                138
            ],
            "start_date": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "BillingSubscriptionSchedulePhaseItem": {
            "price": [
                4
            ],
            "quantity": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                8
            ],
            "isCreditCardRequired": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "BillingUpdate": {
            "billingSubscriptions": [
                134
            ],
            "currentBillingSubscription": [
                134
            ],
            "__typename": [
                4
            ]
        },
        "BillingUsageType": {},
        "BooleanFieldComparison": {
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "CalendarChannel": {
            "connectedAccountId": [
                567
            ],
            "contactAutoCreationPolicy": [
                144
            ],
            "createdAt": [
                228
            ],
            "excludePrivateEvents": [
                1
            ],
            "handle": [
                4
            ],
            "id": [
                567
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "syncStage": [
                145
            ],
            "syncStageStartedAt": [
                228
            ],
            "syncStatus": [
                146
            ],
            "syncedAt": [
                228
            ],
            "throttleFailureCount": [
                8
            ],
            "updatedAt": [
                228
            ],
            "visibility": [
                147
            ],
            "__typename": [
                4
            ]
        },
        "CalendarChannelContactAutoCreationPolicy": {},
        "CalendarChannelSyncStage": {},
        "CalendarChannelSyncStatus": {},
        "CalendarChannelVisibility": {},
        "CalendarConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "CampaignAudiencePreviewDTO": {
            "duplicateEmails": [
                2
            ],
            "globallyUnsubscribed": [
                2
            ],
            "hardSuppressed": [
                2
            ],
            "sendable": [
                2
            ],
            "topicUnsubscribed": [
                2
            ],
            "totalMembers": [
                2
            ],
            "trackingRefused": [
                2
            ],
            "withoutEmail": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "CancelMessageCampaignInput": {
            "campaignId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CancelMessageCampaignOutputDTO": {
            "campaignId": [
                4
            ],
            "canceledMessageCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "Captcha": {
            "provider": [
                155
            ],
            "siteKey": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CaptchaDriverType": {},
        "ChannelSyncSuccess": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ChartNumberFormat": {},
        "ChatConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                344
            ],
            "error": [
                160
            ],
            "maxSeq": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamError": {
            "code": [
                4
            ],
            "message": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ChatThreadsConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                8
            ],
            "exists": [
                1
            ],
            "isEmailVerified": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ClaimableApplicationRegistration": {
            "author": [
                4
            ],
            "description": [
                4
            ],
            "id": [
                4
            ],
            "isOwned": [
                1
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "sourcePackage": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ClientAiEvaluationModelConfig": {
            "description": [
                4
            ],
            "inputCostPerMillionTokens": [
                8
            ],
            "isAvailable": [
                1
            ],
            "isDeprecated": [
                1
            ],
            "label": [
                4
            ],
            "maxCriteriaPerQuestion": [
                8
            ],
            "maxScoreLevels": [
                8
            ],
            "medianLatencyMs": [
                8
            ],
            "modelId": [
                4
            ],
            "outputCostPerMillionTokens": [
                8
            ],
            "providerLabel": [
                4
            ],
            "supportedQuestionTypes": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ClientAiModelConfig": {
            "contextWindowTokens": [
                8
            ],
            "costPerTask": [
                8
            ],
            "dataResidency": [
                4
            ],
            "effort": [
                4
            ],
            "efforts": [
                4
            ],
            "inputCostPerMillionTokens": [
                8
            ],
            "intelligenceIndex": [
                8
            ],
            "isBenchmarkInherited": [
                1
            ],
            "isDeprecated": [
                1
            ],
            "label": [
                4
            ],
            "maxOutputTokens": [
                8
            ],
            "modelFamily": [
                401
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                403
            ],
            "outputCostPerMillionTokens": [
                8
            ],
            "outputTokensPerSecond": [
                8
            ],
            "providerLabel": [
                4
            ],
            "providerName": [
                4
            ],
            "sdkPackage": [
                4
            ],
            "zeroDataRetention": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ClientAiModelTierConfig": {
            "isZeroDataRetentionRequired": [
                1
            ],
            "modelId": [
                4
            ],
            "requiredDataResidencyRegion": [
                4
            ],
            "tier": [
                40
            ],
            "__typename": [
                4
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                164
            ],
            "aiModelTiers": [
                166
            ],
            "aiModels": [
                165
            ],
            "allowRequestsToTwentyIcons": [
                1
            ],
            "analyticsEnabled": [
                1
            ],
            "api": [
                47
            ],
            "appVersion": [
                4
            ],
            "authProviders": [
                97
            ],
            "billing": [
                114
            ],
            "calendarBookingPageId": [
                4
            ],
            "canManageFeatureFlags": [
                1
            ],
            "captcha": [
                154
            ],
            "defaultSubdomain": [
                4
            ],
            "enterpriseInstanceType": [
                4
            ],
            "frontDomain": [
                4
            ],
            "isAttachmentPreviewEnabled": [
                1
            ],
            "isBookCallOnboardingStepEnabled": [
                1
            ],
            "isClickHouseConfigured": [
                1
            ],
            "isCloudflareIntegrationEnabled": [
                1
            ],
            "isCompanyEnrichmentEnabled": [
                1
            ],
            "isConfigVariablesInDbEnabled": [
                1
            ],
            "isCookieSessionEnabled": [
                1
            ],
            "isEmailVerificationRequired": [
                1
            ],
            "isEmailingDomainInDemoMode": [
                1
            ],
            "isGoogleCalendarEnabled": [
                1
            ],
            "isGoogleMessagingEnabled": [
                1
            ],
            "isImapSmtpCaldavEnabled": [
                1
            ],
            "isMicrosoftCalendarEnabled": [
                1
            ],
            "isMicrosoftMessagingEnabled": [
                1
            ],
            "isMultiWorkspaceEnabled": [
                1
            ],
            "isOnboardingAiChatEnabled": [
                1
            ],
            "isWorkspaceSchemaDDLLocked": [
                1
            ],
            "maintenance": [
                168
            ],
            "publicFeatureFlags": [
                452
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                518
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                539
            ],
            "__typename": [
                4
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                228
            ],
            "link": [
                4
            ],
            "startAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "CollectionHash": {
            "collectionName": [
                44
            ],
            "hash": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItem": {
            "applicationId": [
                567
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                567
            ],
            "availabilityType": [
                171
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                567
            ],
            "createdAt": [
                228
            ],
            "engineComponentKey": [
                262
            ],
            "frontComponent": [
                304
            ],
            "frontComponentId": [
                567
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "navigationTargetObjectMetadataId": [
                567
            ],
            "pageLayoutId": [
                567
            ],
            "payload": [
                172
            ],
            "position": [
                8
            ],
            "shortLabel": [
                4
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "workflowVersionId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                413
            ],
            "on_PathCommandMenuItemPayload": [
                438
            ],
            "__typename": [
                4
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                71
            ],
            "files": [
                295
            ],
            "__typename": [
                4
            ]
        },
        "ConnectApplicationWithApiKeyInput": {
            "apiKey": [
                4
            ],
            "applicationId": [
                567
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                567
            ],
            "archivedAt": [
                228
            ],
            "authFailedAt": [
                228
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                454
            ],
            "connectionProviderId": [
                567
            ],
            "createdAt": [
                228
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                567
            ],
            "lastCredentialsRefreshedAt": [
                228
            ],
            "lastSignedInAt": [
                228
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                176
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                228
            ],
            "userWorkspaceId": [
                567
            ],
            "visibility": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountScope": {},
        "ConnectedImapSmtpCaldavAccount": {
            "connectionParameters": [
                329
            ],
            "handle": [
                4
            ],
            "id": [
                567
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                255
            ],
            "host": [
                4
            ],
            "password": [
                4
            ],
            "port": [
                8
            ],
            "username": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ConnectionProviderScope": {},
        "CreateAgentChatChannelInput": {
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "name": [
                4
            ],
            "roleIds": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateAgentInput": {
            "avatarColor": [
                4
            ],
            "avatarShape": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                344
            ],
            "modelId": [
                4
            ],
            "name": [
                4
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                344
            ],
            "roleId": [
                567
            ],
            "triggers": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "CreateApiKeyInput": {
            "expiresAt": [
                4
            ],
            "name": [
                4
            ],
            "revokedAt": [
                4
            ],
            "roleId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                567
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                567
            ],
            "participantHandleFieldUniversalIdentifier": [
                567
            ],
            "visibility": [
                383
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                72
            ],
            "targets": [
                74
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                86
            ],
            "clientSecret": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationRegistrationInput": {
            "name": [
                4
            ],
            "oAuthRedirectUris": [
                4
            ],
            "oAuthScopes": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateApprovedAccessDomainInput": {
            "domain": [
                4
            ],
            "email": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateCalendarEventInput": {
            "addConferencing": [
                1
            ],
            "attendees": [
                4
            ],
            "connectedAccountId": [
                4
            ],
            "description": [
                4
            ],
            "endsAt": [
                4
            ],
            "isFullDay": [
                1
            ],
            "location": [
                4
            ],
            "sendInvitations": [
                1
            ],
            "startsAt": [
                4
            ],
            "timeZone": [
                4
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateCalendarEventOutput": {
            "calendarEventId": [
                4
            ],
            "conferenceLink": [
                4
            ],
            "error": [
                4
            ],
            "iCalUid": [
                4
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "CreateCommandMenuItemInput": {
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                567
            ],
            "availabilityType": [
                171
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                567
            ],
            "engineComponentKey": [
                262
            ],
            "frontComponentId": [
                567
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "navigationTargetObjectMetadataId": [
                567
            ],
            "pageLayoutId": [
                567
            ],
            "payload": [
                344
            ],
            "position": [
                8
            ],
            "shortLabel": [
                4
            ],
            "workflowVersionId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateEmailGroupChannelInput": {
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateEmailGroupChannelOutput": {
            "forwardingAddress": [
                4
            ],
            "messageChannel": [
                377
            ],
            "__typename": [
                4
            ]
        },
        "CreateEmailingDomainInput": {
            "domain": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateFieldInput": {
            "defaultValue": [
                344
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "isAuditLogged": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isNullable": [
                1
            ],
            "isRemoteCreation": [
                1
            ],
            "isSearchable": [
                1
            ],
            "isSystem": [
                1
            ],
            "isUIEditable": [
                1
            ],
            "isUIReadOnly": [
                1
            ],
            "isUnique": [
                1
            ],
            "label": [
                4
            ],
            "morphRelationsCreationPayload": [
                344
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "options": [
                344
            ],
            "relationCreationPayload": [
                344
            ],
            "settings": [
                344
            ],
            "type": [
                290
            ],
            "__typename": [
                4
            ]
        },
        "CreateFrontComponentInput": {
            "builtComponentChecksum": [
                4
            ],
            "builtComponentPath": [
                4
            ],
            "componentName": [
                4
            ],
            "description": [
                4
            ],
            "id": [
                567
            ],
            "name": [
                4
            ],
            "sourceComponentPath": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateIndexFieldInput": {
            "fieldMetadataId": [
                567
            ],
            "subFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateIndexInput": {
            "fields": [
                197
            ],
            "indexType": [
                337
            ],
            "objectMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                344
            ],
            "databaseEventTriggerSettings": [
                344
            ],
            "description": [
                4
            ],
            "httpRouteTriggerSettings": [
                344
            ],
            "id": [
                567
            ],
            "name": [
                4
            ],
            "serverRouteTriggerSettings": [
                344
            ],
            "source": [
                344
            ],
            "timeoutSeconds": [
                8
            ],
            "toolTriggerSettings": [
                344
            ],
            "universalIdentifier": [
                567
            ],
            "workflowActionTriggerSettings": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                567
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateMessageSuppressionInput": {
            "emailAddress": [
                4
            ],
            "unsubscribeTopicId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                567
            ],
            "agentId": [
                567
            ],
            "color": [
                4
            ],
            "folderId": [
                567
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "link": [
                4
            ],
            "name": [
                4
            ],
            "nativePageKey": [
                4
            ],
            "pageLayoutId": [
                567
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                567
            ],
            "targetRecordId": [
                567
            ],
            "type": [
                405
            ],
            "userWorkspaceId": [
                567
            ],
            "viewId": [
                567
            ],
            "workflowId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateObjectInput": {
            "color": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isRemote": [
                1
            ],
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "namePlural": [
                4
            ],
            "nameSingular": [
                4
            ],
            "primaryKeyColumnType": [
                4
            ],
            "primaryKeyFieldMetadataSettings": [
                344
            ],
            "shortcut": [
                4
            ],
            "skipNameField": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneFieldMetadataInput": {
            "field": [
                195
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                198
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                203
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutInput": {
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "type": [
                431
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                430
            ],
            "pageLayoutId": [
                567
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutWidgetInput": {
            "configuration": [
                344
            ],
            "objectMetadataId": [
                567
            ],
            "pageLayoutTabId": [
                567
            ],
            "position": [
                344
            ],
            "title": [
                4
            ],
            "type": [
                698
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                567
            ],
            "filter": [
                344
            ],
            "objectMetadataId": [
                567
            ],
            "orderBy": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                567
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                567
            ],
            "secondFieldMetadataId": [
                567
            ],
            "thirdFieldMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateRoleInput": {
            "canAccessAllAgentChatChannels": [
                1
            ],
            "canAccessAllTools": [
                1
            ],
            "canBeAssignedToAgents": [
                1
            ],
            "canBeAssignedToApiKeys": [
                1
            ],
            "canBeAssignedToUsers": [
                1
            ],
            "canDestroyAllObjectRecords": [
                1
            ],
            "canReadAllObjectRecords": [
                1
            ],
            "canSoftDeleteAllObjectRecords": [
                1
            ],
            "canUpdateAllObjectRecords": [
                1
            ],
            "canUpdateAllSettings": [
                1
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateSkillInput": {
            "content": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateUnsubscribeTopicInput": {
            "description": [
                4
            ],
            "name": [
                4
            ],
            "visibility": [
                571
            ],
            "__typename": [
                4
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                113
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                656
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                663
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                665
            ],
            "__typename": [
                4
            ]
        },
        "CreateValidationRuleInput": {
            "description": [
                4
            ],
            "errorFieldMetadataId": [
                567
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "message": [
                4
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                567
            ],
            "isVisible": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                8
            ],
            "viewId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                32
            ],
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "isCanonical": [
                1
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "size": [
                8
            ],
            "viewFieldGroupId": [
                567
            ],
            "viewId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                567
            ],
            "logicalOperator": [
                686
            ],
            "parentViewFilterGroupId": [
                567
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "operand": [
                687
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                567
            ],
            "subFieldName": [
                4
            ],
            "value": [
                344
            ],
            "viewFilterGroupId": [
                567
            ],
            "viewId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewGroupInput": {
            "fieldValue": [
                4
            ],
            "id": [
                567
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewInput": {
            "anyFieldFilterValue": [
                4
            ],
            "calendarEndFieldMetadataId": [
                567
            ],
            "calendarFieldMetadataId": [
                567
            ],
            "calendarLayout": [
                680
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                567
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                689
            ],
            "mainGroupByFieldMetadataId": [
                567
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "openRecordIn": [
                690
            ],
            "position": [
                8
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                693
            ],
            "visibility": [
                694
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                692
            ],
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "CreateWebhookInput": {
            "description": [
                4
            ],
            "id": [
                567
            ],
            "operations": [
                4
            ],
            "roleId": [
                567
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreditUsedItem": {
            "creditsUsed": [
                8
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "operation": [
                656
            ],
            "resource": [
                663
            ],
            "__typename": [
                4
            ]
        },
        "CursorPaging": {
            "after": [
                178
            ],
            "before": [
                178
            ],
            "first": [
                2
            ],
            "last": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "DatabaseEventAction": {},
        "DateTime": {},
        "DeleteApprovedAccessDomainInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteTwoFactorAuthenticationMethod": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldGroupInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DeletedWorkspaceMember": {
            "avatarUrl": [
                4
            ],
            "id": [
                567
            ],
            "name": [
                307
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "DevelopmentApplication": {
            "id": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "DomainRecord": {
            "key": [
                4
            ],
            "status": [
                4
            ],
            "type": [
                4
            ],
            "validationType": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "DomainValidRecords": {
            "domain": [
                4
            ],
            "id": [
                567
            ],
            "isCustomDomainEnabled": [
                1
            ],
            "records": [
                248
            ],
            "__typename": [
                4
            ]
        },
        "DuplicatedDashboard": {
            "createdAt": [
                4
            ],
            "id": [
                567
            ],
            "pageLayoutId": [
                567
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "DuplicatedMessageList": {
            "createdAt": [
                4
            ],
            "description": [
                4
            ],
            "id": [
                567
            ],
            "memberCount": [
                8
            ],
            "name": [
                4
            ],
            "position": [
                8
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EditSso": {
            "id": [
                567
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                499
            ],
            "type": [
                324
            ],
            "__typename": [
                4
            ]
        },
        "EditSsoInput": {
            "id": [
                567
            ],
            "status": [
                499
            ],
            "__typename": [
                4
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                179
            ],
            "IMAP": [
                179
            ],
            "SMTP": [
                179
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EmailConnectionSecurity": {},
        "EmailPasswordResetLink": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                228
            ],
            "domain": [
                4
            ],
            "id": [
                567
            ],
            "status": [
                259
            ],
            "tenantStatus": [
                260
            ],
            "unsubscribeHostnameStatus": [
                569
            ],
            "updatedAt": [
                228
            ],
            "verificationRecords": [
                675
            ],
            "verifiedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "EngineComponentKey": {},
        "EnqueueJobInput": {
            "delayMs": [
                2
            ],
            "jobId": [
                4
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payload": [
                344
            ],
            "retryLimit": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "EnqueueJobItemInput": {
            "jobId": [
                4
            ],
            "payload": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "EnqueueJobResult": {
            "enqueued": [
                1
            ],
            "jobId": [
                4
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EnqueueJobsInput": {
            "delayMs": [
                2
            ],
            "jobs": [
                264
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payloads": [
                344
            ],
            "retryLimit": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "EnqueueJobsResult": {
            "availableBytes": [
                8
            ],
            "enqueued": [
                1
            ],
            "enqueuedJobsCount": [
                2
            ],
            "jobIds": [
                4
            ],
            "jobs": [
                268
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EnqueuedJob": {
            "jobId": [
                4
            ],
            "sizeBytes": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "EnterpriseLicenseInfoDTO": {
            "expiresAt": [
                228
            ],
            "isValid": [
                1
            ],
            "licensee": [
                4
            ],
            "subscriptionId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EnterpriseSubscriptionStatusDTO": {
            "cancelAt": [
                228
            ],
            "currentPeriodEnd": [
                228
            ],
            "expiresAt": [
                228
            ],
            "isCancellationScheduled": [
                1
            ],
            "licensee": [
                4
            ],
            "status": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EventLogDateRangeInput": {
            "end": [
                228
            ],
            "start": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "EventLogFieldFilterInput": {
            "field": [
                4
            ],
            "operand": [
                273
            ],
            "values": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EventLogFilterOperand": {},
        "EventLogFiltersInput": {
            "dateRange": [
                271
            ],
            "eventType": [
                4
            ],
            "fieldFilters": [
                272
            ],
            "objectMetadataId": [
                4
            ],
            "recordId": [
                4
            ],
            "userWorkspaceId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EventLogPageInfo": {
            "endCursor": [
                4
            ],
            "hasNextPage": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryInput": {
            "after": [
                4
            ],
            "filters": [
                274
            ],
            "first": [
                2
            ],
            "table": [
                279
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                275
            ],
            "records": [
                278
            ],
            "totalCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "EventLogRecord": {
            "event": [
                4
            ],
            "isCustom": [
                1
            ],
            "objectMetadataId": [
                4
            ],
            "properties": [
                344
            ],
            "recordId": [
                4
            ],
            "timestamp": [
                228
            ],
            "userId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EventLogTable": {},
        "EventSubscription": {
            "eventStreamId": [
                4
            ],
            "metadataEvents": [
                392
            ],
            "objectRecordEventsWithQueryIds": [
                420
            ],
            "queueJobEvents": [
                347
            ],
            "__typename": [
                4
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                567
            ],
            "payload": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlag": {
            "key": [
                283
            ],
            "value": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlagKey": {},
        "Field": {
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "defaultValue": [
                344
            ],
            "description": [
                4
            ],
            "disabledFieldPermissionActions": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isAuditLogged": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isNullable": [
                1
            ],
            "isSearchable": [
                1
            ],
            "isSystem": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "isUIEditable": [
                1
            ],
            "isUIReadOnly": [
                1
            ],
            "isUnique": [
                1
            ],
            "label": [
                4
            ],
            "morphId": [
                567
            ],
            "morphRelations": [
                473
            ],
            "name": [
                4
            ],
            "object": [
                407
            ],
            "objectMetadataId": [
                567
            ],
            "options": [
                344
            ],
            "relation": [
                473
            ],
            "settings": [
                344
            ],
            "type": [
                290
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                697
            ],
            "fieldDisplayMode": [
                287
            ],
            "fieldMetadataId": [
                4
            ],
            "isUIEditable": [
                1
            ],
            "nestedRelationFieldMetadataId": [
                4
            ],
            "viewId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "FieldConnection": {
            "edges": [
                288
            ],
            "pageInfo": [
                427
            ],
            "__typename": [
                4
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                178
            ],
            "node": [
                284
            ],
            "__typename": [
                4
            ]
        },
        "FieldFilter": {
            "and": [
                289
            ],
            "id": [
                568
            ],
            "isActive": [
                142
            ],
            "isSystem": [
                142
            ],
            "isUIEditable": [
                142
            ],
            "isUIReadOnly": [
                142
            ],
            "objectMetadataId": [
                568
            ],
            "or": [
                289
            ],
            "__typename": [
                4
            ]
        },
        "FieldMetadataType": {},
        "FieldPermission": {
            "canReadFieldValue": [
                1
            ],
            "canUpdateFieldValue": [
                1
            ],
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "objectMetadataId": [
                567
            ],
            "roleId": [
                567
            ],
            "rowLevelPermissionPredicateGroupId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "FieldPermissionInput": {
            "canReadFieldValue": [
                1
            ],
            "canUpdateFieldValue": [
                1
            ],
            "fieldMetadataId": [
                567
            ],
            "objectMetadataId": [
                567
            ],
            "rowLevelPermissionPredicateGroupId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                697
            ],
            "newFieldDefaultVisibility": [
                1
            ],
            "shouldAllowUserToSeeHiddenFields": [
                1
            ],
            "viewId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "File": {
            "createdAt": [
                228
            ],
            "id": [
                567
            ],
            "path": [
                4
            ],
            "size": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "FileAttachmentInput": {
            "filename": [
                4
            ],
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "FileFolder": {},
        "FileUploadTarget": {
            "contentType": [
                4
            ],
            "expiresAt": [
                228
            ],
            "fileId": [
                567
            ],
            "uploadUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "FileWithSignedUrl": {
            "createdAt": [
                228
            ],
            "id": [
                567
            ],
            "path": [
                4
            ],
            "size": [
                8
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "FilesConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                567
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                499
            ],
            "type": [
                324
            ],
            "workspace": [
                718
            ],
            "__typename": [
                4
            ]
        },
        "FindMessageSuppressionsInput": {
            "limit": [
                2
            ],
            "offset": [
                2
            ],
            "reason": [
                390
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                697
            ],
            "fieldMetadataId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponent": {
            "applicationGrantedCapabilities": [
                4
            ],
            "applicationGrantedIframeMediaPermissions": [
                326
            ],
            "applicationId": [
                567
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                91
            ],
            "applicationVariables": [
                344
            ],
            "builtComponentChecksum": [
                4
            ],
            "builtComponentPath": [
                4
            ],
            "componentName": [
                4
            ],
            "createdAt": [
                228
            ],
            "description": [
                4
            ],
            "frontComponentSharedDependenciesChecksum": [
                4
            ],
            "id": [
                567
            ],
            "isHeadless": [
                1
            ],
            "name": [
                4
            ],
            "sourceComponentPath": [
                4
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "usesSdkClient": [
                1
            ],
            "widgetAvailability": [
                306
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                697
            ],
            "frontComponentId": [
                567
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                567
            ],
            "pageLayoutType": [
                431
            ],
            "__typename": [
                4
            ]
        },
        "FullName": {
            "firstName": [
                4
            ],
            "lastName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GenerateInput": {
            "input": [
                493
            ],
            "instructions": [
                4
            ],
            "modelId": [
                4
            ],
            "responseFormat": [
                344
            ],
            "runId": [
                567
            ],
            "scope": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "GenerateResult": {
            "error": [
                4
            ],
            "object": [
                344
            ],
            "runId": [
                567
            ],
            "success": [
                1
            ],
            "text": [
                4
            ],
            "usage": [
                41
            ],
            "__typename": [
                4
            ]
        },
        "GetApiKeyInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "GetAuthorizationUrlForSSO": {
            "authorizationURL": [
                4
            ],
            "id": [
                567
            ],
            "type": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GetAuthorizationUrlForSSOInput": {
            "identityProviderId": [
                567
            ],
            "workspaceInviteHash": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedProgress": {
            "completedStepActionKeys": [
                314
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                314
            ],
            "snoozedUntil": [
                4
            ],
            "steps": [
                315
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                314
            ],
            "description": [
                4
            ],
            "doneChatThreadId": [
                4
            ],
            "doneDescription": [
                4
            ],
            "doneTitle": [
                4
            ],
            "doneWorkflowId": [
                4
            ],
            "icon": [
                4
            ],
            "iconColor": [
                4
            ],
            "kind": [
                316
            ],
            "prompt": [
                4
            ],
            "promptLabel": [
                4
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepKind": {},
        "GettingStartedWorkflow": {
            "versionId": [
                4
            ],
            "workflowId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedWorkflowPreview": {
            "actions": [
                319
            ],
            "stepActionKey": [
                314
            ],
            "trigger": [
                320
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedWorkflowPreviewAction": {
            "title": [
                4
            ],
            "type": [
                699
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedWorkflowPreviewTrigger": {
            "databaseEventAction": [
                4
            ],
            "title": [
                4
            ],
            "type": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GrantApplicationCapabilitiesInput": {
            "applicationId": [
                567
            ],
            "capabilities": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GraphOrderBy": {},
        "GridPosition": {
            "column": [
                8
            ],
            "columnSpan": [
                8
            ],
            "row": [
                8
            ],
            "rowSpan": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                697
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "IframeMediaPermission": {
            "camera": [
                1
            ],
            "microphone": [
                1
            ],
            "origin": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "IframeMediaPermissionInput": {
            "camera": [
                1
            ],
            "microphone": [
                1
            ],
            "origin": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ImapSmtpCaldavConnectionSuccess": {
            "connectedAccountId": [
                4
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ImapSmtpCaldavPublicConnectionParameters": {
            "CALDAV": [
                330
            ],
            "IMAP": [
                330
            ],
            "SMTP": [
                330
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ImapSmtpCaldavPublicConnectionParams": {
            "connectionSecurity": [
                255
            ],
            "host": [
                4
            ],
            "port": [
                8
            ],
            "username": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Impersonate": {
            "loginToken": [
                98
            ],
            "workspace": [
                722
            ],
            "__typename": [
                4
            ]
        },
        "InboxThreadRecordInput": {
            "objectNameSingular": [
                4
            ],
            "recordId": [
                567
            ],
            "threadId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "id": [
                567
            ],
            "indexFieldMetadataList": [
                335
            ],
            "indexType": [
                337
            ],
            "indexWhereClause": [
                4
            ],
            "isCustom": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "isUnique": [
                1
            ],
            "name": [
                4
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "IndexEdge": {
            "cursor": [
                178
            ],
            "node": [
                333
            ],
            "__typename": [
                4
            ]
        },
        "IndexField": {
            "createdAt": [
                228
            ],
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "order": [
                8
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "IndexFilter": {
            "and": [
                336
            ],
            "id": [
                568
            ],
            "isCustom": [
                142
            ],
            "or": [
                336
            ],
            "__typename": [
                4
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                567
            ],
            "messages": [
                56
            ],
            "__typename": [
                4
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                340
            ],
            "__typename": [
                4
            ]
        },
        "IngestedAppMessage": {
            "externalId": [
                4
            ],
            "hasAttachments": [
                1
            ],
            "messageId": [
                567
            ],
            "messageThreadId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "InitiateTwoFactorAuthenticationProvisioning": {
            "uri": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "InvalidatePassword": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "InviteSuggestion": {
            "displayName": [
                4
            ],
            "email": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "JSON": {},
        "JSONObject": {},
        "JobState": {},
        "JobStatus": {
            "attemptsMade": [
                2
            ],
            "enqueuedAt": [
                8
            ],
            "failedReason": [
                4
            ],
            "finishedAt": [
                8
            ],
            "jobId": [
                4
            ],
            "progress": [
                2
            ],
            "startedAt": [
                8
            ],
            "state": [
                346
            ],
            "__typename": [
                4
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                567
            ],
            "aggregateOperation": [
                32
            ],
            "axisNameDisplay": [
                106
            ],
            "color": [
                4
            ],
            "configurationType": [
                697
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "displayLegend": [
                1
            ],
            "filter": [
                344
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "isCumulative": [
                1
            ],
            "isStacked": [
                1
            ],
            "numberFormat": [
                157
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                421
            ],
            "primaryAxisGroupByFieldMetadataId": [
                567
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                322
            ],
            "rangeMax": [
                8
            ],
            "rangeMin": [
                8
            ],
            "secondaryAxisGroupByDateGranularity": [
                421
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                567
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                322
            ],
            "splitMultiValueFields": [
                1
            ],
            "timezone": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "LineChartData": {
            "formattedToRawLookup": [
                344
            ],
            "hasTooManyGroups": [
                1
            ],
            "series": [
                352
            ],
            "showDataLabels": [
                1
            ],
            "showLegend": [
                1
            ],
            "xAxisLabel": [
                4
            ],
            "yAxisLabel": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "LineChartDataInput": {
            "configuration": [
                344
            ],
            "objectMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "LineChartDataPoint": {
            "x": [
                4
            ],
            "y": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "LineChartSeries": {
            "data": [
                351
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ListAppConnectionsInput": {
            "providerName": [
                4
            ],
            "scope": [
                176
            ],
            "userWorkspaceId": [
                4
            ],
            "visibility": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageChannelsInput": {
            "connectedAccountId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "Location": {
            "lat": [
                8
            ],
            "lng": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunction": {
            "applicationId": [
                567
            ],
            "canRunOnDemand": [
                1
            ],
            "createdAt": [
                228
            ],
            "cronTriggerSettings": [
                344
            ],
            "databaseEventTriggerSettings": [
                344
            ],
            "description": [
                4
            ],
            "executionMode": [
                358
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                344
            ],
            "id": [
                567
            ],
            "name": [
                4
            ],
            "runtime": [
                4
            ],
            "sourceHandlerPath": [
                4
            ],
            "timeoutSeconds": [
                8
            ],
            "toolTriggerSettings": [
                344
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "workflowActionTriggerSettings": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                344
            ],
            "duration": [
                8
            ],
            "error": [
                344
            ],
            "logs": [
                4
            ],
            "status": [
                360
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "LogicFunctionIdInput": {
            "id": [
                19
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogs": {
            "logs": [
                4
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                567
            ],
            "applicationUniversalIdentifier": [
                567
            ],
            "id": [
                567
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "LoginToken": {
            "loginToken": [
                98
            ],
            "__typename": [
                4
            ]
        },
        "MarkAppChannelThreadAsReadInput": {
            "messageChannelId": [
                567
            ],
            "messageThreadId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceApp": {
            "author": [
                4
            ],
            "category": [
                4
            ],
            "connectUrl": [
                4
            ],
            "description": [
                4
            ],
            "id": [
                4
            ],
            "isListed": [
                1
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "sourcePackage": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppDetail": {
            "aboutDescription": [
                4
            ],
            "author": [
                4
            ],
            "billsCredits": [
                1
            ],
            "category": [
                4
            ],
            "connectUrl": [
                4
            ],
            "content": [
                64
            ],
            "defaultRoleUniversalIdentifier": [
                4
            ],
            "description": [
                4
            ],
            "emailSupport": [
                4
            ],
            "galleryImages": [
                4
            ],
            "id": [
                4
            ],
            "installCount": [
                2
            ],
            "isListed": [
                1
            ],
            "issueReportUrl": [
                4
            ],
            "latestAvailableVersion": [
                4
            ],
            "logoUrl": [
                4
            ],
            "manifest": [
                344
            ],
            "name": [
                4
            ],
            "objects": [
                368
            ],
            "pricingDescription": [
                4
            ],
            "requestedCapabilities": [
                4
            ],
            "requestedIframeMediaPermissions": [
                326
            ],
            "roles": [
                369
            ],
            "screenshots": [
                4
            ],
            "sourcePackage": [
                4
            ],
            "sourceType": [
                87
            ],
            "termsUrl": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "websiteUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppObject": {
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppRole": {
            "canAccessAllTools": [
                1
            ],
            "canDestroyAllObjectRecords": [
                1
            ],
            "canReadAllObjectRecords": [
                1
            ],
            "canSoftDeleteAllObjectRecords": [
                1
            ],
            "canUpdateAllObjectRecords": [
                1
            ],
            "canUpdateAllSettings": [
                1
            ],
            "description": [
                4
            ],
            "fieldPermissions": [
                370
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                371
            ],
            "permissionFlagUniversalIdentifiers": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppRoleFieldPermission": {
            "canReadFieldValue": [
                1
            ],
            "canUpdateFieldValue": [
                1
            ],
            "fieldUniversalIdentifier": [
                4
            ],
            "objectUniversalIdentifier": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppRoleObjectPermission": {
            "canDestroyObjectRecords": [
                1
            ],
            "canReadObjectRecords": [
                1
            ],
            "canSoftDeleteObjectRecords": [
                1
            ],
            "canUpdateObjectRecords": [
                1
            ],
            "objectUniversalIdentifier": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "McpServer": {
            "applicationId": [
                567
            ],
            "connectionProviderId": [
                567
            ],
            "createdAt": [
                228
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "tools": [
                373
            ],
            "toolsSyncError": [
                4
            ],
            "toolsSyncedAt": [
                228
            ],
            "updatedAt": [
                228
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "McpServerTool": {
            "annotations": [
                344
            ],
            "description": [
                4
            ],
            "inputSchema": [
                344
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignSendBlockerDTO": {
            "code": [
                4
            ],
            "message": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MessageChannel": {
            "canStartConversation": [
                1
            ],
            "connectedAccount": [
                175
            ],
            "connectedAccountId": [
                567
            ],
            "contactAutoCreationPolicy": [
                378
            ],
            "createdAt": [
                228
            ],
            "displayName": [
                4
            ],
            "excludeGroupEmails": [
                1
            ],
            "excludeNonProfessionalEmails": [
                1
            ],
            "handle": [
                4
            ],
            "id": [
                567
            ],
            "importProgress": [
                2
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "messageFolderImportPolicy": [
                385
            ],
            "messagingProviderUniversalIdentifier": [
                567
            ],
            "participantHandleFieldUniversalIdentifier": [
                567
            ],
            "pendingGroupEmailsAction": [
                379
            ],
            "syncStage": [
                380
            ],
            "syncStageStartedAt": [
                228
            ],
            "syncStatus": [
                381
            ],
            "syncedAt": [
                228
            ],
            "throttleFailureCount": [
                8
            ],
            "throttleRetryAfter": [
                228
            ],
            "type": [
                382
            ],
            "updatedAt": [
                228
            ],
            "visibility": [
                383
            ],
            "__typename": [
                4
            ]
        },
        "MessageChannelContactAutoCreationPolicy": {},
        "MessageChannelPendingGroupEmailsAction": {},
        "MessageChannelSyncStage": {},
        "MessageChannelSyncStatus": {},
        "MessageChannelType": {},
        "MessageChannelVisibility": {},
        "MessageFolder": {
            "createdAt": [
                228
            ],
            "externalId": [
                4
            ],
            "id": [
                567
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                567
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                386
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "MessageFolderImportPolicy": {},
        "MessageFolderPendingSyncAction": {},
        "MessageParticipantRole": {},
        "MessageSuppression": {
            "createdAt": [
                228
            ],
            "emailAddress": [
                4
            ],
            "id": [
                567
            ],
            "reason": [
                390
            ],
            "source": [
                391
            ],
            "unsubscribeTopicId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                388
            ],
            "totalCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionReason": {},
        "MessageSuppressionSource": {},
        "MetadataEvent": {
            "metadataName": [
                4
            ],
            "properties": [
                419
            ],
            "recordId": [
                4
            ],
            "type": [
                393
            ],
            "updatedCollectionHash": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MetadataEventAction": {},
        "MetadataTranslation": {
            "canonicalValue": [
                4
            ],
            "locale": [
                4
            ],
            "metadataName": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "property": [
                4
            ],
            "provenance": [
                396
            ],
            "recordId": [
                567
            ],
            "sourceValue": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MetadataTranslationOverrideInput": {
            "locale": [
                4
            ],
            "property": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MetadataTranslationProvenance": {},
        "MetadataTranslationsInput": {
            "fieldMetadataId": [
                567
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                169
            ],
            "objectMetadataItems": [
                399
            ],
            "views": [
                400
            ],
            "__typename": [
                4
            ]
        },
        "MinimalObjectMetadata": {
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isRemote": [
                1
            ],
            "isSystem": [
                1
            ],
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "namePlural": [
                4
            ],
            "nameSingular": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MinimalView": {
            "id": [
                567
            ],
            "key": [
                689
            ],
            "objectMetadataId": [
                567
            ],
            "type": [
                693
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                529,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                703,
                {
                    "data": [
                        3,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                25,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "addQueryToEventStream": [
                1,
                {
                    "input": [
                        5,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "approveApplicationIframeMediaPermissions": [
                58,
                {
                    "applicationId": [
                        567,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        327,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "archiveInboxThread": [
                1,
                {
                    "input": [
                        95,
                        "ArchiveInboxThreadInput!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                1,
                {
                    "assigneeWorkspaceMemberId": [
                        567
                    ],
                    "threadId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        567,
                        "UUID!"
                    ],
                    "roleId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        567,
                        "UUID!"
                    ],
                    "roleId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                1,
                {
                    "input": [
                        332,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                101,
                {
                    "clientId": [
                        4,
                        "String!"
                    ],
                    "codeChallenge": [
                        4
                    ],
                    "issuer": [
                        4
                    ],
                    "redirectUrl": [
                        4,
                        "String!"
                    ],
                    "resource": [
                        4
                    ],
                    "scope": [
                        4
                    ],
                    "state": [
                        4
                    ]
                }
            ],
            "cancelMessageCampaign": [
                153,
                {
                    "input": [
                        152,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                140
            ],
            "cancelSwitchBillingPlan": [
                140
            ],
            "cancelSwitchResourceCreditPrice": [
                140
            ],
            "checkCustomDomainValidRecords": [
                249
            ],
            "checkPublicDomainValidRecords": [
                249,
                {
                    "domain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                133,
                {
                    "plan": [
                        124,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        537,
                        "SubscriptionInterval!"
                    ],
                    "requirePaymentMethod": [
                        1,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        4
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                86,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                86,
                {
                    "fileId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                173,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "fileIds": [
                        567,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                425,
                {
                    "hasBookedCall": [
                        1,
                        "Boolean!"
                    ],
                    "isAutoSkipped": [
                        1,
                        "Boolean!"
                    ]
                }
            ],
            "completeFileUpload": [
                299,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                299,
                {
                    "fileId": [
                        4,
                        "String!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceLogoUpload": [
                299,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                299,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "connectApplicationWithApiKey": [
                567,
                {
                    "input": [
                        174,
                        "ConnectApplicationWithApiKeyInput!"
                    ]
                }
            ],
            "createAgentChatChannel": [
                7,
                {
                    "input": [
                        181,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                48,
                {
                    "input": [
                        183,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                377,
                {
                    "input": [
                        184,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                185,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "files": [
                        73,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                186,
                {
                    "input": [
                        187,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                94,
                {
                    "input": [
                        188,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                122
            ],
            "createCalendarEvent": [
                190,
                {
                    "input": [
                        189,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                18,
                {
                    "channelId": [
                        567
                    ]
                }
            ],
            "createCommandMenuItem": [
                170,
                {
                    "input": [
                        191,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                247,
                {
                    "name": [
                        4,
                        "String!"
                    ],
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                193,
                {
                    "input": [
                        192,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                258,
                {
                    "input": [
                        194,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                298,
                {
                    "fieldMetadataId": [
                        4
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        4
                    ],
                    "fileFolder": [
                        297,
                        "FileFolder!"
                    ],
                    "filename": [
                        4,
                        "String!"
                    ],
                    "size": [
                        8,
                        "Float!"
                    ]
                }
            ],
            "createFrontComponent": [
                304,
                {
                    "input": [
                        196,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                404,
                {
                    "inputs": [
                        202,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                683,
                {
                    "inputs": [
                        217,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                682,
                {
                    "inputs": [
                        218,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                688,
                {
                    "inputs": [
                        221,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                372,
                {
                    "input": [
                        200,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                388,
                {
                    "input": [
                        201,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                404,
                {
                    "input": [
                        202,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                298,
                {
                    "filename": [
                        4,
                        "String!"
                    ],
                    "size": [
                        8,
                        "Float!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                526,
                {
                    "input": [
                        524,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                45,
                {
                    "event": [
                        4,
                        "String!"
                    ],
                    "objectMetadataId": [
                        567,
                        "UUID!"
                    ],
                    "properties": [
                        344
                    ],
                    "recordId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                6,
                {
                    "input": [
                        182,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                284,
                {
                    "input": [
                        204,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                333,
                {
                    "input": [
                        205,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                357,
                {
                    "input": [
                        199,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                407,
                {
                    "input": [
                        206,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                480,
                {
                    "createRoleInput": [
                        212,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                428,
                {
                    "input": [
                        207,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                429,
                {
                    "input": [
                        208,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                432,
                {
                    "input": [
                        209,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                451,
                {
                    "applicationId": [
                        4,
                        "String!"
                    ],
                    "domain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "createRelatedRecordPath": [
                472,
                {
                    "input": [
                        211,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                526,
                {
                    "input": [
                        525,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                529,
                {
                    "input": [
                        213,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                122,
                {
                    "idempotencyKey": [
                        4,
                        "String!"
                    ],
                    "plan": [
                        124,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        537,
                        "SubscriptionInterval!"
                    ],
                    "requirePaymentMethod": [
                        1,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        4
                    ]
                }
            ],
            "createUnsubscribeTopic": [
                570,
                {
                    "input": [
                        214,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                654,
                {
                    "input": [
                        215,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                674,
                {
                    "input": [
                        216,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                679,
                {
                    "input": [
                        222,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                682,
                {
                    "input": [
                        218,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                683,
                {
                    "input": [
                        217,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                684,
                {
                    "input": [
                        220,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                685,
                {
                    "input": [
                        219,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                688,
                {
                    "input": [
                        221,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                691,
                {
                    "input": [
                        223,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                695,
                {
                    "input": [
                        224,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                529,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        567,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        567
                    ]
                }
            ],
            "deleteAppKeyValue": [
                1,
                {
                    "key": [
                        4,
                        "String!"
                    ],
                    "scope": [
                        53
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                377,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteApplicationRegistration": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                1,
                {
                    "input": [
                        229,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                170,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                175,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                703
            ],
            "deleteEmailGroupChannel": [
                377,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteEmailingDomain": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                304,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                404,
                {
                    "ids": [
                        567,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                372,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                404,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                6,
                {
                    "input": [
                        22,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                284,
                {
                    "input": [
                        230,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                333,
                {
                    "input": [
                        231,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                357,
                {
                    "input": [
                        361,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                407,
                {
                    "input": [
                        232,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                4,
                {
                    "roleId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deletePublicDomain": [
                1,
                {
                    "domain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteQueuedChatMessage": [
                1,
                {
                    "messageId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                472,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                233,
                {
                    "input": [
                        234,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                529,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                235,
                {
                    "twoFactorAuthenticationMethodId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteUnsubscribeTopic": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteUsageLimit": [
                1,
                {
                    "usageLimitId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                667
            ],
            "deleteUserFromWorkspace": [
                671,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                674,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteView": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteViewField": [
                682,
                {
                    "input": [
                        237,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                683,
                {
                    "input": [
                        236,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                684,
                {
                    "input": [
                        238,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilterGroup": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteViewGroup": [
                688,
                {
                    "input": [
                        239,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                1,
                {
                    "input": [
                        240,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                695,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "deleteWorkspaceInvitation": [
                4,
                {
                    "appTokenId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayout": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayoutTab": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayoutWidget": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyView": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyViewField": [
                682,
                {
                    "input": [
                        243,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                683,
                {
                    "input": [
                        242,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                684,
                {
                    "input": [
                        244,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilterGroup": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyViewGroup": [
                688,
                {
                    "input": [
                        245,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                1,
                {
                    "input": [
                        246,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                1,
                {
                    "input": [
                        332,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                175,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                250,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                251,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                252,
                {
                    "input": [
                        253,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                256,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "workspaceId": [
                        567
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                116
            ],
            "enqueueJob": [
                265,
                {
                    "input": [
                        263,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                267,
                {
                    "input": [
                        266,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                707
            ],
            "executeOneLogicFunction": [
                359,
                {
                    "input": [
                        281,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                309,
                {
                    "input": [
                        308,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                50,
                {
                    "apiKeyId": [
                        567,
                        "UUID!"
                    ],
                    "expiresAt": [
                        4,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                91,
                {
                    "applicationId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                98
            ],
            "generateTransientToken": [
                548
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                562,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                564,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                100,
                {
                    "loginToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromOTP": [
                100,
                {
                    "captchaToken": [
                        4
                    ],
                    "loginToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ],
                    "otp": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromSSOExchangeToken": [
                100,
                {
                    "ssoExchangeToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                565,
                {
                    "captchaToken": [
                        4
                    ],
                    "loginToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ],
                    "recoveryCode": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                311,
                {
                    "input": [
                        312,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                364,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "locale": [
                        4
                    ],
                    "origin": [
                        4,
                        "String!"
                    ],
                    "password": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ]
                }
            ],
            "goBackToPreviousOnboardingStep": [
                424
            ],
            "grantApplicationCapabilities": [
                60,
                {
                    "input": [
                        321,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                331,
                {
                    "userId": [
                        567,
                        "UUID!"
                    ],
                    "workspaceId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                339,
                {
                    "input": [
                        338,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                341,
                {
                    "loginToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ]
                }
            ],
            "initiateOTPProvisioningForAuthenticatedUser": [
                341
            ],
            "installApplication": [
                58,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ],
                    "version": [
                        4
                    ]
                }
            ],
            "installMarketplaceApp": [
                1,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ],
                    "version": [
                        4
                    ]
                }
            ],
            "markAgentChatThreadAsDoneInChannel": [
                1,
                {
                    "threadId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "markAppChannelThreadAsRead": [
                1,
                {
                    "input": [
                        365,
                        "MarkAppChannelThreadAsReadInput!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        567
                    ],
                    "threadId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                567,
                {
                    "workspaceMemberId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                317,
                {
                    "stepActionKey": [
                        314,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                1
            ],
            "releaseEnterpriseServerBinding": [
                269
            ],
            "removeAgentChatMessageReaction": [
                25,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        475,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                467,
                {
                    "principal": [
                        464,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        471,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                91,
                {
                    "applicationRefreshToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                100,
                {
                    "appToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "reopenAgentChatThreadInChannel": [
                1,
                {
                    "threadId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        476,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                477,
                {
                    "affiliatePartnerName": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resendWorkspaceInvitation": [
                514,
                {
                    "appTokenId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetAiChatAssistantProfile": [
                34
            ],
            "resetCommandMenuItem": [
                170,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                429,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                428,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                432,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                543,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                506,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                2
            ],
            "revokeApiKey": [
                48,
                {
                    "input": [
                        478,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "revokeWorkspaceApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                482,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                495,
                {
                    "input": [
                        491,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                328,
                {
                    "connectionParameters": [
                        254,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        4,
                        "String!"
                    ],
                    "id": [
                        567
                    ]
                }
            ],
            "sendAppChannelMessage": [
                505,
                {
                    "input": [
                        504,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                506,
                {
                    "browsingContext": [
                        344
                    ],
                    "channelId": [
                        567
                    ],
                    "fileAttachments": [
                        296,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        1
                    ],
                    "isAssistantParticipant": [
                        1
                    ],
                    "mentionedWorkspaceMemberIds": [
                        567,
                        "[UUID!]"
                    ],
                    "messageId": [
                        567,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        567,
                        "[UUID!]"
                    ],
                    "shouldAssistantReply": [
                        1
                    ],
                    "text": [
                        4,
                        "String!"
                    ],
                    "threadId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                509,
                {
                    "input": [
                        508,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                513,
                {
                    "input": [
                        512,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                514,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        567
                    ]
                }
            ],
            "sendMessageCampaign": [
                516,
                {
                    "input": [
                        515,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                511,
                {
                    "input": [
                        517,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                52,
                {
                    "input": [
                        519,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setAppMessageThreadReadState": [
                521,
                {
                    "input": [
                        520,
                        "SetAppMessageThreadReadStateInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                121,
                {
                    "partnerCode": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                269,
                {
                    "enterpriseKey": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                467,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        471,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                467,
                {
                    "accessLevel": [
                        463,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        464,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        471,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                140,
                {
                    "priceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                105,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "locale": [
                        4
                    ],
                    "password": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ]
                }
            ],
            "signOut": [
                1,
                {
                    "refreshToken": [
                        4
                    ]
                }
            ],
            "signUp": [
                105,
                {
                    "affiliatePartnerName": [
                        4
                    ],
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "locale": [
                        4
                    ],
                    "password": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ]
                }
            ],
            "signUpInNewWorkspace": [
                527,
                {
                    "input": [
                        528
                    ]
                }
            ],
            "signUpInWorkspace": [
                527,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "locale": [
                        4
                    ],
                    "password": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ],
                    "workspaceId": [
                        567
                    ],
                    "workspaceInviteHash": [
                        4
                    ],
                    "workspacePersonalInviteToken": [
                        4
                    ]
                }
            ],
            "skipSyncEmailOnboardingStep": [
                425,
                {
                    "isAutoSkipped": [
                        1,
                        "Boolean!"
                    ]
                }
            ],
            "snoozeAgentChatThreadInChannel": [
                1,
                {
                    "snoozedUntil": [
                        228,
                        "DateTime!"
                    ],
                    "threadId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "startAppChannelConversation": [
                505,
                {
                    "input": [
                        531,
                        "StartAppChannelConversationInput!"
                    ]
                }
            ],
            "startChannelSync": [
                156,
                {
                    "connectedAccountId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                532,
                {
                    "companyContext": [
                        344
                    ],
                    "personContext": [
                        344
                    ]
                }
            ],
            "stopAgentChatStream": [
                1,
                {
                    "threadId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        533,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                534
            ],
            "switchBillingPlan": [
                140,
                {
                    "plan": [
                        124
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                140
            ],
            "syncAppMessageFolders": [
                384,
                {
                    "input": [
                        541,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                717,
                {
                    "dryRun": [
                        1
                    ],
                    "inferDeletionFromMissingEntities": [
                        1
                    ],
                    "manifest": [
                        344,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                1
            ],
            "syncMcpServerTools": [
                372,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "trackAnalytics": [
                45,
                {
                    "event": [
                        4
                    ],
                    "name": [
                        4
                    ],
                    "properties": [
                        344
                    ],
                    "type": [
                        46,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                86,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ],
                    "targetWorkspaceSubdomain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "triggerAddPeopleToMessageListJob": [
                550,
                {
                    "input": [
                        549,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                554,
                {
                    "input": [
                        551,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                553,
                {
                    "input": [
                        552,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                558,
                {
                    "input": [
                        555,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                557,
                {
                    "input": [
                        556,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                560,
                {
                    "input": [
                        559,
                        "TriggerUpgradeApplicationInput!"
                    ]
                }
            ],
            "uninstallApplication": [
                1,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "updateAgentChatChannel": [
                7,
                {
                    "channelId": [
                        567,
                        "UUID!"
                    ],
                    "input": [
                        572,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateAgentChatThreadInboxState": [
                20,
                {
                    "action": [
                        16,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        228
                    ],
                    "threadIds": [
                        567,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                48,
                {
                    "input": [
                        574,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                377,
                {
                    "input": [
                        575,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                58,
                {
                    "id": [
                        567,
                        "UUID!"
                    ],
                    "input": [
                        576,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                86,
                {
                    "input": [
                        577,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                90,
                {
                    "input": [
                        579,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                143,
                {
                    "input": [
                        581,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                170,
                {
                    "input": [
                        583,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                377,
                {
                    "input": [
                        584,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                304,
                {
                    "input": [
                        586,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                313,
                {
                    "input": [
                        588,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                282,
                {
                    "input": [
                        589,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                404,
                {
                    "inputs": [
                        602,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                407,
                {
                    "inputs": [
                        603,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                688,
                {
                    "inputs": [
                        625,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                372,
                {
                    "input": [
                        592,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                377,
                {
                    "input": [
                        594,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                384,
                {
                    "input": [
                        596,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                384,
                {
                    "input": [
                        598,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateMyUserApplicationVariable": [
                1,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "key": [
                        4,
                        "String!"
                    ],
                    "value": [
                        4,
                        "String!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                404,
                {
                    "input": [
                        602,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                6,
                {
                    "input": [
                        573,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        567
                    ],
                    "key": [
                        4,
                        "String!"
                    ],
                    "value": [
                        4,
                        "String!"
                    ]
                }
            ],
            "updateOneField": [
                284,
                {
                    "input": [
                        601,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        590,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                407,
                {
                    "input": [
                        603,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                480,
                {
                    "updateRoleInput": [
                        610,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                428,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        604,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                429,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        605,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                432,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        607,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                428,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        609,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                342,
                {
                    "newPassword": [
                        4,
                        "String!"
                    ],
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "updateSkill": [
                529,
                {
                    "input": [
                        612,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                543,
                {
                    "input": [
                        613,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                570,
                {
                    "input": [
                        614,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                654,
                {
                    "input": [
                        615,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                115,
                {
                    "userCreditsFallback": [
                        669,
                        "UserCreditsFallback!"
                    ]
                }
            ],
            "updateUserEmail": [
                1,
                {
                    "newEmail": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ]
                }
            ],
            "updateValidationRule": [
                674,
                {
                    "input": [
                        616,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                679,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        627,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                682,
                {
                    "input": [
                        620,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                683,
                {
                    "input": [
                        618,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                684,
                {
                    "input": [
                        623,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                685,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        622,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                688,
                {
                    "input": [
                        625,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                691,
                {
                    "input": [
                        628,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                695,
                {
                    "input": [
                        630,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                703,
                {
                    "data": [
                        634,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                703,
                {
                    "data": [
                        632,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                703,
                {
                    "data": [
                        633,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                712,
                {
                    "roleId": [
                        567,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        635,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "upgradeApplication": [
                1,
                {
                    "appRegistrationId": [
                        4,
                        "String!"
                    ],
                    "targetVersion": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadAppTarball": [
                86,
                {
                    "file": [
                        636,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "uploadApplicationFile": [
                295,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        636,
                        "Upload!"
                    ],
                    "fileFolder": [
                        297,
                        "FileFolder!"
                    ],
                    "filePath": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                299,
                {
                    "fieldMetadataUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        636,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                299,
                {
                    "file": [
                        636,
                        "Upload!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                299,
                {
                    "file": [
                        636,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                299,
                {
                    "file": [
                        636,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                291,
                {
                    "upsertFieldPermissionsInput": [
                        637,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                679,
                {
                    "input": [
                        640,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                415,
                {
                    "upsertObjectPermissionsInput": [
                        641,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                481,
                {
                    "upsertPermissionFlagsInput": [
                        642,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                644,
                {
                    "input": [
                        643,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                679,
                {
                    "input": [
                        645,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                94,
                {
                    "input": [
                        672,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                676,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "emailVerificationToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyEmailAndGetWorkspaceAgnosticToken": [
                105,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "emailVerificationToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyEmailingDomain": [
                258,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                677,
                {
                    "otp": [
                        4,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                4
            ]
        },
        "NativeModelCapabilities": {
            "twitterSearch": [
                1
            ],
            "webSearch": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItem": {
            "agentChatChannelId": [
                567
            ],
            "agentId": [
                567
            ],
            "applicationId": [
                567
            ],
            "color": [
                4
            ],
            "createdAt": [
                228
            ],
            "folderId": [
                567
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "link": [
                4
            ],
            "name": [
                4
            ],
            "nativePageKey": [
                4
            ],
            "pageLayoutId": [
                567
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                567
            ],
            "targetRecordId": [
                567
            ],
            "targetRecordIdentifier": [
                460
            ],
            "type": [
                405
            ],
            "updatedAt": [
                228
            ],
            "userWorkspaceId": [
                567
            ],
            "viewId": [
                567
            ],
            "workflowId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                567
            ],
            "color": [
                4
            ],
            "createdAt": [
                228
            ],
            "description": [
                4
            ],
            "disabledObjectPermissionActions": [
                4
            ],
            "duplicateCriteria": [
                4
            ],
            "fields": [
                410,
                {
                    "filter": [
                        289,
                        "FieldFilter!"
                    ],
                    "paging": [
                        226,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                284
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "imageIdentifierFieldMetadataId": [
                567
            ],
            "indexMetadataList": [
                333
            ],
            "indexMetadatas": [
                412,
                {
                    "filter": [
                        336,
                        "IndexFilter!"
                    ],
                    "paging": [
                        226,
                        "CursorPaging!"
                    ]
                }
            ],
            "isActive": [
                1
            ],
            "isAuditLogged": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isRemote": [
                1
            ],
            "isSearchable": [
                1
            ],
            "isSystem": [
                1
            ],
            "isUICreatable": [
                1
            ],
            "isUIEditable": [
                1
            ],
            "isUIReadOnly": [
                1
            ],
            "labelIdentifierFieldMetadataId": [
                567
            ],
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "namePlural": [
                4
            ],
            "nameSingular": [
                4
            ],
            "openRecordIn": [
                414
            ],
            "searchFieldMetadataList": [
                501
            ],
            "shortcut": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "ObjectConnection": {
            "edges": [
                409
            ],
            "pageInfo": [
                427
            ],
            "__typename": [
                4
            ]
        },
        "ObjectEdge": {
            "cursor": [
                178
            ],
            "node": [
                407
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                288
            ],
            "pageInfo": [
                427
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                411
            ],
            "id": [
                568
            ],
            "isActive": [
                142
            ],
            "isRemote": [
                142
            ],
            "isSearchable": [
                142
            ],
            "isSystem": [
                142
            ],
            "isUICreatable": [
                142
            ],
            "isUIEditable": [
                142
            ],
            "isUIReadOnly": [
                142
            ],
            "or": [
                411
            ],
            "universalIdentifier": [
                568
            ],
            "__typename": [
                4
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                334
            ],
            "pageInfo": [
                427
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ObjectOpenRecordIn": {},
        "ObjectPermission": {
            "canDestroyObjectRecords": [
                1
            ],
            "canReadObjectRecords": [
                1
            ],
            "canSoftDeleteObjectRecords": [
                1
            ],
            "canUpdateObjectRecords": [
                1
            ],
            "objectMetadataId": [
                567
            ],
            "restrictedFields": [
                344
            ],
            "rowLevelPermissionPredicateGroups": [
                484
            ],
            "rowLevelPermissionPredicates": [
                483
            ],
            "uneditableFields": [
                567
            ],
            "unreadableFields": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ObjectPermissionInput": {
            "canDestroyObjectRecords": [
                1
            ],
            "canReadObjectRecords": [
                1
            ],
            "canSoftDeleteObjectRecords": [
                1
            ],
            "canUpdateObjectRecords": [
                1
            ],
            "objectMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordCount": {
            "objectNamePlural": [
                4
            ],
            "totalCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordEvent": {
            "action": [
                227
            ],
            "objectNameSingular": [
                4
            ],
            "properties": [
                419
            ],
            "recordId": [
                4
            ],
            "userId": [
                4
            ],
            "workspaceMemberId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordEventProperties": {
            "after": [
                344
            ],
            "before": [
                344
            ],
            "diff": [
                344
            ],
            "updatedFields": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordEventWithQueryIds": {
            "objectRecordEvent": [
                418
            ],
            "queryIds": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "ObjectRecordsPermissions": {
            "canCreateAllRecords": [
                1
            ],
            "canDestroyAllRecords": [
                1
            ],
            "canReadAllRecords": [
                1
            ],
            "canSoftDeleteAllRecords": [
                1
            ],
            "canUpdateAllRecords": [
                1
            ],
            "objectMetadataId": [
                567
            ],
            "restrictedFields": [
                344
            ],
            "rowLevelRecordsPermissions": [
                490
            ],
            "uneditableFields": [
                567
            ],
            "unreadableFields": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                423
            ],
            "previousOnboardingStatus": [
                423
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStepSuccess": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "OpenRecordIn": {},
        "PageInfo": {
            "endCursor": [
                178
            ],
            "hasNextPage": [
                1
            ],
            "hasPreviousPage": [
                1
            ],
            "startCursor": [
                178
            ],
            "__typename": [
                4
            ]
        },
        "PageLayout": {
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                567
            ],
            "deletedAt": [
                228
            ],
            "id": [
                567
            ],
            "isFirstTabPinned": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "tabs": [
                429
            ],
            "type": [
                431
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isOverridden": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "layoutMode": [
                430
            ],
            "pageLayoutId": [
                567
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "widgets": [
                432
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                326
            ],
            "applicationId": [
                567
            ],
            "applicationName": [
                4
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                344
            ],
            "configuration": [
                696
            ],
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "gridPosition": [
                323
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isOverridden": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "objectMetadataId": [
                567
            ],
            "pageLayoutTabId": [
                567
            ],
            "position": [
                435
            ],
            "title": [
                4
            ],
            "type": [
                698
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                430
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "column": [
                2
            ],
            "columnSpan": [
                2
            ],
            "layoutMode": [
                430
            ],
            "row": [
                2
            ],
            "rowSpan": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetCanvasPosition": [
                433
            ],
            "on_PageLayoutWidgetGridPosition": [
                434
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                437
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                436
            ],
            "index": [
                2
            ],
            "layoutMode": [
                430
            ],
            "__typename": [
                4
            ]
        },
        "PathCommandMenuItemPayload": {
            "path": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PermissionFlag": {
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "permissionType": [
                4
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                567
            ],
            "aggregateOperation": [
                32
            ],
            "color": [
                4
            ],
            "configurationType": [
                697
            ],
            "dateGranularity": [
                421
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "displayLegend": [
                1
            ],
            "filter": [
                344
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupByFieldMetadataId": [
                567
            ],
            "groupBySubFieldName": [
                4
            ],
            "hideEmptyCategory": [
                1
            ],
            "manualSortOrder": [
                4
            ],
            "numberFormat": [
                157
            ],
            "orderBy": [
                322
            ],
            "showCenterMetric": [
                1
            ],
            "splitMultiValueFields": [
                1
            ],
            "timezone": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PieChartData": {
            "data": [
                444
            ],
            "formattedToRawLookup": [
                344
            ],
            "hasTooManyGroups": [
                1
            ],
            "showCenterMetric": [
                1
            ],
            "showDataLabels": [
                1
            ],
            "showLegend": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "PieChartDataInput": {
            "configuration": [
                344
            ],
            "objectMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "PieChartDataItem": {
            "key": [
                4
            ],
            "value": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "PlaceDetailsResult": {
            "city": [
                4
            ],
            "country": [
                4
            ],
            "location": [
                356
            ],
            "postcode": [
                4
            ],
            "state": [
                4
            ],
            "street": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PreviewMessageCampaignAudienceInput": {
            "listId": [
                4
            ],
            "unsubscribeTopicId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PreviewMessageCampaignSendInput": {
            "campaignId": [
                4
            ],
            "scheduledAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                151
            ],
            "blockers": [
                376
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                567
            ],
            "isClaimingVerifiedClientName": [
                1
            ],
            "isVerified": [
                1
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "oAuthScopes": [
                4
            ],
            "websiteUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PublicConnectionParametersOutput": {
            "connectionSecurity": [
                255
            ],
            "host": [
                4
            ],
            "port": [
                8
            ],
            "username": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PublicDomain": {
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "domain": [
                4
            ],
            "id": [
                567
            ],
            "isValidated": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "PublicFeatureFlag": {
            "key": [
                283
            ],
            "metadata": [
                453
            ],
            "__typename": [
                4
            ]
        },
        "PublicFeatureFlagMetadata": {
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "imagePath": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PublicImapSmtpCaldavConnectionParameters": {
            "CALDAV": [
                450
            ],
            "IMAP": [
                450
            ],
            "SMTP": [
                450
            ],
            "__typename": [
                4
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                96
            ],
            "authProviders": [
                97
            ],
            "displayName": [
                4
            ],
            "id": [
                567
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                721
            ],
            "__typename": [
                4
            ]
        },
        "PublicWorkspaceDataSummary": {
            "displayName": [
                4
            ],
            "id": [
                567
            ],
            "logo": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Query": {
            "accessGroupPropagationProgress": [
                0
            ],
            "agentChatChannelRoles": [
                10
            ],
            "agentChatChannelSummaries": [
                11
            ],
            "agentChatChannelThreadIds": [
                13,
                {
                    "after": [
                        4
                    ],
                    "assignment": [
                        9
                    ],
                    "channelId": [
                        567,
                        "UUID!"
                    ],
                    "filter": [
                        12
                    ],
                    "first": [
                        2
                    ],
                    "status": [
                        14
                    ]
                }
            ],
            "agentChatChannels": [
                7
            ],
            "agentChatOpenThreadsSummary": [
                17
            ],
            "agentRunInsights": [
                28,
                {
                    "agentId": [
                        567,
                        "UUID!"
                    ],
                    "timeZone": [
                        4,
                        "String!"
                    ]
                }
            ],
            "agentRunSummaries": [
                29
            ],
            "agentRuns": [
                27,
                {
                    "agentId": [
                        567,
                        "UUID!"
                    ],
                    "limit": [
                        2,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                36
            ],
            "aiChatUserCreditsUsage": [
                37
            ],
            "apiKey": [
                48,
                {
                    "input": [
                        310,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                48
            ],
            "appConnection": [
                51,
                {
                    "id": [
                        19,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                51,
                {
                    "filter": [
                        353
                    ]
                }
            ],
            "appKeyValue": [
                52,
                {
                    "key": [
                        4,
                        "String!"
                    ],
                    "scope": [
                        53
                    ]
                }
            ],
            "appMessageChannels": [
                377,
                {
                    "filter": [
                        354
                    ]
                }
            ],
            "appMessageFolders": [
                384,
                {
                    "filter": [
                        355
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                61,
                {
                    "applicationId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                62,
                {
                    "applicationId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "applicationCoreGraphqlSchema": [
                4,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "applicationRegistrationTarballUrl": [
                4,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "applicationSdkClientChecksums": [
                500,
                {
                    "applicationId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                108,
                {
                    "input": [
                        109,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                121
            ],
            "billingPlans": [
                123
            ],
            "billingPortalSession": [
                133,
                {
                    "forPaymentMethodUpdate": [
                        1
                    ],
                    "returnUrlPath": [
                        4
                    ]
                }
            ],
            "callRecordingIdForCalendarEvent": [
                567,
                {
                    "calendarEventId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                23,
                {
                    "agentUniversalIdentifier": [
                        567
                    ],
                    "threadId": [
                        567
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                159,
                {
                    "agentUniversalIdentifier": [
                        567
                    ],
                    "threadId": [
                        567
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "chatThread": [
                18,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                162,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceInviteHashIsValid": [
                711,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                535,
                {
                    "subdomain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                170,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                170
            ],
            "currentUser": [
                667
            ],
            "currentUserApplicationAuthorizations": [
                59
            ],
            "currentUserSessions": [
                670
            ],
            "currentWorkspace": [
                703
            ],
            "enterpriseCheckoutSession": [
                4,
                {
                    "billingInterval": [
                        4
                    ]
                }
            ],
            "enterprisePortalSession": [
                4,
                {
                    "returnUrlPath": [
                        4
                    ]
                }
            ],
            "enterpriseSubscriptionStatus": [
                270
            ],
            "eventLogs": [
                277,
                {
                    "input": [
                        276,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                66,
                {
                    "shouldIncludeDependencies": [
                        1
                    ],
                    "shouldIncludePublicAssets": [
                        1
                    ],
                    "shouldIncludeSourceFiles": [
                        1
                    ],
                    "universalIdentifier": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                284,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                286,
                {
                    "filter": [
                        289,
                        "FieldFilter!"
                    ],
                    "paging": [
                        226,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                449,
                {
                    "clientId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                86,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                78,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "periodEnd": [
                        228
                    ],
                    "periodStart": [
                        228
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                88,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "periodEnd": [
                        228
                    ],
                    "periodStart": [
                        228
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                90,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                163,
                {
                    "sourcePackage": [
                        4
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "findInstallApplicationJobStatus": [
                347,
                {
                    "jobId": [
                        4
                    ],
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findManyAgents": [
                6
            ],
            "findManyApplicationRegistrations": [
                86
            ],
            "findManyApplications": [
                58
            ],
            "findManyLogicFunctions": [
                357
            ],
            "findManyMarketplaceApps": [
                366,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                451
            ],
            "findMarketplaceAppDetail": [
                367,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findOneAgent": [
                6,
                {
                    "input": [
                        22,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                58,
                {
                    "id": [
                        567
                    ],
                    "universalIdentifier": [
                        567
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                86,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                357,
                {
                    "input": [
                        361,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                347,
                {
                    "jobId": [
                        4
                    ],
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findUpgradeApplicationJobStatus": [
                347,
                {
                    "jobId": [
                        4
                    ],
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                705
            ],
            "findWorkspaceFromInviteHash": [
                703,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                710
            ],
            "frontComponent": [
                304,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                304
            ],
            "getAddressDetails": [
                445,
                {
                    "placeId": [
                        4,
                        "String!"
                    ],
                    "token": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                42
            ],
            "getApiKeyRoles": [
                480
            ],
            "getApprovedAccessDomains": [
                94
            ],
            "getAutoCompleteAddress": [
                102,
                {
                    "address": [
                        4,
                        "String!"
                    ],
                    "country": [
                        4
                    ],
                    "isFieldCity": [
                        1
                    ],
                    "token": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAvailablePackages": [
                344,
                {
                    "input": [
                        361,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                177,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                258
            ],
            "getInviteSuggestions": [
                343
            ],
            "getJobs": [
                347,
                {
                    "jobIds": [
                        4,
                        "[String!]!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                4,
                {
                    "input": [
                        361,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                428,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                429,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                429,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                432,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                432,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                428,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        431
                    ]
                }
            ],
            "getPermissionFlags": [
                439
            ],
            "getPublicWorkspaceDataByDomain": [
                455,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                456,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                132
            ],
            "getRole": [
                480,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                480
            ],
            "getSSOIdentityProviders": [
                301
            ],
            "getToolIndex": [
                547
            ],
            "getToolInputSchema": [
                344,
                {
                    "toolName": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                651,
                {
                    "input": [
                        652
                    ]
                }
            ],
            "getView": [
                679,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                682,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                683,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                683,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                682,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                684,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                685,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                685,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                684,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                688,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                688,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                691,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                691,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                679,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        693,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                708
            ],
            "gettingStartedProgress": [
                313
            ],
            "gettingStartedWorkflowPreviews": [
                318
            ],
            "githubClaimAuthorizationUrl": [
                4,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "isApplicationStopped": [
                1,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "lineChartData": [
                349,
                {
                    "input": [
                        350,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                123
            ],
            "mcpServer": [
                372,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                372
            ],
            "messageSuppressions": [
                389,
                {
                    "input": [
                        302,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                394,
                {
                    "input": [
                        397,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                398
            ],
            "mostlyEmptyFieldMetadataIds": [
                567,
                {
                    "objectMetadataId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                85
            ],
            "myCalendarChannels": [
                143,
                {
                    "connectedAccountId": [
                        567
                    ]
                }
            ],
            "myConnectedAccounts": [
                175
            ],
            "myMessageChannels": [
                377,
                {
                    "connectedAccountId": [
                        567
                    ]
                }
            ],
            "myMessageFolders": [
                384,
                {
                    "messageChannelId": [
                        567
                    ]
                }
            ],
            "myUserApplicationVariables": [
                713
            ],
            "navigationMenuItem": [
                404,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                404
            ],
            "object": [
                407,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                417
            ],
            "objects": [
                408,
                {
                    "filter": [
                        411,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        226,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                442,
                {
                    "input": [
                        443,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                151,
                {
                    "input": [
                        446,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                448,
                {
                    "input": [
                        447,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                367,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                366
            ],
            "recordPermissions": [
                462,
                {
                    "targets": [
                        471,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                467,
                {
                    "target": [
                        471,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                472
            ],
            "skill": [
                529,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                529
            ],
            "timelineActivityTypes": [
                543
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                561
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                566,
                {
                    "userId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                570
            ],
            "usageLimits": [
                654
            ],
            "usageQuotaDefinitions": [
                658
            ],
            "usageQuotaScopeConsumption": [
                660,
                {
                    "input": [
                        661,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                662
            ],
            "validatePasswordResetToken": [
                673,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                674,
                {
                    "objectMetadataId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                674,
                {
                    "fieldMetadataId": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                695,
                {
                    "id": [
                        567,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                695
            ],
            "workspaceApplicationAuthorizations": [
                59
            ],
            "__typename": [
                4
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                567
            ],
            "optionValue": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RecordExport": {
            "downloadPath": [
                4
            ],
            "errorMessage": [
                4
            ],
            "filename": [
                4
            ],
            "id": [
                567
            ],
            "progress": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "RecordIdentifier": {
            "id": [
                567
            ],
            "imageIdentifier": [
                4
            ],
            "labelIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RecordPermissionsDTO": {
            "canDelete": [
                1
            ],
            "canRead": [
                1
            ],
            "canSoftDelete": [
                1
            ],
            "canUpdate": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "RecordPermissionsResult": {
            "objectMetadataId": [
                567
            ],
            "permissions": [
                461
            ],
            "recordId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                567
            ],
            "workspaceMemberId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharePrincipalType": {},
        "RecordShareRowCause": {},
        "RecordSharingDTO": {
            "canManageSharing": [
                1
            ],
            "hasManagedGeneralAccess": [
                1
            ],
            "isPrivate": [
                1
            ],
            "isShareable": [
                1
            ],
            "permissions": [
                461
            ],
            "roles": [
                469
            ],
            "shares": [
                468
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                463
            ],
            "id": [
                19
            ],
            "principalId": [
                567
            ],
            "principalRoleId": [
                567
            ],
            "principalType": [
                465
            ],
            "rowCause": [
                466
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingRoleDTO": {
            "canRead": [
                1
            ],
            "canUpdate": [
                1
            ],
            "id": [
                567
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                697
            ],
            "isUIEditable": [
                1
            ],
            "recordLimit": [
                2
            ],
            "viewId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RecordTargetInput": {
            "objectMetadataId": [
                567
            ],
            "recordId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                567
            ],
            "secondFieldMetadataId": [
                567
            ],
            "thirdFieldMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                284
            ],
            "sourceObjectMetadata": [
                407
            ],
            "targetFieldMetadata": [
                284
            ],
            "targetObjectMetadata": [
                407
            ],
            "type": [
                474
            ],
            "__typename": [
                4
            ]
        },
        "RelationType": {},
        "RemoveQueryFromEventStreamInput": {
            "eventStreamId": [
                4
            ],
            "queryId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ReportAppConnectionAuthFailureInput": {
            "id": [
                19
            ],
            "reason": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ResendEmailVerificationToken": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "RevokeApiKeyInput": {
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "RichTextBody": {
            "blocknote": [
                4
            ],
            "markdown": [
                4
            ],
            "tiptap": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Role": {
            "agents": [
                6
            ],
            "apiKeys": [
                49
            ],
            "applicationId": [
                567
            ],
            "canAccessAllAgentChatChannels": [
                1
            ],
            "canAccessAllTools": [
                1
            ],
            "canBeAssignedToAgents": [
                1
            ],
            "canBeAssignedToApiKeys": [
                1
            ],
            "canBeAssignedToUsers": [
                1
            ],
            "canDestroyAllObjectRecords": [
                1
            ],
            "canReadAllObjectRecords": [
                1
            ],
            "canSoftDeleteAllObjectRecords": [
                1
            ],
            "canUpdateAllObjectRecords": [
                1
            ],
            "canUpdateAllSettings": [
                1
            ],
            "description": [
                4
            ],
            "fieldPermissions": [
                291
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                415
            ],
            "permissionFlags": [
                481
            ],
            "rowLevelPermissionFieldPermissions": [
                291
            ],
            "rowLevelPermissionPredicateGroups": [
                484
            ],
            "rowLevelPermissionPredicates": [
                483
            ],
            "rowLevelPermissionRules": [
                489
            ],
            "universalIdentifier": [
                567
            ],
            "workspaceMembers": [
                712
            ],
            "__typename": [
                4
            ]
        },
        "RolePermissionFlag": {
            "flag": [
                4
            ],
            "id": [
                567
            ],
            "roleId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "RotateClientSecret": {
            "clientSecret": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionPredicate": {
            "fieldMetadataId": [
                4
            ],
            "id": [
                4
            ],
            "objectMetadataId": [
                4
            ],
            "operand": [
                488
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                8
            ],
            "relationFieldMetadataId": [
                4
            ],
            "roleId": [
                4
            ],
            "rowLevelPermissionPredicateGroupId": [
                4
            ],
            "subFieldName": [
                4
            ],
            "value": [
                344
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberSubFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionPredicateGroup": {
            "canDestroyRecords": [
                1
            ],
            "canReadRecords": [
                1
            ],
            "canSoftDeleteRecords": [
                1
            ],
            "canUpdateRecords": [
                1
            ],
            "id": [
                4
            ],
            "logicalOperator": [
                486
            ],
            "objectMetadataId": [
                4
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                4
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                8
            ],
            "roleId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionPredicateGroupInput": {
            "canDestroyRecords": [
                1
            ],
            "canReadRecords": [
                1
            ],
            "canSoftDeleteRecords": [
                1
            ],
            "canUpdateRecords": [
                1
            ],
            "id": [
                567
            ],
            "logicalOperator": [
                486
            ],
            "objectMetadataId": [
                567
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                567
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicateInput": {
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "operand": [
                488
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                8
            ],
            "relationFieldMetadataId": [
                567
            ],
            "rowLevelPermissionPredicateGroupId": [
                567
            ],
            "subFieldName": [
                4
            ],
            "value": [
                344
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberSubFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionPredicateOperand": {},
        "RowLevelPermissionRule": {
            "canCreateRecords": [
                1
            ],
            "canDestroyRecords": [
                1
            ],
            "canReadRecords": [
                1
            ],
            "canSoftDeleteRecords": [
                1
            ],
            "canUpdateRecords": [
                1
            ],
            "id": [
                567
            ],
            "objectMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelRecordsPermissions": {
            "canCreateRecords": [
                1
            ],
            "canDestroyRecords": [
                1
            ],
            "canReadRecords": [
                1
            ],
            "canSoftDeleteRecords": [
                1
            ],
            "canUpdateRecords": [
                1
            ],
            "predicateGroups": [
                484
            ],
            "predicates": [
                483
            ],
            "ruleId": [
                567
            ],
            "uneditableFields": [
                567
            ],
            "unreadableFields": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentInput": {
            "additionalInstructions": [
                4
            ],
            "agentUniversalIdentifier": [
                4
            ],
            "input": [
                493
            ],
            "messages": [
                493
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                344
            ],
            "runAsWorkspaceMemberId": [
                567
            ],
            "thread": [
                496
            ],
            "waitForCompletion": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                567
            ],
            "filename": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentMessageInput": {
            "attachments": [
                492
            ],
            "content": [
                4
            ],
            "role": [
                494
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentMessageRole": {},
        "RunAgentResult": {
            "error": [
                4
            ],
            "result": [
                344
            ],
            "runId": [
                567
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentThreadInput": {
            "key": [
                4
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SSOConnection": {
            "id": [
                567
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                499
            ],
            "type": [
                324
            ],
            "__typename": [
                4
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                567
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                499
            ],
            "type": [
                324
            ],
            "__typename": [
                4
            ]
        },
        "SSOIdentityProviderStatus": {},
        "SdkClientChecksums": {
            "core": [
                4
            ],
            "metadata": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SearchField": {
            "createdAt": [
                228
            ],
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "position": [
                8
            ],
            "tsVectorFieldMetadataId": [
                567
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageAttachmentInput": {
            "id": [
                567
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageEmailInput": {
            "bcc": [
                4
            ],
            "body": [
                4
            ],
            "cc": [
                4
            ],
            "inReplyTo": [
                4
            ],
            "subject": [
                4
            ],
            "to": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageInput": {
            "attachments": [
                502
            ],
            "email": [
                503
            ],
            "idempotencyKey": [
                567
            ],
            "messageChannelId": [
                567
            ],
            "messageThreadId": [
                567
            ],
            "text": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageOutput": {
            "messageId": [
                567
            ],
            "messageThreadId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                567
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                567
            ],
            "streamId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailAttachmentInput": {
            "id": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailInput": {
            "bcc": [
                4
            ],
            "body": [
                4
            ],
            "cc": [
                4
            ],
            "connectedAccountId": [
                4
            ],
            "draftMessageId": [
                4
            ],
            "files": [
                507
            ],
            "fromHandle": [
                4
            ],
            "inReplyTo": [
                4
            ],
            "subject": [
                4
            ],
            "targetRecord": [
                510
            ],
            "to": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailOutput": {
            "error": [
                4
            ],
            "messageThreadId": [
                4
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailTargetRecordInput": {
            "objectNameSingular": [
                4
            ],
            "recordId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailViaDomainOutput": {
            "messageId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageInput": {
            "idempotencyKey": [
                4
            ],
            "text": [
                4
            ],
            "threadKey": [
                4
            ],
            "title": [
                4
            ],
            "toolCall": [
                344
            ],
            "workspaceMemberIds": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "SendInvitations": {
            "errors": [
                4
            ],
            "result": [
                710
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "SendMessageCampaignInput": {
            "campaignId": [
                4
            ],
            "scheduledAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                151
            ],
            "campaignId": [
                4
            ],
            "queuedCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "SendMessageCampaignTestInput": {
            "body": [
                4
            ],
            "fromAddress": [
                4
            ],
            "subject": [
                4
            ],
            "toAddress": [
                4
            ],
            "unsubscribeTopicId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Sentry": {
            "dsn": [
                4
            ],
            "environment": [
                4
            ],
            "release": [
                4
            ],
            "tracesSampleRate": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "SetAppKeyValueInput": {
            "key": [
                4
            ],
            "scope": [
                53
            ],
            "value": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "SetAppMessageThreadReadStateInput": {
            "isRead": [
                1
            ],
            "messageChannelId": [
                567
            ],
            "threadExternalId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SetAppMessageThreadReadStateOutput": {
            "updatedMessageCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "frontComponentId": [
                567
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "position": [
                8
            ],
            "scope": [
                523
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItemScope": {},
        "SetupOIDCSsoInput": {
            "clientID": [
                4
            ],
            "clientSecret": [
                4
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SetupSAMLSsoInput": {
            "certificate": [
                4
            ],
            "fingerprint": [
                4
            ],
            "id": [
                567
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "ssoURL": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SetupSso": {
            "id": [
                567
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                499
            ],
            "type": [
                324
            ],
            "__typename": [
                4
            ]
        },
        "SignUp": {
            "loginToken": [
                98
            ],
            "workspace": [
                722
            ],
            "__typename": [
                4
            ]
        },
        "SignUpInNewWorkspaceInput": {
            "affiliatePartnerName": [
                4
            ],
            "captchaToken": [
                4
            ],
            "displayName": [
                4
            ],
            "subdomain": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Skill": {
            "applicationId": [
                567
            ],
            "content": [
                4
            ],
            "createdAt": [
                228
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isCustom": [
                1
            ],
            "isSystem": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                479
            ],
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "StartAppChannelConversationInput": {
            "idempotencyKey": [
                567
            ],
            "messageChannelId": [
                567
            ],
            "personId": [
                567
            ],
            "text": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                720
            ],
            "thread": [
                18
            ],
            "__typename": [
                4
            ]
        },
        "StopGenerateInput": {
            "runId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "StopImpersonation": {
            "canRestoreImpersonatorSession": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "SubdomainAvailabilityDTO": {
            "available": [
                1
            ],
            "isValid": [
                1
            ],
            "suggestedSubdomain": [
                4
            ],
            "suggestedSubdomains": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Subscription": {
            "eventLogsLive": [
                278,
                {
                    "fieldFilters": [
                        272,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        279,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                459,
                {
                    "input": [
                        210,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                362,
                {
                    "input": [
                        363,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                15,
                {
                    "agentUniversalIdentifier": [
                        567
                    ],
                    "runId": [
                        567
                    ],
                    "threadId": [
                        567
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "onEventSubscription": [
                280,
                {
                    "eventStreamId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                4
            ]
        },
        "SubscriptionInterval": {},
        "SubscriptionStatus": {},
        "Support": {
            "supportDriver": [
                540
            ],
            "supportFrontChatId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SupportDriver": {},
        "SyncAppMessageFoldersInput": {
            "folders": [
                55
            ],
            "messageChannelId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityType": {
            "action": [
                4
            ],
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "emit": [
                544
            ],
            "frontComponentUniversalIdentifier": [
                567
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "objectUniversalIdentifier": [
                567
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                567
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                567
            ],
            "on": [
                4
            ],
            "through": [
                545
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                567
            ],
            "relationFieldUniversalIdentifier": [
                567
            ],
            "triggerFieldUniversalIdentifiers": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "ToolIndexEntry": {
            "category": [
                4
            ],
            "description": [
                4
            ],
            "frontComponentId": [
                4
            ],
            "icon": [
                4
            ],
            "inputSchema": [
                344
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "objectName": [
                4
            ],
            "widgetName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TransientToken": {
            "transientToken": [
                98
            ],
            "__typename": [
                4
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                567
            ],
            "personFilter": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "TriggerAddPeopleToMessageListJobResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerInstallApplicationInput": {
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerInstallApplicationJobInput": {
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerInstallApplicationJobResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerInstallApplicationResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUninstallApplicationInput": {
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUninstallApplicationJobInput": {
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUninstallApplicationJobResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUninstallApplicationResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUpgradeApplicationInput": {
            "targetVersion": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUpgradeApplicationResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationBackupCodeStatus": {
            "remainingBackupCodeCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationBackupCodes": {
            "backupCodes": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationMethodSummary": {
            "status": [
                4
            ],
            "strategy": [
                4
            ],
            "twoFactorAuthenticationMethodId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                228
            ],
            "recoveryCode": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationRecoveryCodeRedemption": {
            "isTwoFactorAuthenticationReset": [
                1
            ],
            "provisioningUri": [
                4
            ],
            "tokens": [
                99
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationRecoveryStatus": {
            "hasVerifiedTwoFactorAuthenticationMethod": [
                1
            ],
            "isAwaitingRecoveryEnrollment": [
                1
            ],
            "pendingRecoveryCodeExpiresAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                567
            ],
            "gt": [
                567
            ],
            "gte": [
                567
            ],
            "iLike": [
                567
            ],
            "in": [
                567
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                567
            ],
            "lt": [
                567
            ],
            "lte": [
                567
            ],
            "neq": [
                567
            ],
            "notILike": [
                567
            ],
            "notIn": [
                567
            ],
            "notLike": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                228
            ],
            "description": [
                4
            ],
            "id": [
                567
            ],
            "name": [
                4
            ],
            "updatedAt": [
                228
            ],
            "visibility": [
                571
            ],
            "__typename": [
                4
            ]
        },
        "UnsubscribeTopicVisibility": {},
        "UpdateAgentChatChannelInput": {
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "name": [
                4
            ],
            "position": [
                8
            ],
            "roleIds": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpdateAgentInput": {
            "avatarColor": [
                4
            ],
            "avatarShape": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                344
            ],
            "modelId": [
                4
            ],
            "name": [
                4
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                344
            ],
            "roleId": [
                567
            ],
            "triggers": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApiKeyInput": {
            "expiresAt": [
                4
            ],
            "id": [
                567
            ],
            "name": [
                4
            ],
            "revokedAt": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateAppMessageChannelInput": {
            "displayName": [
                4
            ],
            "id": [
                567
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                567
            ],
            "visibility": [
                383
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationInput": {
            "autoUpgrade": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationRegistrationInput": {
            "id": [
                4
            ],
            "update": [
                578
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationRegistrationPayload": {
            "name": [
                4
            ],
            "oAuthRedirectUris": [
                4
            ],
            "oAuthScopes": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationRegistrationVariableInput": {
            "id": [
                4
            ],
            "update": [
                580
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationRegistrationVariablePayload": {
            "description": [
                4
            ],
            "resetValue": [
                1
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateCalendarChannelInput": {
            "id": [
                567
            ],
            "update": [
                582
            ],
            "__typename": [
                4
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                144
            ],
            "excludePrivateEvents": [
                1
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "visibility": [
                147
            ],
            "__typename": [
                4
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                567
            ],
            "availabilityType": [
                171
            ],
            "engineComponentKey": [
                262
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                567
            ],
            "position": [
                8
            ],
            "shortLabel": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateEmailGroupChannelInput": {
            "displayName": [
                4
            ],
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                344
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "isAuditLogged": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isNullable": [
                1
            ],
            "isSearchable": [
                1
            ],
            "isSystem": [
                1
            ],
            "isUIEditable": [
                1
            ],
            "isUIReadOnly": [
                1
            ],
            "isUnique": [
                1
            ],
            "label": [
                4
            ],
            "morphRelationsUpdatePayload": [
                344
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "options": [
                344
            ],
            "settings": [
                344
            ],
            "translations": [
                395
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFrontComponentInput": {
            "id": [
                567
            ],
            "update": [
                587
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFrontComponentInputUpdates": {
            "description": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateGettingStartedInput": {
            "completedStepActionKey": [
                314
            ],
            "completedStepChatThreadId": [
                4
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                314
            ],
            "snoozedUntil": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLabPublicFeatureFlagInput": {
            "publicFeatureFlag": [
                4
            ],
            "value": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInput": {
            "id": [
                567
            ],
            "update": [
                591
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                344
            ],
            "databaseEventTriggerSettings": [
                344
            ],
            "description": [
                4
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                344
            ],
            "name": [
                4
            ],
            "sourceHandlerCode": [
                4
            ],
            "sourceHandlerPath": [
                4
            ],
            "timeoutSeconds": [
                8
            ],
            "toolTriggerSettings": [
                344
            ],
            "workflowActionTriggerSettings": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                567
            ],
            "update": [
                593
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                567
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                567
            ],
            "update": [
                595
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                378
            ],
            "excludeGroupEmails": [
                1
            ],
            "excludeNonProfessionalEmails": [
                1
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "messageFolderImportPolicy": [
                385
            ],
            "visibility": [
                383
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                567
            ],
            "update": [
                597
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInputUpdates": {
            "isSynced": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFoldersInput": {
            "ids": [
                567
            ],
            "update": [
                597
            ],
            "__typename": [
                4
            ]
        },
        "UpdateNavigationMenuItemInput": {
            "color": [
                4
            ],
            "folderId": [
                567
            ],
            "icon": [
                4
            ],
            "link": [
                4
            ],
            "name": [
                4
            ],
            "pageLayoutId": [
                567
            ],
            "position": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "UpdateObjectPayload": {
            "color": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "imageIdentifierFieldMetadataId": [
                567
            ],
            "isActive": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isSearchable": [
                1
            ],
            "labelIdentifierFieldMetadataId": [
                567
            ],
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "namePlural": [
                4
            ],
            "nameSingular": [
                4
            ],
            "openRecordIn": [
                414
            ],
            "shortcut": [
                4
            ],
            "translations": [
                395
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                567
            ],
            "update": [
                585
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                567
            ],
            "update": [
                599
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                567
            ],
            "update": [
                600
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutInput": {
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "type": [
                431
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutTabInput": {
            "icon": [
                4
            ],
            "layoutMode": [
                430
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutTabWithWidgetsInput": {
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "layoutMode": [
                430
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "widgets": [
                608
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                344
            ],
            "configuration": [
                344
            ],
            "isActive": [
                1
            ],
            "objectMetadataId": [
                567
            ],
            "pageLayoutTabId": [
                567
            ],
            "position": [
                344
            ],
            "title": [
                4
            ],
            "type": [
                698
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetWithIdInput": {
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                344
            ],
            "configuration": [
                344
            ],
            "id": [
                567
            ],
            "objectMetadataId": [
                567
            ],
            "pageLayoutTabId": [
                567
            ],
            "position": [
                344
            ],
            "title": [
                4
            ],
            "type": [
                698
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWithTabsInput": {
            "isFirstTabPinned": [
                1
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "tabs": [
                606
            ],
            "type": [
                431
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRoleInput": {
            "id": [
                567
            ],
            "update": [
                611
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRolePayload": {
            "canAccessAllAgentChatChannels": [
                1
            ],
            "canAccessAllTools": [
                1
            ],
            "canBeAssignedToAgents": [
                1
            ],
            "canBeAssignedToApiKeys": [
                1
            ],
            "canBeAssignedToUsers": [
                1
            ],
            "canDestroyAllObjectRecords": [
                1
            ],
            "canReadAllObjectRecords": [
                1
            ],
            "canSoftDeleteAllObjectRecords": [
                1
            ],
            "canUpdateAllObjectRecords": [
                1
            ],
            "canUpdateAllSettings": [
                1
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateSkillInput": {
            "content": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateTimelineActivityTypeInput": {
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                395
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUnsubscribeTopicInput": {
            "description": [
                4
            ],
            "id": [
                4
            ],
            "name": [
                4
            ],
            "visibility": [
                571
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                567
            ],
            "payload": [
                215
            ],
            "__typename": [
                4
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                567
            ],
            "update": [
                617
            ],
            "__typename": [
                4
            ]
        },
        "UpdateValidationRuleInputUpdates": {
            "description": [
                4
            ],
            "errorFieldMetadataId": [
                567
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "message": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFieldGroupInput": {
            "id": [
                567
            ],
            "update": [
                619
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFieldGroupInputUpdates": {
            "deletedAt": [
                4
            ],
            "isVisible": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                567
            ],
            "update": [
                621
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                32
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "size": [
                8
            ],
            "viewFieldGroupId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                567
            ],
            "logicalOperator": [
                686
            ],
            "parentViewFilterGroupId": [
                567
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                567
            ],
            "update": [
                624
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                567
            ],
            "operand": [
                687
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                567
            ],
            "subFieldName": [
                4
            ],
            "value": [
                344
            ],
            "viewFilterGroupId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                567
            ],
            "update": [
                626
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                567
            ],
            "fieldValue": [
                4
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewInput": {
            "anyFieldFilterValue": [
                4
            ],
            "calendarEndFieldMetadataId": [
                567
            ],
            "calendarFieldMetadataId": [
                567
            ],
            "calendarLayout": [
                680
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                567
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                567
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                690
            ],
            "position": [
                8
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "translations": [
                395
            ],
            "type": [
                693
            ],
            "visibility": [
                694
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                567
            ],
            "update": [
                629
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                692
            ],
            "subFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWebhookInput": {
            "id": [
                567
            ],
            "update": [
                631
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWebhookInputUpdates": {
            "description": [
                4
            ],
            "operations": [
                4
            ],
            "roleId": [
                567
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceAllowedEmbeddingOriginsInput": {
            "operation": [
                4
            ],
            "origin": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceIframeMediaPermissionsInput": {
            "camera": [
                1
            ],
            "microphone": [
                1
            ],
            "origin": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceInput": {
            "aiAdditionalInstructions": [
                4
            ],
            "aiAgentModelTier": [
                40
            ],
            "aiChatAssistantProfile": [
                35
            ],
            "aiChatDirectMessageAssistantMode": [
                33
            ],
            "aiChatInboxAssistantMode": [
                33
            ],
            "aiChatModelTier": [
                40
            ],
            "aiDataPolicy": [
                39
            ],
            "aiEvaluationModelId": [
                4
            ],
            "aiModelIdByTier": [
                344
            ],
            "allowImpersonation": [
                1
            ],
            "customDomain": [
                4
            ],
            "defaultRoleId": [
                567
            ],
            "displayName": [
                4
            ],
            "editableProfileFields": [
                4
            ],
            "eventLogRetentionDays": [
                8
            ],
            "inviteHash": [
                4
            ],
            "isAutoModelSelectionEnabled": [
                1
            ],
            "isCampaignClickTrackingEnabled": [
                1
            ],
            "isCampaignOpenTrackingEnabled": [
                1
            ],
            "isGoogleAuthBypassEnabled": [
                1
            ],
            "isGoogleAuthEnabled": [
                1
            ],
            "isInternalImportEnabled": [
                1
            ],
            "isInternalMessagesImportEnabled": [
                1
            ],
            "isMicrosoftAuthBypassEnabled": [
                1
            ],
            "isMicrosoftAuthEnabled": [
                1
            ],
            "isPasswordAuthBypassEnabled": [
                1
            ],
            "isPasswordAuthEnabled": [
                1
            ],
            "isPublicInviteLinkEnabled": [
                1
            ],
            "isTwoFactorAuthenticationEnforced": [
                1
            ],
            "logo": [
                4
            ],
            "subdomain": [
                4
            ],
            "trashRetentionDays": [
                8
            ],
            "workspaceDiscoverability": [
                709
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                344
            ],
            "workspaceMemberId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                292
            ],
            "roleId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                567
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewFieldId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                638
            ],
            "id": [
                567
            ],
            "isVisible": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                638
            ],
            "groups": [
                639
            ],
            "widgetId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                416
            ],
            "roleId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpsertPermissionFlagsInput": {
            "permissionFlagKeys": [
                4
            ],
            "roleId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "canCreateRecords": [
                1
            ],
            "canDestroyRecords": [
                1
            ],
            "canReadRecords": [
                1
            ],
            "canSoftDeleteRecords": [
                1
            ],
            "canUpdateRecords": [
                1
            ],
            "objectMetadataId": [
                567
            ],
            "predicateGroups": [
                485
            ],
            "predicates": [
                487
            ],
            "roleId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                484
            ],
            "predicates": [
                483
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                649
            ],
            "viewFields": [
                646
            ],
            "viewFilterGroups": [
                647
            ],
            "viewFilters": [
                648
            ],
            "viewSorts": [
                650
            ],
            "widgetId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                32
            ],
            "fieldMetadataId": [
                567
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "size": [
                8
            ],
            "viewFieldId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                567
            ],
            "logicalOperator": [
                686
            ],
            "parentViewFilterGroupId": [
                567
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "operand": [
                687
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                567
            ],
            "subFieldName": [
                4
            ],
            "value": [
                344
            ],
            "viewFilterGroupId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                567
            ],
            "calendarFieldMetadataId": [
                567
            ],
            "calendarLayout": [
                680
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                567
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                567
            ],
            "openRecordIn": [
                690
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                693
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                692
            ],
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                228
            ],
            "periodStart": [
                228
            ],
            "timeSeries": [
                664
            ],
            "usageByApplication": [
                653
            ],
            "usageByModel": [
                653
            ],
            "usageByOperationType": [
                653
            ],
            "usageByUser": [
                653
            ],
            "userDailyUsage": [
                666
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                656
            ],
            "periodEnd": [
                228
            ],
            "periodStart": [
                228
            ],
            "userWorkspaceId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UsageBreakdownItem": {
            "creditsUsed": [
                8
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "userCreditsUsed": [
                8
            ],
            "workspaceCreditsUsed": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "UsageLimit": {
            "burstValue": [
                113
            ],
            "createdAt": [
                228
            ],
            "id": [
                567
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                656
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                663
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                665
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                665
            ],
            "operationType": [
                656
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                655
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                659
            ],
            "resourceType": [
                663
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                657
            ],
            "hasAllowancePeriod": [
                1
            ],
            "isIntraWorkspaceLimitEntitled": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaOperatorOnlyScope": {
            "operationType": [
                656
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                665
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                113
            ],
            "periodEnd": [
                228
            ],
            "periodStart": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                656
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                663
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                665
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                113
            ],
            "id": [
                567
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                656
            ],
            "periodEnd": [
                228
            ],
            "periodStart": [
                228
            ],
            "periodUnit": [
                4
            ],
            "remainingValue": [
                113
            ],
            "resourceType": [
                663
            ],
            "spenderId": [
                4
            ],
            "spenderLabel": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                665
            ],
            "__typename": [
                4
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                8
            ],
            "date": [
                4
            ],
            "workspaceCreditsUsed": [
                8
            ],
            "__typename": [
                4
            ]
        },
        "UsageUnit": {},
        "UsageUserDaily": {
            "dailyUsage": [
                664
            ],
            "userWorkspaceId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "User": {
            "availableWorkspaces": [
                104
            ],
            "canAccessFullAdminPanel": [
                1
            ],
            "canImpersonate": [
                1
            ],
            "createdAt": [
                228
            ],
            "currentUserWorkspace": [
                671
            ],
            "currentWorkspace": [
                703
            ],
            "deletedAt": [
                228
            ],
            "deletedWorkspaceMembers": [
                241
            ],
            "disabled": [
                1
            ],
            "email": [
                4
            ],
            "firstName": [
                4
            ],
            "hasPassword": [
                1
            ],
            "id": [
                567
            ],
            "isEmailVerified": [
                1
            ],
            "isWorkspaceCreator": [
                1
            ],
            "lastName": [
                4
            ],
            "locale": [
                4
            ],
            "onboardingStatus": [
                423
            ],
            "previousOnboardingStatus": [
                423
            ],
            "supportUserHash": [
                4
            ],
            "updatedAt": [
                228
            ],
            "userVars": [
                345
            ],
            "userWorkspaces": [
                671
            ],
            "workspaceMember": [
                712
            ],
            "workspaceMembers": [
                712
            ],
            "workspaces": [
                671
            ],
            "__typename": [
                4
            ]
        },
        "UserApplicationVariableValue": {
            "description": [
                4
            ],
            "isDeprecated": [
                1
            ],
            "isRequired": [
                1
            ],
            "isSecret": [
                1
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "options": [
                344
            ],
            "type": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UserCreditsFallback": {},
        "UserSession": {
            "authProvider": [
                4
            ],
            "city": [
                4
            ],
            "country": [
                4
            ],
            "createdAt": [
                228
            ],
            "expiresAt": [
                228
            ],
            "id": [
                567
            ],
            "ipAddress": [
                4
            ],
            "isCurrent": [
                1
            ],
            "isImpersonating": [
                1
            ],
            "lastActiveAt": [
                228
            ],
            "region": [
                4
            ],
            "userAgent": [
                4
            ],
            "workspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "id": [
                567
            ],
            "isImpersonating": [
                1
            ],
            "locale": [
                4
            ],
            "objectRecordsPermissions": [
                422
            ],
            "permissionFlags": [
                440
            ],
            "twoFactorAuthenticationMethodSummary": [
                563
            ],
            "updatedAt": [
                228
            ],
            "user": [
                667
            ],
            "userId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                567
            ],
            "validationToken": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ValidatePasswordResetToken": {
            "email": [
                4
            ],
            "hasPassword": [
                1
            ],
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ValidationRule": {
            "description": [
                4
            ],
            "errorFieldMetadataId": [
                567
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "message": [
                4
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "VerificationRecord": {
            "key": [
                4
            ],
            "priority": [
                8
            ],
            "status": [
                4
            ],
            "type": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "VerifyEmailAndGetLoginToken": {
            "loginToken": [
                98
            ],
            "workspaceUrls": [
                721
            ],
            "__typename": [
                4
            ]
        },
        "VerifyTwoFactorAuthenticationMethod": {
            "backupCodes": [
                4
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "VersionDistributionEntry": {
            "count": [
                2
            ],
            "version": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "View": {
            "anyFieldFilterValue": [
                4
            ],
            "applicationId": [
                567
            ],
            "calendarEndFieldMetadataId": [
                567
            ],
            "calendarFieldMetadataId": [
                567
            ],
            "calendarLayout": [
                680
            ],
            "createdAt": [
                228
            ],
            "createdByUserWorkspaceId": [
                567
            ],
            "deletedAt": [
                228
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isCompact": [
                1
            ],
            "isCustom": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                567
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                689
            ],
            "mainGroupByFieldMetadataId": [
                567
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                567
            ],
            "openRecordIn": [
                690
            ],
            "position": [
                8
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                693
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "viewFieldGroups": [
                683
            ],
            "viewFields": [
                682
            ],
            "viewFilterGroups": [
                685
            ],
            "viewFilters": [
                684
            ],
            "viewGroups": [
                688
            ],
            "viewSorts": [
                691
            ],
            "visibility": [
                694
            ],
            "workspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                32
            ],
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isCanonical": [
                1
            ],
            "isOverridden": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "size": [
                8
            ],
            "universalIdentifier": [
                567
            ],
            "updatedAt": [
                228
            ],
            "viewFieldGroupId": [
                567
            ],
            "viewId": [
                567
            ],
            "workspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "id": [
                567
            ],
            "isActive": [
                1
            ],
            "isOverridden": [
                1
            ],
            "isVisible": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                8
            ],
            "updatedAt": [
                228
            ],
            "viewFields": [
                682
            ],
            "viewId": [
                567
            ],
            "workspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilter": {
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "operand": [
                687
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                567
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                228
            ],
            "value": [
                344
            ],
            "viewFilterGroupId": [
                567
            ],
            "viewId": [
                567
            ],
            "workspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "id": [
                567
            ],
            "logicalOperator": [
                686
            ],
            "parentViewFilterGroupId": [
                567
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "updatedAt": [
                228
            ],
            "viewId": [
                567
            ],
            "workspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "fieldValue": [
                4
            ],
            "id": [
                567
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "updatedAt": [
                228
            ],
            "viewId": [
                567
            ],
            "workspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "direction": [
                692
            ],
            "fieldMetadataId": [
                567
            ],
            "id": [
                567
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                228
            ],
            "viewId": [
                567
            ],
            "workspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "ViewSortDirection": {},
        "ViewType": {},
        "ViewVisibility": {},
        "Webhook": {
            "applicationId": [
                567
            ],
            "createdAt": [
                228
            ],
            "deletedAt": [
                228
            ],
            "description": [
                4
            ],
            "id": [
                567
            ],
            "operations": [
                4
            ],
            "role": [
                480
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "updatedAt": [
                228
            ],
            "__typename": [
                4
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                31
            ],
            "on_BarChartConfiguration": [
                107
            ],
            "on_CalendarConfiguration": [
                148
            ],
            "on_CallRecordingSummaryConfiguration": [
                149
            ],
            "on_CallRecordingTranscriptConfiguration": [
                150
            ],
            "on_ChatConfiguration": [
                158
            ],
            "on_ChatThreadsConfiguration": [
                161
            ],
            "on_EmailThreadConfiguration": [
                257
            ],
            "on_EmailsConfiguration": [
                261
            ],
            "on_FieldConfiguration": [
                285
            ],
            "on_FieldRichTextConfiguration": [
                293
            ],
            "on_FieldsConfiguration": [
                294
            ],
            "on_FilesConfiguration": [
                300
            ],
            "on_FormFieldConfiguration": [
                303
            ],
            "on_FrontComponentConfiguration": [
                305
            ],
            "on_IframeConfiguration": [
                325
            ],
            "on_LineChartConfiguration": [
                348
            ],
            "on_MessageCampaignBodyConfiguration": [
                374
            ],
            "on_MessageCampaignDetailsConfiguration": [
                375
            ],
            "on_NotesConfiguration": [
                406
            ],
            "on_PieChartConfiguration": [
                441
            ],
            "on_RecordTableConfiguration": [
                470
            ],
            "on_StandaloneRichTextConfiguration": [
                530
            ],
            "on_TasksConfiguration": [
                542
            ],
            "on_TimelineConfiguration": [
                546
            ],
            "on_ViewConfiguration": [
                681
            ],
            "on_WorkflowConfiguration": [
                700
            ],
            "on_WorkflowRunConfiguration": [
                701
            ],
            "on_WorkflowVersionConfiguration": [
                702
            ],
            "__typename": [
                4
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowActionType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                697
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                704
            ],
            "aiAdditionalInstructions": [
                4
            ],
            "aiAgentModelTier": [
                40
            ],
            "aiChatAssistantProfile": [
                34
            ],
            "aiChatDirectMessageAssistantMode": [
                33
            ],
            "aiChatInboxAssistantMode": [
                33
            ],
            "aiChatModelTier": [
                40
            ],
            "aiDataPolicy": [
                38
            ],
            "aiEvaluationModelId": [
                4
            ],
            "aiModelIdByTier": [
                344
            ],
            "allowImpersonation": [
                1
            ],
            "allowedEmbeddingOrigins": [
                4
            ],
            "billingCustomer": [
                115
            ],
            "billingEntitlements": [
                117
            ],
            "billingSubscriptions": [
                134
            ],
            "createdAt": [
                228
            ],
            "currentBillingSubscription": [
                134
            ],
            "customDomain": [
                4
            ],
            "databaseSchema": [
                4
            ],
            "defaultRole": [
                480
            ],
            "deletedAt": [
                228
            ],
            "displayName": [
                4
            ],
            "editableProfileFields": [
                4
            ],
            "eventLogRetentionDays": [
                8
            ],
            "featureFlags": [
                282
            ],
            "hasValidEnterpriseValidityToken": [
                1
            ],
            "hasValidSignedEnterpriseKey": [
                1
            ],
            "id": [
                567
            ],
            "iframeMediaPermissions": [
                326
            ],
            "installedApplications": [
                58
            ],
            "inviteHash": [
                4
            ],
            "isAutoModelSelectionEnabled": [
                1
            ],
            "isCampaignClickTrackingEnabled": [
                1
            ],
            "isCampaignOpenTrackingEnabled": [
                1
            ],
            "isCustomDomainEnabled": [
                1
            ],
            "isGoogleAuthBypassEnabled": [
                1
            ],
            "isGoogleAuthEnabled": [
                1
            ],
            "isInternalImportEnabled": [
                1
            ],
            "isInternalMessagesImportEnabled": [
                1
            ],
            "isMicrosoftAuthBypassEnabled": [
                1
            ],
            "isMicrosoftAuthEnabled": [
                1
            ],
            "isPasswordAuthBypassEnabled": [
                1
            ],
            "isPasswordAuthEnabled": [
                1
            ],
            "isPublicInviteLinkEnabled": [
                1
            ],
            "isTrialAvailable": [
                1
            ],
            "isTwoFactorAuthenticationEnforced": [
                1
            ],
            "logo": [
                4
            ],
            "logoFileId": [
                567
            ],
            "metadataVersion": [
                8
            ],
            "subdomain": [
                4
            ],
            "trashRetentionDays": [
                8
            ],
            "updatedAt": [
                228
            ],
            "viewFields": [
                682
            ],
            "viewFilterGroups": [
                685
            ],
            "viewFilters": [
                684
            ],
            "viewGroups": [
                688
            ],
            "viewSorts": [
                691
            ],
            "views": [
                679
            ],
            "workspaceCustomApplication": [
                58
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                709
            ],
            "workspaceMembersCount": [
                8
            ],
            "workspaceUrls": [
                721
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceActivationStatus": {},
        "WorkspaceAiStats": {
            "conversationsCount": [
                2
            ],
            "skillsCount": [
                2
            ],
            "toolsCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceCompanyEnrichmentOutcome": {},
        "WorkspaceCompanyEnrichmentResult": {
            "enrichment": [
                344
            ],
            "isBookCallOnboardingStepPending": [
                1
            ],
            "outcome": [
                706
            ],
            "personEnrichment": [
                344
            ],
            "personOutcome": [
                719
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceCreationDefaultsDTO": {
            "displayName": [
                4
            ],
            "subdomain": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceDiscoverability": {},
        "WorkspaceInvitation": {
            "email": [
                4
            ],
            "expiresAt": [
                228
            ],
            "id": [
                567
            ],
            "roleId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceInviteHashValid": {
            "isValid": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMember": {
            "avatarUrl": [
                4
            ],
            "calendarStartDay": [
                2
            ],
            "colorScheme": [
                4
            ],
            "dateFormat": [
                714
            ],
            "id": [
                567
            ],
            "locale": [
                4
            ],
            "name": [
                307
            ],
            "numberFormat": [
                715
            ],
            "openRecordIn": [
                426
            ],
            "roles": [
                480
            ],
            "timeFormat": [
                716
            ],
            "timeZone": [
                4
            ],
            "uiScale": [
                4
            ],
            "userEmail": [
                4
            ],
            "userId": [
                567
            ],
            "userWorkspaceId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                567
            ],
            "variables": [
                668
            ],
            "workspaceMemberId": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberDateFormatEnum": {},
        "WorkspaceMemberNumberFormatEnum": {},
        "WorkspaceMemberTimeFormatEnum": {},
        "WorkspaceMigration": {
            "actions": [
                344
            ],
            "applicationUniversalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceNameAndId": {
            "displayName": [
                4
            ],
            "id": [
                567
            ],
            "__typename": [
                4
            ]
        },
        "WorkspacePersonEnrichmentOutcome": {},
        "WorkspaceSetupChatOutcome": {},
        "WorkspaceUrls": {
            "customUrl": [
                4
            ],
            "subdomainUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceUrlsAndId": {
            "id": [
                567
            ],
            "workspaceUrls": [
                721
            ],
            "__typename": [
                4
            ]
        }
    }
}