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
        377,
        378,
        379,
        380,
        381,
        382,
        384,
        385,
        386,
        389,
        390,
        392,
        395,
        400,
        404,
        413,
        420,
        422,
        425,
        429,
        430,
        435,
        439,
        462,
        464,
        465,
        473,
        485,
        487,
        493,
        498,
        520,
        533,
        534,
        536,
        563,
        565,
        567,
        632,
        652,
        659,
        661,
        665,
        676,
        682,
        683,
        685,
        686,
        688,
        689,
        690,
        693,
        694,
        695,
        700,
        702,
        705,
        710,
        711,
        712,
        715,
        716
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
                563
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
                563
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
                563
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
                563
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                563
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
                563
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
                563
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
                563
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
                563
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
                563
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
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                563
            ],
            "createdAt": [
                227
            ],
            "id": [
                563
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
                563
            ],
            "senderUserWorkspaceId": [
                563
            ],
            "senderWorkspaceMemberId": [
                563
            ],
            "status": [
                4
            ],
            "threadId": [
                563
            ],
            "turnId": [
                563
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
                563
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                563
            ],
            "messageId": [
                563
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
                563
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                563
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
                563
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
                563
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
                563
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
                563
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
                563
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
                563
            ],
            "aggregateOperation": [
                32
            ],
            "configurationType": [
                693
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
                457
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
                563
            ],
            "name": [
                4
            ],
            "revokedAt": [
                227
            ],
            "role": [
                479
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
                563
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
                563
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
                563
            ],
            "role": [
                386
            ],
            "workspaceMemberId": [
                563
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
                563
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
                479
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
                563
            ],
            "grantedIframeMediaPermissions": [
                325
            ],
            "healthCheckLogicFunctionId": [
                563
            ],
            "id": [
                563
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                356
            ],
            "logoFileId": [
                563
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                406
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                563
            ],
            "requestedIframeMediaPermissions": [
                325
            ],
            "runOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                563
            ],
            "settingsMenuItems": [
                519
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                563
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
                563
            ],
            "lastAuthorizedAt": [
                227
            ],
            "lastUsedAt": [
                227
            ],
            "marketplaceAppUniversalIdentifier": [
                4
            ],
            "scopes": [
                4
            ],
            "userId": [
                563
            ],
            "workspaceId": [
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                563
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
                453
            ],
            "connectionProviderId": [
                563
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
                563
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
                563
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
                563
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
                563
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
                563
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
                563
            ],
            "connectionProviders": [
                62
            ],
            "hasUserHealthCheck": [
                1
            ],
            "settingsMenuItems": [
                519
            ],
            "variables": [
                664
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
                563
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
                563
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
                674
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                563
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
                563
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
                563
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
                563
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
                563
            ],
            "workspaceMemberIds": [
                563
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
                497
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
                563
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
                496
            ],
            "workspaceUrls": [
                717
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
                563
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
                693
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
                420
            ],
            "primaryAxisGroupByFieldMetadataId": [
                563
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
                420
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                563
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
                563
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
                563
            ],
            "userCreditsFallback": [
                665
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
                534
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
                533
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
                533
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
                563
            ],
            "interval": [
                533
            ],
            "metadata": [
                343
            ],
            "phases": [
                137
            ],
            "status": [
                534
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
                563
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
                563
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
                563
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
                693
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                693
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                693
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
                693
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
                693
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
                400
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                402
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
                451
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                517
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                535
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
                563
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                563
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
                563
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
                563
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                563
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
                563
            ],
            "pageLayoutId": [
                563
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
                563
            ],
            "updatedAt": [
                227
            ],
            "workflowVersionId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                412
            ],
            "on_PathCommandMenuItemPayload": [
                437
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
                563
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
                453
            ],
            "connectionProviderId": [
                563
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
                563
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
                563
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
                563
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                563
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
                563
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
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                563
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                563
            ],
            "participantHandleFieldUniversalIdentifier": [
                563
            ],
            "visibility": [
                382
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
                563
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
                563
            ],
            "engineComponentKey": [
                261
            ],
            "frontComponentId": [
                563
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
                563
            ],
            "pageLayoutId": [
                563
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
                563
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
                376
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
                563
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
                563
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
                563
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
                563
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
                563
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
                563
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
                563
            ],
            "id": [
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                563
            ],
            "agentId": [
                563
            ],
            "color": [
                4
            ],
            "folderId": [
                563
            ],
            "icon": [
                4
            ],
            "id": [
                563
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
                563
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                563
            ],
            "targetRecordId": [
                563
            ],
            "type": [
                404
            ],
            "userWorkspaceId": [
                563
            ],
            "viewId": [
                563
            ],
            "workflowId": [
                563
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
                563
            ],
            "type": [
                430
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                429
            ],
            "pageLayoutId": [
                563
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
                563
            ],
            "pageLayoutTabId": [
                563
            ],
            "position": [
                343
            ],
            "title": [
                4
            ],
            "type": [
                694
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                563
            ],
            "filter": [
                343
            ],
            "objectMetadataId": [
                563
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
                563
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                563
            ],
            "secondFieldMetadataId": [
                563
            ],
            "thirdFieldMetadataId": [
                563
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
                563
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
                567
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
                652
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                659
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                661
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
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                563
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
                563
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
                563
            ],
            "id": [
                563
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
                563
            ],
            "viewId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                563
            ],
            "logicalOperator": [
                682
            ],
            "parentViewFilterGroupId": [
                563
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                563
            ],
            "id": [
                563
            ],
            "operand": [
                683
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                563
            ],
            "subFieldName": [
                4
            ],
            "value": [
                343
            ],
            "viewFilterGroupId": [
                563
            ],
            "viewId": [
                563
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
                563
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewId": [
                563
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
                563
            ],
            "calendarFieldMetadataId": [
                563
            ],
            "calendarLayout": [
                676
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                563
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                563
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                685
            ],
            "mainGroupByFieldMetadataId": [
                563
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                563
            ],
            "openRecordIn": [
                686
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
                689
            ],
            "visibility": [
                690
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                688
            ],
            "fieldMetadataId": [
                563
            ],
            "id": [
                563
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                563
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
                563
            ],
            "operations": [
                4
            ],
            "roleId": [
                563
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
                652
            ],
            "resource": [
                659
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                563
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
                563
            ],
            "name": [
                306
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                563
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
                563
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
                563
            ],
            "pageLayoutId": [
                563
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
                563
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
                563
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                498
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
                563
            ],
            "status": [
                498
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
                693
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
                563
            ],
            "status": [
                258
            ],
            "tenantStatus": [
                259
            ],
            "unsubscribeHostnameStatus": [
                565
            ],
            "updatedAt": [
                227
            ],
            "verificationRecords": [
                671
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
                693
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
                391
            ],
            "objectRecordEventsWithQueryIds": [
                419
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
                563
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
                563
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
                563
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
                563
            ],
            "morphRelations": [
                472
            ],
            "name": [
                4
            ],
            "object": [
                406
            ],
            "objectMetadataId": [
                563
            ],
            "options": [
                343
            ],
            "relation": [
                472
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
                693
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
                426
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
                564
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
                564
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
                563
            ],
            "id": [
                563
            ],
            "objectMetadataId": [
                563
            ],
            "roleId": [
                563
            ],
            "rowLevelPermissionPredicateGroupId": [
                563
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
                563
            ],
            "objectMetadataId": [
                563
            ],
            "rowLevelPermissionPredicateGroupId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                693
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                693
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
                563
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
                563
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
                563
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
                563
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
                693
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                563
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                498
            ],
            "type": [
                323
            ],
            "workspace": [
                714
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
                389
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                693
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
                563
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
                563
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
                563
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
                693
            ],
            "frontComponentId": [
                563
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                563
            ],
            "pageLayoutType": [
                430
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
                492
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
                563
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
                563
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
                563
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
                563
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
                563
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
                695
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
                563
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
                693
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
                718
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
                563
            ],
            "threadId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                563
            ],
            "createdAt": [
                227
            ],
            "id": [
                563
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
                563
            ],
            "id": [
                563
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
                564
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
                563
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
                563
            ],
            "messageThreadId": [
                563
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
                563
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
                693
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
                420
            ],
            "primaryAxisGroupByFieldMetadataId": [
                563
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
                420
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                563
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
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                563
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
                563
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
                563
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
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                563
            ],
            "applicationUniversalIdentifier": [
                563
            ],
            "id": [
                563
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                563
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
                563
            ],
            "messageThreadId": [
                563
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
                343
            ],
            "name": [
                4
            ],
            "objects": [
                367
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
                368
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
                369
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                370
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
                563
            ],
            "connectionProviderId": [
                563
            ],
            "createdAt": [
                227
            ],
            "id": [
                563
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
                372
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
                693
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                693
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
                563
            ],
            "contactAutoCreationPolicy": [
                377
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
                563
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
                384
            ],
            "messagingProviderUniversalIdentifier": [
                563
            ],
            "participantHandleFieldUniversalIdentifier": [
                563
            ],
            "pendingGroupEmailsAction": [
                378
            ],
            "syncStage": [
                379
            ],
            "syncStageStartedAt": [
                227
            ],
            "syncStatus": [
                380
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
                381
            ],
            "updatedAt": [
                227
            ],
            "visibility": [
                382
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
                563
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                563
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                385
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
                563
            ],
            "reason": [
                389
            ],
            "source": [
                390
            ],
            "unsubscribeTopicId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                387
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
                418
            ],
            "recordId": [
                4
            ],
            "type": [
                392
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
                563
            ],
            "property": [
                4
            ],
            "provenance": [
                395
            ],
            "recordId": [
                563
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
                563
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                563
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
                398
            ],
            "views": [
                399
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
                563
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
                563
            ],
            "key": [
                685
            ],
            "objectMetadataId": [
                563
            ],
            "type": [
                689
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                526,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                699,
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
                        563,
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
                        563,
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
                        563
                    ],
                    "threadId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        563,
                        "UUID!"
                    ],
                    "roleId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        563,
                        "UUID!"
                    ],
                    "roleId": [
                        563,
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
                        533,
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
                        563,
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
                        563,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                424,
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
                376,
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
                        563
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
                403,
                {
                    "inputs": [
                        201,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                679,
                {
                    "inputs": [
                        216,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                678,
                {
                    "inputs": [
                        217,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                684,
                {
                    "inputs": [
                        220,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                371,
                {
                    "input": [
                        199,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                387,
                {
                    "input": [
                        200,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                403,
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
                523,
                {
                    "input": [
                        521,
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
                        563,
                        "UUID!"
                    ],
                    "properties": [
                        343
                    ],
                    "recordId": [
                        563,
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
                406,
                {
                    "input": [
                        205,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                479,
                {
                    "createRoleInput": [
                        211,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                427,
                {
                    "input": [
                        206,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                428,
                {
                    "input": [
                        207,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                431,
                {
                    "input": [
                        208,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                450,
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
                471,
                {
                    "input": [
                        210,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                523,
                {
                    "input": [
                        522,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                526,
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
                        533,
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
                566,
                {
                    "input": [
                        213,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                650,
                {
                    "input": [
                        214,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                670,
                {
                    "input": [
                        215,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                675,
                {
                    "input": [
                        221,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                678,
                {
                    "input": [
                        217,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                679,
                {
                    "input": [
                        216,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                680,
                {
                    "input": [
                        219,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                681,
                {
                    "input": [
                        218,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                684,
                {
                    "input": [
                        220,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                687,
                {
                    "input": [
                        222,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                691,
                {
                    "input": [
                        223,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                526,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        563,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        563
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
                376,
                {
                    "id": [
                        563,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                174,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                699
            ],
            "deleteEmailGroupChannel": [
                376,
                {
                    "id": [
                        563,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                403,
                {
                    "ids": [
                        563,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                371,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                403,
                {
                    "id": [
                        563,
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
                406,
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
                        563,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                471,
                {
                    "id": [
                        563,
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
                526,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                234,
                {
                    "twoFactorAuthenticationMethodId": [
                        563,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                663
            ],
            "deleteUserFromWorkspace": [
                667,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                670,
                {
                    "id": [
                        563,
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
                678,
                {
                    "input": [
                        236,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                679,
                {
                    "input": [
                        235,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                680,
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
                684,
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
                691,
                {
                    "id": [
                        563,
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
                678,
                {
                    "input": [
                        242,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                679,
                {
                    "input": [
                        241,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                680,
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
                684,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                249,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                250,
                {
                    "id": [
                        563,
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
                        563
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
                703
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
                        563,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                98
            ],
            "generateTransientToken": [
                544
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                558,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                560,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        563,
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
                561,
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
                423
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
                        563,
                        "UUID!"
                    ],
                    "workspaceId": [
                        563,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "markAppChannelThreadAsRead": [
                1,
                {
                    "input": [
                        364,
                        "MarkAppChannelThreadAsReadInput!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        563
                    ],
                    "threadId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                563,
                {
                    "workspaceMemberId": [
                        563,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        474,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                466,
                {
                    "principal": [
                        463,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        470,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        563,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        475,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                476,
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
                513,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                428,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                427,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                431,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                539,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                505,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        563,
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
                        477,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "revokeWorkspaceApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                481,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                494,
                {
                    "input": [
                        490,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        563,
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
                        563
                    ]
                }
            ],
            "sendAppChannelMessage": [
                504,
                {
                    "input": [
                        503,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                505,
                {
                    "browsingContext": [
                        343
                    ],
                    "channelId": [
                        563
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
                        563,
                        "[UUID!]"
                    ],
                    "messageId": [
                        563,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        563,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                508,
                {
                    "input": [
                        507,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                512,
                {
                    "input": [
                        511,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                513,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        563
                    ]
                }
            ],
            "sendMessageCampaign": [
                515,
                {
                    "input": [
                        514,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                510,
                {
                    "input": [
                        516,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                52,
                {
                    "input": [
                        518,
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
                466,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        470,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                466,
                {
                    "accessLevel": [
                        462,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        463,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        470,
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
                524,
                {
                    "input": [
                        525
                    ]
                }
            ],
            "signUpInWorkspace": [
                524,
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
                        563
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
                424,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                156,
                {
                    "connectedAccountId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                528,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        529,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                530
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
                383,
                {
                    "input": [
                        537,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                713,
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
                371,
                {
                    "id": [
                        563,
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
                546,
                {
                    "input": [
                        545,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                550,
                {
                    "input": [
                        547,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                549,
                {
                    "input": [
                        548,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                554,
                {
                    "input": [
                        551,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                553,
                {
                    "input": [
                        552,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                556,
                {
                    "input": [
                        555,
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
                        563,
                        "UUID!"
                    ],
                    "input": [
                        568,
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
                        563,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                48,
                {
                    "input": [
                        570,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                376,
                {
                    "input": [
                        571,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                58,
                {
                    "id": [
                        563,
                        "UUID!"
                    ],
                    "input": [
                        572,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                86,
                {
                    "input": [
                        573,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                90,
                {
                    "input": [
                        575,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                143,
                {
                    "input": [
                        577,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                170,
                {
                    "input": [
                        579,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                376,
                {
                    "input": [
                        580,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                303,
                {
                    "input": [
                        582,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                312,
                {
                    "input": [
                        584,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                281,
                {
                    "input": [
                        585,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                403,
                {
                    "inputs": [
                        598,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                406,
                {
                    "inputs": [
                        599,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                684,
                {
                    "inputs": [
                        621,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                371,
                {
                    "input": [
                        588,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                376,
                {
                    "input": [
                        590,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                383,
                {
                    "input": [
                        592,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                383,
                {
                    "input": [
                        594,
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
                403,
                {
                    "input": [
                        598,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                6,
                {
                    "input": [
                        569,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        563
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
                        597,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        586,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                406,
                {
                    "input": [
                        599,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                479,
                {
                    "updateRoleInput": [
                        606,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                427,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        600,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                428,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        601,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                431,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        603,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                427,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        605,
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
                526,
                {
                    "input": [
                        608,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                539,
                {
                    "input": [
                        609,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                566,
                {
                    "input": [
                        610,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                650,
                {
                    "input": [
                        611,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                115,
                {
                    "userCreditsFallback": [
                        665,
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
                670,
                {
                    "input": [
                        612,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                675,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        623,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                678,
                {
                    "input": [
                        616,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                679,
                {
                    "input": [
                        614,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                680,
                {
                    "input": [
                        619,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                681,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        618,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                684,
                {
                    "input": [
                        621,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                687,
                {
                    "input": [
                        624,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                691,
                {
                    "input": [
                        626,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                699,
                {
                    "data": [
                        630,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                699,
                {
                    "data": [
                        628,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                699,
                {
                    "data": [
                        629,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                708,
                {
                    "roleId": [
                        563,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        631,
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
                        632,
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
                        632,
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
                        632,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                298,
                {
                    "file": [
                        632,
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
                        632,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                298,
                {
                    "file": [
                        632,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                290,
                {
                    "upsertFieldPermissionsInput": [
                        633,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                675,
                {
                    "input": [
                        636,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                414,
                {
                    "upsertObjectPermissionsInput": [
                        637,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                480,
                {
                    "upsertPermissionFlagsInput": [
                        638,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                640,
                {
                    "input": [
                        639,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                675,
                {
                    "input": [
                        641,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                94,
                {
                    "input": [
                        668,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                672,
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
                673,
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
                563
            ],
            "agentId": [
                563
            ],
            "applicationId": [
                563
            ],
            "color": [
                4
            ],
            "createdAt": [
                227
            ],
            "folderId": [
                563
            ],
            "icon": [
                4
            ],
            "id": [
                563
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
                563
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                563
            ],
            "targetRecordId": [
                563
            ],
            "targetRecordIdentifier": [
                459
            ],
            "type": [
                404
            ],
            "updatedAt": [
                227
            ],
            "userWorkspaceId": [
                563
            ],
            "viewId": [
                563
            ],
            "workflowId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                693
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                563
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
                409,
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
                563
            ],
            "imageIdentifierFieldMetadataId": [
                563
            ],
            "indexMetadataList": [
                332
            ],
            "indexMetadatas": [
                411,
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
                563
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
                413
            ],
            "searchFieldMetadataList": [
                500
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
                408
            ],
            "pageInfo": [
                426
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
                406
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
                426
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                410
            ],
            "id": [
                564
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
                410
            ],
            "universalIdentifier": [
                564
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
                426
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                563
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
                563
            ],
            "restrictedFields": [
                343
            ],
            "rowLevelPermissionPredicateGroups": [
                483
            ],
            "rowLevelPermissionPredicates": [
                482
            ],
            "uneditableFields": [
                563
            ],
            "unreadableFields": [
                563
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
                563
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
                418
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
                417
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
                563
            ],
            "restrictedFields": [
                343
            ],
            "rowLevelRecordsPermissions": [
                489
            ],
            "uneditableFields": [
                563
            ],
            "unreadableFields": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                422
            ],
            "previousOnboardingStatus": [
                422
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
                563
            ],
            "createdAt": [
                227
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                563
            ],
            "deletedAt": [
                227
            ],
            "id": [
                563
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
                563
            ],
            "tabs": [
                428
            ],
            "type": [
                430
            ],
            "universalIdentifier": [
                563
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
                563
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
                563
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
                429
            ],
            "pageLayoutId": [
                563
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                563
            ],
            "updatedAt": [
                227
            ],
            "widgets": [
                431
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
                563
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
                692
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
                563
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
                563
            ],
            "pageLayoutTabId": [
                563
            ],
            "position": [
                434
            ],
            "title": [
                4
            ],
            "type": [
                694
            ],
            "universalIdentifier": [
                563
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
                429
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
                429
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
                432
            ],
            "on_PageLayoutWidgetGridPosition": [
                433
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                436
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                435
            ],
            "index": [
                2
            ],
            "layoutMode": [
                429
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
                563
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
                563
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
                563
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
                563
            ],
            "aggregateOperation": [
                32
            ],
            "color": [
                4
            ],
            "configurationType": [
                693
            ],
            "dateGranularity": [
                420
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
                563
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
                443
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
                563
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
                375
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                563
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
                563
            ],
            "createdAt": [
                227
            ],
            "domain": [
                4
            ],
            "id": [
                563
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
                452
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
                449
            ],
            "IMAP": [
                449
            ],
            "SMTP": [
                449
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
                563
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                717
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
                563
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
                        563,
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
                        563,
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
                        563,
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
                376,
                {
                    "filter": [
                        353
                    ]
                }
            ],
            "appMessageFolders": [
                383,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                62,
                {
                    "applicationId": [
                        563,
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
                499,
                {
                    "applicationId": [
                        563,
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
                563,
                {
                    "calendarEventId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                23,
                {
                    "agentUniversalIdentifier": [
                        563
                    ],
                    "threadId": [
                        563
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
                        563
                    ],
                    "threadId": [
                        563
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
                        563,
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
                707,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                531,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                170
            ],
            "currentUser": [
                663
            ],
            "currentUserApplicationAuthorizations": [
                59
            ],
            "currentUserSessions": [
                666
            ],
            "currentWorkspace": [
                699
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
                    "shouldIncludePublicAssets": [
                        1
                    ],
                    "shouldIncludeSourceFiles": [
                        1
                    ],
                    "universalIdentifier": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                283,
                {
                    "id": [
                        563,
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
                448,
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
                365,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                450
            ],
            "findMarketplaceAppDetail": [
                366,
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
                        563
                    ],
                    "universalIdentifier": [
                        563
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
                701
            ],
            "findWorkspaceFromInviteHash": [
                699,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                706
            ],
            "frontComponent": [
                303,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                303
            ],
            "getAddressDetails": [
                444,
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
                479
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
                        563,
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
                427,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                428,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                428,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                431,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                431,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                427,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        430
                    ]
                }
            ],
            "getPermissionFlags": [
                438
            ],
            "getPublicWorkspaceDataByDomain": [
                454,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                455,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                132
            ],
            "getRole": [
                479,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                479
            ],
            "getSSOIdentityProviders": [
                300
            ],
            "getToolIndex": [
                543
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
                647,
                {
                    "input": [
                        648
                    ]
                }
            ],
            "getView": [
                675,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                678,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                679,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                679,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                678,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                680,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                681,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                681,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                680,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                684,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                684,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                687,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                687,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                675,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        689,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                704
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
                371,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                371
            ],
            "messageSuppressions": [
                388,
                {
                    "input": [
                        301,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                393,
                {
                    "input": [
                        396,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                397
            ],
            "mostlyEmptyFieldMetadataIds": [
                563,
                {
                    "objectMetadataId": [
                        563,
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
                        563
                    ]
                }
            ],
            "myConnectedAccounts": [
                174
            ],
            "myMessageChannels": [
                376,
                {
                    "connectedAccountId": [
                        563
                    ]
                }
            ],
            "myMessageFolders": [
                383,
                {
                    "messageChannelId": [
                        563
                    ]
                }
            ],
            "myUserApplicationVariables": [
                709
            ],
            "navigationMenuItem": [
                403,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                403
            ],
            "object": [
                406,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                416
            ],
            "objects": [
                407,
                {
                    "filter": [
                        410,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        225,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                441,
                {
                    "input": [
                        442,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                151,
                {
                    "input": [
                        445,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                447,
                {
                    "input": [
                        446,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                366,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                365
            ],
            "recordPermissions": [
                461,
                {
                    "targets": [
                        470,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                466,
                {
                    "target": [
                        470,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                471
            ],
            "skill": [
                526,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                526
            ],
            "timelineActivityTypes": [
                539
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                557
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                562,
                {
                    "userId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                566
            ],
            "usageLimits": [
                650
            ],
            "usageQuotaDefinitions": [
                654
            ],
            "usageQuotaScopeConsumption": [
                656,
                {
                    "input": [
                        657,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                658
            ],
            "validatePasswordResetToken": [
                669,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                670,
                {
                    "objectMetadataId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                670,
                {
                    "fieldMetadataId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                691,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                691
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
                563
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
                563
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
                563
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
                563
            ],
            "permissions": [
                460
            ],
            "recordId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                563
            ],
            "workspaceMemberId": [
                563
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
                460
            ],
            "roles": [
                468
            ],
            "shares": [
                467
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                462
            ],
            "id": [
                19
            ],
            "principalId": [
                563
            ],
            "principalRoleId": [
                563
            ],
            "principalType": [
                464
            ],
            "rowCause": [
                465
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
                563
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
                693
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
                563
            ],
            "recordId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                563
            ],
            "id": [
                563
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                563
            ],
            "secondFieldMetadataId": [
                563
            ],
            "thirdFieldMetadataId": [
                563
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
                406
            ],
            "targetFieldMetadata": [
                283
            ],
            "targetObjectMetadata": [
                406
            ],
            "type": [
                473
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
                563
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
                563
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
                563
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                414
            ],
            "permissionFlags": [
                480
            ],
            "rowLevelPermissionFieldPermissions": [
                290
            ],
            "rowLevelPermissionPredicateGroups": [
                483
            ],
            "rowLevelPermissionPredicates": [
                482
            ],
            "rowLevelPermissionRules": [
                488
            ],
            "universalIdentifier": [
                563
            ],
            "workspaceMembers": [
                708
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
                563
            ],
            "roleId": [
                563
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
                487
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
                485
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
                563
            ],
            "logicalOperator": [
                485
            ],
            "objectMetadataId": [
                563
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                563
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
                563
            ],
            "id": [
                563
            ],
            "operand": [
                487
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                8
            ],
            "relationFieldMetadataId": [
                563
            ],
            "rowLevelPermissionPredicateGroupId": [
                563
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
                563
            ],
            "objectMetadataId": [
                563
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
                483
            ],
            "predicates": [
                482
            ],
            "ruleId": [
                563
            ],
            "uneditableFields": [
                563
            ],
            "unreadableFields": [
                563
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
                492
            ],
            "messages": [
                492
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                343
            ],
            "runAsWorkspaceMemberId": [
                563
            ],
            "thread": [
                495
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
                563
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
                491
            ],
            "content": [
                4
            ],
            "role": [
                493
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
                563
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                563
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
                563
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                498
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
                563
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                498
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
                563
            ],
            "id": [
                563
            ],
            "position": [
                8
            ],
            "tsVectorFieldMetadataId": [
                563
            ],
            "updatedAt": [
                227
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageAttachmentInput": {
            "id": [
                563
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
                501
            ],
            "email": [
                502
            ],
            "idempotencyKey": [
                563
            ],
            "messageChannelId": [
                563
            ],
            "messageThreadId": [
                563
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
                563
            ],
            "messageThreadId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                563
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                563
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
                506
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
                509
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
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                563
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
                706
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
                563
            ],
            "createdAt": [
                227
            ],
            "frontComponentId": [
                563
            ],
            "icon": [
                4
            ],
            "id": [
                563
            ],
            "position": [
                8
            ],
            "scope": [
                520
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                563
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
                563
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
                563
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                498
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
                718
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
                563
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
                563
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
                478
            ],
            "configurationType": [
                693
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                716
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
                563
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
                458,
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
                        563
                    ],
                    "runId": [
                        563
                    ],
                    "threadId": [
                        563
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
                536
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                693
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
                563
            ],
            "createdAt": [
                227
            ],
            "emit": [
                540
            ],
            "frontComponentUniversalIdentifier": [
                563
            ],
            "icon": [
                4
            ],
            "id": [
                563
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
                563
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                563
            ],
            "universalIdentifier": [
                563
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
                563
            ],
            "on": [
                4
            ],
            "through": [
                541
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                563
            ],
            "relationFieldUniversalIdentifier": [
                563
            ],
            "triggerFieldUniversalIdentifiers": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                693
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
                563
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
                563
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
                563
            ],
            "gt": [
                563
            ],
            "gte": [
                563
            ],
            "iLike": [
                563
            ],
            "in": [
                563
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                563
            ],
            "lt": [
                563
            ],
            "lte": [
                563
            ],
            "neq": [
                563
            ],
            "notILike": [
                563
            ],
            "notIn": [
                563
            ],
            "notLike": [
                563
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
                563
            ],
            "name": [
                4
            ],
            "updatedAt": [
                227
            ],
            "visibility": [
                567
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
                563
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
                563
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
                563
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
                563
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
                563
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                563
            ],
            "visibility": [
                382
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
                574
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
                576
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
                563
            ],
            "update": [
                578
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
                563
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
                563
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                563
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
                563
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
                563
            ],
            "options": [
                343
            ],
            "settings": [
                343
            ],
            "translations": [
                394
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
                563
            ],
            "update": [
                583
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
                563
            ],
            "update": [
                587
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
                563
            ],
            "update": [
                589
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                563
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
                563
            ],
            "update": [
                591
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                377
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
                384
            ],
            "visibility": [
                382
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                563
            ],
            "update": [
                593
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
                563
            ],
            "update": [
                593
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
                563
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
                563
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
                563
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
                563
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
                413
            ],
            "shortcut": [
                4
            ],
            "translations": [
                394
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                563
            ],
            "update": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                563
            ],
            "update": [
                595
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                563
            ],
            "update": [
                596
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
                563
            ],
            "type": [
                430
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
                429
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
                563
            ],
            "layoutMode": [
                429
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "widgets": [
                604
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
                563
            ],
            "pageLayoutTabId": [
                563
            ],
            "position": [
                343
            ],
            "title": [
                4
            ],
            "type": [
                694
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
                563
            ],
            "objectMetadataId": [
                563
            ],
            "pageLayoutTabId": [
                563
            ],
            "position": [
                343
            ],
            "title": [
                4
            ],
            "type": [
                694
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
                563
            ],
            "tabs": [
                602
            ],
            "type": [
                430
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRoleInput": {
            "id": [
                563
            ],
            "update": [
                607
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
                563
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
                563
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                394
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
                567
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                563
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
                563
            ],
            "update": [
                613
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
                563
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
                563
            ],
            "update": [
                615
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
                563
            ],
            "update": [
                617
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                563
            ],
            "logicalOperator": [
                682
            ],
            "parentViewFilterGroupId": [
                563
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                563
            ],
            "update": [
                620
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                563
            ],
            "operand": [
                683
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                563
            ],
            "subFieldName": [
                4
            ],
            "value": [
                343
            ],
            "viewFilterGroupId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                563
            ],
            "update": [
                622
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                563
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
                563
            ],
            "calendarFieldMetadataId": [
                563
            ],
            "calendarLayout": [
                676
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                563
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                563
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                563
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                686
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
                394
            ],
            "type": [
                689
            ],
            "visibility": [
                690
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                563
            ],
            "update": [
                625
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                688
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
                563
            ],
            "update": [
                627
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
                563
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
                563
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
                705
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
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                563
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewFieldId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                634
            ],
            "id": [
                563
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
                634
            ],
            "groups": [
                635
            ],
            "widgetId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                415
            ],
            "roleId": [
                563
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
                563
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
                563
            ],
            "predicateGroups": [
                484
            ],
            "predicates": [
                486
            ],
            "roleId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                483
            ],
            "predicates": [
                482
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                645
            ],
            "viewFields": [
                642
            ],
            "viewFilterGroups": [
                643
            ],
            "viewFilters": [
                644
            ],
            "viewSorts": [
                646
            ],
            "widgetId": [
                563
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
                563
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
                563
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                563
            ],
            "logicalOperator": [
                682
            ],
            "parentViewFilterGroupId": [
                563
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
                563
            ],
            "id": [
                563
            ],
            "operand": [
                683
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                563
            ],
            "subFieldName": [
                4
            ],
            "value": [
                343
            ],
            "viewFilterGroupId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                563
            ],
            "calendarFieldMetadataId": [
                563
            ],
            "calendarLayout": [
                676
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                563
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                563
            ],
            "openRecordIn": [
                686
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                689
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                688
            ],
            "fieldMetadataId": [
                563
            ],
            "id": [
                563
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
                660
            ],
            "usageByApplication": [
                649
            ],
            "usageByModel": [
                649
            ],
            "usageByOperationType": [
                649
            ],
            "usageByUser": [
                649
            ],
            "userDailyUsage": [
                662
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                652
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
                563
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                652
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                659
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                661
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
                661
            ],
            "operationType": [
                652
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                651
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                655
            ],
            "resourceType": [
                659
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                653
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
                652
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                661
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
                652
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                659
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                661
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
                563
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                652
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
                659
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
                661
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
                660
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
                667
            ],
            "currentWorkspace": [
                699
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
                563
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
                422
            ],
            "previousOnboardingStatus": [
                422
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
                667
            ],
            "workspaceMember": [
                708
            ],
            "workspaceMembers": [
                708
            ],
            "workspaces": [
                667
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
                563
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
                563
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
                563
            ],
            "isImpersonating": [
                1
            ],
            "locale": [
                4
            ],
            "objectRecordsPermissions": [
                421
            ],
            "permissionFlags": [
                439
            ],
            "twoFactorAuthenticationMethodSummary": [
                559
            ],
            "updatedAt": [
                227
            ],
            "user": [
                663
            ],
            "userId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                563
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
                563
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
                563
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                563
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
                563
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
                717
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
                563
            ],
            "calendarEndFieldMetadataId": [
                563
            ],
            "calendarFieldMetadataId": [
                563
            ],
            "calendarLayout": [
                676
            ],
            "createdAt": [
                227
            ],
            "createdByUserWorkspaceId": [
                563
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
                563
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
                563
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                685
            ],
            "mainGroupByFieldMetadataId": [
                563
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                563
            ],
            "openRecordIn": [
                686
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
                689
            ],
            "universalIdentifier": [
                563
            ],
            "updatedAt": [
                227
            ],
            "viewFieldGroups": [
                679
            ],
            "viewFields": [
                678
            ],
            "viewFilterGroups": [
                681
            ],
            "viewFilters": [
                680
            ],
            "viewGroups": [
                684
            ],
            "viewSorts": [
                687
            ],
            "visibility": [
                690
            ],
            "workspaceId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                693
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
                563
            ],
            "createdAt": [
                227
            ],
            "deletedAt": [
                227
            ],
            "fieldMetadataId": [
                563
            ],
            "id": [
                563
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
                563
            ],
            "updatedAt": [
                227
            ],
            "viewFieldGroupId": [
                563
            ],
            "viewId": [
                563
            ],
            "workspaceId": [
                563
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
                563
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
                678
            ],
            "viewId": [
                563
            ],
            "workspaceId": [
                563
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
                563
            ],
            "id": [
                563
            ],
            "operand": [
                683
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                563
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
                563
            ],
            "viewId": [
                563
            ],
            "workspaceId": [
                563
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
                563
            ],
            "logicalOperator": [
                682
            ],
            "parentViewFilterGroupId": [
                563
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "updatedAt": [
                227
            ],
            "viewId": [
                563
            ],
            "workspaceId": [
                563
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
                563
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
                563
            ],
            "workspaceId": [
                563
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
                688
            ],
            "fieldMetadataId": [
                563
            ],
            "id": [
                563
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                227
            ],
            "viewId": [
                563
            ],
            "workspaceId": [
                563
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
                563
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
                563
            ],
            "operations": [
                4
            ],
            "role": [
                479
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
                373
            ],
            "on_MessageCampaignDetailsConfiguration": [
                374
            ],
            "on_NotesConfiguration": [
                405
            ],
            "on_PieChartConfiguration": [
                440
            ],
            "on_RecordTableConfiguration": [
                469
            ],
            "on_StandaloneRichTextConfiguration": [
                527
            ],
            "on_TasksConfiguration": [
                538
            ],
            "on_TimelineConfiguration": [
                542
            ],
            "on_ViewConfiguration": [
                677
            ],
            "on_WorkflowConfiguration": [
                696
            ],
            "on_WorkflowRunConfiguration": [
                697
            ],
            "on_WorkflowVersionConfiguration": [
                698
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
                693
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                693
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                693
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                700
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
                479
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
                563
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
                563
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
                678
            ],
            "viewFilterGroups": [
                681
            ],
            "viewFilters": [
                680
            ],
            "viewGroups": [
                684
            ],
            "viewSorts": [
                687
            ],
            "views": [
                675
            ],
            "workspaceCustomApplication": [
                58
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                705
            ],
            "workspaceMembersCount": [
                8
            ],
            "workspaceUrls": [
                717
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
                702
            ],
            "personEnrichment": [
                343
            ],
            "personOutcome": [
                715
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
                563
            ],
            "roleId": [
                563
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
                710
            ],
            "id": [
                563
            ],
            "locale": [
                4
            ],
            "name": [
                306
            ],
            "numberFormat": [
                711
            ],
            "openRecordIn": [
                425
            ],
            "roles": [
                479
            ],
            "timeFormat": [
                712
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
                563
            ],
            "userWorkspaceId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                563
            ],
            "variables": [
                664
            ],
            "workspaceMemberId": [
                563
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
                563
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
                563
            ],
            "workspaceUrls": [
                717
            ],
            "__typename": [
                4
            ]
        }
    }
}