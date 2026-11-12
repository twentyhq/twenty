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
        26,
        28,
        29,
        36,
        40,
        42,
        49,
        65,
        73,
        83,
        89,
        102,
        106,
        107,
        109,
        114,
        120,
        126,
        131,
        137,
        140,
        141,
        142,
        143,
        151,
        153,
        167,
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
        372,
        373,
        374,
        375,
        376,
        377,
        379,
        380,
        381,
        384,
        385,
        387,
        390,
        395,
        399,
        408,
        415,
        417,
        420,
        424,
        425,
        430,
        434,
        457,
        459,
        460,
        468,
        480,
        482,
        488,
        493,
        514,
        527,
        528,
        530,
        557,
        559,
        561,
        626,
        646,
        653,
        655,
        659,
        670,
        676,
        677,
        679,
        680,
        682,
        683,
        684,
        687,
        688,
        689,
        694,
        696,
        699,
        704,
        705,
        706,
        709,
        710
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
                557
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
                557
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
                557
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
                557
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                557
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
                557
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
                557
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
                557
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
                557
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
                557
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
                557
            ],
            "updatedAt": [
                223
            ],
            "__typename": [
                4
            ]
        },
        "AgentIdInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                557
            ],
            "createdAt": [
                223
            ],
            "id": [
                557
            ],
            "isBuiltInAssistant": [
                1
            ],
            "parts": [
                23
            ],
            "processedAt": [
                223
            ],
            "reactions": [
                24
            ],
            "role": [
                4
            ],
            "senderApplicationId": [
                557
            ],
            "senderUserWorkspaceId": [
                557
            ],
            "senderWorkspaceMemberId": [
                557
            ],
            "status": [
                4
            ],
            "threadId": [
                557
            ],
            "turnId": [
                557
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
                557
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                557
            ],
            "messageId": [
                557
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
                557
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                557
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
                557
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
                26
            ],
            "threadId": [
                557
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
        "AgentTurnStatus": {},
        "AggregateChartConfiguration": {
            "aggregateFieldMetadataId": [
                557
            ],
            "aggregateOperation": [
                28
            ],
            "configurationType": [
                687
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
                153
            ],
            "prefix": [
                4
            ],
            "ratioAggregateConfig": [
                452
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
                109
            ],
            "kind": [
                4
            ],
            "limitValue": [
                109
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
                109
            ],
            "limitValue": [
                109
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
                39
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
                557
            ],
            "name": [
                4
            ],
            "revokedAt": [
                223
            ],
            "role": [
                474
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
                557
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
                49
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
                557
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
                50
            ],
            "externalId": [
                4
            ],
            "folderExternalIds": [
                4
            ],
            "participants": [
                53
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
                557
            ],
            "role": [
                381
            ],
            "workspaceMemberId": [
                557
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
                85
            ],
            "applicationRegistrationId": [
                557
            ],
            "applicationVariables": [
                88
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
                166
            ],
            "content": [
                60
            ],
            "createdAt": [
                223
            ],
            "defaultLogicFunctionRole": [
                474
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
                557
            ],
            "grantedIframeMediaPermissions": [
                321
            ],
            "healthCheckLogicFunctionId": [
                557
            ],
            "id": [
                557
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                352
            ],
            "logoFileId": [
                557
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                401
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                557
            ],
            "requestedIframeMediaPermissions": [
                321
            ],
            "runOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                557
            ],
            "settingsMenuItems": [
                513
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                557
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
                557
            ],
            "lastAuthorizedAt": [
                223
            ],
            "lastUsedAt": [
                223
            ],
            "scopes": [
                4
            ],
            "workspaceId": [
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                557
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
                448
            ],
            "connectionProviderId": [
                557
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
                557
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
                557
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
                557
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "oauth": [
                59
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
                61
            ],
            "commandMenuItems": [
                61
            ],
            "connectionProviders": [
                61
            ],
            "fields": [
                61
            ],
            "frontComponents": [
                61
            ],
            "indexes": [
                61
            ],
            "logicFunctions": [
                61
            ],
            "navigationMenuItems": [
                61
            ],
            "objects": [
                61
            ],
            "pageLayoutTabs": [
                61
            ],
            "pageLayouts": [
                61
            ],
            "permissionFlags": [
                61
            ],
            "publicAssets": [
                61
            ],
            "roles": [
                61
            ],
            "skills": [
                61
            ],
            "translations": [
                61
            ],
            "viewFields": [
                61
            ],
            "views": [
                61
            ],
            "workflows": [
                61
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
                63
            ],
            "coverage": [
                64
            ],
            "files": [
                66
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
                83
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
                65
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
                557
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
                557
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
                71
            ],
            "description": [
                4
            ],
            "status": [
                73
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
                75
            ],
            "bucketSizeInSeconds": [
                2
            ],
            "creditUsage": [
                76
            ],
            "creditsUsed": [
                8
            ],
            "failedRunCount": [
                2
            ],
            "functions": [
                77
            ],
            "issues": [
                78
            ],
            "lifecycle": [
                79
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
                80
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
                557
            ],
            "connectionProviders": [
                58
            ],
            "hasUserHealthCheck": [
                1
            ],
            "settingsMenuItems": [
                513
            ],
            "variables": [
                658
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
                557
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
                557
            ],
            "sourcePackage": [
                4
            ],
            "sourceType": [
                83
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
                668
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                557
            ],
            "latestAvailableVersion": [
                4
            ],
            "logoUrl": [
                4
            ],
            "sourceType": [
                83
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
                557
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
                94
            ],
            "applicationRefreshToken": [
                94
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
                557
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
                89
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
                557
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
                557
            ],
            "workspaceMemberIds": [
                557
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
                492
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
                94
            ],
            "refreshToken": [
                94
            ],
            "__typename": [
                4
            ]
        },
        "AuthTokens": {
            "tokens": [
                95
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
                557
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
                491
            ],
            "workspaceUrls": [
                711
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                99
            ],
            "availableWorkspacesForSignUp": [
                99
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                100
            ],
            "tokens": [
                95
            ],
            "__typename": [
                4
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                557
            ],
            "aggregateOperation": [
                28
            ],
            "axisNameDisplay": [
                102
            ],
            "color": [
                4
            ],
            "configurationType": [
                687
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
                106
            ],
            "isCumulative": [
                1
            ],
            "layout": [
                107
            ],
            "numberFormat": [
                153
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                415
            ],
            "primaryAxisGroupByFieldMetadataId": [
                557
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
                415
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                557
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
                106
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
                107
            ],
            "series": [
                108
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
                557
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
                557
            ],
            "userCreditsFallback": [
                659
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
                528
            ],
            "__typename": [
                4
            ]
        },
        "BillingEntitlement": {
            "key": [
                114
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
                121
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
                127
            ],
            "name": [
                4
            ],
            "prices": [
                122
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
                115
            ],
            "downgradePlanKeys": [
                120
            ],
            "isCheckoutDefault": [
                1
            ],
            "isSellable": [
                1
            ],
            "meteredProducts": [
                116
            ],
            "planKey": [
                120
            ],
            "resourceCreditProducts": [
                115
            ],
            "upgradePlanKeys": [
                120
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
                137
            ],
            "recurringInterval": [
                527
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
                137
            ],
            "recurringInterval": [
                527
            ],
            "stripePriceId": [
                4
            ],
            "tiers": [
                123
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
                127
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
                127
            ],
            "name": [
                4
            ],
            "on_BillingLicensedProduct": [
                115
            ],
            "on_BillingMeteredProduct": [
                116
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
                120
            ],
            "priceUsageBased": [
                137
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
                557
            ],
            "interval": [
                527
            ],
            "metadata": [
                339
            ],
            "phases": [
                133
            ],
            "status": [
                528
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
                557
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
                557
            ],
            "contactAutoCreationPolicy": [
                140
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
                557
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "syncStage": [
                141
            ],
            "syncStageStartedAt": [
                223
            ],
            "syncStatus": [
                142
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
                143
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
                687
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                687
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
                151
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
                687
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
                156
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
                687
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
                395
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                397
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
                36
            ],
            "__typename": [
                4
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                160
            ],
            "aiModelTiers": [
                162
            ],
            "aiModels": [
                161
            ],
            "allowRequestsToTwentyIcons": [
                1
            ],
            "analyticsEnabled": [
                1
            ],
            "api": [
                43
            ],
            "appVersion": [
                4
            ],
            "authProviders": [
                93
            ],
            "billing": [
                110
            ],
            "calendarBookingPageId": [
                4
            ],
            "canManageFeatureFlags": [
                1
            ],
            "captcha": [
                150
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
                164
            ],
            "publicFeatureFlags": [
                446
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                511
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                529
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
                40
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
                557
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                557
            ],
            "availabilityType": [
                167
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                557
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
                557
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                557
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
                557
            ],
            "pageLayoutId": [
                557
            ],
            "payload": [
                168
            ],
            "position": [
                8
            ],
            "shortLabel": [
                4
            ],
            "universalIdentifier": [
                557
            ],
            "updatedAt": [
                223
            ],
            "workflowVersionId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                407
            ],
            "on_PathCommandMenuItemPayload": [
                432
            ],
            "__typename": [
                4
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                67
            ],
            "files": [
                290
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                557
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
                448
            ],
            "connectionProviderId": [
                557
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
                557
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
                557
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
                557
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                557
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
                557
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
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                557
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                557
            ],
            "participantHandleFieldUniversalIdentifier": [
                557
            ],
            "visibility": [
                377
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                68
            ],
            "targets": [
                70
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                82
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
                557
            ],
            "availabilityType": [
                167
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                557
            ],
            "engineComponentKey": [
                257
            ],
            "frontComponentId": [
                557
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
                557
            ],
            "pageLayoutId": [
                557
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
                557
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
                371
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
                557
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
                557
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
                557
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
                557
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
                557
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
                557
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
                557
            ],
            "id": [
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                557
            ],
            "agentId": [
                557
            ],
            "color": [
                4
            ],
            "folderId": [
                557
            ],
            "icon": [
                4
            ],
            "id": [
                557
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
                557
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                557
            ],
            "targetRecordId": [
                557
            ],
            "type": [
                399
            ],
            "userWorkspaceId": [
                557
            ],
            "viewId": [
                557
            ],
            "workflowId": [
                557
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
                557
            ],
            "type": [
                425
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                424
            ],
            "pageLayoutId": [
                557
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
                557
            ],
            "pageLayoutTabId": [
                557
            ],
            "position": [
                339
            ],
            "title": [
                4
            ],
            "type": [
                688
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                557
            ],
            "filter": [
                339
            ],
            "objectMetadataId": [
                557
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
                557
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                557
            ],
            "secondFieldMetadataId": [
                557
            ],
            "thirdFieldMetadataId": [
                557
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
                557
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                109
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                109
            ],
            "operationType": [
                646
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                653
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                655
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
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                28
            ],
            "fieldMetadataId": [
                557
            ],
            "id": [
                557
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
                557
            ],
            "viewId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                557
            ],
            "logicalOperator": [
                676
            ],
            "parentViewFilterGroupId": [
                557
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                557
            ],
            "id": [
                557
            ],
            "operand": [
                677
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                557
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                557
            ],
            "viewId": [
                557
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
                557
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewId": [
                557
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
                557
            ],
            "calendarFieldMetadataId": [
                557
            ],
            "calendarLayout": [
                670
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                557
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                557
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                679
            ],
            "mainGroupByFieldMetadataId": [
                557
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                557
            ],
            "openRecordIn": [
                680
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
                683
            ],
            "visibility": [
                684
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                682
            ],
            "fieldMetadataId": [
                557
            ],
            "id": [
                557
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                557
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
                557
            ],
            "operations": [
                4
            ],
            "roleId": [
                557
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
                646
            ],
            "resource": [
                653
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                557
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
                557
            ],
            "name": [
                302
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                557
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
                557
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
                557
            ],
            "pageLayoutId": [
                557
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
                557
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
                557
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                493
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
                557
            ],
            "status": [
                493
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
                687
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
                557
            ],
            "status": [
                254
            ],
            "tenantStatus": [
                255
            ],
            "unsubscribeHostnameStatus": [
                559
            ],
            "updatedAt": [
                223
            ],
            "verificationRecords": [
                665
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
                687
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
                386
            ],
            "objectRecordEventsWithQueryIds": [
                414
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
                557
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
                557
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
                557
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
                557
            ],
            "morphRelations": [
                467
            ],
            "name": [
                4
            ],
            "object": [
                401
            ],
            "objectMetadataId": [
                557
            ],
            "options": [
                339
            ],
            "relation": [
                467
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
                687
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
                421
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
                558
            ],
            "isActive": [
                138
            ],
            "isSystem": [
                138
            ],
            "isUIEditable": [
                138
            ],
            "isUIReadOnly": [
                138
            ],
            "objectMetadataId": [
                558
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
                557
            ],
            "id": [
                557
            ],
            "objectMetadataId": [
                557
            ],
            "roleId": [
                557
            ],
            "rowLevelPermissionPredicateGroupId": [
                557
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
                557
            ],
            "objectMetadataId": [
                557
            ],
            "rowLevelPermissionPredicateGroupId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                687
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
                557
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
                557
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
                557
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
                557
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
                687
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                557
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                493
            ],
            "type": [
                319
            ],
            "workspace": [
                708
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
                384
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                687
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
                557
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                87
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
                557
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
                557
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
                687
            ],
            "frontComponentId": [
                557
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                557
            ],
            "pageLayoutType": [
                425
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
                487
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
                557
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
                557
            ],
            "success": [
                1
            ],
            "text": [
                4
            ],
            "usage": [
                37
            ],
            "__typename": [
                4
            ]
        },
        "GetApiKeyInput": {
            "id": [
                557
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
                557
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
                557
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
                689
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
                557
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
                687
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
                94
            ],
            "workspace": [
                712
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
                557
            ],
            "threadId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                557
            ],
            "createdAt": [
                223
            ],
            "id": [
                557
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
                557
            ],
            "id": [
                557
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
                558
            ],
            "isCustom": [
                138
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
                557
            ],
            "messages": [
                52
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
                557
            ],
            "messageThreadId": [
                557
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
                557
            ],
            "aggregateOperation": [
                28
            ],
            "axisNameDisplay": [
                102
            ],
            "color": [
                4
            ],
            "configurationType": [
                687
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
                153
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                415
            ],
            "primaryAxisGroupByFieldMetadataId": [
                557
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
                415
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                557
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
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                557
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
                557
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
                557
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
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                557
            ],
            "applicationUniversalIdentifier": [
                557
            ],
            "id": [
                557
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "LoginToken": {
            "loginToken": [
                94
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
                60
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
                362
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
                363
            ],
            "screenshots": [
                4
            ],
            "sourcePackage": [
                4
            ],
            "sourceType": [
                83
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
                364
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                365
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
                557
            ],
            "connectionProviderId": [
                557
            ],
            "createdAt": [
                223
            ],
            "id": [
                557
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
                367
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
                687
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                687
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
                557
            ],
            "contactAutoCreationPolicy": [
                372
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
                557
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
                379
            ],
            "messagingProviderUniversalIdentifier": [
                557
            ],
            "participantHandleFieldUniversalIdentifier": [
                557
            ],
            "pendingGroupEmailsAction": [
                373
            ],
            "syncStage": [
                374
            ],
            "syncStageStartedAt": [
                223
            ],
            "syncStatus": [
                375
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
                376
            ],
            "updatedAt": [
                223
            ],
            "visibility": [
                377
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
                557
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                557
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                380
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
                557
            ],
            "reason": [
                384
            ],
            "source": [
                385
            ],
            "unsubscribeTopicId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                382
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
                413
            ],
            "recordId": [
                4
            ],
            "type": [
                387
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
                557
            ],
            "property": [
                4
            ],
            "provenance": [
                390
            ],
            "recordId": [
                557
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
                557
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                165
            ],
            "objectMetadataItems": [
                393
            ],
            "views": [
                394
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
                557
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
                557
            ],
            "key": [
                679
            ],
            "objectMetadataId": [
                557
            ],
            "type": [
                683
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                520,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                693,
                {
                    "data": [
                        3,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                24,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        557,
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
                54,
                {
                    "applicationId": [
                        557,
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
                        91,
                        "ArchiveInboxThreadInput!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                1,
                {
                    "assigneeWorkspaceMemberId": [
                        557
                    ],
                    "threadId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        557,
                        "UUID!"
                    ],
                    "roleId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        557,
                        "UUID!"
                    ],
                    "roleId": [
                        557,
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
                97,
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
                    "scope": [
                        4
                    ],
                    "state": [
                        4
                    ]
                }
            ],
            "cancelMessageCampaign": [
                149,
                {
                    "input": [
                        148,
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
                        120,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        527,
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
                82,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                82,
                {
                    "fileId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                169,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "fileIds": [
                        557,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                419,
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
                44,
                {
                    "input": [
                        178,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                371,
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
                        69,
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
                90,
                {
                    "input": [
                        183,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                118
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
                        557
                    ]
                }
            ],
            "createCommandMenuItem": [
                166,
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
                398,
                {
                    "inputs": [
                        197,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                673,
                {
                    "inputs": [
                        212,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                672,
                {
                    "inputs": [
                        213,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                678,
                {
                    "inputs": [
                        216,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                366,
                {
                    "input": [
                        195,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                382,
                {
                    "input": [
                        196,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                398,
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
                517,
                {
                    "input": [
                        515,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                41,
                {
                    "event": [
                        4,
                        "String!"
                    ],
                    "objectMetadataId": [
                        557,
                        "UUID!"
                    ],
                    "properties": [
                        339
                    ],
                    "recordId": [
                        557,
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
                401,
                {
                    "input": [
                        201,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                474,
                {
                    "createRoleInput": [
                        207,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                422,
                {
                    "input": [
                        202,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                423,
                {
                    "input": [
                        203,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                426,
                {
                    "input": [
                        204,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                445,
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
                466,
                {
                    "input": [
                        206,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                517,
                {
                    "input": [
                        516,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                520,
                {
                    "input": [
                        208,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                118,
                {
                    "idempotencyKey": [
                        4,
                        "String!"
                    ],
                    "plan": [
                        120,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        527,
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
                560,
                {
                    "input": [
                        209,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                644,
                {
                    "input": [
                        210,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                664,
                {
                    "input": [
                        211,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                669,
                {
                    "input": [
                        217,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                672,
                {
                    "input": [
                        213,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                673,
                {
                    "input": [
                        212,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                674,
                {
                    "input": [
                        215,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                675,
                {
                    "input": [
                        214,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                678,
                {
                    "input": [
                        216,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                681,
                {
                    "input": [
                        218,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                685,
                {
                    "input": [
                        219,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                520,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        557,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        557
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
                        49
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                371,
                {
                    "id": [
                        557,
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
                166,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                170,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                693
            ],
            "deleteEmailGroupChannel": [
                371,
                {
                    "id": [
                        557,
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                398,
                {
                    "ids": [
                        557,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                366,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                398,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                6,
                {
                    "input": [
                        21,
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
                401,
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
                        557,
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                466,
                {
                    "id": [
                        557,
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
                520,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                230,
                {
                    "twoFactorAuthenticationMethodId": [
                        557,
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                657
            ],
            "deleteUserFromWorkspace": [
                661,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                664,
                {
                    "id": [
                        557,
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
                672,
                {
                    "input": [
                        232,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                673,
                {
                    "input": [
                        231,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                674,
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
                678,
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
                685,
                {
                    "id": [
                        557,
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
                672,
                {
                    "input": [
                        238,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                673,
                {
                    "input": [
                        237,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                674,
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
                678,
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                245,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                246,
                {
                    "id": [
                        557,
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
                        557
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                112
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
                697
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
                46,
                {
                    "apiKeyId": [
                        557,
                        "UUID!"
                    ],
                    "expiresAt": [
                        4,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                87,
                {
                    "applicationId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                94
            ],
            "generateTransientToken": [
                538
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                552,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                554,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                96,
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
                96,
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
                96,
                {
                    "ssoExchangeToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                555,
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
                418
            ],
            "grantApplicationCapabilities": [
                56,
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
                        557,
                        "UUID!"
                    ],
                    "workspaceId": [
                        557,
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
                54,
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        557
                    ],
                    "threadId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                557,
                {
                    "workspaceMemberId": [
                        557,
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
                24,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        469,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                461,
                {
                    "principal": [
                        458,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        465,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                87,
                {
                    "applicationRefreshToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                96,
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        470,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                471,
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
                507,
                {
                    "appTokenId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetAiChatAssistantProfile": [
                30
            ],
            "resetCommandMenuItem": [
                166,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                423,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                422,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                533,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                499,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                2
            ],
            "revokeApiKey": [
                44,
                {
                    "input": [
                        472,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                476,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                489,
                {
                    "input": [
                        485,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                72,
                {
                    "applicationId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                72,
                {
                    "applicationId": [
                        557,
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
                        557
                    ]
                }
            ],
            "sendAppChannelMessage": [
                498,
                {
                    "input": [
                        497,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                499,
                {
                    "browsingContext": [
                        339
                    ],
                    "channelId": [
                        557
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
                        557,
                        "[UUID!]"
                    ],
                    "messageId": [
                        557,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        557,
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                502,
                {
                    "input": [
                        501,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                506,
                {
                    "input": [
                        505,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                507,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        557
                    ]
                }
            ],
            "sendMessageCampaign": [
                509,
                {
                    "input": [
                        508,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                504,
                {
                    "input": [
                        510,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                48,
                {
                    "input": [
                        512,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                117,
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
                461,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        465,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                461,
                {
                    "accessLevel": [
                        457,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        458,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        465,
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
                101,
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
                101,
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
                518,
                {
                    "input": [
                        519
                    ]
                }
            ],
            "signUpInWorkspace": [
                518,
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
                        557
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
                419,
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                152,
                {
                    "connectedAccountId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                522,
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        523,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                524
            ],
            "switchBillingPlan": [
                136,
                {
                    "plan": [
                        120
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                136
            ],
            "syncAppMessageFolders": [
                378,
                {
                    "input": [
                        531,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                707,
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
                366,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "trackAnalytics": [
                41,
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
                        42,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                82,
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
                540,
                {
                    "input": [
                        539,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                544,
                {
                    "input": [
                        541,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                543,
                {
                    "input": [
                        542,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                548,
                {
                    "input": [
                        545,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                547,
                {
                    "input": [
                        546,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                550,
                {
                    "input": [
                        549,
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
                        557,
                        "UUID!"
                    ],
                    "input": [
                        562,
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
                        557,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                44,
                {
                    "input": [
                        564,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                371,
                {
                    "input": [
                        565,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                54,
                {
                    "id": [
                        557,
                        "UUID!"
                    ],
                    "input": [
                        566,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                82,
                {
                    "input": [
                        567,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                86,
                {
                    "input": [
                        569,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                139,
                {
                    "input": [
                        571,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                166,
                {
                    "input": [
                        573,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                371,
                {
                    "input": [
                        574,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                299,
                {
                    "input": [
                        576,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                308,
                {
                    "input": [
                        578,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                277,
                {
                    "input": [
                        579,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                398,
                {
                    "inputs": [
                        592,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                401,
                {
                    "inputs": [
                        593,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                678,
                {
                    "inputs": [
                        615,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                366,
                {
                    "input": [
                        582,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                371,
                {
                    "input": [
                        584,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                378,
                {
                    "input": [
                        586,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                378,
                {
                    "input": [
                        588,
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
                398,
                {
                    "input": [
                        592,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                6,
                {
                    "input": [
                        563,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        557
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
                        591,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        580,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                401,
                {
                    "input": [
                        593,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                474,
                {
                    "updateRoleInput": [
                        600,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                422,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        594,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                423,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        595,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        597,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                422,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        599,
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
                520,
                {
                    "input": [
                        602,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                533,
                {
                    "input": [
                        603,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                560,
                {
                    "input": [
                        604,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                644,
                {
                    "input": [
                        605,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                111,
                {
                    "userCreditsFallback": [
                        659,
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
                664,
                {
                    "input": [
                        606,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                669,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        617,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                672,
                {
                    "input": [
                        610,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                673,
                {
                    "input": [
                        608,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                674,
                {
                    "input": [
                        613,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                675,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        612,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                678,
                {
                    "input": [
                        615,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                681,
                {
                    "input": [
                        618,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                685,
                {
                    "input": [
                        620,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                693,
                {
                    "data": [
                        624,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                693,
                {
                    "data": [
                        622,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                693,
                {
                    "data": [
                        623,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                702,
                {
                    "roleId": [
                        557,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        625,
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
                82,
                {
                    "file": [
                        626,
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
                        626,
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
                        626,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                294,
                {
                    "file": [
                        626,
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
                        626,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                294,
                {
                    "file": [
                        626,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                286,
                {
                    "upsertFieldPermissionsInput": [
                        627,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                669,
                {
                    "input": [
                        630,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                409,
                {
                    "upsertObjectPermissionsInput": [
                        631,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                475,
                {
                    "upsertPermissionFlagsInput": [
                        632,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                634,
                {
                    "input": [
                        633,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                669,
                {
                    "input": [
                        635,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                90,
                {
                    "input": [
                        662,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                666,
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
                101,
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
                667,
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
                557
            ],
            "agentId": [
                557
            ],
            "applicationId": [
                557
            ],
            "color": [
                4
            ],
            "createdAt": [
                223
            ],
            "folderId": [
                557
            ],
            "icon": [
                4
            ],
            "id": [
                557
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
                557
            ],
            "position": [
                8
            ],
            "targetObjectMetadataId": [
                557
            ],
            "targetRecordId": [
                557
            ],
            "targetRecordIdentifier": [
                454
            ],
            "type": [
                399
            ],
            "updatedAt": [
                223
            ],
            "userWorkspaceId": [
                557
            ],
            "viewId": [
                557
            ],
            "workflowId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                557
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
                404,
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
                557
            ],
            "imageIdentifierFieldMetadataId": [
                557
            ],
            "indexMetadataList": [
                328
            ],
            "indexMetadatas": [
                406,
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
                557
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
                408
            ],
            "searchFieldMetadataList": [
                495
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
                403
            ],
            "pageInfo": [
                421
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
                401
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
                421
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                405
            ],
            "id": [
                558
            ],
            "isActive": [
                138
            ],
            "isRemote": [
                138
            ],
            "isSearchable": [
                138
            ],
            "isSystem": [
                138
            ],
            "isUICreatable": [
                138
            ],
            "isUIEditable": [
                138
            ],
            "isUIReadOnly": [
                138
            ],
            "or": [
                405
            ],
            "universalIdentifier": [
                558
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
                421
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                557
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
                557
            ],
            "restrictedFields": [
                339
            ],
            "rowLevelPermissionPredicateGroups": [
                478
            ],
            "rowLevelPermissionPredicates": [
                477
            ],
            "uneditableFields": [
                557
            ],
            "unreadableFields": [
                557
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
                557
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
                413
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
                412
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
                557
            ],
            "restrictedFields": [
                339
            ],
            "rowLevelRecordsPermissions": [
                484
            ],
            "uneditableFields": [
                557
            ],
            "unreadableFields": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                417
            ],
            "previousOnboardingStatus": [
                417
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
                557
            ],
            "createdAt": [
                223
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                557
            ],
            "deletedAt": [
                223
            ],
            "id": [
                557
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
                557
            ],
            "tabs": [
                423
            ],
            "type": [
                425
            ],
            "universalIdentifier": [
                557
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
                557
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
                557
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
                424
            ],
            "pageLayoutId": [
                557
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                557
            ],
            "updatedAt": [
                223
            ],
            "widgets": [
                426
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
                557
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
                686
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
                557
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
                557
            ],
            "pageLayoutTabId": [
                557
            ],
            "position": [
                429
            ],
            "title": [
                4
            ],
            "type": [
                688
            ],
            "universalIdentifier": [
                557
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
                424
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
                424
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
                427
            ],
            "on_PageLayoutWidgetGridPosition": [
                428
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                431
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                430
            ],
            "index": [
                2
            ],
            "layoutMode": [
                424
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
                557
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
                557
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
                557
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
                557
            ],
            "aggregateOperation": [
                28
            ],
            "color": [
                4
            ],
            "configurationType": [
                687
            ],
            "dateGranularity": [
                415
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
                557
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
                153
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
                438
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
                557
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
                147
            ],
            "blockers": [
                370
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                557
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
                557
            ],
            "createdAt": [
                223
            ],
            "domain": [
                4
            ],
            "id": [
                557
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
                447
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
                444
            ],
            "IMAP": [
                444
            ],
            "SMTP": [
                444
            ],
            "__typename": [
                4
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                92
            ],
            "authProviders": [
                93
            ],
            "displayName": [
                4
            ],
            "id": [
                557
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                711
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
                557
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
                        557,
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
            "agentRuns": [
                25,
                {
                    "agentId": [
                        557,
                        "UUID!"
                    ],
                    "limit": [
                        2,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                32
            ],
            "aiChatUserCreditsUsage": [
                33
            ],
            "apiKey": [
                44,
                {
                    "input": [
                        305,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                44
            ],
            "appConnection": [
                47,
                {
                    "id": [
                        19,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                47,
                {
                    "filter": [
                        348
                    ]
                }
            ],
            "appKeyValue": [
                48,
                {
                    "key": [
                        4,
                        "String!"
                    ],
                    "scope": [
                        49
                    ]
                }
            ],
            "appMessageChannels": [
                371,
                {
                    "filter": [
                        349
                    ]
                }
            ],
            "appMessageFolders": [
                378,
                {
                    "filter": [
                        350
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                57,
                {
                    "applicationId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                58,
                {
                    "applicationId": [
                        557,
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
                494,
                {
                    "applicationId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                104,
                {
                    "input": [
                        105,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                117
            ],
            "billingPlans": [
                119
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
                557,
                {
                    "calendarEventId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                22,
                {
                    "agentUniversalIdentifier": [
                        557
                    ],
                    "threadId": [
                        557
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                155,
                {
                    "agentUniversalIdentifier": [
                        557
                    ],
                    "threadId": [
                        557
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
                        557,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                158,
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
                701,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                525,
                {
                    "subdomain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                166,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                166
            ],
            "currentUser": [
                657
            ],
            "currentUserApplicationAuthorizations": [
                55
            ],
            "currentUserSessions": [
                660
            ],
            "currentWorkspace": [
                693
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
                62,
                {
                    "shouldIncludeDependencies": [
                        1
                    ],
                    "shouldIncludeSourceFiles": [
                        1
                    ],
                    "universalIdentifier": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                279,
                {
                    "id": [
                        557,
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
                443,
                {
                    "clientId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                82,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                74,
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
                84,
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
                86,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                159,
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
                82
            ],
            "findManyApplications": [
                54
            ],
            "findManyLogicFunctions": [
                352
            ],
            "findManyMarketplaceApps": [
                360,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                445
            ],
            "findMarketplaceAppDetail": [
                361,
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
                        21,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                54,
                {
                    "id": [
                        557
                    ],
                    "universalIdentifier": [
                        557
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                82,
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
                695
            ],
            "findWorkspaceFromInviteHash": [
                693,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                700
            ],
            "frontComponent": [
                299,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                299
            ],
            "getAddressDetails": [
                439,
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
                38
            ],
            "getApiKeyRoles": [
                474
            ],
            "getApprovedAccessDomains": [
                90
            ],
            "getAutoCompleteAddress": [
                98,
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
                        557,
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
                422,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                423,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                423,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                426,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                426,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                422,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        425
                    ]
                }
            ],
            "getPermissionFlags": [
                433
            ],
            "getPublicWorkspaceDataByDomain": [
                449,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                450,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                128
            ],
            "getRole": [
                474,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                474
            ],
            "getSSOIdentityProviders": [
                296
            ],
            "getToolIndex": [
                537
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
                641,
                {
                    "input": [
                        642
                    ]
                }
            ],
            "getView": [
                669,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                672,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                673,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                673,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                672,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                674,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                675,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                675,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                674,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                678,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                678,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                681,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                681,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                669,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        683,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                698
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
                119
            ],
            "mcpServer": [
                366,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                366
            ],
            "messageSuppressions": [
                383,
                {
                    "input": [
                        297,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                388,
                {
                    "input": [
                        391,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                392
            ],
            "mostlyEmptyFieldMetadataIds": [
                557,
                {
                    "objectMetadataId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                81
            ],
            "myCalendarChannels": [
                139,
                {
                    "connectedAccountId": [
                        557
                    ]
                }
            ],
            "myConnectedAccounts": [
                170
            ],
            "myMessageChannels": [
                371,
                {
                    "connectedAccountId": [
                        557
                    ]
                }
            ],
            "myMessageFolders": [
                378,
                {
                    "messageChannelId": [
                        557
                    ]
                }
            ],
            "myUserApplicationVariables": [
                703
            ],
            "navigationMenuItem": [
                398,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                398
            ],
            "object": [
                401,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                411
            ],
            "objects": [
                402,
                {
                    "filter": [
                        405,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        221,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                436,
                {
                    "input": [
                        437,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                147,
                {
                    "input": [
                        440,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                442,
                {
                    "input": [
                        441,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                361,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                360
            ],
            "recordPermissions": [
                456,
                {
                    "targets": [
                        465,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                461,
                {
                    "target": [
                        465,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                466
            ],
            "skill": [
                520,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                520
            ],
            "timelineActivityTypes": [
                533
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                551
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                556,
                {
                    "userId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                560
            ],
            "usageLimits": [
                644
            ],
            "usageQuotaDefinitions": [
                648
            ],
            "usageQuotaScopeConsumption": [
                650,
                {
                    "input": [
                        651,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                652
            ],
            "validatePasswordResetToken": [
                663,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                664,
                {
                    "objectMetadataId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                664,
                {
                    "fieldMetadataId": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                685,
                {
                    "id": [
                        557,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                685
            ],
            "__typename": [
                4
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                557
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
                557
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
                557
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
                557
            ],
            "permissions": [
                455
            ],
            "recordId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                557
            ],
            "workspaceMemberId": [
                557
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
                455
            ],
            "roles": [
                463
            ],
            "shares": [
                462
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                457
            ],
            "id": [
                19
            ],
            "principalId": [
                557
            ],
            "principalRoleId": [
                557
            ],
            "principalType": [
                459
            ],
            "rowCause": [
                460
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
                557
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
                687
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
                557
            ],
            "recordId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                557
            ],
            "id": [
                557
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                557
            ],
            "secondFieldMetadataId": [
                557
            ],
            "thirdFieldMetadataId": [
                557
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
                401
            ],
            "targetFieldMetadata": [
                279
            ],
            "targetObjectMetadata": [
                401
            ],
            "type": [
                468
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
                557
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
                45
            ],
            "applicationId": [
                557
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
                557
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                409
            ],
            "permissionFlags": [
                475
            ],
            "rowLevelPermissionFieldPermissions": [
                286
            ],
            "rowLevelPermissionPredicateGroups": [
                478
            ],
            "rowLevelPermissionPredicates": [
                477
            ],
            "rowLevelPermissionRules": [
                483
            ],
            "universalIdentifier": [
                557
            ],
            "workspaceMembers": [
                702
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
                557
            ],
            "roleId": [
                557
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
                557
            ],
            "logicalOperator": [
                480
            ],
            "objectMetadataId": [
                557
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                557
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
                557
            ],
            "id": [
                557
            ],
            "operand": [
                482
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                8
            ],
            "relationFieldMetadataId": [
                557
            ],
            "rowLevelPermissionPredicateGroupId": [
                557
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
                557
            ],
            "objectMetadataId": [
                557
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
                478
            ],
            "predicates": [
                477
            ],
            "ruleId": [
                557
            ],
            "uneditableFields": [
                557
            ],
            "unreadableFields": [
                557
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
                487
            ],
            "messages": [
                487
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                339
            ],
            "runAsWorkspaceMemberId": [
                557
            ],
            "thread": [
                490
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
                557
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
                486
            ],
            "content": [
                4
            ],
            "role": [
                488
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
                557
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                557
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
                557
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                493
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
                557
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                493
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
                557
            ],
            "id": [
                557
            ],
            "position": [
                8
            ],
            "tsVectorFieldMetadataId": [
                557
            ],
            "updatedAt": [
                223
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
                496
            ],
            "idempotencyKey": [
                557
            ],
            "messageChannelId": [
                557
            ],
            "messageThreadId": [
                557
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
                557
            ],
            "messageThreadId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                557
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                557
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
                500
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
                503
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
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                557
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
                700
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
                147
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
                49
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
                557
            ],
            "createdAt": [
                223
            ],
            "frontComponentId": [
                557
            ],
            "icon": [
                4
            ],
            "id": [
                557
            ],
            "position": [
                8
            ],
            "scope": [
                514
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                557
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
                557
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
                557
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                493
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
                94
            ],
            "workspace": [
                712
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
                557
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
                557
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
                473
            ],
            "configurationType": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                710
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
                557
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
                453,
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
                        557
                    ],
                    "runId": [
                        557
                    ],
                    "threadId": [
                        557
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
                530
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
                51
            ],
            "messageChannelId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                687
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
                557
            ],
            "createdAt": [
                223
            ],
            "emit": [
                534
            ],
            "frontComponentUniversalIdentifier": [
                557
            ],
            "icon": [
                4
            ],
            "id": [
                557
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
                557
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                557
            ],
            "universalIdentifier": [
                557
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
                557
            ],
            "on": [
                4
            ],
            "through": [
                535
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                557
            ],
            "relationFieldUniversalIdentifier": [
                557
            ],
            "triggerFieldUniversalIdentifiers": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                687
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
                94
            ],
            "__typename": [
                4
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                557
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
                557
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
                95
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
                557
            ],
            "gt": [
                557
            ],
            "gte": [
                557
            ],
            "iLike": [
                557
            ],
            "in": [
                557
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                557
            ],
            "lt": [
                557
            ],
            "lte": [
                557
            ],
            "neq": [
                557
            ],
            "notILike": [
                557
            ],
            "notIn": [
                557
            ],
            "notLike": [
                557
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
                557
            ],
            "name": [
                4
            ],
            "updatedAt": [
                223
            ],
            "visibility": [
                561
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
                557
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
                557
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
                557
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
                557
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
                557
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                557
            ],
            "visibility": [
                377
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
                568
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
                570
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
                557
            ],
            "update": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                140
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
                143
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
                557
            ],
            "availabilityType": [
                167
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
                557
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                557
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
                557
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
                557
            ],
            "options": [
                339
            ],
            "settings": [
                339
            ],
            "translations": [
                389
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
                557
            ],
            "update": [
                577
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
                557
            ],
            "update": [
                581
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
                557
            ],
            "update": [
                583
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                557
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
                557
            ],
            "update": [
                585
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                372
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
                379
            ],
            "visibility": [
                377
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                557
            ],
            "update": [
                587
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
                557
            ],
            "update": [
                587
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
                557
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
                557
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
                557
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
                557
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
                408
            ],
            "shortcut": [
                4
            ],
            "translations": [
                389
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                557
            ],
            "update": [
                575
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                557
            ],
            "update": [
                589
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                557
            ],
            "update": [
                590
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
                557
            ],
            "type": [
                425
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
                424
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
                557
            ],
            "layoutMode": [
                424
            ],
            "position": [
                8
            ],
            "title": [
                4
            ],
            "widgets": [
                598
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
                557
            ],
            "pageLayoutTabId": [
                557
            ],
            "position": [
                339
            ],
            "title": [
                4
            ],
            "type": [
                688
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
                557
            ],
            "objectMetadataId": [
                557
            ],
            "pageLayoutTabId": [
                557
            ],
            "position": [
                339
            ],
            "title": [
                4
            ],
            "type": [
                688
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
                557
            ],
            "tabs": [
                596
            ],
            "type": [
                425
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRoleInput": {
            "id": [
                557
            ],
            "update": [
                601
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
                557
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
                557
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                389
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
                561
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                557
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
                557
            ],
            "update": [
                607
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
                557
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
                557
            ],
            "update": [
                609
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
                557
            ],
            "update": [
                611
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                28
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                557
            ],
            "logicalOperator": [
                676
            ],
            "parentViewFilterGroupId": [
                557
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "viewId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                557
            ],
            "update": [
                614
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                557
            ],
            "operand": [
                677
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                557
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                557
            ],
            "update": [
                616
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                557
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
                557
            ],
            "calendarFieldMetadataId": [
                557
            ],
            "calendarLayout": [
                670
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                557
            ],
            "isCompact": [
                1
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                557
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                557
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                680
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
                389
            ],
            "type": [
                683
            ],
            "visibility": [
                684
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                557
            ],
            "update": [
                619
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                682
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
                557
            ],
            "update": [
                621
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
                557
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
                36
            ],
            "aiChatAssistantProfile": [
                31
            ],
            "aiChatDirectMessageAssistantMode": [
                29
            ],
            "aiChatInboxAssistantMode": [
                29
            ],
            "aiChatModelTier": [
                36
            ],
            "aiDataPolicy": [
                35
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
                557
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
                699
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
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                557
            ],
            "isVisible": [
                1
            ],
            "position": [
                8
            ],
            "viewFieldId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                628
            ],
            "id": [
                557
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
                628
            ],
            "groups": [
                629
            ],
            "widgetId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                410
            ],
            "roleId": [
                557
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
                557
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
                557
            ],
            "predicateGroups": [
                479
            ],
            "predicates": [
                481
            ],
            "roleId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                478
            ],
            "predicates": [
                477
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                639
            ],
            "viewFields": [
                636
            ],
            "viewFilterGroups": [
                637
            ],
            "viewFilters": [
                638
            ],
            "viewSorts": [
                640
            ],
            "widgetId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                28
            ],
            "fieldMetadataId": [
                557
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
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                557
            ],
            "logicalOperator": [
                676
            ],
            "parentViewFilterGroupId": [
                557
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
                557
            ],
            "id": [
                557
            ],
            "operand": [
                677
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                557
            ],
            "subFieldName": [
                4
            ],
            "value": [
                339
            ],
            "viewFilterGroupId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                557
            ],
            "calendarFieldMetadataId": [
                557
            ],
            "calendarLayout": [
                670
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                557
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                557
            ],
            "openRecordIn": [
                680
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                683
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                682
            ],
            "fieldMetadataId": [
                557
            ],
            "id": [
                557
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
                654
            ],
            "usageByApplication": [
                643
            ],
            "usageByModel": [
                643
            ],
            "usageByOperationType": [
                643
            ],
            "usageByUser": [
                643
            ],
            "userDailyUsage": [
                656
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                646
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
                109
            ],
            "createdAt": [
                223
            ],
            "id": [
                557
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                109
            ],
            "operationType": [
                646
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                653
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                655
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
                655
            ],
            "operationType": [
                646
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                645
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                649
            ],
            "resourceType": [
                653
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                647
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
                646
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                655
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                109
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
                646
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                653
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                655
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                109
            ],
            "id": [
                557
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                109
            ],
            "operationType": [
                646
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
                109
            ],
            "resourceType": [
                653
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
                655
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
                654
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
                100
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
                661
            ],
            "currentWorkspace": [
                693
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
                557
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
                417
            ],
            "previousOnboardingStatus": [
                417
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
                661
            ],
            "workspaceMember": [
                702
            ],
            "workspaceMembers": [
                702
            ],
            "workspaces": [
                661
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
                557
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
                557
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
                557
            ],
            "isImpersonating": [
                1
            ],
            "locale": [
                4
            ],
            "objectRecordsPermissions": [
                416
            ],
            "permissionFlags": [
                434
            ],
            "twoFactorAuthenticationMethodSummary": [
                553
            ],
            "updatedAt": [
                223
            ],
            "user": [
                657
            ],
            "userId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                557
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
                557
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
                557
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                557
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
                557
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
                94
            ],
            "workspaceUrls": [
                711
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
                557
            ],
            "calendarEndFieldMetadataId": [
                557
            ],
            "calendarFieldMetadataId": [
                557
            ],
            "calendarLayout": [
                670
            ],
            "createdAt": [
                223
            ],
            "createdByUserWorkspaceId": [
                557
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
                557
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
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                557
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                679
            ],
            "mainGroupByFieldMetadataId": [
                557
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                557
            ],
            "openRecordIn": [
                680
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
                683
            ],
            "universalIdentifier": [
                557
            ],
            "updatedAt": [
                223
            ],
            "viewFieldGroups": [
                673
            ],
            "viewFields": [
                672
            ],
            "viewFilterGroups": [
                675
            ],
            "viewFilters": [
                674
            ],
            "viewGroups": [
                678
            ],
            "viewSorts": [
                681
            ],
            "visibility": [
                684
            ],
            "workspaceId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                28
            ],
            "applicationId": [
                557
            ],
            "createdAt": [
                223
            ],
            "deletedAt": [
                223
            ],
            "fieldMetadataId": [
                557
            ],
            "id": [
                557
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
                557
            ],
            "updatedAt": [
                223
            ],
            "viewFieldGroupId": [
                557
            ],
            "viewId": [
                557
            ],
            "workspaceId": [
                557
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
                557
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
                672
            ],
            "viewId": [
                557
            ],
            "workspaceId": [
                557
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
                557
            ],
            "id": [
                557
            ],
            "operand": [
                677
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "relationTargetFieldMetadataId": [
                557
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
                557
            ],
            "viewId": [
                557
            ],
            "workspaceId": [
                557
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
                557
            ],
            "logicalOperator": [
                676
            ],
            "parentViewFilterGroupId": [
                557
            ],
            "positionInViewFilterGroup": [
                8
            ],
            "updatedAt": [
                223
            ],
            "viewId": [
                557
            ],
            "workspaceId": [
                557
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
                557
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
                557
            ],
            "workspaceId": [
                557
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
                682
            ],
            "fieldMetadataId": [
                557
            ],
            "id": [
                557
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                223
            ],
            "viewId": [
                557
            ],
            "workspaceId": [
                557
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
                557
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
                557
            ],
            "operations": [
                4
            ],
            "role": [
                474
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
                27
            ],
            "on_BarChartConfiguration": [
                103
            ],
            "on_CalendarConfiguration": [
                144
            ],
            "on_CallRecordingSummaryConfiguration": [
                145
            ],
            "on_CallRecordingTranscriptConfiguration": [
                146
            ],
            "on_ChatConfiguration": [
                154
            ],
            "on_ChatThreadsConfiguration": [
                157
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
                368
            ],
            "on_MessageCampaignDetailsConfiguration": [
                369
            ],
            "on_NotesConfiguration": [
                400
            ],
            "on_PieChartConfiguration": [
                435
            ],
            "on_RecordTableConfiguration": [
                464
            ],
            "on_StandaloneRichTextConfiguration": [
                521
            ],
            "on_TasksConfiguration": [
                532
            ],
            "on_TimelineConfiguration": [
                536
            ],
            "on_ViewConfiguration": [
                671
            ],
            "on_WorkflowConfiguration": [
                690
            ],
            "on_WorkflowRunConfiguration": [
                691
            ],
            "on_WorkflowVersionConfiguration": [
                692
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
                687
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                694
            ],
            "aiAdditionalInstructions": [
                4
            ],
            "aiAgentModelTier": [
                36
            ],
            "aiChatAssistantProfile": [
                30
            ],
            "aiChatDirectMessageAssistantMode": [
                29
            ],
            "aiChatInboxAssistantMode": [
                29
            ],
            "aiChatModelTier": [
                36
            ],
            "aiDataPolicy": [
                34
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
                111
            ],
            "billingEntitlements": [
                113
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
                474
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
                557
            ],
            "iframeMediaPermissions": [
                321
            ],
            "installedApplications": [
                54
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
                557
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
                672
            ],
            "viewFilterGroups": [
                675
            ],
            "viewFilters": [
                674
            ],
            "viewGroups": [
                678
            ],
            "viewSorts": [
                681
            ],
            "views": [
                669
            ],
            "workspaceCustomApplication": [
                54
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                699
            ],
            "workspaceMembersCount": [
                8
            ],
            "workspaceUrls": [
                711
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
                696
            ],
            "personEnrichment": [
                339
            ],
            "personOutcome": [
                709
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
                557
            ],
            "roleId": [
                557
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
                704
            ],
            "id": [
                557
            ],
            "locale": [
                4
            ],
            "name": [
                302
            ],
            "numberFormat": [
                705
            ],
            "openRecordIn": [
                420
            ],
            "roles": [
                474
            ],
            "timeFormat": [
                706
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
                557
            ],
            "userWorkspaceId": [
                557
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                557
            ],
            "variables": [
                658
            ],
            "workspaceMemberId": [
                557
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
                557
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
                557
            ],
            "workspaceUrls": [
                711
            ],
            "__typename": [
                4
            ]
        }
    }
}