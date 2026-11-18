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
        458,
        460,
        461,
        469,
        480,
        481,
        490,
        495,
        517,
        530,
        531,
        533,
        560,
        562,
        564,
        629,
        649,
        656,
        658,
        662,
        673,
        679,
        680,
        682,
        683,
        685,
        686,
        687,
        690,
        691,
        692,
        697,
        699,
        702,
        707,
        708,
        709,
        712,
        713
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
                560
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
                560
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
                560
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
                560
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                560
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
                560
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
                560
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
                560
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
                560
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
                560
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
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                560
            ],
            "createdAt": [
                223
            ],
            "id": [
                560
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
                560
            ],
            "senderUserWorkspaceId": [
                560
            ],
            "senderWorkspaceMemberId": [
                560
            ],
            "status": [
                4
            ],
            "threadId": [
                560
            ],
            "turnId": [
                560
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
                560
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                560
            ],
            "messageId": [
                560
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
                560
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                560
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
                560
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
                560
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
                560
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
                560
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
                560
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
                560
            ],
            "aggregateOperation": [
                32
            ],
            "configurationType": [
                690
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
                453
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
                560
            ],
            "name": [
                4
            ],
            "revokedAt": [
                223
            ],
            "role": [
                475
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
                560
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
                560
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
                560
            ],
            "role": [
                382
            ],
            "workspaceMemberId": [
                560
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
                560
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
                475
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
                560
            ],
            "grantedIframeMediaPermissions": [
                321
            ],
            "healthCheckLogicFunctionId": [
                560
            ],
            "id": [
                560
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                352
            ],
            "logoFileId": [
                560
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
                560
            ],
            "requestedIframeMediaPermissions": [
                321
            ],
            "requestedRoleId": [
                560
            ],
            "runHealthCheckOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                560
            ],
            "settingsMenuItems": [
                516
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                560
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
                560
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
                560
            ],
            "workspaceId": [
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                560
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
                449
            ],
            "connectionProviderId": [
                560
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
                560
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
                560
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
                560
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
                560
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
                560
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
                560
            ],
            "connectionProviders": [
                62
            ],
            "settingsMenuItems": [
                516
            ],
            "variables": [
                661
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
                560
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
                560
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
                671
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                560
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
                560
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
                560
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
                560
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
                560
            ],
            "workspaceMemberIds": [
                560
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
                494
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
                560
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
                493
            ],
            "workspaceUrls": [
                714
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
                560
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
                690
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
                560
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
                560
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
                560
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
                560
            ],
            "userCreditsFallback": [
                662
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
                531
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
                530
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
                560
            ],
            "interval": [
                530
            ],
            "metadata": [
                339
            ],
            "phases": [
                133
            ],
            "status": [
                531
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
                560
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
            "connectedAccountId": [
                560
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
                560
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
                690
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                690
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                690
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
                690
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
                690
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
                447
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                514
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                532
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
                560
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                560
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
                560
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
                560
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                560
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
                560
            ],
            "pageLayoutId": [
                560
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
                560
            ],
            "updatedAt": [
                223
            ],
            "workflowVersionId": [
                560
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
                560
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                560
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
                449
            ],
            "connectionProviderId": [
                560
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
                560
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
                560
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
                560
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                560
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
                560
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
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                560
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                560
            ],
            "participantHandleFieldUniversalIdentifier": [
                560
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
                560
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
                560
            ],
            "engineComponentKey": [
                257
            ],
            "frontComponentId": [
                560
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
                560
            ],
            "pageLayoutId": [
                560
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
                560
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
                560
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
                560
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
                560
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
                560
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
                560
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
                560
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
                560
            ],
            "id": [
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                560
            ],
            "agentId": [
                560
            ],
            "color": [
                4
            ],
            "folderId": [
                560
            ],
            "icon": [
                4
            ],
            "id": [
                560
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
                560
            ],
            "parentId": [
                560
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                560
            ],
            "targetRecordId": [
                560
            ],
            "type": [
                400
            ],
            "userWorkspaceId": [
                560
            ],
            "viewId": [
                560
            ],
            "workflowId": [
                560
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
                560
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
                560
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
                560
            ],
            "pageLayoutTabId": [
                560
            ],
            "position": [
                339
            ],
            "title": [
                4
            ],
            "type": [
                691
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                560
            ],
            "filter": [
                339
            ],
            "objectMetadataId": [
                560
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
                560
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                560
            ],
            "secondFieldMetadataId": [
                560
            ],
            "thirdFieldMetadataId": [
                560
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
                560
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
                564
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
                649
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                656
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                658
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
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                560
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
                560
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
                560
            ],
            "id": [
                560
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
                560
            ],
            "size": [
                8
            ],
            "viewFieldGroupId": [
                560
            ],
            "viewId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                560
            ],
            "logicalOperator": [
                679
            ],
            "parentViewFilterGroupId": [
                560
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                560
            ],
            "id": [
                560
            ],
            "operand": [
                680
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                560
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                560
            ],
            "viewId": [
                560
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
                560
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewId": [
                560
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
                560
            ],
            "calendarFieldMetadataId": [
                560
            ],
            "calendarLayout": [
                673
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                560
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                560
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                682
            ],
            "mainGroupByFieldMetadataId": [
                560
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                560
            ],
            "openRecordIn": [
                683
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
                686
            ],
            "visibility": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                685
            ],
            "fieldMetadataId": [
                560
            ],
            "id": [
                560
            ],
            "relationTargetFieldMetadataId": [
                560
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                560
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
                560
            ],
            "operations": [
                4
            ],
            "roleId": [
                560
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
                649
            ],
            "resource": [
                656
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                560
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
                560
            ],
            "name": [
                302
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                560
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
                560
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
                560
            ],
            "pageLayoutId": [
                560
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
                560
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
                560
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                495
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
                560
            ],
            "status": [
                495
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
                690
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
                560
            ],
            "status": [
                254
            ],
            "tenantStatus": [
                255
            ],
            "unsubscribeHostnameStatus": [
                562
            ],
            "updatedAt": [
                223
            ],
            "verificationRecords": [
                668
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
                690
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
                560
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
                560
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
                560
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
                560
            ],
            "morphRelations": [
                468
            ],
            "name": [
                4
            ],
            "object": [
                402
            ],
            "objectMetadataId": [
                560
            ],
            "options": [
                339
            ],
            "relation": [
                468
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
                690
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
                561
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
                561
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
                560
            ],
            "id": [
                560
            ],
            "objectMetadataId": [
                560
            ],
            "roleId": [
                560
            ],
            "rowLevelPermissionPredicateGroupId": [
                560
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
                560
            ],
            "objectMetadataId": [
                560
            ],
            "rowLevelPermissionPredicateGroupId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                690
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                690
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
                560
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
                560
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
                560
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
                560
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
                690
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                560
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                495
            ],
            "type": [
                319
            ],
            "workspace": [
                711
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                690
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
                560
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
                560
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
                560
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
                690
            ],
            "frontComponentId": [
                560
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                560
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
                489
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
                560
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
                560
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
                560
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
                560
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
                560
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
                692
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
                560
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
                690
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
                715
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
                560
            ],
            "threadId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                560
            ],
            "createdAt": [
                223
            ],
            "id": [
                560
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
                560
            ],
            "id": [
                560
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
                561
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
                560
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
                560
            ],
            "messageThreadId": [
                560
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
                560
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
                690
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
                560
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
                560
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
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                560
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
                560
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
                560
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
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                560
            ],
            "applicationUniversalIdentifier": [
                560
            ],
            "id": [
                560
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                560
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
                560
            ],
            "messageThreadId": [
                560
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
                560
            ],
            "connectionProviderId": [
                560
            ],
            "createdAt": [
                223
            ],
            "id": [
                560
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
                690
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                690
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
                560
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
                560
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
                560
            ],
            "participantHandleFieldUniversalIdentifier": [
                560
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
                560
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                560
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
                560
            ],
            "reason": [
                385
            ],
            "source": [
                386
            ],
            "unsubscribeTopicId": [
                560
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
                560
            ],
            "property": [
                4
            ],
            "provenance": [
                391
            ],
            "recordId": [
                560
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
                560
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                560
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
                560
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
                560
            ],
            "key": [
                682
            ],
            "objectMetadataId": [
                560
            ],
            "type": [
                686
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                523,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                696,
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
                        560,
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
                        560,
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
                        560
                    ],
                    "threadId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        560,
                        "UUID!"
                    ],
                    "roleId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        560,
                        "UUID!"
                    ],
                    "roleId": [
                        560,
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
                        530,
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
                        560,
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
                        560,
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
                560,
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
                        560
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
                676,
                {
                    "inputs": [
                        212,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                675,
                {
                    "inputs": [
                        213,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                681,
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
                520,
                {
                    "input": [
                        518,
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
                        560,
                        "UUID!"
                    ],
                    "properties": [
                        339
                    ],
                    "recordId": [
                        560,
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
                475,
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
                446,
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
                467,
                {
                    "input": [
                        206,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                520,
                {
                    "input": [
                        519,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                523,
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
                        530,
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
                563,
                {
                    "input": [
                        209,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                647,
                {
                    "input": [
                        210,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                667,
                {
                    "input": [
                        211,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                672,
                {
                    "input": [
                        217,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                675,
                {
                    "input": [
                        213,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                676,
                {
                    "input": [
                        212,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                677,
                {
                    "input": [
                        215,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                678,
                {
                    "input": [
                        214,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                681,
                {
                    "input": [
                        216,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                684,
                {
                    "input": [
                        218,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                688,
                {
                    "input": [
                        219,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                523,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        560,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        560
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
                        560,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                170,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                696
            ],
            "deleteEmailGroupChannel": [
                372,
                {
                    "id": [
                        560,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                399,
                {
                    "ids": [
                        560,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                367,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                399,
                {
                    "id": [
                        560,
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
                        560,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                467,
                {
                    "id": [
                        560,
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
                523,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                230,
                {
                    "twoFactorAuthenticationMethodId": [
                        560,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                660
            ],
            "deleteUserFromWorkspace": [
                664,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                667,
                {
                    "id": [
                        560,
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
                675,
                {
                    "input": [
                        232,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                676,
                {
                    "input": [
                        231,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                677,
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
                681,
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
                688,
                {
                    "id": [
                        560,
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
                675,
                {
                    "input": [
                        238,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                676,
                {
                    "input": [
                        237,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                677,
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
                681,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                245,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                246,
                {
                    "id": [
                        560,
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
                        560
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
                700
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
                        560,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                98
            ],
            "generateTransientToken": [
                541
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                555,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                557,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        560,
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
                558,
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
                        560,
                        "UUID!"
                    ],
                    "workspaceId": [
                        560,
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
                        560,
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
                        560
                    ],
                    "threadId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                560,
                {
                    "workspaceMemberId": [
                        560,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        470,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                462,
                {
                    "principal": [
                        459,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        466,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        560,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        471,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                472,
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
                510,
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
                        560,
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
                536,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                502,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        560,
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
                        473,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "revokeWorkspaceApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                477,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                491,
                {
                    "input": [
                        487,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                76,
                {
                    "applicationId": [
                        560,
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
                        560
                    ]
                }
            ],
            "sendAppChannelMessage": [
                501,
                {
                    "input": [
                        500,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                502,
                {
                    "browsingContext": [
                        339
                    ],
                    "channelId": [
                        560
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
                        560,
                        "[UUID!]"
                    ],
                    "messageId": [
                        560,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        560,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                505,
                {
                    "input": [
                        504,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                509,
                {
                    "input": [
                        508,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                510,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        560
                    ]
                }
            ],
            "sendMessageCampaign": [
                512,
                {
                    "input": [
                        511,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                507,
                {
                    "input": [
                        513,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                52,
                {
                    "input": [
                        515,
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
                462,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        466,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                462,
                {
                    "accessLevel": [
                        458,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        459,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        466,
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
                521,
                {
                    "input": [
                        522
                    ]
                }
            ],
            "signUpInWorkspace": [
                521,
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
                        560
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                151,
                {
                    "connectedAccountId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                525,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        526,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                527
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
                        534,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                710,
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
                        560,
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
                543,
                {
                    "input": [
                        542,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                547,
                {
                    "input": [
                        544,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                546,
                {
                    "input": [
                        545,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                551,
                {
                    "input": [
                        548,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                550,
                {
                    "input": [
                        549,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                553,
                {
                    "input": [
                        552,
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
                        560,
                        "UUID!"
                    ],
                    "input": [
                        565,
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
                        560,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                48,
                {
                    "input": [
                        567,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                372,
                {
                    "input": [
                        568,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                58,
                {
                    "id": [
                        560,
                        "UUID!"
                    ],
                    "input": [
                        569,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                86,
                {
                    "input": [
                        570,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                90,
                {
                    "input": [
                        572,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                138,
                {
                    "input": [
                        574,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                165,
                {
                    "input": [
                        576,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                372,
                {
                    "input": [
                        577,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                299,
                {
                    "input": [
                        579,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                308,
                {
                    "input": [
                        581,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                277,
                {
                    "input": [
                        582,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                399,
                {
                    "inputs": [
                        595,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                402,
                {
                    "inputs": [
                        596,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                681,
                {
                    "inputs": [
                        618,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                367,
                {
                    "input": [
                        585,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                372,
                {
                    "input": [
                        587,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                379,
                {
                    "input": [
                        589,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                379,
                {
                    "input": [
                        591,
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
                        595,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                6,
                {
                    "input": [
                        566,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        560
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
                        594,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        583,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                402,
                {
                    "input": [
                        596,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                475,
                {
                    "updateRoleInput": [
                        603,
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
                        597,
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
                        598,
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
                        600,
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
                        602,
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
                523,
                {
                    "input": [
                        605,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                536,
                {
                    "input": [
                        606,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                563,
                {
                    "input": [
                        607,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                647,
                {
                    "input": [
                        608,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                115,
                {
                    "userCreditsFallback": [
                        662,
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
                667,
                {
                    "input": [
                        609,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                672,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        620,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                675,
                {
                    "input": [
                        613,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                676,
                {
                    "input": [
                        611,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                677,
                {
                    "input": [
                        616,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                678,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        615,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                681,
                {
                    "input": [
                        618,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                684,
                {
                    "input": [
                        621,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                688,
                {
                    "input": [
                        623,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                696,
                {
                    "data": [
                        627,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                696,
                {
                    "data": [
                        625,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                696,
                {
                    "data": [
                        626,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                705,
                {
                    "roleId": [
                        560,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        628,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "uploadAppTarball": [
                86,
                {
                    "file": [
                        629,
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
                        629,
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
                        629,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                294,
                {
                    "file": [
                        629,
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
                        629,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                294,
                {
                    "file": [
                        629,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                286,
                {
                    "upsertFieldPermissionsInput": [
                        630,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                672,
                {
                    "input": [
                        633,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                410,
                {
                    "upsertObjectPermissionsInput": [
                        634,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                476,
                {
                    "upsertPermissionFlagsInput": [
                        635,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionRules": [
                637,
                {
                    "input": [
                        636,
                        "UpsertRowLevelPermissionRulesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                672,
                {
                    "input": [
                        638,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                94,
                {
                    "input": [
                        665,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                669,
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
                670,
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
                560
            ],
            "agentId": [
                560
            ],
            "applicationId": [
                560
            ],
            "color": [
                4
            ],
            "createdAt": [
                223
            ],
            "folderId": [
                560
            ],
            "icon": [
                4
            ],
            "id": [
                560
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
                560
            ],
            "parentId": [
                560
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                560
            ],
            "targetRecordId": [
                560
            ],
            "targetRecordIdentifier": [
                455
            ],
            "type": [
                400
            ],
            "updatedAt": [
                223
            ],
            "userWorkspaceId": [
                560
            ],
            "viewId": [
                560
            ],
            "workflowId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                690
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                560
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
                560
            ],
            "imageIdentifierFieldMetadataId": [
                560
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
                560
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
                497
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
                561
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
                561
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
                560
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
                560
            ],
            "restrictedFields": [
                339
            ],
            "rowLevelPermissionPredicateGroups": [
                479
            ],
            "rowLevelPermissionPredicates": [
                478
            ],
            "uneditableFields": [
                560
            ],
            "unreadableFields": [
                560
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
                560
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
                560
            ],
            "restrictedFields": [
                339
            ],
            "rowLevelRecordsPermissions": [
                486
            ],
            "uneditableFields": [
                560
            ],
            "unreadableFields": [
                560
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
                560
            ],
            "createdAt": [
                223
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                560
            ],
            "deletedAt": [
                223
            ],
            "id": [
                560
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
                560
            ],
            "tabs": [
                424
            ],
            "type": [
                426
            ],
            "universalIdentifier": [
                560
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
                560
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
                560
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
                560
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                560
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
                560
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
                689
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
                560
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
                560
            ],
            "pageLayoutTabId": [
                560
            ],
            "position": [
                430
            ],
            "title": [
                4
            ],
            "type": [
                691
            ],
            "universalIdentifier": [
                560
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
                560
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
                560
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
                560
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
                560
            ],
            "aggregateOperation": [
                32
            ],
            "color": [
                4
            ],
            "configurationType": [
                690
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
                560
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
                560
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
                560
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
                560
            ],
            "createdAt": [
                223
            ],
            "domain": [
                4
            ],
            "id": [
                560
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
                448
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
                445
            ],
            "IMAP": [
                445
            ],
            "SMTP": [
                445
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
                560
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                714
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
                560
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
                        560,
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
                        560,
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
                        560,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                62,
                {
                    "applicationId": [
                        560,
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
                496,
                {
                    "applicationId": [
                        560,
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
            "callRecordingIdForCalendarEvent": [
                560,
                {
                    "calendarEventId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                23,
                {
                    "agentUniversalIdentifier": [
                        560
                    ],
                    "threadId": [
                        560
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
                        560
                    ],
                    "threadId": [
                        560
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
                        560,
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
                704,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                528,
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                165
            ],
            "currentUser": [
                660
            ],
            "currentUserApplicationAuthorizations": [
                59
            ],
            "currentUserSessions": [
                663
            ],
            "currentWorkspace": [
                696
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
                        560,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                279,
                {
                    "id": [
                        560,
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
                446
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
                        560
                    ],
                    "universalIdentifier": [
                        560
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
                698
            ],
            "findWorkspaceFromInviteHash": [
                696,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                703
            ],
            "frontComponent": [
                299,
                {
                    "id": [
                        560,
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
                475
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
                        560,
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
                450,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                451,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                128
            ],
            "getRole": [
                475,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                475
            ],
            "getSSOIdentityProviders": [
                296
            ],
            "getToolIndex": [
                540
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
                644,
                {
                    "input": [
                        645
                    ]
                }
            ],
            "getView": [
                672,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                675,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                676,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                676,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                675,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                677,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                678,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                678,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                677,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                681,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                681,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                684,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                684,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                672,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        686,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                701
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
                        560,
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
                560,
                {
                    "objectMetadataId": [
                        560,
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
                        560
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
                        560
                    ]
                }
            ],
            "myMessageFolders": [
                379,
                {
                    "messageChannelId": [
                        560
                    ]
                }
            ],
            "myUserApplicationVariables": [
                706
            ],
            "navigationMenuItem": [
                399,
                {
                    "id": [
                        560,
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
                        560,
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
                457,
                {
                    "targets": [
                        466,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                462,
                {
                    "target": [
                        466,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                467
            ],
            "skill": [
                523,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                523
            ],
            "timelineActivityTypes": [
                536
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                554
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                559,
                {
                    "userId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                563
            ],
            "usageLimits": [
                647
            ],
            "usageQuotaDefinitions": [
                651
            ],
            "usageQuotaScopeConsumption": [
                653,
                {
                    "input": [
                        654,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                655
            ],
            "validatePasswordResetToken": [
                666,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                667,
                {
                    "objectMetadataId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                667,
                {
                    "fieldMetadataId": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                688,
                {
                    "id": [
                        560,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                688
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
                560
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
                560
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
                560
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
                560
            ],
            "permissions": [
                456
            ],
            "recordId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                560
            ],
            "workspaceMemberId": [
                560
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
                456
            ],
            "roles": [
                464
            ],
            "shares": [
                463
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                458
            ],
            "id": [
                19
            ],
            "principalId": [
                560
            ],
            "principalRoleId": [
                560
            ],
            "principalType": [
                460
            ],
            "rowCause": [
                461
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
                560
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
                690
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
                560
            ],
            "recordId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                560
            ],
            "id": [
                560
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                560
            ],
            "secondFieldMetadataId": [
                560
            ],
            "thirdFieldMetadataId": [
                560
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
                469
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
                560
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
                560
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
                560
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
                476
            ],
            "rowLevelPermissionFieldPermissions": [
                286
            ],
            "rowLevelPermissionPredicateGroups": [
                479
            ],
            "rowLevelPermissionPredicates": [
                478
            ],
            "rowLevelPermissionRules": [
                482
            ],
            "universalIdentifier": [
                560
            ],
            "workspaceMembers": [
                705
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
                560
            ],
            "roleId": [
                560
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
                481
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
                480
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
                560
            ],
            "objectMetadataId": [
                560
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
                560
            ],
            "predicateGroups": [
                484
            ],
            "predicates": [
                485
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateGroupInput": {
            "id": [
                560
            ],
            "logicalOperator": [
                480
            ],
            "position": [
                8
            ],
            "predicateGroups": [
                484
            ],
            "predicates": [
                485
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateInput": {
            "fieldMetadataId": [
                560
            ],
            "id": [
                560
            ],
            "operand": [
                481
            ],
            "position": [
                8
            ],
            "relationFieldMetadataId": [
                560
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
                479
            ],
            "predicates": [
                478
            ],
            "ruleId": [
                560
            ],
            "uneditableFields": [
                560
            ],
            "unreadableFields": [
                560
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
                489
            ],
            "messages": [
                489
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                339
            ],
            "runAsWorkspaceMemberId": [
                560
            ],
            "thread": [
                492
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
                560
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
                488
            ],
            "content": [
                4
            ],
            "role": [
                490
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
                560
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                560
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
                560
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                495
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
                560
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                495
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
                560
            ],
            "id": [
                560
            ],
            "position": [
                8
            ],
            "tsVectorFieldMetadataId": [
                560
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
                560
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
                498
            ],
            "email": [
                499
            ],
            "idempotencyKey": [
                560
            ],
            "messageChannelId": [
                560
            ],
            "messageThreadId": [
                560
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
                560
            ],
            "messageThreadId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                560
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                560
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
                503
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
                506
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
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                560
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
                703
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
                560
            ],
            "createdAt": [
                223
            ],
            "frontComponentId": [
                560
            ],
            "icon": [
                4
            ],
            "id": [
                560
            ],
            "position": [
                8
            ],
            "scope": [
                517
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                560
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
                560
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
                560
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                495
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
                715
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
                560
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
                560
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
                474
            ],
            "configurationType": [
                690
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                713
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
                560
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
                454,
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
                        560
                    ],
                    "runId": [
                        560
                    ],
                    "threadId": [
                        560
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
                533
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                690
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
                560
            ],
            "createdAt": [
                223
            ],
            "emit": [
                537
            ],
            "frontComponentUniversalIdentifier": [
                560
            ],
            "icon": [
                4
            ],
            "id": [
                560
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
                560
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                560
            ],
            "universalIdentifier": [
                560
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
                560
            ],
            "on": [
                4
            ],
            "through": [
                538
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                560
            ],
            "relationFieldUniversalIdentifier": [
                560
            ],
            "triggerFieldUniversalIdentifiers": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                690
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
                560
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
                560
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
                560
            ],
            "gt": [
                560
            ],
            "gte": [
                560
            ],
            "iLike": [
                560
            ],
            "in": [
                560
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                560
            ],
            "lt": [
                560
            ],
            "lte": [
                560
            ],
            "neq": [
                560
            ],
            "notILike": [
                560
            ],
            "notIn": [
                560
            ],
            "notLike": [
                560
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
                560
            ],
            "name": [
                4
            ],
            "updatedAt": [
                223
            ],
            "visibility": [
                564
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
                560
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
                560
            ],
            "isActive": [
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
                560
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
                560
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
                560
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                560
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
                571
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
                573
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
                560
            ],
            "update": [
                575
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
                560
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
                560
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                560
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
                560
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
                560
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
                560
            ],
            "update": [
                580
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
                560
            ],
            "update": [
                584
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
                560
            ],
            "update": [
                586
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                560
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
                560
            ],
            "update": [
                588
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
                560
            ],
            "update": [
                590
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
                560
            ],
            "update": [
                590
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
                560
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
                560
            ],
            "parentId": [
                560
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
                560
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
                560
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
                560
            ],
            "update": [
                578
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                560
            ],
            "update": [
                592
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                560
            ],
            "update": [
                593
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
                560
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
                560
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
                601
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
                560
            ],
            "pageLayoutTabId": [
                560
            ],
            "position": [
                339
            ],
            "title": [
                4
            ],
            "type": [
                691
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
                560
            ],
            "objectMetadataId": [
                560
            ],
            "pageLayoutTabId": [
                560
            ],
            "position": [
                339
            ],
            "title": [
                4
            ],
            "type": [
                691
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
                560
            ],
            "tabs": [
                599
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
                560
            ],
            "update": [
                604
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
                560
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
                560
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
                564
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                560
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
                560
            ],
            "update": [
                610
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
                560
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
                560
            ],
            "update": [
                612
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
                560
            ],
            "update": [
                614
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
                560
            ],
            "size": [
                8
            ],
            "viewFieldGroupId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                560
            ],
            "logicalOperator": [
                679
            ],
            "parentViewFilterGroupId": [
                560
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                560
            ],
            "update": [
                617
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                560
            ],
            "operand": [
                680
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                560
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                560
            ],
            "update": [
                619
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                560
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
                560
            ],
            "calendarFieldMetadataId": [
                560
            ],
            "calendarLayout": [
                673
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                560
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                560
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                560
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                683
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
                686
            ],
            "visibility": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                560
            ],
            "update": [
                622
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                685
            ],
            "relationTargetFieldMetadataId": [
                560
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
                560
            ],
            "update": [
                624
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
                560
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
                560
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
                702
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
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                560
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewFieldId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                631
            ],
            "id": [
                560
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
                631
            ],
            "groups": [
                632
            ],
            "widgetId": [
                560
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
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesInput": {
            "objectMetadataId": [
                560
            ],
            "roleId": [
                560
            ],
            "rules": [
                483
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesResult": {
            "predicateGroups": [
                479
            ],
            "predicates": [
                478
            ],
            "rules": [
                482
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                642
            ],
            "viewFields": [
                639
            ],
            "viewFilterGroups": [
                640
            ],
            "viewFilters": [
                641
            ],
            "viewSorts": [
                643
            ],
            "widgetId": [
                560
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
                560
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
                560
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                560
            ],
            "logicalOperator": [
                679
            ],
            "parentViewFilterGroupId": [
                560
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
                560
            ],
            "id": [
                560
            ],
            "operand": [
                680
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                560
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                560
            ],
            "calendarFieldMetadataId": [
                560
            ],
            "calendarLayout": [
                673
            ],
            "kanbanAggregateOperation": [
                32
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                560
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                560
            ],
            "openRecordIn": [
                683
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                686
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                685
            ],
            "fieldMetadataId": [
                560
            ],
            "id": [
                560
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
                657
            ],
            "usageByApplication": [
                646
            ],
            "usageByModel": [
                646
            ],
            "usageByOperationType": [
                646
            ],
            "usageByUser": [
                646
            ],
            "userDailyUsage": [
                659
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                649
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
                560
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                649
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                656
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                658
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
                658
            ],
            "operationType": [
                649
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                648
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                652
            ],
            "resourceType": [
                656
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                650
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
                649
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                658
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
                649
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                656
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                658
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
                560
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                113
            ],
            "operationType": [
                649
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
                656
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
                658
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
                657
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
                664
            ],
            "currentWorkspace": [
                696
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
                560
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
                664
            ],
            "workspaceMember": [
                705
            ],
            "workspaceMembers": [
                705
            ],
            "workspaces": [
                664
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
                560
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
                560
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
                560
            ],
            "isImpersonating": [
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
                556
            ],
            "updatedAt": [
                223
            ],
            "user": [
                660
            ],
            "userId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                560
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
                560
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
                560
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                560
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
                560
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
                714
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
                560
            ],
            "calendarEndFieldMetadataId": [
                560
            ],
            "calendarFieldMetadataId": [
                560
            ],
            "calendarLayout": [
                673
            ],
            "createdAt": [
                223
            ],
            "createdByUserWorkspaceId": [
                560
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
                560
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
                560
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                682
            ],
            "mainGroupByFieldMetadataId": [
                560
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                560
            ],
            "openRecordIn": [
                683
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
                686
            ],
            "universalIdentifier": [
                560
            ],
            "updatedAt": [
                223
            ],
            "viewFieldGroups": [
                676
            ],
            "viewFields": [
                675
            ],
            "viewFilterGroups": [
                678
            ],
            "viewFilters": [
                677
            ],
            "viewGroups": [
                681
            ],
            "viewSorts": [
                684
            ],
            "visibility": [
                687
            ],
            "workspaceId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                690
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
                560
            ],
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "fieldMetadataId": [
                560
            ],
            "id": [
                560
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
                560
            ],
            "size": [
                8
            ],
            "universalIdentifier": [
                560
            ],
            "updatedAt": [
                223
            ],
            "viewFieldGroupId": [
                560
            ],
            "viewId": [
                560
            ],
            "workspaceId": [
                560
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
                560
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
                675
            ],
            "viewId": [
                560
            ],
            "workspaceId": [
                560
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
                560
            ],
            "id": [
                560
            ],
            "operand": [
                680
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                560
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
                560
            ],
            "viewId": [
                560
            ],
            "workspaceId": [
                560
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
                560
            ],
            "logicalOperator": [
                679
            ],
            "parentViewFilterGroupId": [
                560
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "updatedAt": [
                223
            ],
            "viewId": [
                560
            ],
            "workspaceId": [
                560
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
                560
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
                560
            ],
            "workspaceId": [
                560
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
                685
            ],
            "fieldMetadataId": [
                560
            ],
            "id": [
                560
            ],
            "relationTargetFieldMetadataId": [
                560
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                223
            ],
            "viewId": [
                560
            ],
            "workspaceId": [
                560
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
                560
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
                560
            ],
            "operations": [
                4
            ],
            "role": [
                475
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
                465
            ],
            "on_StandaloneRichTextConfiguration": [
                524
            ],
            "on_TasksConfiguration": [
                535
            ],
            "on_TimelineConfiguration": [
                539
            ],
            "on_ViewConfiguration": [
                674
            ],
            "on_WorkflowConfiguration": [
                693
            ],
            "on_WorkflowRunConfiguration": [
                694
            ],
            "on_WorkflowVersionConfiguration": [
                695
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
                690
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                690
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                690
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                697
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
                475
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
                560
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
                560
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
                675
            ],
            "viewFilterGroups": [
                678
            ],
            "viewFilters": [
                677
            ],
            "viewGroups": [
                681
            ],
            "viewSorts": [
                684
            ],
            "views": [
                672
            ],
            "workspaceCustomApplication": [
                58
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                702
            ],
            "workspaceMembersCount": [
                8
            ],
            "workspaceUrls": [
                714
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
                699
            ],
            "personEnrichment": [
                339
            ],
            "personOutcome": [
                712
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
                560
            ],
            "roleId": [
                560
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
                707
            ],
            "id": [
                560
            ],
            "locale": [
                4
            ],
            "name": [
                302
            ],
            "numberFormat": [
                708
            ],
            "openRecordIn": [
                421
            ],
            "roles": [
                475
            ],
            "timeFormat": [
                709
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
                560
            ],
            "userWorkspaceId": [
                560
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                560
            ],
            "variables": [
                661
            ],
            "workspaceMemberId": [
                560
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
                560
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
                560
            ],
            "workspaceUrls": [
                714
            ],
            "__typename": [
                4
            ]
        }
    }
}