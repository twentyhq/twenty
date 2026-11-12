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
        175,
        177,
        179,
        226,
        227,
        254,
        258,
        259,
        261,
        272,
        278,
        282,
        286,
        289,
        296,
        313,
        315,
        321,
        323,
        336,
        343,
        344,
        345,
        357,
        359,
        376,
        377,
        378,
        379,
        380,
        381,
        383,
        384,
        385,
        388,
        389,
        391,
        394,
        399,
        403,
        412,
        419,
        421,
        424,
        428,
        429,
        434,
        438,
        461,
        463,
        464,
        472,
        484,
        486,
        492,
        497,
        518,
        531,
        532,
        534,
        561,
        563,
        565,
        630,
        650,
        657,
        659,
        663,
        674,
        680,
        681,
        683,
        684,
        686,
        687,
        688,
        691,
        692,
        693,
        698,
        700,
        703,
        708,
        709,
        710,
        713,
        714
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
                343
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
                561
            ],
            "avatarColor": [
                4
            ],
            "avatarShape": [
                4
            ],
            "createdAt": [
                227
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                343
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
                343
            ],
            "roleId": [
                561
            ],
            "triggers": [
                343
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannel": {
            "applicationId": [
                561
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                561
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
                561
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
                561
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                343
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
                227
            ],
            "deletedAt": [
                227
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
                227
            ],
            "__typename": [
                4
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                227
            ],
            "id": [
                561
            ],
            "isSubscribed": [
                1
            ],
            "lastMentionedAt": [
                227
            ],
            "lastReadAt": [
                227
            ],
            "mentionsResolvedAt": [
                227
            ],
            "snoozedUntil": [
                227
            ],
            "threadId": [
                561
            ],
            "updatedAt": [
                227
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                561
            ],
            "createdAt": [
                227
            ],
            "id": [
                561
            ],
            "isBuiltInAssistant": [
                1
            ],
            "parts": [
                24
            ],
            "processedAt": [
                227
            ],
            "reactions": [
                25
            ],
            "role": [
                4
            ],
            "senderApplicationId": [
                561
            ],
            "senderUserWorkspaceId": [
                561
            ],
            "senderWorkspaceMemberId": [
                561
            ],
            "status": [
                4
            ],
            "threadId": [
                561
            ],
            "turnId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                227
            ],
            "errorMessage": [
                4
            ],
            "fileFilename": [
                4
            ],
            "fileId": [
                561
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                561
            ],
            "messageId": [
                561
            ],
            "orderIndex": [
                2
            ],
            "providerExecuted": [
                1
            ],
            "providerMetadata": [
                343
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
                343
            ],
            "toolName": [
                4
            ],
            "toolOutput": [
                343
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
                561
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "AgentRecentRun": {
            "createdAt": [
                227
            ],
            "id": [
                561
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
                227
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
                227
            ],
            "errorMessage": [
                4
            ],
            "id": [
                561
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
                227
            ],
            "status": [
                30
            ],
            "threadId": [
                561
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
                561
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
                561
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
                561
            ],
            "aggregateOperation": [
                32
            ],
            "configurationType": [
                691
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "filter": [
                343
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
                456
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
                227
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
                227
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
                227
            ],
            "expiresAt": [
                227
            ],
            "id": [
                561
            ],
            "name": [
                4
            ],
            "revokedAt": [
                227
            ],
            "role": [
                478
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                227
            ],
            "id": [
                561
            ],
            "name": [
                4
            ],
            "revokedAt": [
                227
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
                175
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
                343
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                561
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
            "participants": [
                57
            ],
            "receivedAt": [
                227
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
                561
            ],
            "role": [
                385
            ],
            "workspaceMemberId": [
                561
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
                561
            ],
            "applicationVariables": [
                92
            ],
            "autoUpgrade": [
                1
            ],
            "availablePackages": [
                343
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
                227
            ],
            "defaultLogicFunctionRole": [
                478
            ],
            "defaultRoleId": [
                4
            ],
            "description": [
                4
            ],
            "frontComponents": [
                303
            ],
            "grantRoleId": [
                561
            ],
            "grantedIframeMediaPermissions": [
                325
            ],
            "healthCheckLogicFunctionId": [
                561
            ],
            "id": [
                561
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                356
            ],
            "logoFileId": [
                561
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                405
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                561
            ],
            "requestedIframeMediaPermissions": [
                325
            ],
            "runOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                561
            ],
            "settingsMenuItems": [
                517
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                561
            ],
            "applicationName": [
                4
            ],
            "applicationUniversalIdentifier": [
                4
            ],
            "createdAt": [
                227
            ],
            "id": [
                561
            ],
            "lastAuthorizedAt": [
                227
            ],
            "lastUsedAt": [
                227
            ],
            "scopes": [
                4
            ],
            "workspaceId": [
                561
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                561
            ],
            "archivedAt": [
                227
            ],
            "authFailedAt": [
                227
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                452
            ],
            "connectionProviderId": [
                561
            ],
            "createdAt": [
                227
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                561
            ],
            "isOwnedByCurrentUser": [
                1
            ],
            "lastCredentialsRefreshedAt": [
                227
            ],
            "lastSignedInAt": [
                227
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                175
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                227
            ],
            "userWorkspaceId": [
                561
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
                561
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
                179
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
                343
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
                561
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
                296
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
                296
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
                227
            ],
            "fileFolder": [
                296
            ],
            "fileId": [
                561
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
                227
            ],
            "periodStart": [
                227
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
                227
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
                227
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
                227
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
                227
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
                561
            ],
            "connectionProviders": [
                62
            ],
            "hasUserHealthCheck": [
                1
            ],
            "settingsMenuItems": [
                517
            ],
            "variables": [
                662
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                227
            ],
            "galleryImagesUrls": [
                4
            ],
            "id": [
                561
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
                561
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
                227
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
                224
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
                672
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                561
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
                227
            ],
            "description": [
                4
            ],
            "id": [
                561
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
                343
            ],
            "type": [
                4
            ],
            "updatedAt": [
                227
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
                561
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
                343
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
                227
            ],
            "domain": [
                4
            ],
            "id": [
                561
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
                561
            ],
            "workspaceMemberIds": [
                561
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
                496
            ],
            "__typename": [
                4
            ]
        },
        "AuthToken": {
            "expiresAt": [
                227
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
                561
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
                495
            ],
            "workspaceUrls": [
                715
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
                561
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
                691
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
                343
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
                419
            ],
            "primaryAxisGroupByFieldMetadataId": [
                561
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                321
            ],
            "rangeMax": [
                8
            ],
            "rangeMin": [
                8
            ],
            "secondaryAxisGroupByDateGranularity": [
                419
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                561
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                321
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
                343
            ],
            "formattedToRawLookup": [
                343
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
                343
            ],
            "objectMetadataId": [
                561
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
                561
            ],
            "userCreditsFallback": [
                663
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
                532
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
                531
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
                531
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
                227
            ],
            "periodStart": [
                227
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
                227
            ],
            "collectionMethod": [
                135
            ],
            "currentPeriodEnd": [
                227
            ],
            "hasUserCredits": [
                1
            ],
            "id": [
                561
            ],
            "interval": [
                531
            ],
            "metadata": [
                343
            ],
            "phases": [
                137
            ],
            "status": [
                532
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
                561
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
                561
            ],
            "contactAutoCreationPolicy": [
                144
            ],
            "createdAt": [
                227
            ],
            "excludePrivateEvents": [
                1
            ],
            "handle": [
                4
            ],
            "id": [
                561
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
                227
            ],
            "syncStatus": [
                146
            ],
            "syncedAt": [
                227
            ],
            "throttleFailureCount": [
                8
            ],
            "updatedAt": [
                227
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
                691
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                691
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                691
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
                691
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                343
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
                691
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
                399
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                401
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
                450
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                515
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                533
            ],
            "__typename": [
                4
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                227
            ],
            "link": [
                4
            ],
            "startAt": [
                227
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
                561
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                561
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
                561
            ],
            "createdAt": [
                227
            ],
            "engineComponentKey": [
                261
            ],
            "frontComponent": [
                303
            ],
            "frontComponentId": [
                561
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                561
            ],
            "pageLayoutId": [
                561
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
                561
            ],
            "updatedAt": [
                227
            ],
            "workflowVersionId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                411
            ],
            "on_PathCommandMenuItemPayload": [
                436
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
                294
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                561
            ],
            "archivedAt": [
                227
            ],
            "authFailedAt": [
                227
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                452
            ],
            "connectionProviderId": [
                561
            ],
            "createdAt": [
                227
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                561
            ],
            "lastCredentialsRefreshedAt": [
                227
            ],
            "lastSignedInAt": [
                227
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                175
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                227
            ],
            "userWorkspaceId": [
                561
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
                328
            ],
            "handle": [
                4
            ],
            "id": [
                561
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                254
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
                561
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
                343
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
                343
            ],
            "roleId": [
                561
            ],
            "triggers": [
                343
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                561
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                561
            ],
            "participantHandleFieldUniversalIdentifier": [
                561
            ],
            "visibility": [
                381
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
                561
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
                561
            ],
            "engineComponentKey": [
                261
            ],
            "frontComponentId": [
                561
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
                561
            ],
            "pageLayoutId": [
                561
            ],
            "payload": [
                343
            ],
            "position": [
                8
            ],
            "shortLabel": [
                4
            ],
            "workflowVersionId": [
                561
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
                375
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
                343
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
                343
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                561
            ],
            "options": [
                343
            ],
            "relationCreationPayload": [
                343
            ],
            "settings": [
                343
            ],
            "type": [
                289
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
                561
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
                561
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
                196
            ],
            "indexType": [
                336
            ],
            "objectMetadataId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                343
            ],
            "databaseEventTriggerSettings": [
                343
            ],
            "description": [
                4
            ],
            "httpRouteTriggerSettings": [
                343
            ],
            "id": [
                561
            ],
            "name": [
                4
            ],
            "serverRouteTriggerSettings": [
                343
            ],
            "source": [
                343
            ],
            "timeoutSeconds": [
                8
            ],
            "toolTriggerSettings": [
                343
            ],
            "universalIdentifier": [
                561
            ],
            "workflowActionTriggerSettings": [
                343
            ],
            "__typename": [
                4
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                561
            ],
            "id": [
                561
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                561
            ],
            "agentId": [
                561
            ],
            "color": [
                4
            ],
            "folderId": [
                561
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                561
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                561
            ],
            "targetRecordId": [
                561
            ],
            "type": [
                403
            ],
            "userWorkspaceId": [
                561
            ],
            "viewId": [
                561
            ],
            "workflowId": [
                561
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
                343
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
                194
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                197
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                202
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
                561
            ],
            "type": [
                429
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                428
            ],
            "pageLayoutId": [
                561
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
                343
            ],
            "objectMetadataId": [
                561
            ],
            "pageLayoutTabId": [
                561
            ],
            "position": [
                343
            ],
            "title": [
                4
            ],
            "type": [
                692
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                561
            ],
            "filter": [
                343
            ],
            "objectMetadataId": [
                561
            ],
            "orderBy": [
                343
            ],
            "__typename": [
                4
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                561
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                561
            ],
            "secondFieldMetadataId": [
                561
            ],
            "thirdFieldMetadataId": [
                561
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
                561
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
                565
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
                650
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                657
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                659
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
                561
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                561
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
                561
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
                561
            ],
            "id": [
                561
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
                561
            ],
            "viewId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                561
            ],
            "logicalOperator": [
                680
            ],
            "parentViewFilterGroupId": [
                561
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                561
            ],
            "id": [
                561
            ],
            "operand": [
                681
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                561
            ],
            "subFieldName": [
                4
            ],
            "value": [
                343
            ],
            "viewFilterGroupId": [
                561
            ],
            "viewId": [
                561
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
                561
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewId": [
                561
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
                561
            ],
            "calendarFieldMetadataId": [
                561
            ],
            "calendarLayout": [
                674
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                561
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                561
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                683
            ],
            "mainGroupByFieldMetadataId": [
                561
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                561
            ],
            "openRecordIn": [
                684
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
                687
            ],
            "visibility": [
                688
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                686
            ],
            "fieldMetadataId": [
                561
            ],
            "id": [
                561
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                561
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
                561
            ],
            "operations": [
                4
            ],
            "roleId": [
                561
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
                650
            ],
            "resource": [
                657
            ],
            "__typename": [
                4
            ]
        },
        "CursorPaging": {
            "after": [
                177
            ],
            "before": [
                177
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                561
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                561
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
                561
            ],
            "name": [
                306
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                561
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
                561
            ],
            "isCustomDomainEnabled": [
                1
            ],
            "records": [
                247
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
                561
            ],
            "pageLayoutId": [
                561
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
                561
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
                561
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                497
            ],
            "type": [
                323
            ],
            "__typename": [
                4
            ]
        },
        "EditSsoInput": {
            "id": [
                561
            ],
            "status": [
                497
            ],
            "__typename": [
                4
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                178
            ],
            "IMAP": [
                178
            ],
            "SMTP": [
                178
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
                691
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                227
            ],
            "domain": [
                4
            ],
            "id": [
                561
            ],
            "status": [
                258
            ],
            "tenantStatus": [
                259
            ],
            "unsubscribeHostnameStatus": [
                563
            ],
            "updatedAt": [
                227
            ],
            "verificationRecords": [
                669
            ],
            "verifiedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                691
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
                343
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
                343
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
                263
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payloads": [
                343
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
                267
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
                227
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
                227
            ],
            "currentPeriodEnd": [
                227
            ],
            "expiresAt": [
                227
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
                227
            ],
            "start": [
                227
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
                272
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
                270
            ],
            "eventType": [
                4
            ],
            "fieldFilters": [
                271
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
                273
            ],
            "first": [
                2
            ],
            "table": [
                278
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                274
            ],
            "records": [
                277
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
                343
            ],
            "recordId": [
                4
            ],
            "timestamp": [
                227
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
                390
            ],
            "objectRecordEventsWithQueryIds": [
                418
            ],
            "queueJobEvents": [
                346
            ],
            "__typename": [
                4
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                561
            ],
            "payload": [
                343
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlag": {
            "key": [
                282
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
                561
            ],
            "createdAt": [
                227
            ],
            "defaultValue": [
                343
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
                561
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
                561
            ],
            "morphRelations": [
                471
            ],
            "name": [
                4
            ],
            "object": [
                405
            ],
            "objectMetadataId": [
                561
            ],
            "options": [
                343
            ],
            "relation": [
                471
            ],
            "settings": [
                343
            ],
            "type": [
                289
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                691
            ],
            "fieldDisplayMode": [
                286
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
                287
            ],
            "pageInfo": [
                425
            ],
            "__typename": [
                4
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                177
            ],
            "node": [
                283
            ],
            "__typename": [
                4
            ]
        },
        "FieldFilter": {
            "and": [
                288
            ],
            "id": [
                562
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
                562
            ],
            "or": [
                288
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
                561
            ],
            "id": [
                561
            ],
            "objectMetadataId": [
                561
            ],
            "roleId": [
                561
            ],
            "rowLevelPermissionPredicateGroupId": [
                561
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
                561
            ],
            "objectMetadataId": [
                561
            ],
            "rowLevelPermissionPredicateGroupId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                691
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                691
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
                227
            ],
            "id": [
                561
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
                561
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
                227
            ],
            "fileId": [
                561
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
                227
            ],
            "id": [
                561
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
                691
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                561
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                497
            ],
            "type": [
                323
            ],
            "workspace": [
                712
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
                388
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                691
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
                325
            ],
            "applicationId": [
                561
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                91
            ],
            "applicationVariables": [
                343
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
                227
            ],
            "description": [
                4
            ],
            "frontComponentSharedDependenciesChecksum": [
                4
            ],
            "id": [
                561
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
                561
            ],
            "updatedAt": [
                227
            ],
            "usesSdkClient": [
                1
            ],
            "widgetAvailability": [
                305
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                691
            ],
            "frontComponentId": [
                561
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                561
            ],
            "pageLayoutType": [
                429
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
                491
            ],
            "instructions": [
                4
            ],
            "modelId": [
                4
            ],
            "responseFormat": [
                343
            ],
            "runId": [
                561
            ],
            "scope": [
                343
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
                343
            ],
            "runId": [
                561
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
                561
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
                561
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
                561
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
                313
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                313
            ],
            "snoozedUntil": [
                4
            ],
            "steps": [
                314
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                313
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
                315
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
                318
            ],
            "stepActionKey": [
                313
            ],
            "trigger": [
                319
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
                693
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
                561
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
                691
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
                329
            ],
            "IMAP": [
                329
            ],
            "SMTP": [
                329
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
                254
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
                716
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
                561
            ],
            "threadId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                561
            ],
            "createdAt": [
                227
            ],
            "id": [
                561
            ],
            "indexFieldMetadataList": [
                334
            ],
            "indexType": [
                336
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
                227
            ],
            "__typename": [
                4
            ]
        },
        "IndexEdge": {
            "cursor": [
                177
            ],
            "node": [
                332
            ],
            "__typename": [
                4
            ]
        },
        "IndexField": {
            "createdAt": [
                227
            ],
            "fieldMetadataId": [
                561
            ],
            "id": [
                561
            ],
            "order": [
                8
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "IndexFilter": {
            "and": [
                335
            ],
            "id": [
                562
            ],
            "isCustom": [
                142
            ],
            "or": [
                335
            ],
            "__typename": [
                4
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                561
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
                339
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
                561
            ],
            "messageThreadId": [
                561
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
                345
            ],
            "__typename": [
                4
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                561
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
                691
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
                343
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
                419
            ],
            "primaryAxisGroupByFieldMetadataId": [
                561
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                321
            ],
            "rangeMax": [
                8
            ],
            "rangeMin": [
                8
            ],
            "secondaryAxisGroupByDateGranularity": [
                419
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                561
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                321
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
                343
            ],
            "hasTooManyGroups": [
                1
            ],
            "series": [
                351
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
                343
            ],
            "objectMetadataId": [
                561
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
                350
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
                175
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                561
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
                561
            ],
            "canRunOnDemand": [
                1
            ],
            "createdAt": [
                227
            ],
            "cronTriggerSettings": [
                343
            ],
            "databaseEventTriggerSettings": [
                343
            ],
            "description": [
                4
            ],
            "executionMode": [
                357
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                343
            ],
            "id": [
                561
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
                343
            ],
            "universalIdentifier": [
                561
            ],
            "updatedAt": [
                227
            ],
            "workflowActionTriggerSettings": [
                343
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                343
            ],
            "duration": [
                8
            ],
            "error": [
                343
            ],
            "logs": [
                4
            ],
            "status": [
                359
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                561
            ],
            "applicationUniversalIdentifier": [
                561
            ],
            "id": [
                561
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                561
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
        "MarketplaceApp": {
            "author": [
                4
            ],
            "category": [
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
                343
            ],
            "name": [
                4
            ],
            "objects": [
                366
            ],
            "pricingDescription": [
                4
            ],
            "requestedCapabilities": [
                4
            ],
            "requestedIframeMediaPermissions": [
                325
            ],
            "roles": [
                367
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
                368
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                369
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
                561
            ],
            "connectionProviderId": [
                561
            ],
            "createdAt": [
                227
            ],
            "id": [
                561
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
                371
            ],
            "toolsSyncError": [
                4
            ],
            "toolsSyncedAt": [
                227
            ],
            "updatedAt": [
                227
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
                343
            ],
            "description": [
                4
            ],
            "inputSchema": [
                343
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
                691
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                691
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
            "connectedAccount": [
                174
            ],
            "connectedAccountId": [
                561
            ],
            "contactAutoCreationPolicy": [
                376
            ],
            "createdAt": [
                227
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
                561
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
                383
            ],
            "messagingProviderUniversalIdentifier": [
                561
            ],
            "participantHandleFieldUniversalIdentifier": [
                561
            ],
            "pendingGroupEmailsAction": [
                377
            ],
            "syncStage": [
                378
            ],
            "syncStageStartedAt": [
                227
            ],
            "syncStatus": [
                379
            ],
            "syncedAt": [
                227
            ],
            "throttleFailureCount": [
                8
            ],
            "throttleRetryAfter": [
                227
            ],
            "type": [
                380
            ],
            "updatedAt": [
                227
            ],
            "visibility": [
                381
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
                227
            ],
            "externalId": [
                4
            ],
            "id": [
                561
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                561
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                384
            ],
            "updatedAt": [
                227
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
                227
            ],
            "emailAddress": [
                4
            ],
            "id": [
                561
            ],
            "reason": [
                388
            ],
            "source": [
                389
            ],
            "unsubscribeTopicId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                386
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
                417
            ],
            "recordId": [
                4
            ],
            "type": [
                391
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
                561
            ],
            "property": [
                4
            ],
            "provenance": [
                394
            ],
            "recordId": [
                561
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
                561
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                561
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
                397
            ],
            "views": [
                398
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
                561
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
                561
            ],
            "key": [
                683
            ],
            "objectMetadataId": [
                561
            ],
            "type": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                524,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                697,
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
                        561,
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
                        561,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        326,
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
                        561
                    ],
                    "threadId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        561,
                        "UUID!"
                    ],
                    "roleId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        561,
                        "UUID!"
                    ],
                    "roleId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                1,
                {
                    "input": [
                        331,
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
                248
            ],
            "checkPublicDomainValidRecords": [
                248,
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
                        531,
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
                        561,
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
                        561,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                423,
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
                298,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                298,
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
                298,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                298,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "createAgentChatChannel": [
                7,
                {
                    "input": [
                        180,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                48,
                {
                    "input": [
                        182,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                375,
                {
                    "input": [
                        183,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                184,
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
                185,
                {
                    "input": [
                        186,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                94,
                {
                    "input": [
                        187,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                122
            ],
            "createCalendarEvent": [
                189,
                {
                    "input": [
                        188,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                18,
                {
                    "channelId": [
                        561
                    ]
                }
            ],
            "createCommandMenuItem": [
                170,
                {
                    "input": [
                        190,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                246,
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
                192,
                {
                    "input": [
                        191,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                257,
                {
                    "input": [
                        193,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                297,
                {
                    "fieldMetadataId": [
                        4
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        4
                    ],
                    "fileFolder": [
                        296,
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
                303,
                {
                    "input": [
                        195,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                402,
                {
                    "inputs": [
                        201,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                677,
                {
                    "inputs": [
                        216,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                676,
                {
                    "inputs": [
                        217,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                682,
                {
                    "inputs": [
                        220,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                370,
                {
                    "input": [
                        199,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                386,
                {
                    "input": [
                        200,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                402,
                {
                    "input": [
                        201,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                297,
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
                521,
                {
                    "input": [
                        519,
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
                        561,
                        "UUID!"
                    ],
                    "properties": [
                        343
                    ],
                    "recordId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                6,
                {
                    "input": [
                        181,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                283,
                {
                    "input": [
                        203,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                332,
                {
                    "input": [
                        204,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                356,
                {
                    "input": [
                        198,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                405,
                {
                    "input": [
                        205,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                478,
                {
                    "createRoleInput": [
                        211,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                426,
                {
                    "input": [
                        206,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                427,
                {
                    "input": [
                        207,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                430,
                {
                    "input": [
                        208,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                449,
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
                470,
                {
                    "input": [
                        210,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                521,
                {
                    "input": [
                        520,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                524,
                {
                    "input": [
                        212,
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
                        531,
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
                564,
                {
                    "input": [
                        213,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                648,
                {
                    "input": [
                        214,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                668,
                {
                    "input": [
                        215,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                673,
                {
                    "input": [
                        221,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                676,
                {
                    "input": [
                        217,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                677,
                {
                    "input": [
                        216,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                678,
                {
                    "input": [
                        219,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                679,
                {
                    "input": [
                        218,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                682,
                {
                    "input": [
                        220,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                685,
                {
                    "input": [
                        222,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                689,
                {
                    "input": [
                        223,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                524,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        561,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        561
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
                375,
                {
                    "id": [
                        561,
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
                        228,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                170,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                174,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                697
            ],
            "deleteEmailGroupChannel": [
                375,
                {
                    "id": [
                        561,
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
                303,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                402,
                {
                    "ids": [
                        561,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                370,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                402,
                {
                    "id": [
                        561,
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
                283,
                {
                    "input": [
                        229,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                332,
                {
                    "input": [
                        230,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                356,
                {
                    "input": [
                        360,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                405,
                {
                    "input": [
                        231,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                4,
                {
                    "roleId": [
                        561,
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
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                470,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                232,
                {
                    "input": [
                        233,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                524,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                234,
                {
                    "twoFactorAuthenticationMethodId": [
                        561,
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
                        561,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                661
            ],
            "deleteUserFromWorkspace": [
                665,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                668,
                {
                    "id": [
                        561,
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
                676,
                {
                    "input": [
                        236,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                677,
                {
                    "input": [
                        235,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                678,
                {
                    "input": [
                        237,
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
                682,
                {
                    "input": [
                        238,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                1,
                {
                    "input": [
                        239,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                689,
                {
                    "id": [
                        561,
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
                676,
                {
                    "input": [
                        242,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                677,
                {
                    "input": [
                        241,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                678,
                {
                    "input": [
                        243,
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
                682,
                {
                    "input": [
                        244,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                1,
                {
                    "input": [
                        245,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                1,
                {
                    "input": [
                        331,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                174,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                249,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                250,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                251,
                {
                    "input": [
                        252,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                255,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "workspaceId": [
                        561
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                116
            ],
            "enqueueJob": [
                264,
                {
                    "input": [
                        262,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                266,
                {
                    "input": [
                        265,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                701
            ],
            "executeOneLogicFunction": [
                358,
                {
                    "input": [
                        280,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                308,
                {
                    "input": [
                        307,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                50,
                {
                    "apiKeyId": [
                        561,
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
                        561,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                98
            ],
            "generateTransientToken": [
                542
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                556,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                558,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        561,
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
                559,
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
                310,
                {
                    "input": [
                        311,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                363,
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
                422
            ],
            "grantApplicationCapabilities": [
                60,
                {
                    "input": [
                        320,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                330,
                {
                    "userId": [
                        561,
                        "UUID!"
                    ],
                    "workspaceId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                338,
                {
                    "input": [
                        337,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                340,
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
                340
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
                        561,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        561
                    ],
                    "threadId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                561,
                {
                    "workspaceMemberId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                316,
                {
                    "stepActionKey": [
                        313,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                1
            ],
            "releaseEnterpriseServerBinding": [
                268
            ],
            "removeAgentChatMessageReaction": [
                25,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        473,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                465,
                {
                    "principal": [
                        462,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        469,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        561,
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
                        561,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        474,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                475,
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
                511,
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
                        561,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                427,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                430,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                537,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                503,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        561,
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
                        476,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                480,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                493,
                {
                    "input": [
                        489,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                327,
                {
                    "connectionParameters": [
                        253,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        4,
                        "String!"
                    ],
                    "id": [
                        561
                    ]
                }
            ],
            "sendAppChannelMessage": [
                502,
                {
                    "input": [
                        501,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                503,
                {
                    "browsingContext": [
                        343
                    ],
                    "channelId": [
                        561
                    ],
                    "fileAttachments": [
                        295,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        1
                    ],
                    "isAssistantParticipant": [
                        1
                    ],
                    "mentionedWorkspaceMemberIds": [
                        561,
                        "[UUID!]"
                    ],
                    "messageId": [
                        561,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        561,
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
                        561,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                506,
                {
                    "input": [
                        505,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                510,
                {
                    "input": [
                        509,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                511,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        561
                    ]
                }
            ],
            "sendMessageCampaign": [
                513,
                {
                    "input": [
                        512,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                508,
                {
                    "input": [
                        514,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                52,
                {
                    "input": [
                        516,
                        "SetAppKeyValueInput!"
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
                268,
                {
                    "enterpriseKey": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                465,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        469,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                465,
                {
                    "accessLevel": [
                        461,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        462,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        469,
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
                522,
                {
                    "input": [
                        523
                    ]
                }
            ],
            "signUpInWorkspace": [
                522,
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
                        561
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
                423,
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
                        227,
                        "DateTime!"
                    ],
                    "threadId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                156,
                {
                    "connectedAccountId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                526,
                {
                    "companyContext": [
                        343
                    ],
                    "personContext": [
                        343
                    ]
                }
            ],
            "stopAgentChatStream": [
                1,
                {
                    "threadId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        527,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                528
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
                382,
                {
                    "input": [
                        535,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                711,
                {
                    "dryRun": [
                        1
                    ],
                    "inferDeletionFromMissingEntities": [
                        1
                    ],
                    "manifest": [
                        343,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                1
            ],
            "syncMcpServerTools": [
                370,
                {
                    "id": [
                        561,
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
                        343
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
                544,
                {
                    "input": [
                        543,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                548,
                {
                    "input": [
                        545,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                547,
                {
                    "input": [
                        546,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                552,
                {
                    "input": [
                        549,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                551,
                {
                    "input": [
                        550,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                554,
                {
                    "input": [
                        553,
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
                        561,
                        "UUID!"
                    ],
                    "input": [
                        566,
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
                        227
                    ],
                    "threadIds": [
                        561,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                48,
                {
                    "input": [
                        568,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                375,
                {
                    "input": [
                        569,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                58,
                {
                    "id": [
                        561,
                        "UUID!"
                    ],
                    "input": [
                        570,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                86,
                {
                    "input": [
                        571,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                90,
                {
                    "input": [
                        573,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                143,
                {
                    "input": [
                        575,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                170,
                {
                    "input": [
                        577,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                375,
                {
                    "input": [
                        578,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                303,
                {
                    "input": [
                        580,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                312,
                {
                    "input": [
                        582,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                281,
                {
                    "input": [
                        583,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                402,
                {
                    "inputs": [
                        596,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                405,
                {
                    "inputs": [
                        597,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                682,
                {
                    "inputs": [
                        619,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                370,
                {
                    "input": [
                        586,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                375,
                {
                    "input": [
                        588,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                382,
                {
                    "input": [
                        590,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                382,
                {
                    "input": [
                        592,
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
                402,
                {
                    "input": [
                        596,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                6,
                {
                    "input": [
                        567,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        561
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
                283,
                {
                    "input": [
                        595,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        584,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                405,
                {
                    "input": [
                        597,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                478,
                {
                    "updateRoleInput": [
                        604,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        598,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                427,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        599,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                430,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        601,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        603,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                341,
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
                524,
                {
                    "input": [
                        606,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                537,
                {
                    "input": [
                        607,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                564,
                {
                    "input": [
                        608,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                648,
                {
                    "input": [
                        609,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                115,
                {
                    "userCreditsFallback": [
                        663,
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
                668,
                {
                    "input": [
                        610,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                673,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        621,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                676,
                {
                    "input": [
                        614,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                677,
                {
                    "input": [
                        612,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                678,
                {
                    "input": [
                        617,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                679,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        616,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                682,
                {
                    "input": [
                        619,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                685,
                {
                    "input": [
                        622,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                689,
                {
                    "input": [
                        624,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                697,
                {
                    "data": [
                        628,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                697,
                {
                    "data": [
                        626,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                697,
                {
                    "data": [
                        627,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                706,
                {
                    "roleId": [
                        561,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        629,
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
                        630,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "uploadApplicationFile": [
                294,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        630,
                        "Upload!"
                    ],
                    "fileFolder": [
                        296,
                        "FileFolder!"
                    ],
                    "filePath": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                298,
                {
                    "fieldMetadataUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        630,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                298,
                {
                    "file": [
                        630,
                        "Upload!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                298,
                {
                    "file": [
                        630,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                298,
                {
                    "file": [
                        630,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                290,
                {
                    "upsertFieldPermissionsInput": [
                        631,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                673,
                {
                    "input": [
                        634,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                413,
                {
                    "upsertObjectPermissionsInput": [
                        635,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                479,
                {
                    "upsertPermissionFlagsInput": [
                        636,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                638,
                {
                    "input": [
                        637,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                673,
                {
                    "input": [
                        639,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                94,
                {
                    "input": [
                        666,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                670,
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
                257,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                671,
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
                561
            ],
            "agentId": [
                561
            ],
            "applicationId": [
                561
            ],
            "color": [
                4
            ],
            "createdAt": [
                227
            ],
            "folderId": [
                561
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                561
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                561
            ],
            "targetRecordId": [
                561
            ],
            "targetRecordIdentifier": [
                458
            ],
            "type": [
                403
            ],
            "updatedAt": [
                227
            ],
            "userWorkspaceId": [
                561
            ],
            "viewId": [
                561
            ],
            "workflowId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                691
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                561
            ],
            "color": [
                4
            ],
            "createdAt": [
                227
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
                408,
                {
                    "filter": [
                        288,
                        "FieldFilter!"
                    ],
                    "paging": [
                        225,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                283
            ],
            "icon": [
                4
            ],
            "id": [
                561
            ],
            "imageIdentifierFieldMetadataId": [
                561
            ],
            "indexMetadataList": [
                332
            ],
            "indexMetadatas": [
                410,
                {
                    "filter": [
                        335,
                        "IndexFilter!"
                    ],
                    "paging": [
                        225,
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
                561
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
                412
            ],
            "searchFieldMetadataList": [
                499
            ],
            "shortcut": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "ObjectConnection": {
            "edges": [
                407
            ],
            "pageInfo": [
                425
            ],
            "__typename": [
                4
            ]
        },
        "ObjectEdge": {
            "cursor": [
                177
            ],
            "node": [
                405
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                287
            ],
            "pageInfo": [
                425
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                409
            ],
            "id": [
                562
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
                409
            ],
            "universalIdentifier": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                333
            ],
            "pageInfo": [
                425
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                561
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
                561
            ],
            "restrictedFields": [
                343
            ],
            "rowLevelPermissionPredicateGroups": [
                482
            ],
            "rowLevelPermissionPredicates": [
                481
            ],
            "uneditableFields": [
                561
            ],
            "unreadableFields": [
                561
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
                561
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
                226
            ],
            "objectNameSingular": [
                4
            ],
            "properties": [
                417
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
                343
            ],
            "before": [
                343
            ],
            "diff": [
                343
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
                416
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
                561
            ],
            "restrictedFields": [
                343
            ],
            "rowLevelRecordsPermissions": [
                488
            ],
            "uneditableFields": [
                561
            ],
            "unreadableFields": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                421
            ],
            "previousOnboardingStatus": [
                421
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
                177
            ],
            "hasNextPage": [
                1
            ],
            "hasPreviousPage": [
                1
            ],
            "startCursor": [
                177
            ],
            "__typename": [
                4
            ]
        },
        "PageLayout": {
            "applicationId": [
                561
            ],
            "createdAt": [
                227
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                561
            ],
            "deletedAt": [
                227
            ],
            "id": [
                561
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
                561
            ],
            "tabs": [
                427
            ],
            "type": [
                429
            ],
            "universalIdentifier": [
                561
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                561
            ],
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                428
            ],
            "pageLayoutId": [
                561
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                561
            ],
            "updatedAt": [
                227
            ],
            "widgets": [
                430
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                325
            ],
            "applicationId": [
                561
            ],
            "applicationName": [
                4
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                343
            ],
            "configuration": [
                690
            ],
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "gridPosition": [
                322
            ],
            "id": [
                561
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
                561
            ],
            "pageLayoutTabId": [
                561
            ],
            "position": [
                433
            ],
            "title": [
                4
            ],
            "type": [
                692
            ],
            "universalIdentifier": [
                561
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                428
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
                428
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
                431
            ],
            "on_PageLayoutWidgetGridPosition": [
                432
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                435
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                434
            ],
            "index": [
                2
            ],
            "layoutMode": [
                428
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
                561
            ],
            "createdAt": [
                227
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                561
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                561
            ],
            "aggregateOperation": [
                32
            ],
            "color": [
                4
            ],
            "configurationType": [
                691
            ],
            "dateGranularity": [
                419
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
                343
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupByFieldMetadataId": [
                561
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
                321
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
                442
            ],
            "formattedToRawLookup": [
                343
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
                343
            ],
            "objectMetadataId": [
                561
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
                355
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
                227
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
                374
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                561
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
                254
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
                561
            ],
            "createdAt": [
                227
            ],
            "domain": [
                4
            ],
            "id": [
                561
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
                282
            ],
            "metadata": [
                451
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
                448
            ],
            "IMAP": [
                448
            ],
            "SMTP": [
                448
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
                561
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                715
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
                561
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
                        561,
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
                        561,
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
                        561,
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
                        309,
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
                        352
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
                375,
                {
                    "filter": [
                        353
                    ]
                }
            ],
            "appMessageFolders": [
                382,
                {
                    "filter": [
                        354
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                61,
                {
                    "applicationId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                62,
                {
                    "applicationId": [
                        561,
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
                498,
                {
                    "applicationId": [
                        561,
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
                561,
                {
                    "calendarEventId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                23,
                {
                    "agentUniversalIdentifier": [
                        561
                    ],
                    "threadId": [
                        561
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
                        561
                    ],
                    "threadId": [
                        561
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
                        561,
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
                705,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                529,
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
                        561,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                170
            ],
            "currentUser": [
                661
            ],
            "currentUserApplicationAuthorizations": [
                59
            ],
            "currentUserSessions": [
                664
            ],
            "currentWorkspace": [
                697
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
                269
            ],
            "eventLogs": [
                276,
                {
                    "input": [
                        275,
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
                    "shouldIncludeSourceFiles": [
                        1
                    ],
                    "universalIdentifier": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                283,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                285,
                {
                    "filter": [
                        288,
                        "FieldFilter!"
                    ],
                    "paging": [
                        225,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                447,
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
                        227
                    ],
                    "periodStart": [
                        227
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
                        227
                    ],
                    "periodStart": [
                        227
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
                346,
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
                356
            ],
            "findManyMarketplaceApps": [
                364,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                449
            ],
            "findMarketplaceAppDetail": [
                365,
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
                        561
                    ],
                    "universalIdentifier": [
                        561
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
                356,
                {
                    "input": [
                        360,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                346,
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
                346,
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
                699
            ],
            "findWorkspaceFromInviteHash": [
                697,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                704
            ],
            "frontComponent": [
                303,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                303
            ],
            "getAddressDetails": [
                443,
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
                478
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
                343,
                {
                    "input": [
                        360,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                176,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                257
            ],
            "getInviteSuggestions": [
                342
            ],
            "getJobs": [
                346,
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
                        360,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                427,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                427,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                430,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                430,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                426,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        429
                    ]
                }
            ],
            "getPermissionFlags": [
                437
            ],
            "getPublicWorkspaceDataByDomain": [
                453,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                454,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                132
            ],
            "getRole": [
                478,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                478
            ],
            "getSSOIdentityProviders": [
                300
            ],
            "getToolIndex": [
                541
            ],
            "getToolInputSchema": [
                343,
                {
                    "toolName": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                645,
                {
                    "input": [
                        646
                    ]
                }
            ],
            "getView": [
                673,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                676,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                677,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                677,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                676,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                678,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                679,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                679,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                678,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                682,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                682,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                685,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                685,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                673,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        687,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                702
            ],
            "gettingStartedProgress": [
                312
            ],
            "gettingStartedWorkflowPreviews": [
                317
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
                348,
                {
                    "input": [
                        349,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                123
            ],
            "mcpServer": [
                370,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                370
            ],
            "messageSuppressions": [
                387,
                {
                    "input": [
                        301,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                392,
                {
                    "input": [
                        395,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                396
            ],
            "mostlyEmptyFieldMetadataIds": [
                561,
                {
                    "objectMetadataId": [
                        561,
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
                        561
                    ]
                }
            ],
            "myConnectedAccounts": [
                174
            ],
            "myMessageChannels": [
                375,
                {
                    "connectedAccountId": [
                        561
                    ]
                }
            ],
            "myMessageFolders": [
                382,
                {
                    "messageChannelId": [
                        561
                    ]
                }
            ],
            "myUserApplicationVariables": [
                707
            ],
            "navigationMenuItem": [
                402,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                402
            ],
            "object": [
                405,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                415
            ],
            "objects": [
                406,
                {
                    "filter": [
                        409,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        225,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                440,
                {
                    "input": [
                        441,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                151,
                {
                    "input": [
                        444,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                446,
                {
                    "input": [
                        445,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                365,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                364
            ],
            "recordPermissions": [
                460,
                {
                    "targets": [
                        469,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                465,
                {
                    "target": [
                        469,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                470
            ],
            "skill": [
                524,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                524
            ],
            "timelineActivityTypes": [
                537
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                555
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                560,
                {
                    "userId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                564
            ],
            "usageLimits": [
                648
            ],
            "usageQuotaDefinitions": [
                652
            ],
            "usageQuotaScopeConsumption": [
                654,
                {
                    "input": [
                        655,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                656
            ],
            "validatePasswordResetToken": [
                667,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                668,
                {
                    "objectMetadataId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                668,
                {
                    "fieldMetadataId": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                689,
                {
                    "id": [
                        561,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                689
            ],
            "__typename": [
                4
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                561
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
                561
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
                561
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
                561
            ],
            "permissions": [
                459
            ],
            "recordId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                561
            ],
            "workspaceMemberId": [
                561
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
                459
            ],
            "roles": [
                467
            ],
            "shares": [
                466
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                461
            ],
            "id": [
                19
            ],
            "principalId": [
                561
            ],
            "principalRoleId": [
                561
            ],
            "principalType": [
                463
            ],
            "rowCause": [
                464
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
                561
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
                691
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
                561
            ],
            "recordId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                561
            ],
            "id": [
                561
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                561
            ],
            "secondFieldMetadataId": [
                561
            ],
            "thirdFieldMetadataId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                283
            ],
            "sourceObjectMetadata": [
                405
            ],
            "targetFieldMetadata": [
                283
            ],
            "targetObjectMetadata": [
                405
            ],
            "type": [
                472
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
                561
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
                561
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
                290
            ],
            "icon": [
                4
            ],
            "id": [
                561
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                413
            ],
            "permissionFlags": [
                479
            ],
            "rowLevelPermissionFieldPermissions": [
                290
            ],
            "rowLevelPermissionPredicateGroups": [
                482
            ],
            "rowLevelPermissionPredicates": [
                481
            ],
            "rowLevelPermissionRules": [
                487
            ],
            "universalIdentifier": [
                561
            ],
            "workspaceMembers": [
                706
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
                561
            ],
            "roleId": [
                561
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
                486
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
                343
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
                484
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
                561
            ],
            "logicalOperator": [
                484
            ],
            "objectMetadataId": [
                561
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                561
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
                561
            ],
            "id": [
                561
            ],
            "operand": [
                486
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                8
            ],
            "relationFieldMetadataId": [
                561
            ],
            "rowLevelPermissionPredicateGroupId": [
                561
            ],
            "subFieldName": [
                4
            ],
            "value": [
                343
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
                561
            ],
            "objectMetadataId": [
                561
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
                482
            ],
            "predicates": [
                481
            ],
            "ruleId": [
                561
            ],
            "uneditableFields": [
                561
            ],
            "unreadableFields": [
                561
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
                491
            ],
            "messages": [
                491
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                343
            ],
            "runAsWorkspaceMemberId": [
                561
            ],
            "thread": [
                494
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
                561
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
                490
            ],
            "content": [
                4
            ],
            "role": [
                492
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
                343
            ],
            "runId": [
                561
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                561
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
                561
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                497
            ],
            "type": [
                323
            ],
            "__typename": [
                4
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                561
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                497
            ],
            "type": [
                323
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
                227
            ],
            "fieldMetadataId": [
                561
            ],
            "id": [
                561
            ],
            "position": [
                8
            ],
            "tsVectorFieldMetadataId": [
                561
            ],
            "updatedAt": [
                227
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
            "email": [
                500
            ],
            "idempotencyKey": [
                561
            ],
            "messageChannelId": [
                561
            ],
            "messageThreadId": [
                561
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
                561
            ],
            "messageThreadId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                561
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                561
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
                504
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
                507
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
                561
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
                343
            ],
            "workspaceMemberIds": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                561
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
                704
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
                227
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
                343
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                561
            ],
            "createdAt": [
                227
            ],
            "frontComponentId": [
                561
            ],
            "icon": [
                4
            ],
            "id": [
                561
            ],
            "position": [
                8
            ],
            "scope": [
                518
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                561
            ],
            "updatedAt": [
                227
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
                561
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
                561
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                497
            ],
            "type": [
                323
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
                716
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
                561
            ],
            "content": [
                4
            ],
            "createdAt": [
                227
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                227
            ],
            "__typename": [
                4
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                477
            ],
            "configurationType": [
                691
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                714
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
                561
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
                277,
                {
                    "fieldFilters": [
                        271,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        278,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                457,
                {
                    "input": [
                        209,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                361,
                {
                    "input": [
                        362,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                15,
                {
                    "agentUniversalIdentifier": [
                        561
                    ],
                    "runId": [
                        561
                    ],
                    "threadId": [
                        561
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "onEventSubscription": [
                279,
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
                534
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                691
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
                561
            ],
            "createdAt": [
                227
            ],
            "emit": [
                538
            ],
            "frontComponentUniversalIdentifier": [
                561
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                561
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                561
            ],
            "universalIdentifier": [
                561
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                561
            ],
            "on": [
                4
            ],
            "through": [
                539
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                561
            ],
            "relationFieldUniversalIdentifier": [
                561
            ],
            "triggerFieldUniversalIdentifiers": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                691
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
                343
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
                561
            ],
            "personFilter": [
                343
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                227
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
                227
            ],
            "__typename": [
                4
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                561
            ],
            "gt": [
                561
            ],
            "gte": [
                561
            ],
            "iLike": [
                561
            ],
            "in": [
                561
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                561
            ],
            "lt": [
                561
            ],
            "lte": [
                561
            ],
            "neq": [
                561
            ],
            "notILike": [
                561
            ],
            "notIn": [
                561
            ],
            "notLike": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                227
            ],
            "description": [
                4
            ],
            "id": [
                561
            ],
            "name": [
                4
            ],
            "updatedAt": [
                227
            ],
            "visibility": [
                565
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
                561
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
                561
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                343
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
                343
            ],
            "roleId": [
                561
            ],
            "triggers": [
                343
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
                561
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
                561
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                561
            ],
            "visibility": [
                381
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
                572
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
                574
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
                561
            ],
            "update": [
                576
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
                561
            ],
            "availabilityType": [
                171
            ],
            "engineComponentKey": [
                261
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                561
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                561
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                343
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
                343
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                561
            ],
            "options": [
                343
            ],
            "settings": [
                343
            ],
            "translations": [
                393
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
                561
            ],
            "update": [
                581
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
                313
            ],
            "completedStepChatThreadId": [
                4
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                313
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
                561
            ],
            "update": [
                585
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                343
            ],
            "databaseEventTriggerSettings": [
                343
            ],
            "description": [
                4
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                343
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
                343
            ],
            "workflowActionTriggerSettings": [
                343
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                561
            ],
            "update": [
                587
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                561
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
                561
            ],
            "update": [
                589
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                376
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
                383
            ],
            "visibility": [
                381
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                561
            ],
            "update": [
                591
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
                561
            ],
            "update": [
                591
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
                561
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
                561
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
                561
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
                561
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
                412
            ],
            "shortcut": [
                4
            ],
            "translations": [
                393
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                561
            ],
            "update": [
                579
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                561
            ],
            "update": [
                593
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                561
            ],
            "update": [
                594
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
                561
            ],
            "type": [
                429
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
                428
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
                561
            ],
            "layoutMode": [
                428
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "widgets": [
                602
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
                343
            ],
            "configuration": [
                343
            ],
            "isActive": [
                1
            ],
            "objectMetadataId": [
                561
            ],
            "pageLayoutTabId": [
                561
            ],
            "position": [
                343
            ],
            "title": [
                4
            ],
            "type": [
                692
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
                343
            ],
            "configuration": [
                343
            ],
            "id": [
                561
            ],
            "objectMetadataId": [
                561
            ],
            "pageLayoutTabId": [
                561
            ],
            "position": [
                343
            ],
            "title": [
                4
            ],
            "type": [
                692
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
                561
            ],
            "tabs": [
                600
            ],
            "type": [
                429
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRoleInput": {
            "id": [
                561
            ],
            "update": [
                605
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
                561
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
                561
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                393
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
                565
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                561
            ],
            "payload": [
                214
            ],
            "__typename": [
                4
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                561
            ],
            "update": [
                611
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
                561
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
                561
            ],
            "update": [
                613
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
                561
            ],
            "update": [
                615
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                561
            ],
            "logicalOperator": [
                680
            ],
            "parentViewFilterGroupId": [
                561
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                561
            ],
            "update": [
                618
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                561
            ],
            "operand": [
                681
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                561
            ],
            "subFieldName": [
                4
            ],
            "value": [
                343
            ],
            "viewFilterGroupId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                561
            ],
            "update": [
                620
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                561
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
                561
            ],
            "calendarFieldMetadataId": [
                561
            ],
            "calendarLayout": [
                674
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                561
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                561
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                561
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                684
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
                393
            ],
            "type": [
                687
            ],
            "visibility": [
                688
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                561
            ],
            "update": [
                623
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                686
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
                561
            ],
            "update": [
                625
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
                561
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
                343
            ],
            "allowImpersonation": [
                1
            ],
            "customDomain": [
                4
            ],
            "defaultRoleId": [
                561
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
                703
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                343
            ],
            "workspaceMemberId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                291
            ],
            "roleId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                561
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewFieldId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                632
            ],
            "id": [
                561
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
                632
            ],
            "groups": [
                633
            ],
            "widgetId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                414
            ],
            "roleId": [
                561
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
                561
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
                561
            ],
            "predicateGroups": [
                483
            ],
            "predicates": [
                485
            ],
            "roleId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                482
            ],
            "predicates": [
                481
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                643
            ],
            "viewFields": [
                640
            ],
            "viewFilterGroups": [
                641
            ],
            "viewFilters": [
                642
            ],
            "viewSorts": [
                644
            ],
            "widgetId": [
                561
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
                561
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                561
            ],
            "logicalOperator": [
                680
            ],
            "parentViewFilterGroupId": [
                561
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
                561
            ],
            "id": [
                561
            ],
            "operand": [
                681
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                561
            ],
            "subFieldName": [
                4
            ],
            "value": [
                343
            ],
            "viewFilterGroupId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                561
            ],
            "calendarFieldMetadataId": [
                561
            ],
            "calendarLayout": [
                674
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                561
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                561
            ],
            "openRecordIn": [
                684
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                686
            ],
            "fieldMetadataId": [
                561
            ],
            "id": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                227
            ],
            "periodStart": [
                227
            ],
            "timeSeries": [
                658
            ],
            "usageByApplication": [
                647
            ],
            "usageByModel": [
                647
            ],
            "usageByOperationType": [
                647
            ],
            "usageByUser": [
                647
            ],
            "userDailyUsage": [
                660
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                650
            ],
            "periodEnd": [
                227
            ],
            "periodStart": [
                227
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
                227
            ],
            "id": [
                561
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                650
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                657
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                659
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                659
            ],
            "operationType": [
                650
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                649
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                653
            ],
            "resourceType": [
                657
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                651
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
                650
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                659
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
                227
            ],
            "periodStart": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                650
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                657
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                659
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
                561
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                650
            ],
            "periodEnd": [
                227
            ],
            "periodStart": [
                227
            ],
            "periodUnit": [
                4
            ],
            "remainingValue": [
                113
            ],
            "resourceType": [
                657
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
                659
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
                658
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
                227
            ],
            "currentUserWorkspace": [
                665
            ],
            "currentWorkspace": [
                697
            ],
            "deletedAt": [
                227
            ],
            "deletedWorkspaceMembers": [
                240
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
                561
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
                421
            ],
            "previousOnboardingStatus": [
                421
            ],
            "supportUserHash": [
                4
            ],
            "updatedAt": [
                227
            ],
            "userVars": [
                344
            ],
            "userWorkspaces": [
                665
            ],
            "workspaceMember": [
                706
            ],
            "workspaceMembers": [
                706
            ],
            "workspaces": [
                665
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
                343
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
                227
            ],
            "expiresAt": [
                227
            ],
            "id": [
                561
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
                227
            ],
            "region": [
                4
            ],
            "userAgent": [
                4
            ],
            "workspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "id": [
                561
            ],
            "isImpersonating": [
                1
            ],
            "locale": [
                4
            ],
            "objectRecordsPermissions": [
                420
            ],
            "permissionFlags": [
                438
            ],
            "twoFactorAuthenticationMethodSummary": [
                557
            ],
            "updatedAt": [
                227
            ],
            "user": [
                661
            ],
            "userId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                561
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
                561
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
                561
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                561
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
                715
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
                561
            ],
            "calendarEndFieldMetadataId": [
                561
            ],
            "calendarFieldMetadataId": [
                561
            ],
            "calendarLayout": [
                674
            ],
            "createdAt": [
                227
            ],
            "createdByUserWorkspaceId": [
                561
            ],
            "deletedAt": [
                227
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                561
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
                561
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                683
            ],
            "mainGroupByFieldMetadataId": [
                561
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                561
            ],
            "openRecordIn": [
                684
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
                687
            ],
            "universalIdentifier": [
                561
            ],
            "updatedAt": [
                227
            ],
            "viewFieldGroups": [
                677
            ],
            "viewFields": [
                676
            ],
            "viewFilterGroups": [
                679
            ],
            "viewFilters": [
                678
            ],
            "viewGroups": [
                682
            ],
            "viewSorts": [
                685
            ],
            "visibility": [
                688
            ],
            "workspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                691
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
                561
            ],
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "fieldMetadataId": [
                561
            ],
            "id": [
                561
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
                561
            ],
            "updatedAt": [
                227
            ],
            "viewFieldGroupId": [
                561
            ],
            "viewId": [
                561
            ],
            "workspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "id": [
                561
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
                227
            ],
            "viewFields": [
                676
            ],
            "viewId": [
                561
            ],
            "workspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilter": {
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "fieldMetadataId": [
                561
            ],
            "id": [
                561
            ],
            "operand": [
                681
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                561
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                227
            ],
            "value": [
                343
            ],
            "viewFilterGroupId": [
                561
            ],
            "viewId": [
                561
            ],
            "workspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "id": [
                561
            ],
            "logicalOperator": [
                680
            ],
            "parentViewFilterGroupId": [
                561
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "updatedAt": [
                227
            ],
            "viewId": [
                561
            ],
            "workspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "fieldValue": [
                4
            ],
            "id": [
                561
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "updatedAt": [
                227
            ],
            "viewId": [
                561
            ],
            "workspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "direction": [
                686
            ],
            "fieldMetadataId": [
                561
            ],
            "id": [
                561
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                227
            ],
            "viewId": [
                561
            ],
            "workspaceId": [
                561
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
                561
            ],
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "description": [
                4
            ],
            "id": [
                561
            ],
            "operations": [
                4
            ],
            "role": [
                478
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "updatedAt": [
                227
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
                256
            ],
            "on_EmailsConfiguration": [
                260
            ],
            "on_FieldConfiguration": [
                284
            ],
            "on_FieldRichTextConfiguration": [
                292
            ],
            "on_FieldsConfiguration": [
                293
            ],
            "on_FilesConfiguration": [
                299
            ],
            "on_FormFieldConfiguration": [
                302
            ],
            "on_FrontComponentConfiguration": [
                304
            ],
            "on_IframeConfiguration": [
                324
            ],
            "on_LineChartConfiguration": [
                347
            ],
            "on_MessageCampaignBodyConfiguration": [
                372
            ],
            "on_MessageCampaignDetailsConfiguration": [
                373
            ],
            "on_NotesConfiguration": [
                404
            ],
            "on_PieChartConfiguration": [
                439
            ],
            "on_RecordTableConfiguration": [
                468
            ],
            "on_StandaloneRichTextConfiguration": [
                525
            ],
            "on_TasksConfiguration": [
                536
            ],
            "on_TimelineConfiguration": [
                540
            ],
            "on_ViewConfiguration": [
                675
            ],
            "on_WorkflowConfiguration": [
                694
            ],
            "on_WorkflowRunConfiguration": [
                695
            ],
            "on_WorkflowVersionConfiguration": [
                696
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
                691
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                691
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                691
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                698
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
                343
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
                227
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
                478
            ],
            "deletedAt": [
                227
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
                281
            ],
            "hasValidEnterpriseValidityToken": [
                1
            ],
            "hasValidSignedEnterpriseKey": [
                1
            ],
            "id": [
                561
            ],
            "iframeMediaPermissions": [
                325
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
                561
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
                227
            ],
            "viewFields": [
                676
            ],
            "viewFilterGroups": [
                679
            ],
            "viewFilters": [
                678
            ],
            "viewGroups": [
                682
            ],
            "viewSorts": [
                685
            ],
            "views": [
                673
            ],
            "workspaceCustomApplication": [
                58
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                703
            ],
            "workspaceMembersCount": [
                8
            ],
            "workspaceUrls": [
                715
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
                343
            ],
            "isBookCallOnboardingStepPending": [
                1
            ],
            "outcome": [
                700
            ],
            "personEnrichment": [
                343
            ],
            "personOutcome": [
                713
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
                227
            ],
            "id": [
                561
            ],
            "roleId": [
                561
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
                708
            ],
            "id": [
                561
            ],
            "locale": [
                4
            ],
            "name": [
                306
            ],
            "numberFormat": [
                709
            ],
            "openRecordIn": [
                424
            ],
            "roles": [
                478
            ],
            "timeFormat": [
                710
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
                561
            ],
            "userWorkspaceId": [
                561
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                561
            ],
            "variables": [
                662
            ],
            "workspaceMemberId": [
                561
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
                343
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
                561
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
                561
            ],
            "workspaceUrls": [
                715
            ],
            "__typename": [
                4
            ]
        }
    }
}