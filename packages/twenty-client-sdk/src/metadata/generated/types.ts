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
        123,
        126,
        131,
        139,
        140,
        141,
        142,
        150,
        152,
        166,
        171,
        173,
        175,
        222,
        223,
        250,
        254,
        255,
        257,
        268,
        274,
        278,
        282,
        285,
        292,
        309,
        311,
        317,
        319,
        332,
        339,
        340,
        341,
        353,
        355,
        373,
        374,
        375,
        376,
        377,
        378,
        380,
        381,
        382,
        385,
        386,
        388,
        391,
        396,
        400,
        409,
        416,
        418,
        421,
        425,
        426,
        431,
        435,
        459,
        461,
        462,
        470,
        481,
        482,
        491,
        496,
        518,
        531,
        532,
        534,
        536,
        562,
        564,
        566,
        633,
        654,
        661,
        663,
        667,
        678,
        684,
        685,
        687,
        688,
        690,
        691,
        692,
        695,
        696,
        697,
        702,
        704,
        707,
        712,
        713,
        714,
        717,
        718
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
                339
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
                562
            ],
            "avatarColor": [
                4
            ],
            "avatarShape": [
                4
            ],
            "createdAt": [
                223
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                562
            ],
            "isActive": [
                1
            ],
            "isCustom": [
                1
            ],
            "isPrivate": [
                1
            ],
            "isSystem": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                339
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
                339
            ],
            "roleId": [
                562
            ],
            "triggers": [
                339
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannel": {
            "applicationId": [
                562
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                562
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
                562
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
                562
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                339
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
                223
            ],
            "deletedAt": [
                223
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
                223
            ],
            "__typename": [
                4
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                223
            ],
            "id": [
                562
            ],
            "isSubscribed": [
                1
            ],
            "lastMentionedAt": [
                223
            ],
            "lastReadAt": [
                223
            ],
            "mentionsResolvedAt": [
                223
            ],
            "snoozedUntil": [
                223
            ],
            "threadId": [
                562
            ],
            "updatedAt": [
                223
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                562
            ],
            "createdAt": [
                223
            ],
            "id": [
                562
            ],
            "isBuiltInAssistant": [
                1
            ],
            "parts": [
                24
            ],
            "processedAt": [
                223
            ],
            "reactions": [
                25
            ],
            "role": [
                4
            ],
            "senderApplicationId": [
                562
            ],
            "senderUserWorkspaceId": [
                562
            ],
            "senderWorkspaceMemberId": [
                562
            ],
            "status": [
                4
            ],
            "threadId": [
                562
            ],
            "turnId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                223
            ],
            "errorMessage": [
                4
            ],
            "fileFilename": [
                4
            ],
            "fileId": [
                562
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                562
            ],
            "messageId": [
                562
            ],
            "orderIndex": [
                2
            ],
            "providerExecuted": [
                1
            ],
            "providerMetadata": [
                339
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
                339
            ],
            "toolName": [
                4
            ],
            "toolOutput": [
                339
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
                562
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "AgentRecentRun": {
            "createdAt": [
                223
            ],
            "id": [
                562
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
                223
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
                223
            ],
            "errorMessage": [
                4
            ],
            "id": [
                562
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
                223
            ],
            "status": [
                30
            ],
            "threadId": [
                562
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
                562
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
                562
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
                562
            ],
            "aggregateOperation": [
                32
            ],
            "configurationType": [
                695
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "filter": [
                339
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "label": [
                4
            ],
            "numberFormat": [
                152
            ],
            "prefix": [
                4
            ],
            "ratioAggregateConfig": [
                454
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
                223
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
                223
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
                223
            ],
            "expiresAt": [
                223
            ],
            "id": [
                562
            ],
            "name": [
                4
            ],
            "revokedAt": [
                223
            ],
            "role": [
                476
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                223
            ],
            "id": [
                562
            ],
            "name": [
                4
            ],
            "revokedAt": [
                223
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
                171
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
                339
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                562
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
                223
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
                562
            ],
            "role": [
                382
            ],
            "workspaceMemberId": [
                562
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
                562
            ],
            "applicationVariables": [
                92
            ],
            "autoUpgrade": [
                1
            ],
            "availablePackages": [
                339
            ],
            "canBeUninstalled": [
                1
            ],
            "commandMenuItems": [
                165
            ],
            "content": [
                64
            ],
            "createdAt": [
                223
            ],
            "defaultLogicFunctionRole": [
                476
            ],
            "defaultRoleId": [
                4
            ],
            "description": [
                4
            ],
            "frontComponents": [
                299
            ],
            "grantRoleId": [
                562
            ],
            "grantedIframeMediaPermissions": [
                321
            ],
            "healthCheckLogicFunctionId": [
                562
            ],
            "id": [
                562
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                352
            ],
            "logoFileId": [
                562
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                402
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                562
            ],
            "requestedIframeMediaPermissions": [
                321
            ],
            "requestedRoleId": [
                562
            ],
            "runHealthCheckOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                562
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                562
            ],
            "applicationName": [
                4
            ],
            "applicationUniversalIdentifier": [
                4
            ],
            "createdAt": [
                223
            ],
            "id": [
                562
            ],
            "lastAuthorizedAt": [
                223
            ],
            "lastUsedAt": [
                223
            ],
            "marketplaceAppUniversalIdentifier": [
                4
            ],
            "scopes": [
                4
            ],
            "userId": [
                562
            ],
            "workspaceId": [
                562
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                562
            ],
            "archivedAt": [
                223
            ],
            "authFailedAt": [
                223
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                450
            ],
            "connectionProviderId": [
                562
            ],
            "createdAt": [
                223
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                562
            ],
            "isOwnedByCurrentUser": [
                1
            ],
            "lastCredentialsRefreshedAt": [
                223
            ],
            "lastSignedInAt": [
                223
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                171
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                223
            ],
            "userWorkspaceId": [
                562
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
                562
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
                175
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
            "mcpServers": [
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
                339
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
            "encoding": [
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
                562
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
                292
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
                292
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
                223
            ],
            "fileFolder": [
                292
            ],
            "fileId": [
                562
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
                223
            ],
            "periodStart": [
                223
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
                223
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
                223
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
                223
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
                223
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
                562
            ],
            "connectionProviders": [
                62
            ],
            "settingsMenuItems": [
                517
            ],
            "variables": [
                666
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                223
            ],
            "galleryImagesUrls": [
                4
            ],
            "id": [
                562
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
                562
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
                223
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
                220
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
                676
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                562
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
                223
            ],
            "description": [
                4
            ],
            "id": [
                562
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
                339
            ],
            "type": [
                4
            ],
            "updatedAt": [
                223
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
                562
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
                339
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
                223
            ],
            "domain": [
                4
            ],
            "id": [
                562
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
                562
            ],
            "workspaceMemberIds": [
                562
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
                495
            ],
            "__typename": [
                4
            ]
        },
        "AuthToken": {
            "expiresAt": [
                223
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
                562
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
                494
            ],
            "workspaceUrls": [
                719
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
                562
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
                695
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
                339
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
                152
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                416
            ],
            "primaryAxisGroupByFieldMetadataId": [
                562
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                317
            ],
            "rangeMax": [
                8
            ],
            "rangeMin": [
                8
            ],
            "secondaryAxisGroupByDateGranularity": [
                416
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                562
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                317
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
                339
            ],
            "formattedToRawLookup": [
                339
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
                339
            ],
            "objectMetadataId": [
                562
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
                135
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
                562
            ],
            "userCreditsFallback": [
                667
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
                130
            ],
            "currentBillingSubscription": [
                130
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
                127
            ],
            "name": [
                4
            ],
            "prices": [
                124
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
                123
            ],
            "isCheckoutDefault": [
                1
            ],
            "isSellable": [
                1
            ],
            "planKey": [
                123
            ],
            "resourceCreditProducts": [
                119
            ],
            "upgradePlanKeys": [
                123
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
        "BillingProduct": {
            "description": [
                4
            ],
            "images": [
                4
            ],
            "metadata": [
                127
            ],
            "name": [
                4
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
                123
            ],
            "productKey": [
                126
            ],
            "__typename": [
                4
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                223
            ],
            "periodStart": [
                223
            ],
            "productKey": [
                126
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
                132
            ],
            "cancelAt": [
                223
            ],
            "collectionMethod": [
                131
            ],
            "currentPeriodEnd": [
                223
            ],
            "hasUserCredits": [
                1
            ],
            "id": [
                562
            ],
            "interval": [
                531
            ],
            "metadata": [
                339
            ],
            "phases": [
                133
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
                125
            ],
            "creditAmount": [
                8
            ],
            "hasReachedCurrentPeriodCap": [
                1
            ],
            "id": [
                562
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
                134
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
                130
            ],
            "currentBillingSubscription": [
                130
            ],
            "__typename": [
                4
            ]
        },
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
            "connectedAccount": [
                170
            ],
            "connectedAccountId": [
                562
            ],
            "contactAutoCreationPolicy": [
                139
            ],
            "createdAt": [
                223
            ],
            "excludePrivateEvents": [
                1
            ],
            "handle": [
                4
            ],
            "id": [
                562
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "syncStage": [
                140
            ],
            "syncStageStartedAt": [
                223
            ],
            "syncStatus": [
                141
            ],
            "syncedAt": [
                223
            ],
            "throttleFailureCount": [
                8
            ],
            "updatedAt": [
                223
            ],
            "visibility": [
                142
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
                695
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                695
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                695
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
                150
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
                695
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                339
            ],
            "error": [
                155
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
                695
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
                396
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                398
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
                159
            ],
            "aiModelTiers": [
                161
            ],
            "aiModels": [
                160
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
                149
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
                163
            ],
            "publicFeatureFlags": [
                448
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
            "webPushVapidPublicKey": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                223
            ],
            "link": [
                4
            ],
            "startAt": [
                223
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
                562
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                562
            ],
            "availabilityType": [
                166
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                562
            ],
            "createdAt": [
                223
            ],
            "engineComponentKey": [
                257
            ],
            "frontComponent": [
                299
            ],
            "frontComponentId": [
                562
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                562
            ],
            "pageLayoutId": [
                562
            ],
            "payload": [
                167
            ],
            "position": [
                8
            ],
            "shortLabel": [
                4
            ],
            "universalIdentifier": [
                562
            ],
            "updatedAt": [
                223
            ],
            "workflowVersionId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                408
            ],
            "on_PathCommandMenuItemPayload": [
                433
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
                290
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
                562
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                562
            ],
            "archivedAt": [
                223
            ],
            "authFailedAt": [
                223
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                450
            ],
            "connectionProviderId": [
                562
            ],
            "createdAt": [
                223
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                562
            ],
            "lastCredentialsRefreshedAt": [
                223
            ],
            "lastSignedInAt": [
                223
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                171
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                223
            ],
            "userWorkspaceId": [
                562
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
                324
            ],
            "handle": [
                4
            ],
            "id": [
                562
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                250
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
                562
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
            "isPrivate": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                339
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
                339
            ],
            "roleId": [
                562
            ],
            "triggers": [
                339
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                562
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                562
            ],
            "participantHandleFieldUniversalIdentifier": [
                562
            ],
            "visibility": [
                378
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
                562
            ],
            "availabilityType": [
                166
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                562
            ],
            "engineComponentKey": [
                257
            ],
            "frontComponentId": [
                562
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
                562
            ],
            "pageLayoutId": [
                562
            ],
            "payload": [
                339
            ],
            "position": [
                8
            ],
            "shortLabel": [
                4
            ],
            "workflowVersionId": [
                562
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
                372
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
                339
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
                339
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                562
            ],
            "options": [
                339
            ],
            "relationCreationPayload": [
                339
            ],
            "settings": [
                339
            ],
            "type": [
                285
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
                562
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
                562
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
                192
            ],
            "indexType": [
                332
            ],
            "objectMetadataId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                339
            ],
            "databaseEventTriggerSettings": [
                339
            ],
            "description": [
                4
            ],
            "httpRouteTriggerSettings": [
                339
            ],
            "id": [
                562
            ],
            "name": [
                4
            ],
            "serverRouteTriggerSettings": [
                339
            ],
            "source": [
                339
            ],
            "timeoutSeconds": [
                8
            ],
            "toolTriggerSettings": [
                339
            ],
            "universalIdentifier": [
                562
            ],
            "workflowActionTriggerSettings": [
                339
            ],
            "__typename": [
                4
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                562
            ],
            "id": [
                562
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
            "signInScope": [
                175
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                562
            ],
            "agentId": [
                562
            ],
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "folderId": [
                562
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                562
            ],
            "parentId": [
                562
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                562
            ],
            "targetRecordId": [
                562
            ],
            "type": [
                400
            ],
            "userWorkspaceId": [
                562
            ],
            "viewId": [
                562
            ],
            "workflowId": [
                562
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
                339
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
                190
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                193
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                198
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
                562
            ],
            "type": [
                426
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                425
            ],
            "pageLayoutId": [
                562
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
                339
            ],
            "objectMetadataId": [
                562
            ],
            "pageLayoutTabId": [
                562
            ],
            "position": [
                339
            ],
            "title": [
                4
            ],
            "type": [
                696
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                562
            ],
            "filter": [
                339
            ],
            "objectMetadataId": [
                562
            ],
            "orderBy": [
                339
            ],
            "__typename": [
                4
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                562
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                562
            ],
            "secondFieldMetadataId": [
                562
            ],
            "thirdFieldMetadataId": [
                562
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
                562
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
                566
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
                654
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                661
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                663
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
                562
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                562
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
                562
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
                562
            ],
            "id": [
                562
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
            "relationTargetFieldMetadataId": [
                562
            ],
            "size": [
                8
            ],
            "viewFieldGroupId": [
                562
            ],
            "viewId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                562
            ],
            "logicalOperator": [
                684
            ],
            "parentViewFilterGroupId": [
                562
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                562
            ],
            "id": [
                562
            ],
            "operand": [
                685
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                562
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                562
            ],
            "viewId": [
                562
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
                562
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewId": [
                562
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
                562
            ],
            "calendarFieldMetadataId": [
                562
            ],
            "calendarLayout": [
                678
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                562
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                562
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                687
            ],
            "mainGroupByFieldMetadataId": [
                562
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                562
            ],
            "openRecordIn": [
                688
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
                691
            ],
            "visibility": [
                692
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                690
            ],
            "fieldMetadataId": [
                562
            ],
            "id": [
                562
            ],
            "relationTargetFieldMetadataId": [
                562
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                562
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
                562
            ],
            "operations": [
                4
            ],
            "roleId": [
                562
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
                654
            ],
            "resource": [
                661
            ],
            "__typename": [
                4
            ]
        },
        "CursorPaging": {
            "after": [
                173
            ],
            "before": [
                173
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                562
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                562
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
                562
            ],
            "name": [
                302
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                562
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
                562
            ],
            "isCustomDomainEnabled": [
                1
            ],
            "records": [
                243
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
                562
            ],
            "pageLayoutId": [
                562
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
                562
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
                562
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                496
            ],
            "type": [
                319
            ],
            "__typename": [
                4
            ]
        },
        "EditSsoInput": {
            "id": [
                562
            ],
            "status": [
                496
            ],
            "__typename": [
                4
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                174
            ],
            "IMAP": [
                174
            ],
            "SMTP": [
                174
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
                695
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                223
            ],
            "domain": [
                4
            ],
            "id": [
                562
            ],
            "status": [
                254
            ],
            "tenantStatus": [
                255
            ],
            "unsubscribeHostnameStatus": [
                564
            ],
            "updatedAt": [
                223
            ],
            "verificationRecords": [
                673
            ],
            "verifiedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                695
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
                339
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
                339
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
                259
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payloads": [
                339
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
                263
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
                223
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
                223
            ],
            "currentPeriodEnd": [
                223
            ],
            "expiresAt": [
                223
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
                223
            ],
            "start": [
                223
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
                268
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
                266
            ],
            "eventType": [
                4
            ],
            "fieldFilters": [
                267
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
                269
            ],
            "first": [
                2
            ],
            "table": [
                274
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                270
            ],
            "records": [
                273
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
                339
            ],
            "recordId": [
                4
            ],
            "timestamp": [
                223
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
                387
            ],
            "objectRecordEventsWithQueryIds": [
                415
            ],
            "queueJobEvents": [
                342
            ],
            "__typename": [
                4
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                562
            ],
            "payload": [
                339
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlag": {
            "key": [
                278
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
                562
            ],
            "createdAt": [
                223
            ],
            "defaultValue": [
                339
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
                562
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
                562
            ],
            "morphRelations": [
                469
            ],
            "name": [
                4
            ],
            "object": [
                402
            ],
            "objectMetadataId": [
                562
            ],
            "options": [
                339
            ],
            "relation": [
                469
            ],
            "settings": [
                339
            ],
            "type": [
                285
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                695
            ],
            "fieldDisplayMode": [
                282
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
                283
            ],
            "pageInfo": [
                422
            ],
            "__typename": [
                4
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                173
            ],
            "node": [
                279
            ],
            "__typename": [
                4
            ]
        },
        "FieldFilter": {
            "and": [
                284
            ],
            "id": [
                563
            ],
            "isActive": [
                137
            ],
            "isSystem": [
                137
            ],
            "isUIEditable": [
                137
            ],
            "isUIReadOnly": [
                137
            ],
            "objectMetadataId": [
                563
            ],
            "or": [
                284
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
                562
            ],
            "id": [
                562
            ],
            "objectMetadataId": [
                562
            ],
            "roleId": [
                562
            ],
            "rowLevelPermissionPredicateGroupId": [
                562
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
                562
            ],
            "objectMetadataId": [
                562
            ],
            "rowLevelPermissionPredicateGroupId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                695
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                695
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
                223
            ],
            "id": [
                562
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
                562
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
                223
            ],
            "fileId": [
                562
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
                223
            ],
            "id": [
                562
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
                695
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                562
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                496
            ],
            "type": [
                319
            ],
            "workspace": [
                716
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
                385
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                695
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
                321
            ],
            "applicationId": [
                562
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                91
            ],
            "applicationVariables": [
                339
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
                223
            ],
            "description": [
                4
            ],
            "frontComponentSharedDependenciesChecksum": [
                4
            ],
            "id": [
                562
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
                562
            ],
            "updatedAt": [
                223
            ],
            "usesSdkClient": [
                1
            ],
            "widgetAvailability": [
                301
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                695
            ],
            "frontComponentId": [
                562
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                562
            ],
            "pageLayoutType": [
                426
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
                490
            ],
            "instructions": [
                4
            ],
            "modelId": [
                4
            ],
            "responseFormat": [
                339
            ],
            "runId": [
                562
            ],
            "scope": [
                339
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
                339
            ],
            "runId": [
                562
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
                562
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
                562
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
                562
            ],
            "workspaceInviteHash": [
                4
            ],
            "workspacePersonalInviteToken": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedProgress": {
            "completedStepActionKeys": [
                309
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                309
            ],
            "snoozedUntil": [
                4
            ],
            "steps": [
                310
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                309
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
                311
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
                314
            ],
            "stepActionKey": [
                309
            ],
            "trigger": [
                315
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
                697
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
                562
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
                695
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
                325
            ],
            "IMAP": [
                325
            ],
            "SMTP": [
                325
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
                250
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
                720
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
                562
            ],
            "threadId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                562
            ],
            "createdAt": [
                223
            ],
            "id": [
                562
            ],
            "indexFieldMetadataList": [
                330
            ],
            "indexType": [
                332
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
                223
            ],
            "__typename": [
                4
            ]
        },
        "IndexEdge": {
            "cursor": [
                173
            ],
            "node": [
                328
            ],
            "__typename": [
                4
            ]
        },
        "IndexField": {
            "createdAt": [
                223
            ],
            "fieldMetadataId": [
                562
            ],
            "id": [
                562
            ],
            "order": [
                8
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "IndexFilter": {
            "and": [
                331
            ],
            "id": [
                563
            ],
            "isCustom": [
                137
            ],
            "or": [
                331
            ],
            "__typename": [
                4
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                562
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
                335
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
                562
            ],
            "messageThreadId": [
                562
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
                341
            ],
            "__typename": [
                4
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                562
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
                695
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
                339
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
                152
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                416
            ],
            "primaryAxisGroupByFieldMetadataId": [
                562
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                317
            ],
            "rangeMax": [
                8
            ],
            "rangeMin": [
                8
            ],
            "secondaryAxisGroupByDateGranularity": [
                416
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                562
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                317
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
                339
            ],
            "hasTooManyGroups": [
                1
            ],
            "series": [
                347
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
                339
            ],
            "objectMetadataId": [
                562
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
                346
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
                171
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                562
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
                562
            ],
            "canRunOnDemand": [
                1
            ],
            "createdAt": [
                223
            ],
            "cronTriggerSettings": [
                339
            ],
            "databaseEventTriggerSettings": [
                339
            ],
            "description": [
                4
            ],
            "executionMode": [
                353
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                339
            ],
            "id": [
                562
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
                339
            ],
            "universalIdentifier": [
                562
            ],
            "updatedAt": [
                223
            ],
            "workflowActionTriggerSettings": [
                339
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                339
            ],
            "duration": [
                8
            ],
            "error": [
                339
            ],
            "logs": [
                4
            ],
            "status": [
                355
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                562
            ],
            "applicationUniversalIdentifier": [
                562
            ],
            "id": [
                562
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                562
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
                562
            ],
            "messageThreadId": [
                562
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
            "hasMcpServers": [
                1
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
                339
            ],
            "name": [
                4
            ],
            "objects": [
                363
            ],
            "pricingDescription": [
                4
            ],
            "requestedCapabilities": [
                4
            ],
            "requestedIframeMediaPermissions": [
                321
            ],
            "roles": [
                364
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
                365
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                366
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
                562
            ],
            "connectionProviderId": [
                562
            ],
            "createdAt": [
                223
            ],
            "id": [
                562
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
            "signInScope": [
                175
            ],
            "tools": [
                368
            ],
            "toolsSyncError": [
                4
            ],
            "toolsSyncedAt": [
                223
            ],
            "updatedAt": [
                223
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
                339
            ],
            "description": [
                4
            ],
            "inputSchema": [
                339
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
                695
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                695
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
                170
            ],
            "connectedAccountId": [
                562
            ],
            "contactAutoCreationPolicy": [
                373
            ],
            "createdAt": [
                223
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
                562
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
                380
            ],
            "messagingProviderUniversalIdentifier": [
                562
            ],
            "participantHandleFieldUniversalIdentifier": [
                562
            ],
            "pendingGroupEmailsAction": [
                374
            ],
            "syncStage": [
                375
            ],
            "syncStageStartedAt": [
                223
            ],
            "syncStatus": [
                376
            ],
            "syncedAt": [
                223
            ],
            "throttleFailureCount": [
                8
            ],
            "throttleRetryAfter": [
                223
            ],
            "type": [
                377
            ],
            "updatedAt": [
                223
            ],
            "visibility": [
                378
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
                223
            ],
            "externalId": [
                4
            ],
            "id": [
                562
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                562
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                381
            ],
            "updatedAt": [
                223
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
                223
            ],
            "emailAddress": [
                4
            ],
            "id": [
                562
            ],
            "reason": [
                385
            ],
            "source": [
                386
            ],
            "unsubscribeTopicId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                383
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
                414
            ],
            "recordId": [
                4
            ],
            "type": [
                388
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
                562
            ],
            "property": [
                4
            ],
            "provenance": [
                391
            ],
            "recordId": [
                562
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
                562
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                164
            ],
            "objectMetadataItems": [
                394
            ],
            "views": [
                395
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
                562
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
                562
            ],
            "key": [
                687
            ],
            "objectMetadataId": [
                562
            ],
            "type": [
                691
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
                        562,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                701,
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
                        562,
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
                        562,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        322,
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
                        562
                    ],
                    "threadId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        562,
                        "UUID!"
                    ],
                    "roleId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        562,
                        "UUID!"
                    ],
                    "roleId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                1,
                {
                    "input": [
                        327,
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
                148,
                {
                    "input": [
                        147,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                136
            ],
            "cancelSwitchBillingPlan": [
                136
            ],
            "cancelSwitchResourceCreditPrice": [
                136
            ],
            "checkCustomDomainValidRecords": [
                244
            ],
            "checkPublicDomainValidRecords": [
                244,
                {
                    "domain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                129,
                {
                    "plan": [
                        123,
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
                        562,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                168,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "fileIds": [
                        562,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                420,
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
                294,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                294,
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
                294,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                294,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "connectApplicationWithApiKey": [
                562,
                {
                    "input": [
                        169,
                        "ConnectApplicationWithApiKeyInput!"
                    ]
                }
            ],
            "createAgentChatChannel": [
                7,
                {
                    "input": [
                        176,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                48,
                {
                    "input": [
                        178,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                372,
                {
                    "input": [
                        179,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                180,
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
                181,
                {
                    "input": [
                        182,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                94,
                {
                    "input": [
                        183,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                121
            ],
            "createCalendarEvent": [
                185,
                {
                    "input": [
                        184,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                18,
                {
                    "channelId": [
                        562
                    ]
                }
            ],
            "createCommandMenuItem": [
                165,
                {
                    "input": [
                        186,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                242,
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
                188,
                {
                    "input": [
                        187,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                253,
                {
                    "input": [
                        189,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                293,
                {
                    "fieldMetadataId": [
                        4
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        4
                    ],
                    "fileFolder": [
                        292,
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
                299,
                {
                    "input": [
                        191,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                399,
                {
                    "inputs": [
                        197,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                681,
                {
                    "inputs": [
                        212,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                680,
                {
                    "inputs": [
                        213,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                686,
                {
                    "inputs": [
                        216,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                367,
                {
                    "input": [
                        195,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                383,
                {
                    "input": [
                        196,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                399,
                {
                    "input": [
                        197,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                293,
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
                        562,
                        "UUID!"
                    ],
                    "properties": [
                        339
                    ],
                    "recordId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                6,
                {
                    "input": [
                        177,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                279,
                {
                    "input": [
                        199,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                328,
                {
                    "input": [
                        200,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                352,
                {
                    "input": [
                        194,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                402,
                {
                    "input": [
                        201,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                476,
                {
                    "createRoleInput": [
                        207,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                423,
                {
                    "input": [
                        202,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                424,
                {
                    "input": [
                        203,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                427,
                {
                    "input": [
                        204,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                447,
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
                468,
                {
                    "input": [
                        206,
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
                        208,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                121,
                {
                    "idempotencyKey": [
                        4,
                        "String!"
                    ],
                    "plan": [
                        123,
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
                565,
                {
                    "input": [
                        209,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                652,
                {
                    "input": [
                        210,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                672,
                {
                    "input": [
                        211,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                677,
                {
                    "input": [
                        217,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                680,
                {
                    "input": [
                        213,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                681,
                {
                    "input": [
                        212,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                682,
                {
                    "input": [
                        215,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                683,
                {
                    "input": [
                        214,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                686,
                {
                    "input": [
                        216,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                689,
                {
                    "input": [
                        218,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                693,
                {
                    "input": [
                        219,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                524,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        562,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        562
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
                372,
                {
                    "id": [
                        562,
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
                        224,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                165,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                170,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                701
            ],
            "deleteEmailGroupChannel": [
                372,
                {
                    "id": [
                        562,
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
                299,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                399,
                {
                    "ids": [
                        562,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                367,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                399,
                {
                    "id": [
                        562,
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
                279,
                {
                    "input": [
                        225,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                328,
                {
                    "input": [
                        226,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                352,
                {
                    "input": [
                        356,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                402,
                {
                    "input": [
                        227,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                4,
                {
                    "roleId": [
                        562,
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
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                468,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                228,
                {
                    "input": [
                        229,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                524,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                230,
                {
                    "twoFactorAuthenticationMethodId": [
                        562,
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
                        562,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                665
            ],
            "deleteUserFromWorkspace": [
                669,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                672,
                {
                    "id": [
                        562,
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
                680,
                {
                    "input": [
                        232,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                681,
                {
                    "input": [
                        231,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                682,
                {
                    "input": [
                        233,
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
                686,
                {
                    "input": [
                        234,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                1,
                {
                    "input": [
                        235,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                693,
                {
                    "id": [
                        562,
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
                680,
                {
                    "input": [
                        238,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                681,
                {
                    "input": [
                        237,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                682,
                {
                    "input": [
                        239,
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
                686,
                {
                    "input": [
                        240,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                1,
                {
                    "input": [
                        241,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                1,
                {
                    "input": [
                        327,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                170,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                245,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                246,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                247,
                {
                    "input": [
                        248,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                251,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "workspaceId": [
                        562
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                116
            ],
            "enqueueJob": [
                260,
                {
                    "input": [
                        258,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                262,
                {
                    "input": [
                        261,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                705
            ],
            "executeOneLogicFunction": [
                354,
                {
                    "input": [
                        276,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                304,
                {
                    "input": [
                        303,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                50,
                {
                    "apiKeyId": [
                        562,
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
                        562,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                98
            ],
            "generateTransientToken": [
                543
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                557,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                559,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        562,
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
                560,
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
                306,
                {
                    "input": [
                        307,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                359,
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
                419
            ],
            "grantApplicationCapabilities": [
                60,
                {
                    "input": [
                        316,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                326,
                {
                    "userId": [
                        562,
                        "UUID!"
                    ],
                    "workspaceId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                334,
                {
                    "input": [
                        333,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                336,
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
                336
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
                        562,
                        "UUID!"
                    ]
                }
            ],
            "markAppChannelThreadAsRead": [
                1,
                {
                    "input": [
                        360,
                        "MarkAppChannelThreadAsReadInput!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        562
                    ],
                    "threadId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                562,
                {
                    "workspaceMemberId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                312,
                {
                    "stepActionKey": [
                        309,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                1
            ],
            "releaseEnterpriseServerBinding": [
                264
            ],
            "removeAgentChatMessageReaction": [
                25,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        471,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                463,
                {
                    "principal": [
                        460,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        467,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        562,
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
                        562,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        472,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                473,
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
                165,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                424,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                423,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                427,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                538,
                {
                    "id": [
                        562,
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
                        562,
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
                        474,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "revokeWorkspaceApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                478,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                492,
                {
                    "input": [
                        488,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                323,
                {
                    "connectionParameters": [
                        249,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        4,
                        "String!"
                    ],
                    "id": [
                        562
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
                        339
                    ],
                    "channelId": [
                        562
                    ],
                    "fileAttachments": [
                        291,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        1
                    ],
                    "isAssistantParticipant": [
                        1
                    ],
                    "mentionedWorkspaceMemberIds": [
                        562,
                        "[UUID!]"
                    ],
                    "messageId": [
                        562,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        562,
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
                        562,
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
                        562
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
                120,
                {
                    "partnerCode": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                264,
                {
                    "enterpriseKey": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                463,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        467,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                463,
                {
                    "accessLevel": [
                        459,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        460,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        467,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                136,
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
                        562
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
                420,
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
                        223,
                        "DateTime!"
                    ],
                    "threadId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                151,
                {
                    "connectedAccountId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                526,
                {
                    "companyContext": [
                        339
                    ],
                    "personContext": [
                        339
                    ]
                }
            ],
            "stopAgentChatStream": [
                1,
                {
                    "threadId": [
                        562,
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
                136,
                {
                    "plan": [
                        123
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                136
            ],
            "syncAppMessageFolders": [
                379,
                {
                    "input": [
                        535,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                715,
                {
                    "dryRun": [
                        1
                    ],
                    "inferDeletionFromMissingEntities": [
                        1
                    ],
                    "manifest": [
                        339,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                1
            ],
            "syncMcpServerTools": [
                367,
                {
                    "id": [
                        562,
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
                        339
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
                545,
                {
                    "input": [
                        544,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                549,
                {
                    "input": [
                        546,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                548,
                {
                    "input": [
                        547,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                553,
                {
                    "input": [
                        550,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                552,
                {
                    "input": [
                        551,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                555,
                {
                    "input": [
                        554,
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
                        562,
                        "UUID!"
                    ],
                    "input": [
                        567,
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
                        223
                    ],
                    "threadIds": [
                        562,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                48,
                {
                    "input": [
                        569,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                372,
                {
                    "input": [
                        570,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                58,
                {
                    "id": [
                        562,
                        "UUID!"
                    ],
                    "input": [
                        571,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                86,
                {
                    "input": [
                        572,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                90,
                {
                    "input": [
                        574,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                138,
                {
                    "input": [
                        576,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                165,
                {
                    "input": [
                        578,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                372,
                {
                    "input": [
                        579,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                299,
                {
                    "input": [
                        581,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                308,
                {
                    "input": [
                        583,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateInboxNotificationSettings": [
                669,
                {
                    "input": [
                        584,
                        "UpdateInboxNotificationSettingsInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                277,
                {
                    "input": [
                        585,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                399,
                {
                    "inputs": [
                        598,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                402,
                {
                    "inputs": [
                        599,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                686,
                {
                    "inputs": [
                        622,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                367,
                {
                    "input": [
                        588,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                372,
                {
                    "input": [
                        590,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                379,
                {
                    "input": [
                        592,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                379,
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
                399,
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
                        568,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        562
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
                279,
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
                402,
                {
                    "input": [
                        599,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                476,
                {
                    "updateRoleInput": [
                        606,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                423,
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
                424,
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
                427,
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
                423,
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
                337,
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
                        608,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTabPresence": [
                1,
                {
                    "input": [
                        609,
                        "UpdateTabPresenceInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                538,
                {
                    "input": [
                        610,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                565,
                {
                    "input": [
                        611,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                652,
                {
                    "input": [
                        612,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                115,
                {
                    "userCreditsFallback": [
                        667,
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
                672,
                {
                    "input": [
                        613,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                677,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        624,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                680,
                {
                    "input": [
                        617,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                681,
                {
                    "input": [
                        615,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                682,
                {
                    "input": [
                        620,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                683,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        619,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                686,
                {
                    "input": [
                        622,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                689,
                {
                    "input": [
                        625,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                693,
                {
                    "input": [
                        627,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                701,
                {
                    "data": [
                        631,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                701,
                {
                    "data": [
                        629,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                701,
                {
                    "data": [
                        630,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                710,
                {
                    "roleId": [
                        562,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        632,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "uploadAppTarball": [
                86,
                {
                    "file": [
                        633,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "uploadApplicationFile": [
                290,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        633,
                        "Upload!"
                    ],
                    "fileFolder": [
                        292,
                        "FileFolder!"
                    ],
                    "filePath": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                294,
                {
                    "fieldMetadataUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        633,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                294,
                {
                    "file": [
                        633,
                        "Upload!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                294,
                {
                    "file": [
                        633,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                294,
                {
                    "file": [
                        633,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                286,
                {
                    "upsertFieldPermissionsInput": [
                        634,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                677,
                {
                    "input": [
                        637,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                410,
                {
                    "upsertObjectPermissionsInput": [
                        638,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                477,
                {
                    "upsertPermissionFlagsInput": [
                        639,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionRules": [
                641,
                {
                    "input": [
                        640,
                        "UpsertRowLevelPermissionRulesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                677,
                {
                    "input": [
                        642,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "upsertWebPushSubscription": [
                1,
                {
                    "input": [
                        648,
                        "UpsertWebPushSubscriptionInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                94,
                {
                    "input": [
                        670,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                674,
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
                253,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                675,
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
                562
            ],
            "agentId": [
                562
            ],
            "applicationId": [
                562
            ],
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "createdAt": [
                223
            ],
            "folderId": [
                562
            ],
            "icon": [
                4
            ],
            "id": [
                562
            ],
            "isActive": [
                1
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
                562
            ],
            "parentId": [
                562
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                562
            ],
            "targetRecordId": [
                562
            ],
            "targetRecordIdentifier": [
                456
            ],
            "type": [
                400
            ],
            "updatedAt": [
                223
            ],
            "userWorkspaceId": [
                562
            ],
            "viewId": [
                562
            ],
            "workflowId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                695
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                562
            ],
            "color": [
                4
            ],
            "createdAt": [
                223
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
                405,
                {
                    "filter": [
                        284,
                        "FieldFilter!"
                    ],
                    "paging": [
                        221,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                279
            ],
            "icon": [
                4
            ],
            "id": [
                562
            ],
            "imageIdentifierFieldMetadataId": [
                562
            ],
            "indexMetadataList": [
                328
            ],
            "indexMetadatas": [
                407,
                {
                    "filter": [
                        331,
                        "IndexFilter!"
                    ],
                    "paging": [
                        221,
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
                562
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
                409
            ],
            "searchFieldMetadataList": [
                498
            ],
            "shortcut": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "ObjectConnection": {
            "edges": [
                404
            ],
            "pageInfo": [
                422
            ],
            "__typename": [
                4
            ]
        },
        "ObjectEdge": {
            "cursor": [
                173
            ],
            "node": [
                402
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                283
            ],
            "pageInfo": [
                422
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                406
            ],
            "id": [
                563
            ],
            "isActive": [
                137
            ],
            "isRemote": [
                137
            ],
            "isSearchable": [
                137
            ],
            "isSystem": [
                137
            ],
            "isUICreatable": [
                137
            ],
            "isUIEditable": [
                137
            ],
            "isUIReadOnly": [
                137
            ],
            "or": [
                406
            ],
            "universalIdentifier": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                329
            ],
            "pageInfo": [
                422
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                562
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
                562
            ],
            "restrictedFields": [
                339
            ],
            "rowLevelPermissionPredicateGroups": [
                480
            ],
            "rowLevelPermissionPredicates": [
                479
            ],
            "uneditableFields": [
                562
            ],
            "unreadableFields": [
                562
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
                562
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
                222
            ],
            "objectNameSingular": [
                4
            ],
            "properties": [
                414
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
                339
            ],
            "before": [
                339
            ],
            "diff": [
                339
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
                413
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
                562
            ],
            "restrictedFields": [
                339
            ],
            "rowLevelRecordsPermissions": [
                487
            ],
            "uneditableFields": [
                562
            ],
            "unreadableFields": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                418
            ],
            "previousOnboardingStatus": [
                418
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
                173
            ],
            "hasNextPage": [
                1
            ],
            "hasPreviousPage": [
                1
            ],
            "startCursor": [
                173
            ],
            "__typename": [
                4
            ]
        },
        "PageLayout": {
            "applicationId": [
                562
            ],
            "createdAt": [
                223
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                562
            ],
            "deletedAt": [
                223
            ],
            "id": [
                562
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
                562
            ],
            "tabs": [
                424
            ],
            "type": [
                426
            ],
            "universalIdentifier": [
                562
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                562
            ],
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                425
            ],
            "pageLayoutId": [
                562
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                562
            ],
            "updatedAt": [
                223
            ],
            "widgets": [
                427
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                321
            ],
            "applicationId": [
                562
            ],
            "applicationName": [
                4
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                339
            ],
            "configuration": [
                694
            ],
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "gridPosition": [
                318
            ],
            "id": [
                562
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
                562
            ],
            "pageLayoutTabId": [
                562
            ],
            "position": [
                430
            ],
            "title": [
                4
            ],
            "type": [
                696
            ],
            "universalIdentifier": [
                562
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                425
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
                425
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
                428
            ],
            "on_PageLayoutWidgetGridPosition": [
                429
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                432
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                431
            ],
            "index": [
                2
            ],
            "layoutMode": [
                425
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
                562
            ],
            "createdAt": [
                223
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                562
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                562
            ],
            "aggregateOperation": [
                32
            ],
            "color": [
                4
            ],
            "configurationType": [
                695
            ],
            "dateGranularity": [
                416
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
                339
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupByFieldMetadataId": [
                562
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
                152
            ],
            "orderBy": [
                317
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
                439
            ],
            "formattedToRawLookup": [
                339
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
                339
            ],
            "objectMetadataId": [
                562
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
                351
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
                223
            ],
            "__typename": [
                4
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                146
            ],
            "blockers": [
                371
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                562
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
        "PublicCalendarChannel": {
            "connectedAccount": [
                170
            ],
            "connectedAccountId": [
                562
            ],
            "handle": [
                4
            ],
            "id": [
                562
            ],
            "visibility": [
                142
            ],
            "__typename": [
                4
            ]
        },
        "PublicConnectionParametersOutput": {
            "connectionSecurity": [
                250
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
                562
            ],
            "createdAt": [
                223
            ],
            "domain": [
                4
            ],
            "id": [
                562
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
                278
            ],
            "metadata": [
                449
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
                446
            ],
            "IMAP": [
                446
            ],
            "SMTP": [
                446
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
                562
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                719
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
                562
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
                        562,
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
                        562,
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
                        562,
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
                        305,
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
                        348
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
                372,
                {
                    "filter": [
                        349
                    ]
                }
            ],
            "appMessageFolders": [
                379,
                {
                    "filter": [
                        350
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                61,
                {
                    "applicationId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                62,
                {
                    "applicationId": [
                        562,
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
                497,
                {
                    "applicationId": [
                        562,
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
                120
            ],
            "billingPlans": [
                122
            ],
            "billingPortalSession": [
                129,
                {
                    "forPaymentMethodUpdate": [
                        1
                    ],
                    "returnUrlPath": [
                        4
                    ]
                }
            ],
            "calendarChannels": [
                445
            ],
            "callRecordingIdForCalendarEvent": [
                562,
                {
                    "calendarEventId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                23,
                {
                    "agentUniversalIdentifier": [
                        562
                    ],
                    "threadId": [
                        562
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                154,
                {
                    "agentUniversalIdentifier": [
                        562
                    ],
                    "threadId": [
                        562
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
                        562,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                157,
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
                709,
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
                165,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                165
            ],
            "currentUser": [
                665
            ],
            "currentUserApplicationAuthorizations": [
                59
            ],
            "currentUserSessions": [
                668
            ],
            "currentWorkspace": [
                701
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
                265
            ],
            "eventLogs": [
                272,
                {
                    "input": [
                        271,
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
                    "shouldIncludeLogicFunctionSources": [
                        1
                    ],
                    "shouldIncludePublicAssets": [
                        1
                    ],
                    "shouldIncludeSourceDependencies": [
                        1
                    ],
                    "shouldIncludeSourceFiles": [
                        1
                    ],
                    "universalIdentifier": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                279,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                281,
                {
                    "filter": [
                        284,
                        "FieldFilter!"
                    ],
                    "paging": [
                        221,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                444,
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
                        223
                    ],
                    "periodStart": [
                        223
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
                        223
                    ],
                    "periodStart": [
                        223
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
                158,
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
                342,
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
                352
            ],
            "findManyMarketplaceApps": [
                361,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                447
            ],
            "findMarketplaceAppDetail": [
                362,
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
                        562
                    ],
                    "universalIdentifier": [
                        562
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
                352,
                {
                    "input": [
                        356,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                342,
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
                342,
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
                703
            ],
            "findWorkspaceFromInviteHash": [
                701,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                708
            ],
            "frontComponent": [
                299,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                299
            ],
            "getAddressDetails": [
                440,
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
                476
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
                339,
                {
                    "input": [
                        356,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                172,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                253
            ],
            "getInviteSuggestions": [
                338
            ],
            "getJobs": [
                342,
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
                        356,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                423,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                424,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                424,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                427,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                427,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                423,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        426
                    ]
                }
            ],
            "getPermissionFlags": [
                434
            ],
            "getPublicWorkspaceDataByDomain": [
                451,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                452,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                128
            ],
            "getRole": [
                476,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                476
            ],
            "getSSOIdentityProviders": [
                296
            ],
            "getToolIndex": [
                542
            ],
            "getToolInputSchema": [
                339,
                {
                    "toolName": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                649,
                {
                    "input": [
                        650
                    ]
                }
            ],
            "getView": [
                677,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                680,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                681,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                681,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                680,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                682,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                683,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                683,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                682,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                686,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                686,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                689,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                689,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                677,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        691,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                706
            ],
            "gettingStartedProgress": [
                308
            ],
            "gettingStartedWorkflowPreviews": [
                313
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
                344,
                {
                    "input": [
                        345,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                122
            ],
            "mcpServer": [
                367,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                367
            ],
            "messageSuppressions": [
                384,
                {
                    "input": [
                        297,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                389,
                {
                    "input": [
                        392,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                393
            ],
            "mostlyEmptyFieldMetadataIds": [
                562,
                {
                    "objectMetadataId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                85
            ],
            "myCalendarChannels": [
                138,
                {
                    "connectedAccountId": [
                        562
                    ]
                }
            ],
            "myConnectedAccounts": [
                170
            ],
            "myMessageChannels": [
                372,
                {
                    "connectedAccountId": [
                        562
                    ]
                }
            ],
            "myMessageFolders": [
                379,
                {
                    "messageChannelId": [
                        562
                    ]
                }
            ],
            "myUserApplicationVariables": [
                711
            ],
            "navigationMenuItem": [
                399,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                399
            ],
            "object": [
                402,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                412
            ],
            "objects": [
                403,
                {
                    "filter": [
                        406,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        221,
                        "CursorPaging!"
                    ]
                }
            ],
            "onlineWorkspaceMemberIds": [
                562
            ],
            "pieChartData": [
                437,
                {
                    "input": [
                        438,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                146,
                {
                    "input": [
                        441,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                443,
                {
                    "input": [
                        442,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                362,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                361
            ],
            "recordPermissions": [
                458,
                {
                    "targets": [
                        467,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                463,
                {
                    "target": [
                        467,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                468
            ],
            "skill": [
                524,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                524
            ],
            "timelineActivityTypes": [
                538
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                556
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                561,
                {
                    "userId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                565
            ],
            "usageLimits": [
                652
            ],
            "usageQuotaDefinitions": [
                656
            ],
            "usageQuotaScopeConsumption": [
                658,
                {
                    "input": [
                        659,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                660
            ],
            "validatePasswordResetToken": [
                671,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                672,
                {
                    "objectMetadataId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                672,
                {
                    "fieldMetadataId": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                693,
                {
                    "id": [
                        562,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                693
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
                562
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
                562
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
                562
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
                562
            ],
            "permissions": [
                457
            ],
            "recordId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                562
            ],
            "workspaceMemberId": [
                562
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
                457
            ],
            "roles": [
                465
            ],
            "shares": [
                464
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                459
            ],
            "id": [
                19
            ],
            "principalId": [
                562
            ],
            "principalRoleId": [
                562
            ],
            "principalType": [
                461
            ],
            "rowCause": [
                462
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
                562
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
                695
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
                562
            ],
            "recordId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                562
            ],
            "id": [
                562
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                562
            ],
            "secondFieldMetadataId": [
                562
            ],
            "thirdFieldMetadataId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                279
            ],
            "sourceObjectMetadata": [
                402
            ],
            "targetFieldMetadata": [
                279
            ],
            "targetObjectMetadata": [
                402
            ],
            "type": [
                470
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
                562
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
                562
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
                286
            ],
            "icon": [
                4
            ],
            "id": [
                562
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                410
            ],
            "permissionFlags": [
                477
            ],
            "rowLevelPermissionFieldPermissions": [
                286
            ],
            "rowLevelPermissionPredicateGroups": [
                480
            ],
            "rowLevelPermissionPredicates": [
                479
            ],
            "rowLevelPermissionRules": [
                483
            ],
            "universalIdentifier": [
                562
            ],
            "workspaceMembers": [
                710
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
                562
            ],
            "roleId": [
                562
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
                482
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
            "rowLevelPermissionRuleId": [
                4
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
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
                481
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
            "rowLevelPermissionRuleId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
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
                562
            ],
            "objectMetadataId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRuleInput": {
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
                562
            ],
            "predicateGroups": [
                485
            ],
            "predicates": [
                486
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateGroupInput": {
            "id": [
                562
            ],
            "logicalOperator": [
                481
            ],
            "position": [
                8
            ],
            "predicateGroups": [
                485
            ],
            "predicates": [
                486
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateInput": {
            "fieldMetadataId": [
                562
            ],
            "id": [
                562
            ],
            "operand": [
                482
            ],
            "position": [
                8
            ],
            "relationFieldMetadataId": [
                562
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
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
                480
            ],
            "predicates": [
                479
            ],
            "ruleId": [
                562
            ],
            "uneditableFields": [
                562
            ],
            "unreadableFields": [
                562
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
                490
            ],
            "messages": [
                490
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                339
            ],
            "runAsWorkspaceMemberId": [
                562
            ],
            "thread": [
                493
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
                562
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
                489
            ],
            "content": [
                4
            ],
            "role": [
                491
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
                339
            ],
            "runId": [
                562
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                562
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
                562
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                496
            ],
            "type": [
                319
            ],
            "__typename": [
                4
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                562
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                496
            ],
            "type": [
                319
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
                223
            ],
            "fieldMetadataId": [
                562
            ],
            "id": [
                562
            ],
            "position": [
                8
            ],
            "tsVectorFieldMetadataId": [
                562
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageAttachmentInput": {
            "id": [
                562
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
                499
            ],
            "email": [
                500
            ],
            "idempotencyKey": [
                562
            ],
            "messageChannelId": [
                562
            ],
            "messageThreadId": [
                562
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
                562
            ],
            "messageThreadId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                562
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                562
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
                562
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
                339
            ],
            "workspaceMemberIds": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                562
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
                708
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
                223
            ],
            "__typename": [
                4
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                146
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
                339
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                562
            ],
            "createdAt": [
                223
            ],
            "frontComponentId": [
                562
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                562
            ],
            "updatedAt": [
                223
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
                562
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
                562
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                496
            ],
            "type": [
                319
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
                720
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
                562
            ],
            "content": [
                4
            ],
            "createdAt": [
                223
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                223
            ],
            "__typename": [
                4
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                475
            ],
            "configurationType": [
                695
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                718
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
                562
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
                273,
                {
                    "fieldFilters": [
                        267,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        274,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                455,
                {
                    "input": [
                        205,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                357,
                {
                    "input": [
                        358,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                15,
                {
                    "agentUniversalIdentifier": [
                        562
                    ],
                    "runId": [
                        562
                    ],
                    "threadId": [
                        562
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "onEventSubscription": [
                275,
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "TabPresenceStatus": {},
        "TasksConfiguration": {
            "configurationType": [
                695
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
                562
            ],
            "createdAt": [
                223
            ],
            "emit": [
                539
            ],
            "frontComponentUniversalIdentifier": [
                562
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                562
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                562
            ],
            "universalIdentifier": [
                562
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                562
            ],
            "on": [
                4
            ],
            "through": [
                540
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                562
            ],
            "relationFieldUniversalIdentifier": [
                562
            ],
            "triggerFieldUniversalIdentifiers": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                695
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
                339
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
                562
            ],
            "personFilter": [
                339
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                223
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
                223
            ],
            "__typename": [
                4
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                562
            ],
            "gt": [
                562
            ],
            "gte": [
                562
            ],
            "iLike": [
                562
            ],
            "in": [
                562
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                562
            ],
            "lt": [
                562
            ],
            "lte": [
                562
            ],
            "neq": [
                562
            ],
            "notILike": [
                562
            ],
            "notIn": [
                562
            ],
            "notLike": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                223
            ],
            "description": [
                4
            ],
            "id": [
                562
            ],
            "name": [
                4
            ],
            "updatedAt": [
                223
            ],
            "visibility": [
                566
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
                562
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
                562
            ],
            "isActive": [
                1
            ],
            "isPrivate": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                339
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
                339
            ],
            "roleId": [
                562
            ],
            "triggers": [
                339
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
                562
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
                562
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                562
            ],
            "visibility": [
                378
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
                573
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
                575
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
                562
            ],
            "update": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                139
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
                142
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
                562
            ],
            "availabilityType": [
                166
            ],
            "engineComponentKey": [
                257
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                562
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                562
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                339
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
                339
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                562
            ],
            "options": [
                339
            ],
            "settings": [
                339
            ],
            "translations": [
                390
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
                562
            ],
            "update": [
                582
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
                309
            ],
            "completedStepChatThreadId": [
                4
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                309
            ],
            "snoozedUntil": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateInboxNotificationSettingsInput": {
            "inboxNotificationLevel": [
                4
            ],
            "isInboxNotificationPreviewEnabled": [
                1
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
                562
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
                339
            ],
            "databaseEventTriggerSettings": [
                339
            ],
            "description": [
                4
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                339
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
                339
            ],
            "workflowActionTriggerSettings": [
                339
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                562
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
                562
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
            "signInScope": [
                175
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
                562
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
                373
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
                380
            ],
            "visibility": [
                378
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                562
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
                562
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
                562
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "link": [
                4
            ],
            "name": [
                4
            ],
            "pageLayoutId": [
                562
            ],
            "parentId": [
                562
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
                562
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
                562
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
                409
            ],
            "shortcut": [
                4
            ],
            "translations": [
                390
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                562
            ],
            "update": [
                580
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                562
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
                562
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
                562
            ],
            "type": [
                426
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
                425
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
                562
            ],
            "layoutMode": [
                425
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
                339
            ],
            "configuration": [
                339
            ],
            "isActive": [
                1
            ],
            "objectMetadataId": [
                562
            ],
            "pageLayoutTabId": [
                562
            ],
            "position": [
                339
            ],
            "title": [
                4
            ],
            "type": [
                696
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
                339
            ],
            "configuration": [
                339
            ],
            "id": [
                562
            ],
            "objectMetadataId": [
                562
            ],
            "pageLayoutTabId": [
                562
            ],
            "position": [
                339
            ],
            "title": [
                4
            ],
            "type": [
                696
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
                562
            ],
            "tabs": [
                602
            ],
            "type": [
                426
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRoleInput": {
            "id": [
                562
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
                562
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
        "UpdateTabPresenceInput": {
            "status": [
                536
            ],
            "tabId": [
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
                562
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                390
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
                566
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                562
            ],
            "payload": [
                210
            ],
            "__typename": [
                4
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                562
            ],
            "update": [
                614
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
                562
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
                562
            ],
            "update": [
                616
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
                562
            ],
            "update": [
                618
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
            "relationTargetFieldMetadataId": [
                562
            ],
            "size": [
                8
            ],
            "viewFieldGroupId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                562
            ],
            "logicalOperator": [
                684
            ],
            "parentViewFilterGroupId": [
                562
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                562
            ],
            "update": [
                621
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                562
            ],
            "operand": [
                685
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                562
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                562
            ],
            "update": [
                623
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                562
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
                562
            ],
            "calendarFieldMetadataId": [
                562
            ],
            "calendarLayout": [
                678
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                562
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                562
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                562
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                688
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
                390
            ],
            "type": [
                691
            ],
            "visibility": [
                692
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                562
            ],
            "update": [
                626
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                690
            ],
            "relationTargetFieldMetadataId": [
                562
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
                562
            ],
            "update": [
                628
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
                562
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
                339
            ],
            "allowImpersonation": [
                1
            ],
            "customDomain": [
                4
            ],
            "defaultRoleId": [
                562
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
                707
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                339
            ],
            "workspaceMemberId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                287
            ],
            "roleId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                562
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewFieldId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                635
            ],
            "id": [
                562
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
                635
            ],
            "groups": [
                636
            ],
            "widgetId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                411
            ],
            "roleId": [
                562
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesInput": {
            "objectMetadataId": [
                562
            ],
            "roleId": [
                562
            ],
            "rules": [
                484
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesResult": {
            "predicateGroups": [
                480
            ],
            "predicates": [
                479
            ],
            "rules": [
                483
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                646
            ],
            "viewFields": [
                643
            ],
            "viewFilterGroups": [
                644
            ],
            "viewFilters": [
                645
            ],
            "viewSorts": [
                647
            ],
            "widgetId": [
                562
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
                562
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
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                562
            ],
            "logicalOperator": [
                684
            ],
            "parentViewFilterGroupId": [
                562
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
                562
            ],
            "id": [
                562
            ],
            "operand": [
                685
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                562
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                562
            ],
            "calendarFieldMetadataId": [
                562
            ],
            "calendarLayout": [
                678
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                562
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                562
            ],
            "openRecordIn": [
                688
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                691
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                690
            ],
            "fieldMetadataId": [
                562
            ],
            "id": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UpsertWebPushSubscriptionInput": {
            "browserAuthSecret": [
                4
            ],
            "browserPublicKey": [
                4
            ],
            "endpoint": [
                4
            ],
            "vapidPublicKey": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                223
            ],
            "periodStart": [
                223
            ],
            "timeSeries": [
                662
            ],
            "usageByApplication": [
                651
            ],
            "usageByModel": [
                651
            ],
            "usageByOperationType": [
                651
            ],
            "usageByUser": [
                651
            ],
            "userDailyUsage": [
                664
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                654
            ],
            "periodEnd": [
                223
            ],
            "periodStart": [
                223
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
                223
            ],
            "id": [
                562
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                654
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                661
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                663
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                663
            ],
            "operationType": [
                654
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                653
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                657
            ],
            "resourceType": [
                661
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                655
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
                654
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                663
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
                223
            ],
            "periodStart": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                654
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                661
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                663
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
                562
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                654
            ],
            "periodEnd": [
                223
            ],
            "periodStart": [
                223
            ],
            "periodUnit": [
                4
            ],
            "remainingValue": [
                113
            ],
            "resourceType": [
                661
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
                663
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
                662
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
                223
            ],
            "currentUserWorkspace": [
                669
            ],
            "currentWorkspace": [
                701
            ],
            "deletedAt": [
                223
            ],
            "deletedWorkspaceMembers": [
                236
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
                562
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
                418
            ],
            "previousOnboardingStatus": [
                418
            ],
            "supportUserHash": [
                4
            ],
            "updatedAt": [
                223
            ],
            "userVars": [
                340
            ],
            "userWorkspaces": [
                669
            ],
            "workspaceMember": [
                710
            ],
            "workspaceMembers": [
                710
            ],
            "workspaces": [
                669
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
                339
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
                223
            ],
            "expiresAt": [
                223
            ],
            "id": [
                562
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
                223
            ],
            "region": [
                4
            ],
            "userAgent": [
                4
            ],
            "workspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "id": [
                562
            ],
            "inboxNotificationLevel": [
                4
            ],
            "isImpersonating": [
                1
            ],
            "isInboxNotificationPreviewEnabled": [
                1
            ],
            "locale": [
                4
            ],
            "objectRecordsPermissions": [
                417
            ],
            "permissionFlags": [
                435
            ],
            "twoFactorAuthenticationMethodSummary": [
                558
            ],
            "updatedAt": [
                223
            ],
            "user": [
                665
            ],
            "userId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                562
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
                562
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
                562
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                562
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
                719
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
                562
            ],
            "calendarEndFieldMetadataId": [
                562
            ],
            "calendarFieldMetadataId": [
                562
            ],
            "calendarLayout": [
                678
            ],
            "createdAt": [
                223
            ],
            "createdByUserWorkspaceId": [
                562
            ],
            "deletedAt": [
                223
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                562
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
                562
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                687
            ],
            "mainGroupByFieldMetadataId": [
                562
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                562
            ],
            "openRecordIn": [
                688
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
                691
            ],
            "universalIdentifier": [
                562
            ],
            "updatedAt": [
                223
            ],
            "viewFieldGroups": [
                681
            ],
            "viewFields": [
                680
            ],
            "viewFilterGroups": [
                683
            ],
            "viewFilters": [
                682
            ],
            "viewGroups": [
                686
            ],
            "viewSorts": [
                689
            ],
            "visibility": [
                692
            ],
            "workspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                695
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
                562
            ],
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "fieldMetadataId": [
                562
            ],
            "id": [
                562
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
            "relationTargetFieldMetadataId": [
                562
            ],
            "size": [
                8
            ],
            "universalIdentifier": [
                562
            ],
            "updatedAt": [
                223
            ],
            "viewFieldGroupId": [
                562
            ],
            "viewId": [
                562
            ],
            "workspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "id": [
                562
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
                223
            ],
            "viewFields": [
                680
            ],
            "viewId": [
                562
            ],
            "workspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilter": {
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "fieldMetadataId": [
                562
            ],
            "id": [
                562
            ],
            "operand": [
                685
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                562
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                223
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                562
            ],
            "viewId": [
                562
            ],
            "workspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "id": [
                562
            ],
            "logicalOperator": [
                684
            ],
            "parentViewFilterGroupId": [
                562
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "updatedAt": [
                223
            ],
            "viewId": [
                562
            ],
            "workspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "fieldValue": [
                4
            ],
            "id": [
                562
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "updatedAt": [
                223
            ],
            "viewId": [
                562
            ],
            "workspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "direction": [
                690
            ],
            "fieldMetadataId": [
                562
            ],
            "id": [
                562
            ],
            "relationTargetFieldMetadataId": [
                562
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                223
            ],
            "viewId": [
                562
            ],
            "workspaceId": [
                562
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
                562
            ],
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "description": [
                4
            ],
            "id": [
                562
            ],
            "operations": [
                4
            ],
            "role": [
                476
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "updatedAt": [
                223
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
                143
            ],
            "on_CallRecordingSummaryConfiguration": [
                144
            ],
            "on_CallRecordingTranscriptConfiguration": [
                145
            ],
            "on_ChatConfiguration": [
                153
            ],
            "on_ChatThreadsConfiguration": [
                156
            ],
            "on_EmailThreadConfiguration": [
                252
            ],
            "on_EmailsConfiguration": [
                256
            ],
            "on_FieldConfiguration": [
                280
            ],
            "on_FieldRichTextConfiguration": [
                288
            ],
            "on_FieldsConfiguration": [
                289
            ],
            "on_FilesConfiguration": [
                295
            ],
            "on_FormFieldConfiguration": [
                298
            ],
            "on_FrontComponentConfiguration": [
                300
            ],
            "on_IframeConfiguration": [
                320
            ],
            "on_LineChartConfiguration": [
                343
            ],
            "on_MessageCampaignBodyConfiguration": [
                369
            ],
            "on_MessageCampaignDetailsConfiguration": [
                370
            ],
            "on_NotesConfiguration": [
                401
            ],
            "on_PieChartConfiguration": [
                436
            ],
            "on_RecordTableConfiguration": [
                466
            ],
            "on_StandaloneRichTextConfiguration": [
                525
            ],
            "on_TasksConfiguration": [
                537
            ],
            "on_TimelineConfiguration": [
                541
            ],
            "on_ViewConfiguration": [
                679
            ],
            "on_WorkflowConfiguration": [
                698
            ],
            "on_WorkflowRunConfiguration": [
                699
            ],
            "on_WorkflowVersionConfiguration": [
                700
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
                695
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                695
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                695
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                702
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
                339
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
                130
            ],
            "createdAt": [
                223
            ],
            "currentBillingSubscription": [
                130
            ],
            "customDomain": [
                4
            ],
            "databaseSchema": [
                4
            ],
            "defaultRole": [
                476
            ],
            "deletedAt": [
                223
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
                277
            ],
            "hasValidEnterpriseValidityToken": [
                1
            ],
            "hasValidSignedEnterpriseKey": [
                1
            ],
            "id": [
                562
            ],
            "iframeMediaPermissions": [
                321
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
                562
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
                223
            ],
            "viewFields": [
                680
            ],
            "viewFilterGroups": [
                683
            ],
            "viewFilters": [
                682
            ],
            "viewGroups": [
                686
            ],
            "viewSorts": [
                689
            ],
            "views": [
                677
            ],
            "workspaceCustomApplication": [
                58
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                707
            ],
            "workspaceMembersCount": [
                8
            ],
            "workspaceUrls": [
                719
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
                339
            ],
            "isBookCallOnboardingStepPending": [
                1
            ],
            "outcome": [
                704
            ],
            "personEnrichment": [
                339
            ],
            "personOutcome": [
                717
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
                223
            ],
            "id": [
                562
            ],
            "roleId": [
                562
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
                712
            ],
            "id": [
                562
            ],
            "locale": [
                4
            ],
            "name": [
                302
            ],
            "numberFormat": [
                713
            ],
            "openRecordIn": [
                421
            ],
            "roles": [
                476
            ],
            "timeFormat": [
                714
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
                562
            ],
            "userWorkspaceId": [
                562
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                562
            ],
            "variables": [
                666
            ],
            "workspaceMemberId": [
                562
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
                339
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
                562
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
                562
            ],
            "workspaceUrls": [
                719
            ],
            "__typename": [
                4
            ]
        }
    }
}