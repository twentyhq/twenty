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
        71,
        79,
        89,
        95,
        108,
        112,
        113,
        115,
        120,
        125,
        128,
        133,
        141,
        142,
        143,
        144,
        152,
        154,
        168,
        173,
        175,
        177,
        224,
        225,
        252,
        256,
        257,
        259,
        270,
        276,
        280,
        284,
        287,
        294,
        311,
        313,
        319,
        321,
        334,
        341,
        342,
        343,
        355,
        357,
        375,
        376,
        377,
        378,
        379,
        380,
        382,
        383,
        384,
        387,
        388,
        390,
        393,
        398,
        402,
        411,
        418,
        420,
        423,
        427,
        428,
        433,
        437,
        461,
        463,
        464,
        472,
        483,
        484,
        493,
        498,
        520,
        533,
        534,
        536,
        563,
        565,
        567,
        634,
        655,
        662,
        664,
        668,
        679,
        693,
        694,
        696,
        697,
        699,
        700,
        701,
        704,
        705,
        706,
        711,
        713,
        716,
        722,
        723,
        724,
        727,
        728
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
                341
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
                225
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
                341
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
                341
            ],
            "roleId": [
                563
            ],
            "triggers": [
                341
            ],
            "updatedAt": [
                225
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
                341
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
                225
            ],
            "deletedAt": [
                225
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
                225
            ],
            "__typename": [
                4
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                225
            ],
            "id": [
                563
            ],
            "isSubscribed": [
                1
            ],
            "lastMentionedAt": [
                225
            ],
            "lastReadAt": [
                225
            ],
            "mentionsResolvedAt": [
                225
            ],
            "snoozedUntil": [
                225
            ],
            "threadId": [
                563
            ],
            "updatedAt": [
                225
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
                225
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
                225
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
                225
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
                341
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
                341
            ],
            "toolName": [
                4
            ],
            "toolOutput": [
                341
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
                225
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
                225
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
                225
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
                225
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
                704
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "filter": [
                341
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "label": [
                4
            ],
            "numberFormat": [
                154
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
                115
            ],
            "kind": [
                4
            ],
            "limitValue": [
                115
            ],
            "periodEnd": [
                225
            ],
            "__typename": [
                4
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                115
            ],
            "limitValue": [
                115
            ],
            "periodEnd": [
                225
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
                225
            ],
            "expiresAt": [
                225
            ],
            "id": [
                563
            ],
            "name": [
                4
            ],
            "revokedAt": [
                225
            ],
            "role": [
                478
            ],
            "updatedAt": [
                225
            ],
            "__typename": [
                4
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                225
            ],
            "id": [
                563
            ],
            "name": [
                4
            ],
            "revokedAt": [
                225
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
                173
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
                341
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
                225
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
                384
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
                91
            ],
            "applicationRegistrationId": [
                563
            ],
            "applicationVariables": [
                94
            ],
            "autoUpgrade": [
                1
            ],
            "availablePackages": [
                341
            ],
            "canBeUninstalled": [
                1
            ],
            "commandMenuItems": [
                167
            ],
            "content": [
                66
            ],
            "createdAt": [
                225
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
                301
            ],
            "grantRoleId": [
                563
            ],
            "grantedIframeMediaPermissions": [
                323
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
                354
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
                404
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                563
            ],
            "requestedIframeMediaPermissions": [
                323
            ],
            "requestedRoleId": [
                563
            ],
            "runHealthCheckOnUserPreferences": [
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
                225
            ],
            "id": [
                563
            ],
            "lastAuthorizedAt": [
                225
            ],
            "lastUsedAt": [
                225
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
                225
            ],
            "authFailedAt": [
                225
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                452
            ],
            "connectionProviderId": [
                563
            ],
            "createdAt": [
                225
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
                225
            ],
            "lastSignedInAt": [
                225
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                173
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                225
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
        "ApplicationConnectedMemberCount": {
            "applicationId": [
                563
            ],
            "connectedMemberCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectionPrice": {
            "amountCents": [
                2
            ],
            "billingPeriod": [
                4
            ],
            "currency": [
                4
            ],
            "label": [
                4
            ],
            "universalIdentifier": [
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
            "connectedAccountPrices": [
                63
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
                65
            ],
            "scope": [
                177
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
                67
            ],
            "commandMenuItems": [
                67
            ],
            "connectionProviders": [
                67
            ],
            "fields": [
                67
            ],
            "frontComponents": [
                67
            ],
            "indexes": [
                67
            ],
            "logicFunctions": [
                67
            ],
            "mcpServers": [
                67
            ],
            "navigationMenuItems": [
                67
            ],
            "objects": [
                67
            ],
            "pageLayoutTabs": [
                67
            ],
            "pageLayouts": [
                67
            ],
            "permissionFlags": [
                67
            ],
            "publicAssets": [
                67
            ],
            "roles": [
                67
            ],
            "skills": [
                67
            ],
            "translations": [
                67
            ],
            "viewFields": [
                67
            ],
            "views": [
                67
            ],
            "workflows": [
                67
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
                69
            ],
            "coverage": [
                70
            ],
            "files": [
                72
            ],
            "manifest": [
                341
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
                89
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
                71
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
                294
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
                294
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
                225
            ],
            "fileFolder": [
                294
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
                77
            ],
            "description": [
                4
            ],
            "status": [
                79
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
                81
            ],
            "bucketSizeInSeconds": [
                2
            ],
            "creditUsage": [
                82
            ],
            "creditsUsed": [
                8
            ],
            "failedRunCount": [
                2
            ],
            "functions": [
                83
            ],
            "issues": [
                84
            ],
            "lifecycle": [
                85
            ],
            "lifecycleFailureCount": [
                2
            ],
            "lookbackInHours": [
                2
            ],
            "periodEnd": [
                225
            ],
            "periodStart": [
                225
            ],
            "rateLimitEventCount": [
                2
            ],
            "runCount": [
                2
            ],
            "versions": [
                86
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                225
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
                225
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
                225
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
                225
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
                64
            ],
            "settingsMenuItems": [
                519
            ],
            "variables": [
                667
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                225
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
                89
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                225
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
                222
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
                677
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
                89
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                225
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
                341
            ],
            "type": [
                4
            ],
            "updatedAt": [
                225
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
                100
            ],
            "applicationRefreshToken": [
                100
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
                341
            ],
            "scope": [
                95
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
                225
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
                225
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
                100
            ],
            "refreshToken": [
                100
            ],
            "__typename": [
                4
            ]
        },
        "AuthTokens": {
            "tokens": [
                101
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
                729
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                105
            ],
            "availableWorkspacesForSignUp": [
                105
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                106
            ],
            "tokens": [
                101
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
                108
            ],
            "color": [
                4
            ],
            "configurationType": [
                704
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
                341
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupMode": [
                112
            ],
            "isCumulative": [
                1
            ],
            "layout": [
                113
            ],
            "numberFormat": [
                154
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                418
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
                319
            ],
            "rangeMax": [
                8
            ],
            "rangeMin": [
                8
            ],
            "secondaryAxisGroupByDateGranularity": [
                418
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
                319
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
                341
            ],
            "formattedToRawLookup": [
                341
            ],
            "groupMode": [
                112
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
                113
            ],
            "series": [
                114
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
                341
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
                137
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
                668
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
                132
            ],
            "currentBillingSubscription": [
                132
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
                120
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
                129
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
                121
            ],
            "downgradePlanKeys": [
                125
            ],
            "isCheckoutDefault": [
                1
            ],
            "isSellable": [
                1
            ],
            "planKey": [
                125
            ],
            "resourceCreditProducts": [
                121
            ],
            "upgradePlanKeys": [
                125
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
        "BillingProduct": {
            "description": [
                4
            ],
            "images": [
                4
            ],
            "metadata": [
                129
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
                125
            ],
            "productKey": [
                128
            ],
            "__typename": [
                4
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                225
            ],
            "periodStart": [
                225
            ],
            "productKey": [
                128
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
                134
            ],
            "cancelAt": [
                225
            ],
            "collectionMethod": [
                133
            ],
            "currentPeriodEnd": [
                225
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
                341
            ],
            "phases": [
                135
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
                127
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
                136
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
                132
            ],
            "currentBillingSubscription": [
                132
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
                172
            ],
            "connectedAccountId": [
                563
            ],
            "contactAutoCreationPolicy": [
                141
            ],
            "createdAt": [
                225
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
                142
            ],
            "syncStageStartedAt": [
                225
            ],
            "syncStatus": [
                143
            ],
            "syncedAt": [
                225
            ],
            "throttleFailureCount": [
                8
            ],
            "updatedAt": [
                225
            ],
            "visibility": [
                144
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
                704
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                704
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                704
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
                152
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
                704
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                341
            ],
            "error": [
                157
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
                704
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
                398
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                400
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
                161
            ],
            "aiModelTiers": [
                163
            ],
            "aiModels": [
                162
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
                99
            ],
            "billing": [
                116
            ],
            "calendarBookingPageId": [
                4
            ],
            "canManageFeatureFlags": [
                1
            ],
            "captcha": [
                151
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
                165
            ],
            "publicFeatureFlags": [
                450
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
            "webPushVapidPublicKey": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                225
            ],
            "link": [
                4
            ],
            "startAt": [
                225
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
                168
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
                225
            ],
            "engineComponentKey": [
                259
            ],
            "frontComponent": [
                301
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
                169
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
                225
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
                410
            ],
            "on_PathCommandMenuItemPayload": [
                435
            ],
            "__typename": [
                4
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                73
            ],
            "files": [
                292
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
                563
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                563
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
                225
            ],
            "authFailedAt": [
                225
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                452
            ],
            "connectionProviderId": [
                563
            ],
            "createdAt": [
                225
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
                225
            ],
            "lastSignedInAt": [
                225
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                173
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                225
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
                326
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
                252
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
            "isPrivate": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                341
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
                341
            ],
            "roleId": [
                563
            ],
            "triggers": [
                341
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
                380
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                74
            ],
            "targets": [
                76
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                88
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
                168
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
                259
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
                341
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
                374
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
                341
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
                341
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                563
            ],
            "options": [
                341
            ],
            "relationCreationPayload": [
                341
            ],
            "settings": [
                341
            ],
            "type": [
                287
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
                194
            ],
            "indexType": [
                334
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
                341
            ],
            "databaseEventTriggerSettings": [
                341
            ],
            "description": [
                4
            ],
            "httpRouteTriggerSettings": [
                341
            ],
            "id": [
                563
            ],
            "name": [
                4
            ],
            "serverRouteTriggerSettings": [
                341
            ],
            "source": [
                341
            ],
            "timeoutSeconds": [
                8
            ],
            "toolTriggerSettings": [
                341
            ],
            "universalIdentifier": [
                563
            ],
            "workflowActionTriggerSettings": [
                341
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
            "signInScope": [
                177
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
            "builtInSectionKey": [
                4
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
            "parentId": [
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
                402
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
                341
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
                192
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                195
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                200
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
                428
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                427
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
                341
            ],
            "objectMetadataId": [
                563
            ],
            "pageLayoutTabId": [
                563
            ],
            "position": [
                341
            ],
            "title": [
                4
            ],
            "type": [
                705
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
                341
            ],
            "objectMetadataId": [
                563
            ],
            "orderBy": [
                341
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
                115
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                115
            ],
            "operationType": [
                655
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                662
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                664
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
            "label": [
                4
            ],
            "position": [
                8
            ],
            "relationScope": [
                688
            ],
            "relationTargetFieldMetadataId": [
                563
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
                693
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
                694
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
                341
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
                679
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
                696
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
                697
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
                700
            ],
            "visibility": [
                701
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                699
            ],
            "fieldMetadataId": [
                563
            ],
            "id": [
                563
            ],
            "relationTargetFieldMetadataId": [
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
                655
            ],
            "resource": [
                662
            ],
            "__typename": [
                4
            ]
        },
        "CursorPaging": {
            "after": [
                175
            ],
            "before": [
                175
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
                304
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
                245
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
                321
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
                176
            ],
            "IMAP": [
                176
            ],
            "SMTP": [
                176
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
                704
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                225
            ],
            "domain": [
                4
            ],
            "id": [
                563
            ],
            "status": [
                256
            ],
            "tenantStatus": [
                257
            ],
            "unsubscribeHostnameStatus": [
                565
            ],
            "updatedAt": [
                225
            ],
            "verificationRecords": [
                674
            ],
            "verifiedAt": [
                225
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                704
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
                341
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
                341
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
                261
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payloads": [
                341
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
                265
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
                225
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
                225
            ],
            "currentPeriodEnd": [
                225
            ],
            "expiresAt": [
                225
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
                225
            ],
            "start": [
                225
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
                270
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
                268
            ],
            "eventType": [
                4
            ],
            "fieldFilters": [
                269
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
                271
            ],
            "first": [
                2
            ],
            "table": [
                276
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                272
            ],
            "records": [
                275
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
                341
            ],
            "recordId": [
                4
            ],
            "timestamp": [
                225
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
                389
            ],
            "objectRecordEventsWithQueryIds": [
                417
            ],
            "queueJobEvents": [
                344
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
                341
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlag": {
            "key": [
                280
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
                225
            ],
            "defaultValue": [
                341
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
                471
            ],
            "name": [
                4
            ],
            "object": [
                404
            ],
            "objectMetadataId": [
                563
            ],
            "options": [
                341
            ],
            "relation": [
                471
            ],
            "settings": [
                341
            ],
            "type": [
                287
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                225
            ],
            "__typename": [
                4
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                704
            ],
            "fieldDisplayMode": [
                284
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
                285
            ],
            "pageInfo": [
                424
            ],
            "__typename": [
                4
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                175
            ],
            "node": [
                281
            ],
            "__typename": [
                4
            ]
        },
        "FieldFilter": {
            "and": [
                286
            ],
            "id": [
                564
            ],
            "isActive": [
                139
            ],
            "isSystem": [
                139
            ],
            "isUIEditable": [
                139
            ],
            "isUIReadOnly": [
                139
            ],
            "objectMetadataId": [
                564
            ],
            "or": [
                286
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
                704
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                704
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
                225
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
                225
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
                225
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
                704
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
                321
            ],
            "workspace": [
                726
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
                387
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
                704
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
                323
            ],
            "applicationId": [
                563
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                93
            ],
            "applicationVariables": [
                341
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
                225
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
                225
            ],
            "usesSdkClient": [
                1
            ],
            "widgetAvailability": [
                303
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                704
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
                428
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
                341
            ],
            "runId": [
                563
            ],
            "scope": [
                341
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
                341
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
            "workspacePersonalInviteToken": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedProgress": {
            "completedStepActionKeys": [
                311
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                311
            ],
            "snoozedUntil": [
                4
            ],
            "steps": [
                312
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                311
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
                313
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
                316
            ],
            "stepActionKey": [
                311
            ],
            "trigger": [
                317
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
                706
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
                704
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
                327
            ],
            "IMAP": [
                327
            ],
            "SMTP": [
                327
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
                252
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
                100
            ],
            "workspace": [
                730
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
                225
            ],
            "id": [
                563
            ],
            "indexFieldMetadataList": [
                332
            ],
            "indexType": [
                334
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
                225
            ],
            "__typename": [
                4
            ]
        },
        "IndexEdge": {
            "cursor": [
                175
            ],
            "node": [
                330
            ],
            "__typename": [
                4
            ]
        },
        "IndexField": {
            "createdAt": [
                225
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
                225
            ],
            "__typename": [
                4
            ]
        },
        "IndexFilter": {
            "and": [
                333
            ],
            "id": [
                564
            ],
            "isCustom": [
                139
            ],
            "or": [
                333
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
                337
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
                343
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
                108
            ],
            "color": [
                4
            ],
            "configurationType": [
                704
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
                341
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
                154
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                418
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
                319
            ],
            "rangeMax": [
                8
            ],
            "rangeMin": [
                8
            ],
            "secondaryAxisGroupByDateGranularity": [
                418
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
                319
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
                341
            ],
            "hasTooManyGroups": [
                1
            ],
            "series": [
                349
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
                341
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
                348
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
                173
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
                225
            ],
            "cronTriggerSettings": [
                341
            ],
            "databaseEventTriggerSettings": [
                341
            ],
            "description": [
                4
            ],
            "executionMode": [
                355
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                341
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
                341
            ],
            "universalIdentifier": [
                563
            ],
            "updatedAt": [
                225
            ],
            "workflowActionTriggerSettings": [
                341
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                341
            ],
            "duration": [
                8
            ],
            "error": [
                341
            ],
            "logs": [
                4
            ],
            "status": [
                357
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
                100
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
                66
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
                341
            ],
            "name": [
                4
            ],
            "objects": [
                365
            ],
            "pricingDescription": [
                4
            ],
            "requestedCapabilities": [
                4
            ],
            "requestedIframeMediaPermissions": [
                323
            ],
            "roles": [
                366
            ],
            "screenshots": [
                4
            ],
            "sourcePackage": [
                4
            ],
            "sourceType": [
                89
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
                367
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                368
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
                225
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
            "signInScope": [
                177
            ],
            "tools": [
                370
            ],
            "toolsSyncError": [
                4
            ],
            "toolsSyncedAt": [
                225
            ],
            "updatedAt": [
                225
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
                341
            ],
            "description": [
                4
            ],
            "inputSchema": [
                341
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
                704
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                704
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
                172
            ],
            "connectedAccountId": [
                563
            ],
            "contactAutoCreationPolicy": [
                375
            ],
            "createdAt": [
                225
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
                382
            ],
            "messagingProviderUniversalIdentifier": [
                563
            ],
            "participantHandleFieldUniversalIdentifier": [
                563
            ],
            "pendingGroupEmailsAction": [
                376
            ],
            "syncStage": [
                377
            ],
            "syncStageStartedAt": [
                225
            ],
            "syncStatus": [
                378
            ],
            "syncedAt": [
                225
            ],
            "throttleFailureCount": [
                8
            ],
            "throttleRetryAfter": [
                225
            ],
            "type": [
                379
            ],
            "updatedAt": [
                225
            ],
            "visibility": [
                380
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
                225
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
                383
            ],
            "updatedAt": [
                225
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
                225
            ],
            "emailAddress": [
                4
            ],
            "id": [
                563
            ],
            "reason": [
                387
            ],
            "source": [
                388
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
                385
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
                416
            ],
            "recordId": [
                4
            ],
            "type": [
                390
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
                393
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
                166
            ],
            "objectMetadataItems": [
                396
            ],
            "views": [
                397
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
                696
            ],
            "objectMetadataId": [
                563
            ],
            "type": [
                700
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
                710,
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
                        324,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "archiveInboxThread": [
                1,
                {
                    "input": [
                        97,
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
                        329,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                103,
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
                150,
                {
                    "input": [
                        149,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                138
            ],
            "cancelSwitchBillingPlan": [
                138
            ],
            "cancelSwitchResourceCreditPrice": [
                138
            ],
            "checkCustomDomainValidRecords": [
                246
            ],
            "checkPublicDomainValidRecords": [
                246,
                {
                    "domain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                131,
                {
                    "plan": [
                        125,
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
                88,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                88,
                {
                    "fileId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                170,
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
                422,
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
                296,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                296,
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
                296,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                296,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "connectApplicationWithApiKey": [
                563,
                {
                    "input": [
                        171,
                        "ConnectApplicationWithApiKeyInput!"
                    ]
                }
            ],
            "createAgentChatChannel": [
                7,
                {
                    "input": [
                        178,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                48,
                {
                    "input": [
                        180,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                374,
                {
                    "input": [
                        181,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                182,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "files": [
                        75,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                183,
                {
                    "input": [
                        184,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                96,
                {
                    "input": [
                        185,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                123
            ],
            "createCalendarEvent": [
                187,
                {
                    "input": [
                        186,
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
                167,
                {
                    "input": [
                        188,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                244,
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
                190,
                {
                    "input": [
                        189,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                255,
                {
                    "input": [
                        191,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                295,
                {
                    "fieldMetadataId": [
                        4
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        4
                    ],
                    "fileFolder": [
                        294,
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
                301,
                {
                    "input": [
                        193,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                401,
                {
                    "inputs": [
                        199,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                682,
                {
                    "inputs": [
                        214,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                681,
                {
                    "inputs": [
                        215,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                695,
                {
                    "inputs": [
                        218,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                369,
                {
                    "input": [
                        197,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                385,
                {
                    "input": [
                        198,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                401,
                {
                    "input": [
                        199,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                295,
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
                        341
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
                        179,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                281,
                {
                    "input": [
                        201,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                330,
                {
                    "input": [
                        202,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                354,
                {
                    "input": [
                        196,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                404,
                {
                    "input": [
                        203,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                478,
                {
                    "createRoleInput": [
                        209,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                425,
                {
                    "input": [
                        204,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                426,
                {
                    "input": [
                        205,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                429,
                {
                    "input": [
                        206,
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
                        208,
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
                        210,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                123,
                {
                    "idempotencyKey": [
                        4,
                        "String!"
                    ],
                    "plan": [
                        125,
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
                        211,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                653,
                {
                    "input": [
                        212,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                673,
                {
                    "input": [
                        213,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                678,
                {
                    "input": [
                        219,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                681,
                {
                    "input": [
                        215,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                682,
                {
                    "input": [
                        214,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                691,
                {
                    "input": [
                        217,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                692,
                {
                    "input": [
                        216,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                695,
                {
                    "input": [
                        218,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                698,
                {
                    "input": [
                        220,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                702,
                {
                    "input": [
                        221,
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
                374,
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
                        226,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                167,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                172,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                710
            ],
            "deleteEmailGroupChannel": [
                374,
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
                301,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                401,
                {
                    "ids": [
                        563,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                369,
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
                401,
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
                281,
                {
                    "input": [
                        227,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                330,
                {
                    "input": [
                        228,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                354,
                {
                    "input": [
                        358,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                404,
                {
                    "input": [
                        229,
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
                470,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                230,
                {
                    "input": [
                        231,
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
                232,
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
                666
            ],
            "deleteUserFromWorkspace": [
                670,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                673,
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
                681,
                {
                    "input": [
                        234,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                682,
                {
                    "input": [
                        233,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                691,
                {
                    "input": [
                        235,
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
                695,
                {
                    "input": [
                        236,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                1,
                {
                    "input": [
                        237,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                702,
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
                681,
                {
                    "input": [
                        240,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                682,
                {
                    "input": [
                        239,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                691,
                {
                    "input": [
                        241,
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
                695,
                {
                    "input": [
                        242,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                1,
                {
                    "input": [
                        243,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                1,
                {
                    "input": [
                        329,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                172,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                247,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                248,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                249,
                {
                    "input": [
                        250,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                253,
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
                118
            ],
            "enqueueJob": [
                262,
                {
                    "input": [
                        260,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                264,
                {
                    "input": [
                        263,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                714
            ],
            "executeOneLogicFunction": [
                356,
                {
                    "input": [
                        278,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                306,
                {
                    "input": [
                        305,
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
                93,
                {
                    "applicationId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                100
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
                102,
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
                102,
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
                102,
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
                308,
                {
                    "input": [
                        309,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                361,
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
                421
            ],
            "grantApplicationCapabilities": [
                60,
                {
                    "input": [
                        318,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                328,
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
                336,
                {
                    "input": [
                        335,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                338,
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
                338
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
                        362,
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
                314,
                {
                    "stepActionKey": [
                        311,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                1
            ],
            "releaseEnterpriseServerBinding": [
                266
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                93,
                {
                    "applicationRefreshToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                102,
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
                167,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                425,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                429,
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
                        476,
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
                480,
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
                78,
                {
                    "applicationId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                78,
                {
                    "applicationId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                325,
                {
                    "connectionParameters": [
                        251,
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
                        341
                    ],
                    "channelId": [
                        563
                    ],
                    "fileAttachments": [
                        293,
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
                122,
                {
                    "partnerCode": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                266,
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
                138,
                {
                    "priceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                107,
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
                107,
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
                422,
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
                        225,
                        "DateTime!"
                    ],
                    "threadId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                153,
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
                        341
                    ],
                    "personContext": [
                        341
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
                138,
                {
                    "plan": [
                        125
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                138
            ],
            "syncAppMessageFolders": [
                381,
                {
                    "input": [
                        537,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                725,
                {
                    "dryRun": [
                        1
                    ],
                    "inferDeletionFromMissingEntities": [
                        1
                    ],
                    "manifest": [
                        341,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                1
            ],
            "syncMcpServerTools": [
                369,
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
                        341
                    ],
                    "type": [
                        46,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                88,
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
                        225
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
                374,
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
                88,
                {
                    "input": [
                        573,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                92,
                {
                    "input": [
                        575,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                140,
                {
                    "input": [
                        577,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                167,
                {
                    "input": [
                        579,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                374,
                {
                    "input": [
                        580,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFocusedTab": [
                1,
                {
                    "input": [
                        582,
                        "UpdateFocusedTabInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                301,
                {
                    "input": [
                        583,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                310,
                {
                    "input": [
                        585,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateInboxNotificationSettings": [
                670,
                {
                    "input": [
                        586,
                        "UpdateInboxNotificationSettingsInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                279,
                {
                    "input": [
                        587,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                401,
                {
                    "inputs": [
                        600,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                404,
                {
                    "inputs": [
                        601,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                695,
                {
                    "inputs": [
                        623,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                369,
                {
                    "input": [
                        590,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                374,
                {
                    "input": [
                        592,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                381,
                {
                    "input": [
                        594,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                381,
                {
                    "input": [
                        596,
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
                401,
                {
                    "input": [
                        600,
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
                281,
                {
                    "input": [
                        599,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        588,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                404,
                {
                    "input": [
                        601,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                478,
                {
                    "updateRoleInput": [
                        608,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                425,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        602,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        603,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                429,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        605,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                425,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        607,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                339,
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
                        610,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                539,
                {
                    "input": [
                        611,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                566,
                {
                    "input": [
                        612,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                653,
                {
                    "input": [
                        613,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                117,
                {
                    "userCreditsFallback": [
                        668,
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
                673,
                {
                    "input": [
                        614,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                678,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        625,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                681,
                {
                    "input": [
                        618,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                682,
                {
                    "input": [
                        616,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                691,
                {
                    "input": [
                        621,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                692,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        620,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                695,
                {
                    "input": [
                        623,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                698,
                {
                    "input": [
                        626,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                702,
                {
                    "input": [
                        628,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                710,
                {
                    "data": [
                        632,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                710,
                {
                    "data": [
                        630,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                710,
                {
                    "data": [
                        631,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                720,
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
                        633,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "uploadAppTarball": [
                88,
                {
                    "file": [
                        634,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "uploadApplicationFile": [
                292,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        634,
                        "Upload!"
                    ],
                    "fileFolder": [
                        294,
                        "FileFolder!"
                    ],
                    "filePath": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                296,
                {
                    "fieldMetadataUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        634,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                296,
                {
                    "file": [
                        634,
                        "Upload!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                296,
                {
                    "file": [
                        634,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                296,
                {
                    "file": [
                        634,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                288,
                {
                    "upsertFieldPermissionsInput": [
                        635,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                678,
                {
                    "input": [
                        638,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                412,
                {
                    "upsertObjectPermissionsInput": [
                        639,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                479,
                {
                    "upsertPermissionFlagsInput": [
                        640,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionRules": [
                642,
                {
                    "input": [
                        641,
                        "UpsertRowLevelPermissionRulesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                678,
                {
                    "input": [
                        643,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "upsertWebPushSubscription": [
                1,
                {
                    "input": [
                        649,
                        "UpsertWebPushSubscriptionInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                96,
                {
                    "input": [
                        671,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                675,
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
                107,
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
                255,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                676,
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
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "createdAt": [
                225
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
                563
            ],
            "parentId": [
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
                458
            ],
            "type": [
                402
            ],
            "universalIdentifier": [
                563
            ],
            "updatedAt": [
                225
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
                704
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
                225
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
                407,
                {
                    "filter": [
                        286,
                        "FieldFilter!"
                    ],
                    "paging": [
                        223,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                281
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
                330
            ],
            "indexMetadatas": [
                409,
                {
                    "filter": [
                        333,
                        "IndexFilter!"
                    ],
                    "paging": [
                        223,
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
                411
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
                225
            ],
            "__typename": [
                4
            ]
        },
        "ObjectConnection": {
            "edges": [
                406
            ],
            "pageInfo": [
                424
            ],
            "__typename": [
                4
            ]
        },
        "ObjectEdge": {
            "cursor": [
                175
            ],
            "node": [
                404
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                285
            ],
            "pageInfo": [
                424
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                408
            ],
            "id": [
                564
            ],
            "isActive": [
                139
            ],
            "isRemote": [
                139
            ],
            "isSearchable": [
                139
            ],
            "isSystem": [
                139
            ],
            "isUICreatable": [
                139
            ],
            "isUIEditable": [
                139
            ],
            "isUIReadOnly": [
                139
            ],
            "or": [
                408
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
                331
            ],
            "pageInfo": [
                424
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
                341
            ],
            "rowLevelPermissionPredicateGroups": [
                482
            ],
            "rowLevelPermissionPredicates": [
                481
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
                224
            ],
            "objectNameSingular": [
                4
            ],
            "properties": [
                416
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
                341
            ],
            "before": [
                341
            ],
            "diff": [
                341
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
                415
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
            "canReadSomeRecords": [
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
                341
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
                420
            ],
            "previousOnboardingStatus": [
                420
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
                175
            ],
            "hasNextPage": [
                1
            ],
            "hasPreviousPage": [
                1
            ],
            "startCursor": [
                175
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
                225
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                563
            ],
            "deletedAt": [
                225
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
                426
            ],
            "type": [
                428
            ],
            "universalIdentifier": [
                563
            ],
            "updatedAt": [
                225
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
                225
            ],
            "deletedAt": [
                225
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
                427
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
                225
            ],
            "widgets": [
                429
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                323
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
                341
            ],
            "configuration": [
                703
            ],
            "createdAt": [
                225
            ],
            "deletedAt": [
                225
            ],
            "gridPosition": [
                320
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
                432
            ],
            "title": [
                4
            ],
            "type": [
                705
            ],
            "universalIdentifier": [
                563
            ],
            "updatedAt": [
                225
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                427
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
                427
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
                430
            ],
            "on_PageLayoutWidgetGridPosition": [
                431
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                434
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                433
            ],
            "index": [
                2
            ],
            "layoutMode": [
                427
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
                225
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
                225
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
                704
            ],
            "dateGranularity": [
                418
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
                341
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
                154
            ],
            "orderBy": [
                319
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
                441
            ],
            "formattedToRawLookup": [
                341
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
                341
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
                353
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
                225
            ],
            "__typename": [
                4
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                148
            ],
            "blockers": [
                373
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
        "PublicCalendarChannel": {
            "connectedAccount": [
                172
            ],
            "connectedAccountId": [
                563
            ],
            "handle": [
                4
            ],
            "id": [
                563
            ],
            "visibility": [
                144
            ],
            "__typename": [
                4
            ]
        },
        "PublicConnectionParametersOutput": {
            "connectionSecurity": [
                252
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
                225
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
                280
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
                98
            ],
            "authProviders": [
                99
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
                729
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
                        307,
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
                        350
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
                374,
                {
                    "filter": [
                        351
                    ]
                }
            ],
            "appMessageFolders": [
                381,
                {
                    "filter": [
                        352
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
                64,
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
                110,
                {
                    "input": [
                        111,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                122
            ],
            "billingPlans": [
                124
            ],
            "billingPortalSession": [
                131,
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
                447
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
                156,
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
                159,
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
                719,
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
                167,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                167
            ],
            "currentUser": [
                666
            ],
            "currentUserApplicationAuthorizations": [
                59
            ],
            "currentUserSessions": [
                669
            ],
            "currentWorkspace": [
                710
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
                267
            ],
            "eventLogs": [
                274,
                {
                    "input": [
                        273,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                68,
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                281,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                283,
                {
                    "filter": [
                        286,
                        "FieldFilter!"
                    ],
                    "paging": [
                        223,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                446,
                {
                    "clientId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                88,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                80,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "periodEnd": [
                        225
                    ],
                    "periodStart": [
                        225
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                90,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "periodEnd": [
                        225
                    ],
                    "periodStart": [
                        225
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                92,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                160,
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
                344,
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
                88
            ],
            "findManyApplications": [
                58
            ],
            "findManyLogicFunctions": [
                354
            ],
            "findManyMarketplaceApps": [
                363,
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
                364,
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
                88,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                354,
                {
                    "input": [
                        358,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                344,
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
                344,
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
                712
            ],
            "findWorkspaceFromInviteHash": [
                717,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                718
            ],
            "frontComponent": [
                301,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                301
            ],
            "getAddressDetails": [
                442,
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
                96
            ],
            "getAutoCompleteAddress": [
                104,
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
                341,
                {
                    "input": [
                        358,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                174,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                255
            ],
            "getInviteSuggestions": [
                340
            ],
            "getJobs": [
                344,
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
                        358,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                425,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                426,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                429,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                429,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                425,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        428
                    ]
                }
            ],
            "getPermissionFlags": [
                436
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
                        563,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                130
            ],
            "getRole": [
                478,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                478
            ],
            "getSSOIdentityProviders": [
                298
            ],
            "getToolIndex": [
                543
            ],
            "getToolInputSchema": [
                341,
                {
                    "toolName": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                650,
                {
                    "input": [
                        651
                    ]
                }
            ],
            "getView": [
                678,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                681,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                682,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                682,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                681,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                691,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                692,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                692,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                691,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                695,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                695,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                698,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                698,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                678,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        700,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                715
            ],
            "gettingStartedProgress": [
                310
            ],
            "gettingStartedWorkflowPreviews": [
                315
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
                346,
                {
                    "input": [
                        347,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                124
            ],
            "mcpServer": [
                369,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                369
            ],
            "messageSuppressions": [
                386,
                {
                    "input": [
                        299,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                391,
                {
                    "input": [
                        394,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                395
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
                87
            ],
            "myCalendarChannels": [
                140,
                {
                    "connectedAccountId": [
                        563
                    ]
                }
            ],
            "myConnectedAccounts": [
                172
            ],
            "myMessageChannels": [
                374,
                {
                    "connectedAccountId": [
                        563
                    ]
                }
            ],
            "myMessageFolders": [
                381,
                {
                    "messageChannelId": [
                        563
                    ]
                }
            ],
            "myUserApplicationVariables": [
                721
            ],
            "navigationMenuItem": [
                401,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                401
            ],
            "object": [
                404,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                414
            ],
            "objects": [
                405,
                {
                    "filter": [
                        408,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        223,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                439,
                {
                    "input": [
                        440,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                148,
                {
                    "input": [
                        443,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                445,
                {
                    "input": [
                        444,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                364,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                363
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
                653
            ],
            "usageQuotaDefinitions": [
                657
            ],
            "usageQuotaScopeConsumption": [
                659,
                {
                    "input": [
                        660,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                661
            ],
            "validatePasswordResetToken": [
                672,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                673,
                {
                    "objectMetadataId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                673,
                {
                    "fieldMetadataId": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                702,
                {
                    "id": [
                        563,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                702
            ],
            "workspaceApplicationAuthorizations": [
                59,
                {
                    "applicationId": [
                        563
                    ]
                }
            ],
            "workspaceApplicationConnectedMemberCounts": [
                62
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
                459
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
                563
            ],
            "principalRoleId": [
                563
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
                704
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
                281
            ],
            "sourceObjectMetadata": [
                404
            ],
            "targetFieldMetadata": [
                281
            ],
            "targetObjectMetadata": [
                404
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
                288
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
                412
            ],
            "permissionFlags": [
                479
            ],
            "rowLevelPermissionFieldPermissions": [
                288
            ],
            "rowLevelPermissionPredicateGroups": [
                482
            ],
            "rowLevelPermissionPredicates": [
                481
            ],
            "rowLevelPermissionRules": [
                485
            ],
            "universalIdentifier": [
                563
            ],
            "workspaceMembers": [
                720
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
                484
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
                341
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFieldMetadataId": [
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
                483
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
                563
            ],
            "objectMetadataId": [
                563
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
                563
            ],
            "predicateGroups": [
                487
            ],
            "predicates": [
                488
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateGroupInput": {
            "id": [
                563
            ],
            "logicalOperator": [
                483
            ],
            "position": [
                8
            ],
            "predicateGroups": [
                487
            ],
            "predicates": [
                488
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateInput": {
            "fieldMetadataId": [
                563
            ],
            "id": [
                563
            ],
            "operand": [
                484
            ],
            "position": [
                8
            ],
            "relationFieldMetadataId": [
                563
            ],
            "subFieldName": [
                4
            ],
            "value": [
                341
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFieldMetadataId": [
                563
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
                482
            ],
            "predicates": [
                481
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
                341
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
                341
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
                321
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
                321
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
                225
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
                225
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
                341
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
                718
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
                225
            ],
            "__typename": [
                4
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                148
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
                341
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
                225
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
                225
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
                321
            ],
            "__typename": [
                4
            ]
        },
        "SignUp": {
            "loginToken": [
                100
            ],
            "workspace": [
                730
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
                225
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
                225
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
                704
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                728
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
                275,
                {
                    "fieldFilters": [
                        269,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        276,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                457,
                {
                    "input": [
                        207,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                359,
                {
                    "input": [
                        360,
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
                277,
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
                704
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
                225
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
                225
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
                704
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
                341
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
                100
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
                341
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
                225
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
                101
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
                225
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
                225
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
                225
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
            "isPrivate": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                341
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
                341
            ],
            "roleId": [
                563
            ],
            "triggers": [
                341
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
                380
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
                141
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
                144
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
                168
            ],
            "engineComponentKey": [
                259
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
                341
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
                341
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                563
            ],
            "options": [
                341
            ],
            "settings": [
                341
            ],
            "translations": [
                392
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFocusedTabInput": {
            "isFocused": [
                1
            ],
            "tabId": [
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
                584
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
                311
            ],
            "completedStepChatThreadId": [
                4
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                311
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
                563
            ],
            "update": [
                589
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                341
            ],
            "databaseEventTriggerSettings": [
                341
            ],
            "description": [
                4
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                341
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
                341
            ],
            "workflowActionTriggerSettings": [
                341
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
                591
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
            "signInScope": [
                177
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
                593
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                375
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
                382
            ],
            "visibility": [
                380
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
                595
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
                595
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
                563
            ],
            "parentId": [
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
                411
            ],
            "shortcut": [
                4
            ],
            "translations": [
                392
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
                597
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
                598
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
                428
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
                427
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
                427
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "widgets": [
                606
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
                341
            ],
            "configuration": [
                341
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
                341
            ],
            "title": [
                4
            ],
            "type": [
                705
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
                341
            ],
            "configuration": [
                341
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
                341
            ],
            "title": [
                4
            ],
            "type": [
                705
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
                604
            ],
            "type": [
                428
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
                609
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
                392
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
                212
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
                615
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
                617
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
                619
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
            "label": [
                4
            ],
            "position": [
                8
            ],
            "relationScope": [
                688
            ],
            "relationTargetFieldMetadataId": [
                563
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
                693
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
                622
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
                694
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
                341
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
                624
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
                679
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
                697
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
                392
            ],
            "type": [
                700
            ],
            "visibility": [
                701
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
                627
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                699
            ],
            "relationTargetFieldMetadataId": [
                563
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
                629
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
                341
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
                716
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                341
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
                289
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
                636
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
                636
            ],
            "groups": [
                637
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
                413
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
        "UpsertRowLevelPermissionRulesInput": {
            "objectMetadataId": [
                563
            ],
            "roleId": [
                563
            ],
            "rules": [
                486
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesResult": {
            "predicateGroups": [
                482
            ],
            "predicates": [
                481
            ],
            "rules": [
                485
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                647
            ],
            "viewFields": [
                644
            ],
            "viewFilterGroups": [
                645
            ],
            "viewFilters": [
                646
            ],
            "viewSorts": [
                648
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
                693
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
                694
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
                341
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
                679
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
                697
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                700
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                699
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
                225
            ],
            "periodStart": [
                225
            ],
            "timeSeries": [
                663
            ],
            "usageByApplication": [
                652
            ],
            "usageByModel": [
                652
            ],
            "usageByOperationType": [
                652
            ],
            "usageByUser": [
                652
            ],
            "userDailyUsage": [
                665
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                655
            ],
            "periodEnd": [
                225
            ],
            "periodStart": [
                225
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
                115
            ],
            "createdAt": [
                225
            ],
            "id": [
                563
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                115
            ],
            "operationType": [
                655
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                662
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                664
            ],
            "updatedAt": [
                225
            ],
            "__typename": [
                4
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                664
            ],
            "operationType": [
                655
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                654
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                658
            ],
            "resourceType": [
                662
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                656
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
                655
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                664
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                115
            ],
            "periodEnd": [
                225
            ],
            "periodStart": [
                225
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                655
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                662
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                664
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                115
            ],
            "id": [
                563
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                115
            ],
            "operationType": [
                655
            ],
            "periodEnd": [
                225
            ],
            "periodStart": [
                225
            ],
            "periodUnit": [
                4
            ],
            "remainingValue": [
                115
            ],
            "resourceType": [
                662
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
                664
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
                663
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
                106
            ],
            "canAccessFullAdminPanel": [
                1
            ],
            "canImpersonate": [
                1
            ],
            "createdAt": [
                225
            ],
            "currentUserWorkspace": [
                670
            ],
            "currentWorkspace": [
                710
            ],
            "deletedAt": [
                225
            ],
            "deletedWorkspaceMembers": [
                238
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
                420
            ],
            "previousOnboardingStatus": [
                420
            ],
            "supportUserHash": [
                4
            ],
            "updatedAt": [
                225
            ],
            "userVars": [
                342
            ],
            "userWorkspaces": [
                670
            ],
            "workspaceMember": [
                720
            ],
            "workspaceMembers": [
                720
            ],
            "workspaces": [
                670
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
                341
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
                225
            ],
            "expiresAt": [
                225
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
                225
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
                225
            ],
            "deletedAt": [
                225
            ],
            "id": [
                563
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
                419
            ],
            "permissionFlags": [
                437
            ],
            "twoFactorAuthenticationMethodSummary": [
                559
            ],
            "updatedAt": [
                225
            ],
            "user": [
                666
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
                100
            ],
            "workspaceUrls": [
                729
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
                679
            ],
            "createdAt": [
                225
            ],
            "createdByUserWorkspaceId": [
                563
            ],
            "deletedAt": [
                225
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
                696
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
                697
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
                700
            ],
            "universalIdentifier": [
                563
            ],
            "updatedAt": [
                225
            ],
            "viewFieldGroups": [
                682
            ],
            "viewFields": [
                681
            ],
            "viewFilterGroups": [
                692
            ],
            "viewFilters": [
                691
            ],
            "viewGroups": [
                695
            ],
            "viewSorts": [
                698
            ],
            "visibility": [
                701
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
                704
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
                225
            ],
            "deletedAt": [
                225
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
            "label": [
                4
            ],
            "position": [
                8
            ],
            "relationScope": [
                683
            ],
            "relationTargetFieldMetadataId": [
                563
            ],
            "size": [
                8
            ],
            "universalIdentifier": [
                563
            ],
            "updatedAt": [
                225
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
                225
            ],
            "deletedAt": [
                225
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
                225
            ],
            "viewFields": [
                681
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
        "ViewFieldRelationScope": {
            "aggregateOperation": [
                32
            ],
            "filterGroups": [
                685
            ],
            "filters": [
                684
            ],
            "limit": [
                2
            ],
            "sorts": [
                689
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilter": {
            "fieldMetadataId": [
                563
            ],
            "filterGroupId": [
                563
            ],
            "id": [
                563
            ],
            "operand": [
                694
            ],
            "relationTargetFieldMetadataId": [
                563
            ],
            "subFieldName": [
                4
            ],
            "value": [
                341
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroup": {
            "id": [
                563
            ],
            "logicalOperator": [
                693
            ],
            "parentFilterGroupId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroupInput": {
            "id": [
                563
            ],
            "logicalOperator": [
                693
            ],
            "parentFilterGroupId": [
                563
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterInput": {
            "fieldMetadataId": [
                563
            ],
            "filterGroupId": [
                563
            ],
            "id": [
                563
            ],
            "operand": [
                694
            ],
            "relationTargetFieldMetadataId": [
                563
            ],
            "subFieldName": [
                4
            ],
            "value": [
                341
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeInput": {
            "aggregateOperation": [
                32
            ],
            "filterGroups": [
                686
            ],
            "filters": [
                687
            ],
            "limit": [
                2
            ],
            "sorts": [
                690
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeSort": {
            "direction": [
                699
            ],
            "fieldMetadataId": [
                563
            ],
            "relationTargetFieldMetadataId": [
                563
            ],
            "subFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeSortInput": {
            "direction": [
                699
            ],
            "fieldMetadataId": [
                563
            ],
            "relationTargetFieldMetadataId": [
                563
            ],
            "subFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilter": {
            "createdAt": [
                225
            ],
            "deletedAt": [
                225
            ],
            "fieldMetadataId": [
                563
            ],
            "id": [
                563
            ],
            "operand": [
                694
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
                225
            ],
            "value": [
                341
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
                225
            ],
            "deletedAt": [
                225
            ],
            "id": [
                563
            ],
            "logicalOperator": [
                693
            ],
            "parentViewFilterGroupId": [
                563
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "updatedAt": [
                225
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
                225
            ],
            "deletedAt": [
                225
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
                225
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
                225
            ],
            "deletedAt": [
                225
            ],
            "direction": [
                699
            ],
            "fieldMetadataId": [
                563
            ],
            "id": [
                563
            ],
            "relationTargetFieldMetadataId": [
                563
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                225
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
                225
            ],
            "deletedAt": [
                225
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
                478
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "updatedAt": [
                225
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
                109
            ],
            "on_CalendarConfiguration": [
                145
            ],
            "on_CallRecordingSummaryConfiguration": [
                146
            ],
            "on_CallRecordingTranscriptConfiguration": [
                147
            ],
            "on_ChatConfiguration": [
                155
            ],
            "on_ChatThreadsConfiguration": [
                158
            ],
            "on_EmailThreadConfiguration": [
                254
            ],
            "on_EmailsConfiguration": [
                258
            ],
            "on_FieldConfiguration": [
                282
            ],
            "on_FieldRichTextConfiguration": [
                290
            ],
            "on_FieldsConfiguration": [
                291
            ],
            "on_FilesConfiguration": [
                297
            ],
            "on_FormFieldConfiguration": [
                300
            ],
            "on_FrontComponentConfiguration": [
                302
            ],
            "on_IframeConfiguration": [
                322
            ],
            "on_LineChartConfiguration": [
                345
            ],
            "on_MessageCampaignBodyConfiguration": [
                371
            ],
            "on_MessageCampaignDetailsConfiguration": [
                372
            ],
            "on_NotesConfiguration": [
                403
            ],
            "on_PieChartConfiguration": [
                438
            ],
            "on_RecordTableConfiguration": [
                468
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
                680
            ],
            "on_WorkflowConfiguration": [
                707
            ],
            "on_WorkflowRunConfiguration": [
                708
            ],
            "on_WorkflowVersionConfiguration": [
                709
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
                704
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                704
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                704
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                711
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
                341
            ],
            "allowImpersonation": [
                1
            ],
            "allowedEmbeddingOrigins": [
                4
            ],
            "billingCustomer": [
                117
            ],
            "billingEntitlements": [
                119
            ],
            "billingSubscriptions": [
                132
            ],
            "createdAt": [
                225
            ],
            "currentBillingSubscription": [
                132
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
                225
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
                279
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
                323
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
                225
            ],
            "viewFields": [
                681
            ],
            "viewFilterGroups": [
                692
            ],
            "viewFilters": [
                691
            ],
            "viewGroups": [
                695
            ],
            "viewSorts": [
                698
            ],
            "views": [
                678
            ],
            "workspaceCustomApplication": [
                58
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                716
            ],
            "workspaceMembersCount": [
                8
            ],
            "workspaceUrls": [
                729
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
                341
            ],
            "isBookCallOnboardingStepPending": [
                1
            ],
            "outcome": [
                713
            ],
            "personEnrichment": [
                341
            ],
            "personOutcome": [
                727
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
        "WorkspaceFromInviteHash": {
            "allowImpersonation": [
                1
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
            "__typename": [
                4
            ]
        },
        "WorkspaceInvitation": {
            "email": [
                4
            ],
            "expiresAt": [
                225
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
                722
            ],
            "id": [
                563
            ],
            "locale": [
                4
            ],
            "name": [
                304
            ],
            "numberFormat": [
                723
            ],
            "openRecordIn": [
                423
            ],
            "roles": [
                478
            ],
            "timeFormat": [
                724
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
                667
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
                341
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
                729
            ],
            "__typename": [
                4
            ]
        }
    }
}