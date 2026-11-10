export default {
    "scalars": [
        1,
        4,
        6,
        7,
        10,
        11,
        13,
        15,
        18,
        25,
        27,
        28,
        35,
        39,
        41,
        48,
        64,
        72,
        82,
        88,
        100,
        104,
        105,
        107,
        112,
        118,
        124,
        129,
        135,
        138,
        139,
        140,
        141,
        149,
        151,
        165,
        169,
        171,
        173,
        220,
        221,
        248,
        252,
        253,
        255,
        266,
        272,
        276,
        280,
        283,
        290,
        307,
        309,
        315,
        317,
        330,
        337,
        338,
        339,
        351,
        353,
        370,
        371,
        372,
        373,
        374,
        375,
        377,
        378,
        379,
        382,
        383,
        385,
        388,
        393,
        397,
        406,
        413,
        415,
        418,
        422,
        423,
        428,
        432,
        455,
        457,
        458,
        466,
        478,
        480,
        485,
        490,
        510,
        522,
        523,
        525,
        552,
        554,
        556,
        621,
        641,
        648,
        650,
        654,
        665,
        671,
        672,
        674,
        675,
        677,
        678,
        679,
        682,
        683,
        684,
        689,
        691,
        694,
        699,
        700,
        701,
        704,
        705
    ],
    "types": {
        "ActivateWorkspaceInput": {
            "displayName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "AddQuerySubscriptionInput": {
            "eventStreamId": [
                1
            ],
            "operationSignature": [
                337
            ],
            "queryId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Agent": {
            "applicationId": [
                552
            ],
            "avatarColor": [
                1
            ],
            "avatarShape": [
                1
            ],
            "createdAt": [
                221
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isCustom": [
                4
            ],
            "isSystem": [
                4
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                337
            ],
            "modelId": [
                1
            ],
            "name": [
                1
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                337
            ],
            "roleId": [
                552
            ],
            "triggers": [
                337
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "applicationId": [
                552
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isAccessible": [
                4
            ],
            "isCustom": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "roleIds": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "Float": {},
        "AgentChatChannelAssignmentFilter": {},
        "AgentChatChannelRole": {
            "canAccessAllAgentChatChannels": [
                4
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelSummary": {
            "assignedCount": [
                10
            ],
            "assignedToMeCount": [
                10
            ],
            "channelId": [
                552
            ],
            "doneCount": [
                10
            ],
            "hasUnreadAssignedToMe": [
                4
            ],
            "hasUnreadOpen": [
                4
            ],
            "mentionedCount": [
                10
            ],
            "needsInputCount": [
                10
            ],
            "openCount": [
                10
            ],
            "snoozedCount": [
                10
            ],
            "unassignedCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "AgentChatChannelThreadFilter": {},
        "AgentChatChannelThreadIds": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                4
            ],
            "threadIds": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                337
            ],
            "threadId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatInboxAction": {},
        "AgentChatOpenThreadsSummary": {
            "assignedThreadCount": [
                10
            ],
            "assignedToMeThreadCount": [
                10
            ],
            "hasUnreadAssignedThread": [
                4
            ],
            "hasUnreadMentionThread": [
                4
            ],
            "hasUnreadOpenThread": [
                4
            ],
            "mentionThreadCount": [
                10
            ],
            "needsInputThreadCount": [
                10
            ],
            "openThreadCount": [
                10
            ],
            "unassignedThreadCount": [
                10
            ],
            "unreadOpenThreadCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThread": {
            "contextWindowTokens": [
                10
            ],
            "conversationSize": [
                10
            ],
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "id": [
                18
            ],
            "isAssistantParticipant": [
                4
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                10
            ],
            "totalInputCredits": [
                6
            ],
            "totalInputTokens": [
                10
            ],
            "totalOutputCredits": [
                6
            ],
            "totalOutputTokens": [
                10
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                221
            ],
            "id": [
                552
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                221
            ],
            "lastReadAt": [
                221
            ],
            "mentionsResolvedAt": [
                221
            ],
            "snoozedUntil": [
                221
            ],
            "threadId": [
                552
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                552
            ],
            "createdAt": [
                221
            ],
            "id": [
                552
            ],
            "isBuiltInAssistant": [
                4
            ],
            "parts": [
                22
            ],
            "processedAt": [
                221
            ],
            "reactions": [
                23
            ],
            "role": [
                1
            ],
            "senderApplicationId": [
                552
            ],
            "senderUserWorkspaceId": [
                552
            ],
            "senderWorkspaceMemberId": [
                552
            ],
            "status": [
                1
            ],
            "threadId": [
                552
            ],
            "turnId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                221
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                552
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                552
            ],
            "messageId": [
                552
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                337
            ],
            "reasoningContent": [
                1
            ],
            "sourceDocumentFilename": [
                1
            ],
            "sourceDocumentMediaType": [
                1
            ],
            "sourceDocumentSourceId": [
                1
            ],
            "sourceDocumentTitle": [
                1
            ],
            "sourceUrlSourceId": [
                1
            ],
            "sourceUrlTitle": [
                1
            ],
            "sourceUrlUrl": [
                1
            ],
            "state": [
                1
            ],
            "textContent": [
                1
            ],
            "toolCallId": [
                1
            ],
            "toolInput": [
                337
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                337
            ],
            "type": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessageReactionSummary": {
            "agentIds": [
                552
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                221
            ],
            "creatorName": [
                1
            ],
            "creatorSource": [
                1
            ],
            "credits": [
                6
            ],
            "endedAt": [
                221
            ],
            "errorMessage": [
                1
            ],
            "id": [
                552
            ],
            "input": [
                1
            ],
            "inputTokens": [
                10
            ],
            "modelId": [
                1
            ],
            "outputTokens": [
                10
            ],
            "reply": [
                1
            ],
            "startedAt": [
                221
            ],
            "status": [
                25
            ],
            "threadId": [
                552
            ],
            "threadTitle": [
                1
            ],
            "toolNames": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentTurnStatus": {},
        "AggregateChartConfiguration": {
            "aggregateFieldMetadataId": [
                552
            ],
            "aggregateOperation": [
                27
            ],
            "configurationType": [
                682
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                337
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "label": [
                1
            ],
            "numberFormat": [
                151
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                450
            ],
            "suffix": [
                1
            ],
            "timezone": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AggregateOperations": {},
        "AiChatAssistantMode": {},
        "AiChatAssistantProfile": {
            "avatarColor": [
                1
            ],
            "avatarFace": [
                1
            ],
            "avatarShape": [
                1
            ],
            "displayName": [
                1
            ],
            "isAvatarAnimated": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AiChatAssistantProfileInput": {
            "avatarColor": [
                1
            ],
            "avatarFace": [
                1
            ],
            "avatarShape": [
                1
            ],
            "displayName": [
                1
            ],
            "isAvatarAnimated": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUsage": {
            "consumedValue": [
                107
            ],
            "kind": [
                1
            ],
            "limitValue": [
                107
            ],
            "periodEnd": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                107
            ],
            "limitValue": [
                107
            ],
            "periodEnd": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "AiDataPolicy": {
            "isProductImprovementDataSharingEnabled": [
                4
            ],
            "isZeroDataRetentionRequired": [
                4
            ],
            "requiredDataResidencyRegion": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AiDataPolicyInput": {
            "isProductImprovementDataSharingEnabled": [
                4
            ],
            "isZeroDataRetentionRequired": [
                4
            ],
            "requiredDataResidencyRegion": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AiModelTier": {},
        "AiRunUsage": {
            "inputTokens": [
                10
            ],
            "outputTokens": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                10
            ],
            "sections": [
                38
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptSection": {
            "content": [
                1
            ],
            "estimatedTokenCount": [
                10
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AllMetadataName": {},
        "Analytics": {
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AnalyticsType": {},
        "ApiConfig": {
            "mutationMaximumAffectedRecords": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ApiKey": {
            "createdAt": [
                221
            ],
            "expiresAt": [
                221
            ],
            "id": [
                552
            ],
            "name": [
                1
            ],
            "revokedAt": [
                221
            ],
            "role": [
                472
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                221
            ],
            "id": [
                552
            ],
            "name": [
                1
            ],
            "revokedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyToken": {
            "token": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AppConnection": {
            "accessToken": [
                1
            ],
            "authFailedAt": [
                1
            ],
            "authFailedReason": [
                1
            ],
            "externalAccountId": [
                1
            ],
            "handle": [
                1
            ],
            "id": [
                18
            ],
            "name": [
                1
            ],
            "providerName": [
                1
            ],
            "providerType": [
                1
            ],
            "scope": [
                169
            ],
            "scopes": [
                1
            ],
            "userWorkspaceId": [
                1
            ],
            "visibility": [
                1
            ],
            "workspaceMemberId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValue": {
            "key": [
                1
            ],
            "scope": [
                48
            ],
            "value": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                552
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageFolderInput": {
            "externalId": [
                1
            ],
            "isSynced": [
                4
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageInput": {
            "attachments": [
                49
            ],
            "externalId": [
                1
            ],
            "folderExternalIds": [
                1
            ],
            "participants": [
                52
            ],
            "receivedAt": [
                221
            ],
            "subject": [
                1
            ],
            "text": [
                1
            ],
            "threadExternalId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageParticipantInput": {
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "personId": [
                552
            ],
            "role": [
                379
            ],
            "workspaceMemberId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "Application": {
            "agents": [
                3
            ],
            "applicationRegistration": [
                84
            ],
            "applicationRegistrationId": [
                552
            ],
            "applicationVariables": [
                87
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                337
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                164
            ],
            "content": [
                59
            ],
            "createdAt": [
                221
            ],
            "defaultLogicFunctionRole": [
                472
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                297
            ],
            "grantedIframeMediaPermissions": [
                319
            ],
            "healthCheckLogicFunctionId": [
                552
            ],
            "id": [
                552
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                350
            ],
            "logoFileId": [
                552
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                399
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                552
            ],
            "requestedIframeMediaPermissions": [
                319
            ],
            "runOnUserPreferences": [
                4
            ],
            "settingsCustomTabFrontComponentId": [
                552
            ],
            "settingsMenuItems": [
                509
            ],
            "universalIdentifier": [
                1
            ],
            "version": [
                1
            ],
            "yarnLockChecksum": [
                1
            ],
            "yarnLockFileId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                552
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                221
            ],
            "id": [
                552
            ],
            "lastAuthorizedAt": [
                221
            ],
            "lastUsedAt": [
                221
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationCapabilityGrant": {
            "grantedCapabilities": [
                1
            ],
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                552
            ],
            "archivedAt": [
                221
            ],
            "authFailedAt": [
                221
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                446
            ],
            "connectionProviderId": [
                552
            ],
            "createdAt": [
                221
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                552
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                221
            ],
            "lastSignedInAt": [
                221
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                169
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                221
            ],
            "userWorkspaceId": [
                552
            ],
            "visibility": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectionProvider": {
            "applicationId": [
                1
            ],
            "displayName": [
                1
            ],
            "id": [
                552
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                58
            ],
            "scope": [
                173
            ],
            "type": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectionProviderOAuthConfig": {
            "isClientCredentialsConfigured": [
                4
            ],
            "scopes": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationContent": {
            "agents": [
                60
            ],
            "commandMenuItems": [
                60
            ],
            "connectionProviders": [
                60
            ],
            "fields": [
                60
            ],
            "frontComponents": [
                60
            ],
            "indexes": [
                60
            ],
            "logicFunctions": [
                60
            ],
            "navigationMenuItems": [
                60
            ],
            "objects": [
                60
            ],
            "pageLayoutTabs": [
                60
            ],
            "pageLayouts": [
                60
            ],
            "permissionFlags": [
                60
            ],
            "publicAssets": [
                60
            ],
            "roles": [
                60
            ],
            "skills": [
                60
            ],
            "translations": [
                60
            ],
            "viewFields": [
                60
            ],
            "views": [
                60
            ],
            "workflows": [
                60
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationContentItem": {
            "color": [
                1
            ],
            "count": [
                10
            ],
            "description": [
                1
            ],
            "fieldUniversalIdentifier": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                1
            ],
            "label": [
                1
            ],
            "objectUniversalIdentifier": [
                1
            ],
            "parentLabel": [
                1
            ],
            "parentUniversalIdentifier": [
                1
            ],
            "position": [
                6
            ],
            "tag": [
                1
            ],
            "timeoutSeconds": [
                10
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationExport": {
            "application": [
                62
            ],
            "coverage": [
                63
            ],
            "files": [
                65
            ],
            "manifest": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationExportApplication": {
            "displayName": [
                1
            ],
            "sourceType": [
                82
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationExportCoverageEntry": {
            "metadataName": [
                1
            ],
            "reason": [
                1
            ],
            "status": [
                64
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationExportCoverageStatus": {},
        "ApplicationExportFile": {
            "content": [
                1
            ],
            "folder": [
                1
            ],
            "path": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationFileCompletionError": {
            "fileId": [
                552
            ],
            "message": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationFileUploadError": {
            "fileFolder": [
                290
            ],
            "filePath": [
                1
            ],
            "message": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationFileUploadRequestInput": {
            "fileFolder": [
                290
            ],
            "filePath": [
                1
            ],
            "size": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationFileUploadTarget": {
            "contentType": [
                1
            ],
            "expiresAt": [
                221
            ],
            "fileFolder": [
                290
            ],
            "fileId": [
                552
            ],
            "filePath": [
                1
            ],
            "uploadUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationHealthCheckAction": {
            "label": [
                1
            ],
            "location": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationHealthCheckResult": {
            "action": [
                70
            ],
            "description": [
                1
            ],
            "status": [
                72
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationHealthStatus": {},
        "ApplicationMonitoring": {
            "activity": [
                74
            ],
            "bucketSizeInSeconds": [
                10
            ],
            "creditUsage": [
                75
            ],
            "creditsUsed": [
                6
            ],
            "failedRunCount": [
                10
            ],
            "functions": [
                76
            ],
            "issues": [
                77
            ],
            "lifecycle": [
                78
            ],
            "lifecycleFailureCount": [
                10
            ],
            "lookbackInHours": [
                10
            ],
            "periodEnd": [
                221
            ],
            "periodStart": [
                221
            ],
            "rateLimitEventCount": [
                10
            ],
            "runCount": [
                10
            ],
            "versions": [
                79
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                221
            ],
            "errorCount": [
                10
            ],
            "rateLimitedJobCount": [
                10
            ],
            "rateLimitedRequestCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringCreditBucket": {
            "bucketStart": [
                221
            ],
            "creditsUsed": [
                6
            ],
            "operationLabel": [
                1
            ],
            "operationType": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringFunction": {
            "failedRunCount": [
                10
            ],
            "logicFunctionName": [
                1
            ],
            "p95DurationMs": [
                6
            ],
            "runCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringIssue": {
            "affectedInstallCount": [
                10
            ],
            "errorCode": [
                1
            ],
            "eventCount": [
                10
            ],
            "lastSeenAt": [
                221
            ],
            "level": [
                1
            ],
            "logicFunctionName": [
                1
            ],
            "source": [
                1
            ],
            "versions": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringLifecycleBucket": {
            "bucketStart": [
                221
            ],
            "failedCount": [
                10
            ],
            "installCount": [
                10
            ],
            "uninstallCount": [
                10
            ],
            "upgradeCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringVersion": {
            "activeInstallCount": [
                10
            ],
            "failedRunCount": [
                10
            ],
            "runCount": [
                10
            ],
            "version": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationPreferences": {
            "applicationId": [
                552
            ],
            "connectionProviders": [
                57
            ],
            "hasUserHealthCheck": [
                4
            ],
            "settingsMenuItems": [
                509
            ],
            "variables": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                221
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                552
            ],
            "isConfigured": [
                4
            ],
            "isListed": [
                4
            ],
            "isPreInstalled": [
                4
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oAuthClientId": [
                1
            ],
            "oAuthRedirectUris": [
                1
            ],
            "oAuthScopes": [
                1
            ],
            "ownerWorkspaceId": [
                552
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                82
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSourceType": {},
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                10
            ],
            "autoUpdateEnabled": [
                10
            ],
            "creditsUsedBreakdown": [
                218
            ],
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                10
            ],
            "totalCreditsUsed": [
                6
            ],
            "versionDistribution": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                552
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                82
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                221
            ],
            "description": [
                1
            ],
            "id": [
                552
            ],
            "isDeprecated": [
                4
            ],
            "isFilled": [
                4
            ],
            "isRequired": [
                4
            ],
            "isSecret": [
                4
            ],
            "key": [
                1
            ],
            "options": [
                337
            ],
            "type": [
                1
            ],
            "updatedAt": [
                221
            ],
            "value": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationTokenPair": {
            "applicationAccessToken": [
                92
            ],
            "applicationRefreshToken": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationVariable": {
            "description": [
                1
            ],
            "id": [
                552
            ],
            "isDeprecated": [
                4
            ],
            "isRequired": [
                4
            ],
            "isSecret": [
                4
            ],
            "key": [
                1
            ],
            "label": [
                1
            ],
            "options": [
                337
            ],
            "scope": [
                88
            ],
            "type": [
                1
            ],
            "value": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationVariableScope": {},
        "ApprovedAccessDomain": {
            "createdAt": [
                221
            ],
            "domain": [
                1
            ],
            "id": [
                552
            ],
            "isValidated": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AuthBypassProviders": {
            "google": [
                4
            ],
            "microsoft": [
                4
            ],
            "password": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AuthProviders": {
            "google": [
                4
            ],
            "magicLink": [
                4
            ],
            "microsoft": [
                4
            ],
            "password": [
                4
            ],
            "sso": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                221
            ],
            "token": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokenPair": {
            "accessOrWorkspaceAgnosticToken": [
                92
            ],
            "refreshToken": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "AuthorizeApp": {
            "redirectUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AutocompleteResult": {
            "placeId": [
                1
            ],
            "text": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspace": {
            "displayName": [
                1
            ],
            "id": [
                552
            ],
            "inviteHash": [
                1
            ],
            "loginToken": [
                1
            ],
            "logo": [
                1
            ],
            "personalInviteToken": [
                1
            ],
            "sso": [
                488
            ],
            "workspaceUrls": [
                706
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                97
            ],
            "availableWorkspacesForSignUp": [
                97
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                98
            ],
            "tokens": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                552
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                100
            ],
            "color": [
                1
            ],
            "configurationType": [
                682
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "displayLegend": [
                4
            ],
            "filter": [
                337
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupMode": [
                104
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                105
            ],
            "numberFormat": [
                151
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                413
            ],
            "primaryAxisGroupByFieldMetadataId": [
                552
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                315
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                413
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                552
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                315
            ],
            "splitMultiValueFields": [
                4
            ],
            "timezone": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BarChartData": {
            "data": [
                337
            ],
            "formattedToRawLookup": [
                337
            ],
            "groupMode": [
                104
            ],
            "hasTooManyGroups": [
                4
            ],
            "indexBy": [
                1
            ],
            "keys": [
                1
            ],
            "layout": [
                105
            ],
            "series": [
                106
            ],
            "showDataLabels": [
                4
            ],
            "showLegend": [
                4
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BarChartDataInput": {
            "configuration": [
                337
            ],
            "objectMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "BarChartSeries": {
            "key": [
                1
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BigInt": {},
        "Billing": {
            "billingUrl": [
                1
            ],
            "isBillingEnabled": [
                4
            ],
            "stripePublishableKey": [
                1
            ],
            "trialPeriods": [
                133
            ],
            "__typename": [
                1
            ]
        },
        "BillingCustomer": {
            "hasPaymentMethod": [
                4
            ],
            "id": [
                552
            ],
            "userCreditsFallback": [
                654
            ],
            "__typename": [
                1
            ]
        },
        "BillingEndTrialPeriod": {
            "billingPortalUrl": [
                1
            ],
            "billingSubscriptions": [
                128
            ],
            "currentBillingSubscription": [
                128
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                523
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                112
            ],
            "value": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlementKey": {},
        "BillingLicensedProduct": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                125
            ],
            "name": [
                1
            ],
            "prices": [
                119
            ],
            "__typename": [
                1
            ]
        },
        "BillingMeteredProduct": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                125
            ],
            "name": [
                1
            ],
            "prices": [
                120
            ],
            "__typename": [
                1
            ]
        },
        "BillingPartnerCode": {
            "isEditable": [
                4
            ],
            "partnerCode": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingPaymentIntent": {
            "clientSecret": [
                1
            ],
            "paymentIntentType": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlan": {
            "baseProducts": [
                113
            ],
            "downgradePlanKeys": [
                118
            ],
            "isCheckoutDefault": [
                4
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                114
            ],
            "planKey": [
                118
            ],
            "resourceCreditProducts": [
                113
            ],
            "upgradePlanKeys": [
                118
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingPriceLicensed": {
            "creditAmount": [
                6
            ],
            "isSellable": [
                4
            ],
            "priceUsageType": [
                135
            ],
            "recurringInterval": [
                522
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "priceUsageType": [
                135
            ],
            "recurringInterval": [
                522
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                121
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceTier": {
            "flatAmount": [
                6
            ],
            "unitAmount": [
                6
            ],
            "upTo": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingProduct": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                125
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductDTO": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                125
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                113
            ],
            "on_BillingMeteredProduct": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductKey": {},
        "BillingProductMetadata": {
            "isLegacy": [
                1
            ],
            "planKey": [
                118
            ],
            "priceUsageBased": [
                135
            ],
            "productKey": [
                124
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                221
            ],
            "periodStart": [
                221
            ],
            "productKey": [
                124
            ],
            "unitPriceCents": [
                6
            ],
            "userCreditsUsed": [
                6
            ],
            "workspaceCreditsExtraGranted": [
                6
            ],
            "workspaceCreditsGranted": [
                6
            ],
            "workspaceCreditsGrantedForSeats": [
                6
            ],
            "workspaceCreditsSeats": [
                10
            ],
            "workspaceCreditsTotalGranted": [
                6
            ],
            "workspaceCreditsUsed": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingSession": {
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscription": {
            "billingSubscriptionItems": [
                130
            ],
            "cancelAt": [
                221
            ],
            "collectionMethod": [
                129
            ],
            "currentPeriodEnd": [
                221
            ],
            "hasUserCredits": [
                4
            ],
            "id": [
                552
            ],
            "interval": [
                522
            ],
            "metadata": [
                337
            ],
            "phases": [
                131
            ],
            "status": [
                523
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                123
            ],
            "creditAmount": [
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                552
            ],
            "quantity": [
                6
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                6
            ],
            "items": [
                132
            ],
            "start_date": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhaseItem": {
            "price": [
                1
            ],
            "quantity": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                6
            ],
            "isCreditCardRequired": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "BillingUpdate": {
            "billingSubscriptions": [
                128
            ],
            "currentBillingSubscription": [
                128
            ],
            "__typename": [
                1
            ]
        },
        "BillingUsageType": {},
        "BooleanFieldComparison": {
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CalendarChannel": {
            "connectedAccountId": [
                552
            ],
            "contactAutoCreationPolicy": [
                138
            ],
            "createdAt": [
                221
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                552
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                139
            ],
            "syncStageStartedAt": [
                221
            ],
            "syncStatus": [
                140
            ],
            "syncedAt": [
                221
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                221
            ],
            "visibility": [
                141
            ],
            "__typename": [
                1
            ]
        },
        "CalendarChannelContactAutoCreationPolicy": {},
        "CalendarChannelSyncStage": {},
        "CalendarChannelSyncStatus": {},
        "CalendarChannelVisibility": {},
        "CalendarConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "CampaignAudiencePreviewDTO": {
            "duplicateEmails": [
                10
            ],
            "globallyUnsubscribed": [
                10
            ],
            "hardSuppressed": [
                10
            ],
            "sendable": [
                10
            ],
            "topicUnsubscribed": [
                10
            ],
            "totalMembers": [
                10
            ],
            "trackingRefused": [
                10
            ],
            "withoutEmail": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "CancelMessageCampaignInput": {
            "campaignId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CancelMessageCampaignOutputDTO": {
            "campaignId": [
                1
            ],
            "canceledMessageCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "Captcha": {
            "provider": [
                149
            ],
            "siteKey": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CaptchaDriverType": {},
        "ChannelSyncSuccess": {
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ChartNumberFormat": {},
        "ChatConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                337
            ],
            "error": [
                154
            ],
            "maxSeq": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamError": {
            "code": [
                1
            ],
            "message": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ChatThreadsConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                6
            ],
            "exists": [
                4
            ],
            "isEmailVerified": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ClaimableApplicationRegistration": {
            "author": [
                1
            ],
            "description": [
                1
            ],
            "id": [
                1
            ],
            "isOwned": [
                4
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ClientAiEvaluationModelConfig": {
            "description": [
                1
            ],
            "inputCostPerMillionTokens": [
                6
            ],
            "isAvailable": [
                4
            ],
            "isDeprecated": [
                4
            ],
            "label": [
                1
            ],
            "maxCriteriaPerQuestion": [
                6
            ],
            "maxScoreLevels": [
                6
            ],
            "medianLatencyMs": [
                6
            ],
            "modelId": [
                1
            ],
            "outputCostPerMillionTokens": [
                6
            ],
            "providerLabel": [
                1
            ],
            "supportedQuestionTypes": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ClientAiModelConfig": {
            "contextWindowTokens": [
                6
            ],
            "costPerTask": [
                6
            ],
            "dataResidency": [
                1
            ],
            "effort": [
                1
            ],
            "efforts": [
                1
            ],
            "inputCostPerMillionTokens": [
                6
            ],
            "intelligenceIndex": [
                6
            ],
            "isBenchmarkInherited": [
                4
            ],
            "isDeprecated": [
                4
            ],
            "label": [
                1
            ],
            "maxOutputTokens": [
                6
            ],
            "modelFamily": [
                393
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                395
            ],
            "outputCostPerMillionTokens": [
                6
            ],
            "outputTokensPerSecond": [
                6
            ],
            "providerLabel": [
                1
            ],
            "providerName": [
                1
            ],
            "sdkPackage": [
                1
            ],
            "zeroDataRetention": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ClientAiModelTierConfig": {
            "isZeroDataRetentionRequired": [
                4
            ],
            "modelId": [
                1
            ],
            "requiredDataResidencyRegion": [
                1
            ],
            "tier": [
                35
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                158
            ],
            "aiModelTiers": [
                160
            ],
            "aiModels": [
                159
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                42
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                91
            ],
            "billing": [
                108
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                148
            ],
            "defaultSubdomain": [
                1
            ],
            "enterpriseInstanceType": [
                1
            ],
            "frontDomain": [
                1
            ],
            "isAttachmentPreviewEnabled": [
                4
            ],
            "isBookCallOnboardingStepEnabled": [
                4
            ],
            "isClickHouseConfigured": [
                4
            ],
            "isCloudflareIntegrationEnabled": [
                4
            ],
            "isCompanyEnrichmentEnabled": [
                4
            ],
            "isConfigVariablesInDbEnabled": [
                4
            ],
            "isCookieSessionEnabled": [
                4
            ],
            "isEmailVerificationRequired": [
                4
            ],
            "isEmailingDomainInDemoMode": [
                4
            ],
            "isGoogleCalendarEnabled": [
                4
            ],
            "isGoogleMessagingEnabled": [
                4
            ],
            "isImapSmtpCaldavEnabled": [
                4
            ],
            "isMicrosoftCalendarEnabled": [
                4
            ],
            "isMicrosoftMessagingEnabled": [
                4
            ],
            "isMultiWorkspaceEnabled": [
                4
            ],
            "isOnboardingAiChatEnabled": [
                4
            ],
            "isWorkspaceSchemaDDLLocked": [
                4
            ],
            "maintenance": [
                162
            ],
            "publicFeatureFlags": [
                444
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                507
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                524
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                221
            ],
            "link": [
                1
            ],
            "startAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                39
            ],
            "hash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItem": {
            "applicationId": [
                552
            ],
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                552
            ],
            "availabilityType": [
                165
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                552
            ],
            "createdAt": [
                221
            ],
            "engineComponentKey": [
                255
            ],
            "frontComponent": [
                297
            ],
            "frontComponentId": [
                552
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "navigationTargetObjectMetadataId": [
                552
            ],
            "pageLayoutId": [
                552
            ],
            "payload": [
                166
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "workflowVersionId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                405
            ],
            "on_PathCommandMenuItemPayload": [
                430
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                66
            ],
            "files": [
                288
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                552
            ],
            "archivedAt": [
                221
            ],
            "authFailedAt": [
                221
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                446
            ],
            "connectionProviderId": [
                552
            ],
            "createdAt": [
                221
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                552
            ],
            "lastCredentialsRefreshedAt": [
                221
            ],
            "lastSignedInAt": [
                221
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                169
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                221
            ],
            "userWorkspaceId": [
                552
            ],
            "visibility": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountScope": {},
        "ConnectedImapSmtpCaldavAccount": {
            "connectionParameters": [
                322
            ],
            "handle": [
                1
            ],
            "id": [
                552
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                248
            ],
            "host": [
                1
            ],
            "password": [
                1
            ],
            "port": [
                6
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionProviderScope": {},
        "CreateAgentChatChannelInput": {
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "name": [
                1
            ],
            "roleIds": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateAgentInput": {
            "avatarColor": [
                1
            ],
            "avatarShape": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                337
            ],
            "modelId": [
                1
            ],
            "name": [
                1
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                337
            ],
            "roleId": [
                552
            ],
            "triggers": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "CreateApiKeyInput": {
            "expiresAt": [
                1
            ],
            "name": [
                1
            ],
            "revokedAt": [
                1
            ],
            "roleId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                552
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                552
            ],
            "participantHandleFieldUniversalIdentifier": [
                552
            ],
            "visibility": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                67
            ],
            "targets": [
                69
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                81
            ],
            "clientSecret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistrationInput": {
            "name": [
                1
            ],
            "oAuthRedirectUris": [
                1
            ],
            "oAuthScopes": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateApprovedAccessDomainInput": {
            "domain": [
                1
            ],
            "email": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateCalendarEventInput": {
            "addConferencing": [
                4
            ],
            "attendees": [
                1
            ],
            "connectedAccountId": [
                1
            ],
            "description": [
                1
            ],
            "endsAt": [
                1
            ],
            "isFullDay": [
                4
            ],
            "location": [
                1
            ],
            "sendInvitations": [
                4
            ],
            "startsAt": [
                1
            ],
            "timeZone": [
                1
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateCalendarEventOutput": {
            "calendarEventId": [
                1
            ],
            "conferenceLink": [
                1
            ],
            "error": [
                1
            ],
            "iCalUid": [
                1
            ],
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CreateCommandMenuItemInput": {
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                552
            ],
            "availabilityType": [
                165
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                552
            ],
            "engineComponentKey": [
                255
            ],
            "frontComponentId": [
                552
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "navigationTargetObjectMetadataId": [
                552
            ],
            "pageLayoutId": [
                552
            ],
            "payload": [
                337
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailGroupChannelInput": {
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailGroupChannelOutput": {
            "forwardingAddress": [
                1
            ],
            "messageChannel": [
                369
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailingDomainInput": {
            "domain": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "defaultValue": [
                337
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                4
            ],
            "isAuditLogged": [
                4
            ],
            "isLabelSyncedWithName": [
                4
            ],
            "isNullable": [
                4
            ],
            "isRemoteCreation": [
                4
            ],
            "isSearchable": [
                4
            ],
            "isSystem": [
                4
            ],
            "isUIEditable": [
                4
            ],
            "isUIReadOnly": [
                4
            ],
            "isUnique": [
                4
            ],
            "label": [
                1
            ],
            "morphRelationsCreationPayload": [
                337
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "options": [
                337
            ],
            "relationCreationPayload": [
                337
            ],
            "settings": [
                337
            ],
            "type": [
                283
            ],
            "__typename": [
                1
            ]
        },
        "CreateFrontComponentInput": {
            "builtComponentChecksum": [
                1
            ],
            "builtComponentPath": [
                1
            ],
            "componentName": [
                1
            ],
            "description": [
                1
            ],
            "id": [
                552
            ],
            "name": [
                1
            ],
            "sourceComponentPath": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateIndexFieldInput": {
            "fieldMetadataId": [
                552
            ],
            "subFieldName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateIndexInput": {
            "fields": [
                190
            ],
            "indexType": [
                330
            ],
            "objectMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                337
            ],
            "databaseEventTriggerSettings": [
                337
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                337
            ],
            "id": [
                552
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                337
            ],
            "source": [
                337
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                337
            ],
            "universalIdentifier": [
                552
            ],
            "workflowActionTriggerSettings": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                552
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateMessageSuppressionInput": {
            "emailAddress": [
                1
            ],
            "unsubscribeTopicId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                552
            ],
            "agentId": [
                552
            ],
            "color": [
                1
            ],
            "folderId": [
                552
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "nativePageKey": [
                1
            ],
            "pageLayoutId": [
                552
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                552
            ],
            "targetRecordId": [
                552
            ],
            "type": [
                397
            ],
            "userWorkspaceId": [
                552
            ],
            "viewId": [
                552
            ],
            "workflowId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateObjectInput": {
            "color": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isLabelSyncedWithName": [
                4
            ],
            "isRemote": [
                4
            ],
            "labelPlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "nameSingular": [
                1
            ],
            "primaryKeyColumnType": [
                1
            ],
            "primaryKeyFieldMetadataSettings": [
                337
            ],
            "shortcut": [
                1
            ],
            "skipNameField": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneFieldMetadataInput": {
            "field": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                191
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                196
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutInput": {
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "type": [
                423
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                422
            ],
            "pageLayoutId": [
                552
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutWidgetInput": {
            "configuration": [
                337
            ],
            "objectMetadataId": [
                552
            ],
            "pageLayoutTabId": [
                552
            ],
            "position": [
                337
            ],
            "title": [
                1
            ],
            "type": [
                683
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                552
            ],
            "filter": [
                337
            ],
            "objectMetadataId": [
                552
            ],
            "orderBy": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                552
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                552
            ],
            "secondFieldMetadataId": [
                552
            ],
            "thirdFieldMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateRoleInput": {
            "canAccessAllAgentChatChannels": [
                4
            ],
            "canAccessAllTools": [
                4
            ],
            "canBeAssignedToAgents": [
                4
            ],
            "canBeAssignedToApiKeys": [
                4
            ],
            "canBeAssignedToUsers": [
                4
            ],
            "canDestroyAllObjectRecords": [
                4
            ],
            "canReadAllObjectRecords": [
                4
            ],
            "canSoftDeleteAllObjectRecords": [
                4
            ],
            "canUpdateAllObjectRecords": [
                4
            ],
            "canUpdateAllSettings": [
                4
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                1
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateSkillInput": {
            "content": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateUnsubscribeTopicInput": {
            "description": [
                1
            ],
            "name": [
                1
            ],
            "visibility": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                107
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                107
            ],
            "operationType": [
                641
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                648
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                650
            ],
            "__typename": [
                1
            ]
        },
        "CreateValidationRuleInput": {
            "description": [
                1
            ],
            "errorFieldMetadataId": [
                552
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                4
            ],
            "message": [
                1
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                552
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "viewId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                27
            ],
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "size": [
                6
            ],
            "viewFieldGroupId": [
                552
            ],
            "viewId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                552
            ],
            "logicalOperator": [
                671
            ],
            "parentViewFilterGroupId": [
                552
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "operand": [
                672
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                552
            ],
            "subFieldName": [
                1
            ],
            "value": [
                337
            ],
            "viewFilterGroupId": [
                552
            ],
            "viewId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewGroupInput": {
            "fieldValue": [
                1
            ],
            "id": [
                552
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewInput": {
            "anyFieldFilterValue": [
                1
            ],
            "calendarEndFieldMetadataId": [
                552
            ],
            "calendarFieldMetadataId": [
                552
            ],
            "calendarLayout": [
                665
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                552
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                674
            ],
            "mainGroupByFieldMetadataId": [
                552
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "openRecordIn": [
                675
            ],
            "position": [
                6
            ],
            "shouldDisplayGroupsAsTabs": [
                4
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                678
            ],
            "visibility": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                677
            ],
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "CreateWebhookInput": {
            "description": [
                1
            ],
            "id": [
                552
            ],
            "operations": [
                1
            ],
            "roleId": [
                552
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreditUsedItem": {
            "creditsUsed": [
                6
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "operation": [
                641
            ],
            "resource": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                171
            ],
            "before": [
                171
            ],
            "first": [
                10
            ],
            "last": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "DatabaseEventAction": {},
        "DateTime": {},
        "DeleteApprovedAccessDomainInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteTwoFactorAuthenticationMethod": {
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldGroupInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DeletedWorkspaceMember": {
            "avatarUrl": [
                1
            ],
            "id": [
                552
            ],
            "name": [
                300
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "DevelopmentApplication": {
            "id": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DomainRecord": {
            "key": [
                1
            ],
            "status": [
                1
            ],
            "type": [
                1
            ],
            "validationType": [
                1
            ],
            "value": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DomainValidRecords": {
            "domain": [
                1
            ],
            "id": [
                552
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                241
            ],
            "__typename": [
                1
            ]
        },
        "DuplicatedDashboard": {
            "createdAt": [
                1
            ],
            "id": [
                552
            ],
            "pageLayoutId": [
                552
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "updatedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DuplicatedMessageList": {
            "createdAt": [
                1
            ],
            "description": [
                1
            ],
            "id": [
                552
            ],
            "memberCount": [
                6
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "updatedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EditSso": {
            "id": [
                552
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                490
            ],
            "type": [
                317
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                552
            ],
            "status": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                172
            ],
            "IMAP": [
                172
            ],
            "SMTP": [
                172
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EmailConnectionSecurity": {},
        "EmailPasswordResetLink": {
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                221
            ],
            "domain": [
                1
            ],
            "id": [
                552
            ],
            "status": [
                252
            ],
            "tenantStatus": [
                253
            ],
            "unsubscribeHostnameStatus": [
                554
            ],
            "updatedAt": [
                221
            ],
            "verificationRecords": [
                660
            ],
            "verifiedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "EngineComponentKey": {},
        "EnqueueJobInput": {
            "delayMs": [
                10
            ],
            "jobId": [
                1
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payload": [
                337
            ],
            "retryLimit": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobItemInput": {
            "jobId": [
                1
            ],
            "payload": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobResult": {
            "enqueued": [
                4
            ],
            "jobId": [
                1
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobsInput": {
            "delayMs": [
                10
            ],
            "jobs": [
                257
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                337
            ],
            "retryLimit": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobsResult": {
            "availableBytes": [
                6
            ],
            "enqueued": [
                4
            ],
            "enqueuedJobsCount": [
                10
            ],
            "jobIds": [
                1
            ],
            "jobs": [
                261
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EnqueuedJob": {
            "jobId": [
                1
            ],
            "sizeBytes": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "EnterpriseLicenseInfoDTO": {
            "expiresAt": [
                221
            ],
            "isValid": [
                4
            ],
            "licensee": [
                1
            ],
            "subscriptionId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EnterpriseSubscriptionStatusDTO": {
            "cancelAt": [
                221
            ],
            "currentPeriodEnd": [
                221
            ],
            "expiresAt": [
                221
            ],
            "isCancellationScheduled": [
                4
            ],
            "licensee": [
                1
            ],
            "status": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogDateRangeInput": {
            "end": [
                221
            ],
            "start": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "EventLogFieldFilterInput": {
            "field": [
                1
            ],
            "operand": [
                266
            ],
            "values": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogFilterOperand": {},
        "EventLogFiltersInput": {
            "dateRange": [
                264
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                265
            ],
            "objectMetadataId": [
                1
            ],
            "recordId": [
                1
            ],
            "userWorkspaceId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogPageInfo": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryInput": {
            "after": [
                1
            ],
            "filters": [
                267
            ],
            "first": [
                10
            ],
            "table": [
                272
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                268
            ],
            "records": [
                271
            ],
            "totalCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "EventLogRecord": {
            "event": [
                1
            ],
            "isCustom": [
                4
            ],
            "objectMetadataId": [
                1
            ],
            "properties": [
                337
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                221
            ],
            "userId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogTable": {},
        "EventSubscription": {
            "eventStreamId": [
                1
            ],
            "metadataEvents": [
                384
            ],
            "objectRecordEventsWithQueryIds": [
                412
            ],
            "queueJobEvents": [
                340
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                552
            ],
            "payload": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                276
            ],
            "value": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagKey": {},
        "Field": {
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "defaultValue": [
                337
            ],
            "description": [
                1
            ],
            "disabledFieldPermissionActions": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isAuditLogged": [
                4
            ],
            "isLabelSyncedWithName": [
                4
            ],
            "isNullable": [
                4
            ],
            "isSearchable": [
                4
            ],
            "isSystem": [
                4
            ],
            "isSystemSideEffect": [
                4
            ],
            "isUIEditable": [
                4
            ],
            "isUIReadOnly": [
                4
            ],
            "isUnique": [
                4
            ],
            "label": [
                1
            ],
            "morphId": [
                552
            ],
            "morphRelations": [
                465
            ],
            "name": [
                1
            ],
            "object": [
                399
            ],
            "objectMetadataId": [
                552
            ],
            "options": [
                337
            ],
            "relation": [
                465
            ],
            "settings": [
                337
            ],
            "type": [
                283
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                682
            ],
            "fieldDisplayMode": [
                280
            ],
            "fieldMetadataId": [
                1
            ],
            "isUIEditable": [
                4
            ],
            "nestedRelationFieldMetadataId": [
                1
            ],
            "viewId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "edges": [
                281
            ],
            "pageInfo": [
                419
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                171
            ],
            "node": [
                277
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                282
            ],
            "id": [
                553
            ],
            "isActive": [
                136
            ],
            "isSystem": [
                136
            ],
            "isUIEditable": [
                136
            ],
            "isUIReadOnly": [
                136
            ],
            "objectMetadataId": [
                553
            ],
            "or": [
                282
            ],
            "__typename": [
                1
            ]
        },
        "FieldMetadataType": {},
        "FieldPermission": {
            "canReadFieldValue": [
                4
            ],
            "canUpdateFieldValue": [
                4
            ],
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "objectMetadataId": [
                552
            ],
            "roleId": [
                552
            ],
            "rowLevelPermissionPredicateGroupId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "FieldPermissionInput": {
            "canReadFieldValue": [
                4
            ],
            "canUpdateFieldValue": [
                4
            ],
            "fieldMetadataId": [
                552
            ],
            "objectMetadataId": [
                552
            ],
            "rowLevelPermissionPredicateGroupId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                682
            ],
            "newFieldDefaultVisibility": [
                4
            ],
            "shouldAllowUserToSeeHiddenFields": [
                4
            ],
            "viewId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "File": {
            "createdAt": [
                221
            ],
            "id": [
                552
            ],
            "path": [
                1
            ],
            "size": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "FileAttachmentInput": {
            "filename": [
                1
            ],
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "FileFolder": {},
        "FileUploadTarget": {
            "contentType": [
                1
            ],
            "expiresAt": [
                221
            ],
            "fileId": [
                552
            ],
            "uploadUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FileWithSignedUrl": {
            "createdAt": [
                221
            ],
            "id": [
                552
            ],
            "path": [
                1
            ],
            "size": [
                6
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FilesConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                552
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                490
            ],
            "type": [
                317
            ],
            "workspace": [
                703
            ],
            "__typename": [
                1
            ]
        },
        "FindMessageSuppressionsInput": {
            "limit": [
                10
            ],
            "offset": [
                10
            ],
            "reason": [
                382
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                682
            ],
            "fieldMetadataId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponent": {
            "applicationGrantedCapabilities": [
                1
            ],
            "applicationGrantedIframeMediaPermissions": [
                319
            ],
            "applicationId": [
                552
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                86
            ],
            "applicationVariables": [
                337
            ],
            "builtComponentChecksum": [
                1
            ],
            "builtComponentPath": [
                1
            ],
            "componentName": [
                1
            ],
            "createdAt": [
                221
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                552
            ],
            "isHeadless": [
                4
            ],
            "name": [
                1
            ],
            "sourceComponentPath": [
                1
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                299
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                682
            ],
            "frontComponentId": [
                552
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                552
            ],
            "pageLayoutType": [
                423
            ],
            "__typename": [
                1
            ]
        },
        "FullName": {
            "firstName": [
                1
            ],
            "lastName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GenerateInput": {
            "input": [
                484
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                337
            ],
            "runId": [
                552
            ],
            "scope": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "GenerateResult": {
            "error": [
                1
            ],
            "object": [
                337
            ],
            "runId": [
                552
            ],
            "success": [
                4
            ],
            "text": [
                1
            ],
            "usage": [
                36
            ],
            "__typename": [
                1
            ]
        },
        "GetApiKeyInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "GetAuthorizationUrlForSSO": {
            "authorizationURL": [
                1
            ],
            "id": [
                552
            ],
            "type": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GetAuthorizationUrlForSSOInput": {
            "identityProviderId": [
                552
            ],
            "workspaceInviteHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedProgress": {
            "completedStepActionKeys": [
                307
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                307
            ],
            "snoozedUntil": [
                1
            ],
            "steps": [
                308
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                307
            ],
            "description": [
                1
            ],
            "doneChatThreadId": [
                1
            ],
            "doneDescription": [
                1
            ],
            "doneTitle": [
                1
            ],
            "doneWorkflowId": [
                1
            ],
            "icon": [
                1
            ],
            "iconColor": [
                1
            ],
            "kind": [
                309
            ],
            "prompt": [
                1
            ],
            "promptLabel": [
                1
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepKind": {},
        "GettingStartedWorkflow": {
            "versionId": [
                1
            ],
            "workflowId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedWorkflowPreview": {
            "actions": [
                312
            ],
            "stepActionKey": [
                307
            ],
            "trigger": [
                313
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedWorkflowPreviewAction": {
            "title": [
                1
            ],
            "type": [
                684
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedWorkflowPreviewTrigger": {
            "databaseEventAction": [
                1
            ],
            "title": [
                1
            ],
            "type": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GrantApplicationCapabilitiesInput": {
            "applicationId": [
                552
            ],
            "capabilities": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GraphOrderBy": {},
        "GridPosition": {
            "column": [
                6
            ],
            "columnSpan": [
                6
            ],
            "row": [
                6
            ],
            "rowSpan": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                682
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "IframeMediaPermission": {
            "camera": [
                4
            ],
            "microphone": [
                4
            ],
            "origin": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "IframeMediaPermissionInput": {
            "camera": [
                4
            ],
            "microphone": [
                4
            ],
            "origin": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavConnectionSuccess": {
            "connectedAccountId": [
                1
            ],
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavPublicConnectionParameters": {
            "CALDAV": [
                323
            ],
            "IMAP": [
                323
            ],
            "SMTP": [
                323
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavPublicConnectionParams": {
            "connectionSecurity": [
                248
            ],
            "host": [
                1
            ],
            "port": [
                6
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Impersonate": {
            "loginToken": [
                92
            ],
            "workspace": [
                707
            ],
            "__typename": [
                1
            ]
        },
        "InboxThreadRecordInput": {
            "objectNameSingular": [
                1
            ],
            "recordId": [
                552
            ],
            "threadId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "id": [
                552
            ],
            "indexFieldMetadataList": [
                328
            ],
            "indexType": [
                330
            ],
            "indexWhereClause": [
                1
            ],
            "isCustom": [
                4
            ],
            "isSystemSideEffect": [
                4
            ],
            "isUnique": [
                4
            ],
            "name": [
                1
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                171
            ],
            "node": [
                326
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                221
            ],
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                329
            ],
            "id": [
                553
            ],
            "isCustom": [
                136
            ],
            "or": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                552
            ],
            "messages": [
                51
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                333
            ],
            "__typename": [
                1
            ]
        },
        "IngestedAppMessage": {
            "externalId": [
                1
            ],
            "hasAttachments": [
                4
            ],
            "messageId": [
                552
            ],
            "messageThreadId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "InitiateTwoFactorAuthenticationProvisioning": {
            "uri": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "InvalidatePassword": {
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "InviteSuggestion": {
            "displayName": [
                1
            ],
            "email": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "JSON": {},
        "JSONObject": {},
        "JobState": {},
        "JobStatus": {
            "attemptsMade": [
                10
            ],
            "enqueuedAt": [
                6
            ],
            "failedReason": [
                1
            ],
            "finishedAt": [
                6
            ],
            "jobId": [
                1
            ],
            "progress": [
                10
            ],
            "startedAt": [
                6
            ],
            "state": [
                339
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                552
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                100
            ],
            "color": [
                1
            ],
            "configurationType": [
                682
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "displayLegend": [
                4
            ],
            "filter": [
                337
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "isCumulative": [
                4
            ],
            "isStacked": [
                4
            ],
            "numberFormat": [
                151
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                413
            ],
            "primaryAxisGroupByFieldMetadataId": [
                552
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                315
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                413
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                552
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                315
            ],
            "splitMultiValueFields": [
                4
            ],
            "timezone": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "formattedToRawLookup": [
                337
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                345
            ],
            "showDataLabels": [
                4
            ],
            "showLegend": [
                4
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "LineChartDataInput": {
            "configuration": [
                337
            ],
            "objectMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "LineChartDataPoint": {
            "x": [
                1
            ],
            "y": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "LineChartSeries": {
            "data": [
                344
            ],
            "key": [
                1
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ListAppConnectionsInput": {
            "providerName": [
                1
            ],
            "scope": [
                169
            ],
            "userWorkspaceId": [
                1
            ],
            "visibility": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageChannelsInput": {
            "connectedAccountId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "Location": {
            "lat": [
                6
            ],
            "lng": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunction": {
            "applicationId": [
                552
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                221
            ],
            "cronTriggerSettings": [
                337
            ],
            "databaseEventTriggerSettings": [
                337
            ],
            "description": [
                1
            ],
            "executionMode": [
                351
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                337
            ],
            "id": [
                552
            ],
            "name": [
                1
            ],
            "runtime": [
                1
            ],
            "sourceHandlerPath": [
                1
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                337
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "workflowActionTriggerSettings": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                337
            ],
            "duration": [
                6
            ],
            "error": [
                337
            ],
            "logs": [
                1
            ],
            "status": [
                353
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "LogicFunctionIdInput": {
            "id": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogs": {
            "logs": [
                1
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                552
            ],
            "applicationUniversalIdentifier": [
                552
            ],
            "id": [
                552
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceApp": {
            "author": [
                1
            ],
            "category": [
                1
            ],
            "description": [
                1
            ],
            "id": [
                1
            ],
            "isListed": [
                4
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppDetail": {
            "aboutDescription": [
                1
            ],
            "author": [
                1
            ],
            "billsCredits": [
                4
            ],
            "category": [
                1
            ],
            "content": [
                59
            ],
            "defaultRoleUniversalIdentifier": [
                1
            ],
            "description": [
                1
            ],
            "emailSupport": [
                1
            ],
            "galleryImages": [
                1
            ],
            "id": [
                1
            ],
            "installCount": [
                10
            ],
            "isListed": [
                4
            ],
            "issueReportUrl": [
                1
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "manifest": [
                337
            ],
            "name": [
                1
            ],
            "objects": [
                360
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "requestedIframeMediaPermissions": [
                319
            ],
            "roles": [
                361
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                82
            ],
            "termsUrl": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "websiteUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppObject": {
            "labelPlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRole": {
            "canAccessAllTools": [
                4
            ],
            "canDestroyAllObjectRecords": [
                4
            ],
            "canReadAllObjectRecords": [
                4
            ],
            "canSoftDeleteAllObjectRecords": [
                4
            ],
            "canUpdateAllObjectRecords": [
                4
            ],
            "canUpdateAllSettings": [
                4
            ],
            "description": [
                1
            ],
            "fieldPermissions": [
                362
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                363
            ],
            "permissionFlagUniversalIdentifiers": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRoleFieldPermission": {
            "canReadFieldValue": [
                4
            ],
            "canUpdateFieldValue": [
                4
            ],
            "fieldUniversalIdentifier": [
                1
            ],
            "objectUniversalIdentifier": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRoleObjectPermission": {
            "canDestroyObjectRecords": [
                4
            ],
            "canReadObjectRecords": [
                4
            ],
            "canSoftDeleteObjectRecords": [
                4
            ],
            "canUpdateObjectRecords": [
                4
            ],
            "objectUniversalIdentifier": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "McpServer": {
            "applicationId": [
                552
            ],
            "connectionProviderId": [
                552
            ],
            "createdAt": [
                221
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "tools": [
                365
            ],
            "toolsSyncError": [
                1
            ],
            "toolsSyncedAt": [
                221
            ],
            "updatedAt": [
                221
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "McpServerTool": {
            "annotations": [
                337
            ],
            "description": [
                1
            ],
            "inputSchema": [
                337
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignSendBlockerDTO": {
            "code": [
                1
            ],
            "message": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                168
            ],
            "connectedAccountId": [
                552
            ],
            "contactAutoCreationPolicy": [
                370
            ],
            "createdAt": [
                221
            ],
            "displayName": [
                1
            ],
            "excludeGroupEmails": [
                4
            ],
            "excludeNonProfessionalEmails": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                552
            ],
            "importProgress": [
                10
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                377
            ],
            "messagingProviderUniversalIdentifier": [
                552
            ],
            "participantHandleFieldUniversalIdentifier": [
                552
            ],
            "pendingGroupEmailsAction": [
                371
            ],
            "syncStage": [
                372
            ],
            "syncStageStartedAt": [
                221
            ],
            "syncStatus": [
                373
            ],
            "syncedAt": [
                221
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                221
            ],
            "type": [
                374
            ],
            "updatedAt": [
                221
            ],
            "visibility": [
                375
            ],
            "__typename": [
                1
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
                221
            ],
            "externalId": [
                1
            ],
            "id": [
                552
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                552
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                378
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "MessageFolderImportPolicy": {},
        "MessageFolderPendingSyncAction": {},
        "MessageParticipantRole": {},
        "MessageSuppression": {
            "createdAt": [
                221
            ],
            "emailAddress": [
                1
            ],
            "id": [
                552
            ],
            "reason": [
                382
            ],
            "source": [
                383
            ],
            "unsubscribeTopicId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                380
            ],
            "totalCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionReason": {},
        "MessageSuppressionSource": {},
        "MetadataEvent": {
            "metadataName": [
                1
            ],
            "properties": [
                411
            ],
            "recordId": [
                1
            ],
            "type": [
                385
            ],
            "updatedCollectionHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEventAction": {},
        "MetadataTranslation": {
            "canonicalValue": [
                1
            ],
            "locale": [
                1
            ],
            "metadataName": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "property": [
                1
            ],
            "provenance": [
                388
            ],
            "recordId": [
                552
            ],
            "sourceValue": [
                1
            ],
            "value": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MetadataTranslationOverrideInput": {
            "locale": [
                1
            ],
            "property": [
                1
            ],
            "value": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MetadataTranslationProvenance": {},
        "MetadataTranslationsInput": {
            "fieldMetadataId": [
                552
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                163
            ],
            "objectMetadataItems": [
                391
            ],
            "views": [
                392
            ],
            "__typename": [
                1
            ]
        },
        "MinimalObjectMetadata": {
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isRemote": [
                4
            ],
            "isSystem": [
                4
            ],
            "labelPlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "nameSingular": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MinimalView": {
            "id": [
                552
            ],
            "key": [
                674
            ],
            "objectMetadataId": [
                552
            ],
            "type": [
                678
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                516,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                688,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "addQueryToEventStream": [
                4,
                {
                    "input": [
                        2,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "approveApplicationIframeMediaPermissions": [
                53,
                {
                    "applicationId": [
                        552,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        320,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        552
                    ],
                    "threadId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        552,
                        "UUID!"
                    ],
                    "roleId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        552,
                        "UUID!"
                    ],
                    "roleId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        325,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                95,
                {
                    "clientId": [
                        1,
                        "String!"
                    ],
                    "codeChallenge": [
                        1
                    ],
                    "issuer": [
                        1
                    ],
                    "redirectUrl": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        1
                    ],
                    "state": [
                        1
                    ]
                }
            ],
            "cancelMessageCampaign": [
                147,
                {
                    "input": [
                        146,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                134
            ],
            "cancelSwitchBillingPlan": [
                134
            ],
            "cancelSwitchResourceCreditPrice": [
                134
            ],
            "checkCustomDomainValidRecords": [
                242
            ],
            "checkPublicDomainValidRecords": [
                242,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                127,
                {
                    "plan": [
                        118,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        522,
                        "SubscriptionInterval!"
                    ],
                    "requirePaymentMethod": [
                        4,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                81,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                81,
                {
                    "fileId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                167,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        552,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                417,
                {
                    "hasBookedCall": [
                        4,
                        "Boolean!"
                    ],
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "completeFileUpload": [
                292,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                292,
                {
                    "fileId": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceLogoUpload": [
                292,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                292,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createAgentChatChannel": [
                5,
                {
                    "input": [
                        174,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                43,
                {
                    "input": [
                        176,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                369,
                {
                    "input": [
                        177,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                178,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        68,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                179,
                {
                    "input": [
                        180,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                89,
                {
                    "input": [
                        181,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                116
            ],
            "createCalendarEvent": [
                183,
                {
                    "input": [
                        182,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                17,
                {
                    "channelId": [
                        552
                    ]
                }
            ],
            "createCommandMenuItem": [
                164,
                {
                    "input": [
                        184,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                240,
                {
                    "name": [
                        1,
                        "String!"
                    ],
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                186,
                {
                    "input": [
                        185,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                251,
                {
                    "input": [
                        187,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                291,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        290,
                        "FileFolder!"
                    ],
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        6,
                        "Float!"
                    ]
                }
            ],
            "createFrontComponent": [
                297,
                {
                    "input": [
                        189,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                396,
                {
                    "inputs": [
                        195,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                668,
                {
                    "inputs": [
                        210,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                667,
                {
                    "inputs": [
                        211,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                673,
                {
                    "inputs": [
                        214,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                364,
                {
                    "input": [
                        193,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                380,
                {
                    "input": [
                        194,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                396,
                {
                    "input": [
                        195,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                291,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        6,
                        "Float!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                513,
                {
                    "input": [
                        511,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                40,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        552,
                        "UUID!"
                    ],
                    "properties": [
                        337
                    ],
                    "recordId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        175,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                277,
                {
                    "input": [
                        197,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                326,
                {
                    "input": [
                        198,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                350,
                {
                    "input": [
                        192,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                399,
                {
                    "input": [
                        199,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                472,
                {
                    "createRoleInput": [
                        205,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                420,
                {
                    "input": [
                        200,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                421,
                {
                    "input": [
                        201,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                424,
                {
                    "input": [
                        202,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                443,
                {
                    "applicationId": [
                        1,
                        "String!"
                    ],
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createRelatedRecordPath": [
                464,
                {
                    "input": [
                        204,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                513,
                {
                    "input": [
                        512,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                516,
                {
                    "input": [
                        206,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                116,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        118,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        522,
                        "SubscriptionInterval!"
                    ],
                    "requirePaymentMethod": [
                        4,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ]
                }
            ],
            "createUnsubscribeTopic": [
                555,
                {
                    "input": [
                        207,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                639,
                {
                    "input": [
                        208,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                659,
                {
                    "input": [
                        209,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                664,
                {
                    "input": [
                        215,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                667,
                {
                    "input": [
                        211,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                668,
                {
                    "input": [
                        210,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                669,
                {
                    "input": [
                        213,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                670,
                {
                    "input": [
                        212,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                673,
                {
                    "input": [
                        214,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                676,
                {
                    "input": [
                        216,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                680,
                {
                    "input": [
                        217,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                516,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        552,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        552
                    ]
                }
            ],
            "deleteAppKeyValue": [
                4,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        48
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                369,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteApplicationRegistration": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                4,
                {
                    "input": [
                        222,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                164,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                168,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                688
            ],
            "deleteEmailGroupChannel": [
                369,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteEmailingDomain": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                297,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                396,
                {
                    "ids": [
                        552,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                364,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                396,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                3,
                {
                    "input": [
                        20,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                277,
                {
                    "input": [
                        223,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                326,
                {
                    "input": [
                        224,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                350,
                {
                    "input": [
                        354,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                399,
                {
                    "input": [
                        225,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deletePublicDomain": [
                4,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteQueuedChatMessage": [
                4,
                {
                    "messageId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                464,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                226,
                {
                    "input": [
                        227,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                516,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                228,
                {
                    "twoFactorAuthenticationMethodId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteUnsubscribeTopic": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUsageLimit": [
                4,
                {
                    "usageLimitId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                652
            ],
            "deleteUserFromWorkspace": [
                656,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                659,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteView": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteViewField": [
                667,
                {
                    "input": [
                        230,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                668,
                {
                    "input": [
                        229,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                669,
                {
                    "input": [
                        231,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilterGroup": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteViewGroup": [
                673,
                {
                    "input": [
                        232,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        233,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                680,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "deleteWorkspaceInvitation": [
                1,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayout": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayoutTab": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayoutWidget": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyView": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyViewField": [
                667,
                {
                    "input": [
                        236,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                668,
                {
                    "input": [
                        235,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                669,
                {
                    "input": [
                        237,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilterGroup": [
                4,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyViewGroup": [
                673,
                {
                    "input": [
                        238,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        239,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
                {
                    "input": [
                        325,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                168,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                243,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                244,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                245,
                {
                    "input": [
                        246,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                249,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        552
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                110
            ],
            "enqueueJob": [
                258,
                {
                    "input": [
                        256,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                260,
                {
                    "input": [
                        259,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                692
            ],
            "executeOneLogicFunction": [
                352,
                {
                    "input": [
                        274,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                302,
                {
                    "input": [
                        301,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                45,
                {
                    "apiKeyId": [
                        552,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                86,
                {
                    "applicationId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                92
            ],
            "generateTransientToken": [
                533
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                547,
                {
                    "otp": [
                        1
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                549,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                94,
                {
                    "loginToken": [
                        1,
                        "String!"
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromOTP": [
                94,
                {
                    "captchaToken": [
                        1
                    ],
                    "loginToken": [
                        1,
                        "String!"
                    ],
                    "origin": [
                        1,
                        "String!"
                    ],
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromSSOExchangeToken": [
                94,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                550,
                {
                    "captchaToken": [
                        1
                    ],
                    "loginToken": [
                        1,
                        "String!"
                    ],
                    "origin": [
                        1,
                        "String!"
                    ],
                    "recoveryCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                304,
                {
                    "input": [
                        305,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                357,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "locale": [
                        1
                    ],
                    "origin": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "goBackToPreviousOnboardingStep": [
                416
            ],
            "grantApplicationCapabilities": [
                55,
                {
                    "input": [
                        314,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                324,
                {
                    "userId": [
                        552,
                        "UUID!"
                    ],
                    "workspaceId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                332,
                {
                    "input": [
                        331,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                334,
                {
                    "loginToken": [
                        1,
                        "String!"
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "initiateOTPProvisioningForAuthenticatedUser": [
                334
            ],
            "installApplication": [
                53,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ],
                    "version": [
                        1
                    ]
                }
            ],
            "installMarketplaceApp": [
                4,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ],
                    "version": [
                        1
                    ]
                }
            ],
            "markAgentChatThreadAsDoneInChannel": [
                4,
                {
                    "threadId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        552
                    ],
                    "threadId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                552,
                {
                    "workspaceMemberId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                310,
                {
                    "stepActionKey": [
                        307,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                262
            ],
            "removeAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        467,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                459,
                {
                    "principal": [
                        456,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        463,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                86,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                94,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "reopenAgentChatThreadInChannel": [
                4,
                {
                    "threadId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        468,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                469,
                {
                    "affiliatePartnerName": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resendWorkspaceInvitation": [
                503,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetAiChatAssistantProfile": [
                29
            ],
            "resetCommandMenuItem": [
                164,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                420,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                424,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                528,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                495,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                10
            ],
            "revokeApiKey": [
                43,
                {
                    "input": [
                        470,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                474,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                486,
                {
                    "input": [
                        482,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                71,
                {
                    "applicationId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                71,
                {
                    "applicationId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                321,
                {
                    "connectionParameters": [
                        247,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        552
                    ]
                }
            ],
            "sendAppChannelMessage": [
                494,
                {
                    "input": [
                        493,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                495,
                {
                    "browsingContext": [
                        337
                    ],
                    "channelId": [
                        552
                    ],
                    "fileAttachments": [
                        289,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        4
                    ],
                    "isAssistantParticipant": [
                        4
                    ],
                    "mentionedWorkspaceMemberIds": [
                        552,
                        "[UUID!]"
                    ],
                    "messageId": [
                        552,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "recipientWorkspaceMemberIds": [
                        552,
                        "[UUID!]"
                    ],
                    "shouldAssistantReply": [
                        4
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "threadId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                498,
                {
                    "input": [
                        497,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                502,
                {
                    "input": [
                        501,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                503,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        552
                    ]
                }
            ],
            "sendMessageCampaign": [
                505,
                {
                    "input": [
                        504,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                500,
                {
                    "input": [
                        506,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                47,
                {
                    "input": [
                        508,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                115,
                {
                    "partnerCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                262,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                459,
                {
                    "isPrivate": [
                        4,
                        "Boolean!"
                    ],
                    "target": [
                        463,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                459,
                {
                    "accessLevel": [
                        455,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        456,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        463,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                134,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                99,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "locale": [
                        1
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "signOut": [
                4,
                {
                    "refreshToken": [
                        1
                    ]
                }
            ],
            "signUp": [
                99,
                {
                    "affiliatePartnerName": [
                        1
                    ],
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "locale": [
                        1
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "signUpInNewWorkspace": [
                514,
                {
                    "input": [
                        515
                    ]
                }
            ],
            "signUpInWorkspace": [
                514,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "locale": [
                        1
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ],
                    "workspaceId": [
                        552
                    ],
                    "workspaceInviteHash": [
                        1
                    ],
                    "workspacePersonalInviteToken": [
                        1
                    ]
                }
            ],
            "skipSyncEmailOnboardingStep": [
                417,
                {
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "snoozeAgentChatThreadInChannel": [
                4,
                {
                    "snoozedUntil": [
                        221,
                        "DateTime!"
                    ],
                    "threadId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                150,
                {
                    "connectedAccountId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                518,
                {
                    "companyContext": [
                        337
                    ],
                    "personContext": [
                        337
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                519
            ],
            "switchBillingPlan": [
                134,
                {
                    "plan": [
                        118
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                134
            ],
            "syncAppMessageFolders": [
                376,
                {
                    "input": [
                        526,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                702,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        337,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "syncMcpServerTools": [
                364,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "trackAnalytics": [
                40,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        337
                    ],
                    "type": [
                        41,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                81,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ],
                    "targetWorkspaceSubdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "triggerAddPeopleToMessageListJob": [
                535,
                {
                    "input": [
                        534,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                539,
                {
                    "input": [
                        536,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                538,
                {
                    "input": [
                        537,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                543,
                {
                    "input": [
                        540,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                542,
                {
                    "input": [
                        541,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                545,
                {
                    "input": [
                        544,
                        "TriggerUpgradeApplicationInput!"
                    ]
                }
            ],
            "uninstallApplication": [
                4,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateAgentChatChannel": [
                5,
                {
                    "channelId": [
                        552,
                        "UUID!"
                    ],
                    "input": [
                        557,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateAgentChatThreadInboxState": [
                19,
                {
                    "action": [
                        15,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        221
                    ],
                    "threadIds": [
                        552,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                43,
                {
                    "input": [
                        559,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                369,
                {
                    "input": [
                        560,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                53,
                {
                    "id": [
                        552,
                        "UUID!"
                    ],
                    "input": [
                        561,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                81,
                {
                    "input": [
                        562,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                85,
                {
                    "input": [
                        564,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                137,
                {
                    "input": [
                        566,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                164,
                {
                    "input": [
                        568,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                369,
                {
                    "input": [
                        569,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                297,
                {
                    "input": [
                        571,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                306,
                {
                    "input": [
                        573,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                275,
                {
                    "input": [
                        574,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                396,
                {
                    "inputs": [
                        587,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                399,
                {
                    "inputs": [
                        588,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                673,
                {
                    "inputs": [
                        610,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                364,
                {
                    "input": [
                        577,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                369,
                {
                    "input": [
                        579,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                376,
                {
                    "input": [
                        581,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                376,
                {
                    "input": [
                        583,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateMyUserApplicationVariable": [
                4,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "key": [
                        1,
                        "String!"
                    ],
                    "value": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                396,
                {
                    "input": [
                        587,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        558,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        552
                    ],
                    "key": [
                        1,
                        "String!"
                    ],
                    "value": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateOneField": [
                277,
                {
                    "input": [
                        586,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        575,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                399,
                {
                    "input": [
                        588,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                472,
                {
                    "updateRoleInput": [
                        595,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                420,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        589,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        590,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                424,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        592,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                420,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        594,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                335,
                {
                    "newPassword": [
                        1,
                        "String!"
                    ],
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateSkill": [
                516,
                {
                    "input": [
                        597,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                528,
                {
                    "input": [
                        598,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                555,
                {
                    "input": [
                        599,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                639,
                {
                    "input": [
                        600,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                109,
                {
                    "userCreditsFallback": [
                        654,
                        "UserCreditsFallback!"
                    ]
                }
            ],
            "updateUserEmail": [
                4,
                {
                    "newEmail": [
                        1,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "updateValidationRule": [
                659,
                {
                    "input": [
                        601,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                664,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        612,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                667,
                {
                    "input": [
                        605,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                668,
                {
                    "input": [
                        603,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                669,
                {
                    "input": [
                        608,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                670,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        607,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                673,
                {
                    "input": [
                        610,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                676,
                {
                    "input": [
                        613,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                680,
                {
                    "input": [
                        615,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                688,
                {
                    "data": [
                        619,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                688,
                {
                    "data": [
                        617,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                688,
                {
                    "data": [
                        618,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                697,
                {
                    "roleId": [
                        552,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        620,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "upgradeApplication": [
                4,
                {
                    "appRegistrationId": [
                        1,
                        "String!"
                    ],
                    "targetVersion": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadAppTarball": [
                81,
                {
                    "file": [
                        621,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                288,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        621,
                        "Upload!"
                    ],
                    "fileFolder": [
                        290,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                292,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        621,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                292,
                {
                    "file": [
                        621,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                292,
                {
                    "file": [
                        621,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                292,
                {
                    "file": [
                        621,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                284,
                {
                    "upsertFieldPermissionsInput": [
                        622,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                664,
                {
                    "input": [
                        625,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                407,
                {
                    "upsertObjectPermissionsInput": [
                        626,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                473,
                {
                    "upsertPermissionFlagsInput": [
                        627,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                629,
                {
                    "input": [
                        628,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                664,
                {
                    "input": [
                        630,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                89,
                {
                    "input": [
                        657,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                661,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "emailVerificationToken": [
                        1,
                        "String!"
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailAndGetWorkspaceAgnosticToken": [
                99,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "emailVerificationToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailingDomain": [
                251,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                662,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "NativeModelCapabilities": {
            "twitterSearch": [
                4
            ],
            "webSearch": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItem": {
            "agentChatChannelId": [
                552
            ],
            "agentId": [
                552
            ],
            "applicationId": [
                552
            ],
            "color": [
                1
            ],
            "createdAt": [
                221
            ],
            "folderId": [
                552
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "nativePageKey": [
                1
            ],
            "pageLayoutId": [
                552
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                552
            ],
            "targetRecordId": [
                552
            ],
            "targetRecordIdentifier": [
                452
            ],
            "type": [
                397
            ],
            "updatedAt": [
                221
            ],
            "userWorkspaceId": [
                552
            ],
            "viewId": [
                552
            ],
            "workflowId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                552
            ],
            "color": [
                1
            ],
            "createdAt": [
                221
            ],
            "description": [
                1
            ],
            "disabledObjectPermissionActions": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                402,
                {
                    "filter": [
                        282,
                        "FieldFilter!"
                    ],
                    "paging": [
                        219,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                277
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "imageIdentifierFieldMetadataId": [
                552
            ],
            "indexMetadataList": [
                326
            ],
            "indexMetadatas": [
                404,
                {
                    "filter": [
                        329,
                        "IndexFilter!"
                    ],
                    "paging": [
                        219,
                        "CursorPaging!"
                    ]
                }
            ],
            "isActive": [
                4
            ],
            "isAuditLogged": [
                4
            ],
            "isLabelSyncedWithName": [
                4
            ],
            "isRemote": [
                4
            ],
            "isSearchable": [
                4
            ],
            "isSystem": [
                4
            ],
            "isUICreatable": [
                4
            ],
            "isUIEditable": [
                4
            ],
            "isUIReadOnly": [
                4
            ],
            "labelIdentifierFieldMetadataId": [
                552
            ],
            "labelPlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "nameSingular": [
                1
            ],
            "openRecordIn": [
                406
            ],
            "searchFieldMetadataList": [
                492
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                401
            ],
            "pageInfo": [
                419
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                171
            ],
            "node": [
                399
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                281
            ],
            "pageInfo": [
                419
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                403
            ],
            "id": [
                553
            ],
            "isActive": [
                136
            ],
            "isRemote": [
                136
            ],
            "isSearchable": [
                136
            ],
            "isSystem": [
                136
            ],
            "isUICreatable": [
                136
            ],
            "isUIEditable": [
                136
            ],
            "isUIReadOnly": [
                136
            ],
            "or": [
                403
            ],
            "universalIdentifier": [
                553
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                327
            ],
            "pageInfo": [
                419
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ObjectOpenRecordIn": {},
        "ObjectPermission": {
            "canDestroyObjectRecords": [
                4
            ],
            "canReadObjectRecords": [
                4
            ],
            "canSoftDeleteObjectRecords": [
                4
            ],
            "canUpdateObjectRecords": [
                4
            ],
            "objectMetadataId": [
                552
            ],
            "restrictedFields": [
                337
            ],
            "rowLevelPermissionPredicateGroups": [
                476
            ],
            "rowLevelPermissionPredicates": [
                475
            ],
            "uneditableFields": [
                552
            ],
            "unreadableFields": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ObjectPermissionInput": {
            "canDestroyObjectRecords": [
                4
            ],
            "canReadObjectRecords": [
                4
            ],
            "canSoftDeleteObjectRecords": [
                4
            ],
            "canUpdateObjectRecords": [
                4
            ],
            "objectMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordCount": {
            "objectNamePlural": [
                1
            ],
            "totalCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordEvent": {
            "action": [
                220
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                411
            ],
            "recordId": [
                1
            ],
            "userId": [
                1
            ],
            "workspaceMemberId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordEventProperties": {
            "after": [
                337
            ],
            "before": [
                337
            ],
            "diff": [
                337
            ],
            "updatedFields": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordEventWithQueryIds": {
            "objectRecordEvent": [
                410
            ],
            "queryIds": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "ObjectRecordsPermissions": {
            "canCreateAllRecords": [
                4
            ],
            "canDestroyAllRecords": [
                4
            ],
            "canReadAllRecords": [
                4
            ],
            "canSoftDeleteAllRecords": [
                4
            ],
            "canUpdateAllRecords": [
                4
            ],
            "objectMetadataId": [
                552
            ],
            "restrictedFields": [
                337
            ],
            "rowLevelRecordsPermissions": [
                481
            ],
            "uneditableFields": [
                552
            ],
            "unreadableFields": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                415
            ],
            "previousOnboardingStatus": [
                415
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStepSuccess": {
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "OpenRecordIn": {},
        "PageInfo": {
            "endCursor": [
                171
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                171
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                552
            ],
            "deletedAt": [
                221
            ],
            "id": [
                552
            ],
            "isFirstTabPinned": [
                4
            ],
            "isSystemSideEffect": [
                4
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "tabs": [
                421
            ],
            "type": [
                423
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isOverridden": [
                4
            ],
            "isSystemSideEffect": [
                4
            ],
            "layoutMode": [
                422
            ],
            "pageLayoutId": [
                552
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "widgets": [
                424
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                319
            ],
            "applicationId": [
                552
            ],
            "applicationName": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                337
            ],
            "configuration": [
                681
            ],
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "gridPosition": [
                316
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isOverridden": [
                4
            ],
            "isSystemSideEffect": [
                4
            ],
            "objectMetadataId": [
                552
            ],
            "pageLayoutTabId": [
                552
            ],
            "position": [
                427
            ],
            "title": [
                1
            ],
            "type": [
                683
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                422
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "column": [
                10
            ],
            "columnSpan": [
                10
            ],
            "layoutMode": [
                422
            ],
            "row": [
                10
            ],
            "rowSpan": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetCanvasPosition": [
                425
            ],
            "on_PageLayoutWidgetGridPosition": [
                426
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                429
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                428
            ],
            "index": [
                10
            ],
            "layoutMode": [
                422
            ],
            "__typename": [
                1
            ]
        },
        "PathCommandMenuItemPayload": {
            "path": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlag": {
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "key": [
                1
            ],
            "label": [
                1
            ],
            "permissionType": [
                1
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                552
            ],
            "aggregateOperation": [
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                682
            ],
            "dateGranularity": [
                413
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "displayLegend": [
                4
            ],
            "filter": [
                337
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                552
            ],
            "groupBySubFieldName": [
                1
            ],
            "hideEmptyCategory": [
                4
            ],
            "manualSortOrder": [
                1
            ],
            "numberFormat": [
                151
            ],
            "orderBy": [
                315
            ],
            "showCenterMetric": [
                4
            ],
            "splitMultiValueFields": [
                4
            ],
            "timezone": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PieChartData": {
            "data": [
                436
            ],
            "formattedToRawLookup": [
                337
            ],
            "hasTooManyGroups": [
                4
            ],
            "showCenterMetric": [
                4
            ],
            "showDataLabels": [
                4
            ],
            "showLegend": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "PieChartDataInput": {
            "configuration": [
                337
            ],
            "objectMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "PieChartDataItem": {
            "key": [
                1
            ],
            "value": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "PlaceDetailsResult": {
            "city": [
                1
            ],
            "country": [
                1
            ],
            "location": [
                349
            ],
            "postcode": [
                1
            ],
            "state": [
                1
            ],
            "street": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignAudienceInput": {
            "listId": [
                1
            ],
            "unsubscribeTopicId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendInput": {
            "campaignId": [
                1
            ],
            "scheduledAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                145
            ],
            "blockers": [
                368
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                552
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oAuthScopes": [
                1
            ],
            "websiteUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublicConnectionParametersOutput": {
            "connectionSecurity": [
                248
            ],
            "host": [
                1
            ],
            "port": [
                6
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublicDomain": {
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "domain": [
                1
            ],
            "id": [
                552
            ],
            "isValidated": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "PublicFeatureFlag": {
            "key": [
                276
            ],
            "metadata": [
                445
            ],
            "__typename": [
                1
            ]
        },
        "PublicFeatureFlagMetadata": {
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "imagePath": [
                1
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublicImapSmtpCaldavConnectionParameters": {
            "CALDAV": [
                442
            ],
            "IMAP": [
                442
            ],
            "SMTP": [
                442
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                90
            ],
            "authProviders": [
                91
            ],
            "displayName": [
                1
            ],
            "id": [
                552
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                706
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceDataSummary": {
            "displayName": [
                1
            ],
            "id": [
                552
            ],
            "logo": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "agentChatChannelRoles": [
                8
            ],
            "agentChatChannelSummaries": [
                9
            ],
            "agentChatChannelThreadIds": [
                12,
                {
                    "after": [
                        1
                    ],
                    "assignment": [
                        7
                    ],
                    "channelId": [
                        552,
                        "UUID!"
                    ],
                    "filter": [
                        11
                    ],
                    "first": [
                        10
                    ],
                    "status": [
                        13
                    ]
                }
            ],
            "agentChatChannels": [
                5
            ],
            "agentChatOpenThreadsSummary": [
                16
            ],
            "agentRuns": [
                24,
                {
                    "agentId": [
                        552,
                        "UUID!"
                    ],
                    "limit": [
                        10,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                31
            ],
            "aiChatUserCreditsUsage": [
                32
            ],
            "apiKey": [
                43,
                {
                    "input": [
                        303,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                43
            ],
            "appConnection": [
                46,
                {
                    "id": [
                        18,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                46,
                {
                    "filter": [
                        346
                    ]
                }
            ],
            "appKeyValue": [
                47,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        48
                    ]
                }
            ],
            "appMessageChannels": [
                369,
                {
                    "filter": [
                        347
                    ]
                }
            ],
            "appMessageFolders": [
                376,
                {
                    "filter": [
                        348
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                56,
                {
                    "applicationId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                57,
                {
                    "applicationId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "applicationCoreGraphqlSchema": [
                1,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "applicationRegistrationTarballUrl": [
                1,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "applicationSdkClientChecksums": [
                491,
                {
                    "applicationId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                102,
                {
                    "input": [
                        103,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                115
            ],
            "billingPlans": [
                117
            ],
            "billingPortalSession": [
                127,
                {
                    "forPaymentMethodUpdate": [
                        4
                    ],
                    "returnUrlPath": [
                        1
                    ]
                }
            ],
            "callRecordingIdForCalendarEvent": [
                552,
                {
                    "calendarEventId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "agentUniversalIdentifier": [
                        552
                    ],
                    "threadId": [
                        552
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                153,
                {
                    "agentUniversalIdentifier": [
                        552
                    ],
                    "threadId": [
                        552
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "chatThread": [
                17,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                156,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceInviteHashIsValid": [
                696,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                520,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                164,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                164
            ],
            "currentUser": [
                652
            ],
            "currentUserApplicationAuthorizations": [
                54
            ],
            "currentUserSessions": [
                655
            ],
            "currentWorkspace": [
                688
            ],
            "enterpriseCheckoutSession": [
                1,
                {
                    "billingInterval": [
                        1
                    ]
                }
            ],
            "enterprisePortalSession": [
                1,
                {
                    "returnUrlPath": [
                        1
                    ]
                }
            ],
            "enterpriseSubscriptionStatus": [
                263
            ],
            "eventLogs": [
                270,
                {
                    "input": [
                        269,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                61,
                {
                    "shouldIncludeDependencies": [
                        4
                    ],
                    "shouldIncludeSourceFiles": [
                        4
                    ],
                    "universalIdentifier": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                277,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                279,
                {
                    "filter": [
                        282,
                        "FieldFilter!"
                    ],
                    "paging": [
                        219,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                441,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                81,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                73,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        221
                    ],
                    "periodStart": [
                        221
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                83,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        221
                    ],
                    "periodStart": [
                        221
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                85,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                157,
                {
                    "sourcePackage": [
                        1
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "findInstallApplicationJobStatus": [
                340,
                {
                    "jobId": [
                        1
                    ],
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyAgents": [
                3
            ],
            "findManyApplicationRegistrations": [
                81
            ],
            "findManyApplications": [
                53
            ],
            "findManyLogicFunctions": [
                350
            ],
            "findManyMarketplaceApps": [
                358,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                443
            ],
            "findMarketplaceAppDetail": [
                359,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneAgent": [
                3,
                {
                    "input": [
                        20,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                53,
                {
                    "id": [
                        552
                    ],
                    "universalIdentifier": [
                        552
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                81,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                350,
                {
                    "input": [
                        354,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                340,
                {
                    "jobId": [
                        1
                    ],
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findUpgradeApplicationJobStatus": [
                340,
                {
                    "jobId": [
                        1
                    ],
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                690
            ],
            "findWorkspaceFromInviteHash": [
                688,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                695
            ],
            "frontComponent": [
                297,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                297
            ],
            "getAddressDetails": [
                437,
                {
                    "placeId": [
                        1,
                        "String!"
                    ],
                    "token": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                37
            ],
            "getApiKeyRoles": [
                472
            ],
            "getApprovedAccessDomains": [
                89
            ],
            "getAutoCompleteAddress": [
                96,
                {
                    "address": [
                        1,
                        "String!"
                    ],
                    "country": [
                        1
                    ],
                    "isFieldCity": [
                        4
                    ],
                    "token": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAvailablePackages": [
                337,
                {
                    "input": [
                        354,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                170,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                251
            ],
            "getInviteSuggestions": [
                336
            ],
            "getJobs": [
                340,
                {
                    "jobIds": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        354,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                420,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                421,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                424,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                424,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                420,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        423
                    ]
                }
            ],
            "getPermissionFlags": [
                431
            ],
            "getPublicWorkspaceDataByDomain": [
                447,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                448,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                126
            ],
            "getRole": [
                472,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                472
            ],
            "getSSOIdentityProviders": [
                294
            ],
            "getToolIndex": [
                532
            ],
            "getToolInputSchema": [
                337,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                636,
                {
                    "input": [
                        637
                    ]
                }
            ],
            "getView": [
                664,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                667,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                668,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                668,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                667,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                669,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                670,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                670,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                669,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                673,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                673,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                676,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                676,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                664,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        678,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                693
            ],
            "gettingStartedProgress": [
                306
            ],
            "gettingStartedWorkflowPreviews": [
                311
            ],
            "githubClaimAuthorizationUrl": [
                1,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "isApplicationStopped": [
                4,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "lineChartData": [
                342,
                {
                    "input": [
                        343,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                117
            ],
            "mcpServer": [
                364,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                364
            ],
            "messageSuppressions": [
                381,
                {
                    "input": [
                        295,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                386,
                {
                    "input": [
                        389,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                390
            ],
            "mostlyEmptyFieldMetadataIds": [
                552,
                {
                    "objectMetadataId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                80
            ],
            "myCalendarChannels": [
                137,
                {
                    "connectedAccountId": [
                        552
                    ]
                }
            ],
            "myConnectedAccounts": [
                168
            ],
            "myMessageChannels": [
                369,
                {
                    "connectedAccountId": [
                        552
                    ]
                }
            ],
            "myMessageFolders": [
                376,
                {
                    "messageChannelId": [
                        552
                    ]
                }
            ],
            "myUserApplicationVariables": [
                698
            ],
            "navigationMenuItem": [
                396,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                396
            ],
            "object": [
                399,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                409
            ],
            "objects": [
                400,
                {
                    "filter": [
                        403,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        219,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                434,
                {
                    "input": [
                        435,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                145,
                {
                    "input": [
                        438,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                440,
                {
                    "input": [
                        439,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                359,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                358
            ],
            "recordPermissions": [
                454,
                {
                    "targets": [
                        463,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                459,
                {
                    "target": [
                        463,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                464
            ],
            "skill": [
                516,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                516
            ],
            "timelineActivityTypes": [
                528
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                546
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                551,
                {
                    "userId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                555
            ],
            "usageLimits": [
                639
            ],
            "usageQuotaDefinitions": [
                643
            ],
            "usageQuotaScopeConsumption": [
                645,
                {
                    "input": [
                        646,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                647
            ],
            "validatePasswordResetToken": [
                658,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                659,
                {
                    "objectMetadataId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                659,
                {
                    "fieldMetadataId": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                680,
                {
                    "id": [
                        552,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                680
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                552
            ],
            "optionValue": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RecordExport": {
            "downloadPath": [
                1
            ],
            "errorMessage": [
                1
            ],
            "filename": [
                1
            ],
            "id": [
                552
            ],
            "progress": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "RecordIdentifier": {
            "id": [
                552
            ],
            "imageIdentifier": [
                1
            ],
            "labelIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RecordPermissionsDTO": {
            "canDelete": [
                4
            ],
            "canRead": [
                4
            ],
            "canSoftDelete": [
                4
            ],
            "canUpdate": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "RecordPermissionsResult": {
            "objectMetadataId": [
                552
            ],
            "permissions": [
                453
            ],
            "recordId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                552
            ],
            "workspaceMemberId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharePrincipalType": {},
        "RecordShareRowCause": {},
        "RecordSharingDTO": {
            "canManageSharing": [
                4
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "isPrivate": [
                4
            ],
            "isShareable": [
                4
            ],
            "permissions": [
                453
            ],
            "roles": [
                461
            ],
            "shares": [
                460
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                455
            ],
            "id": [
                18
            ],
            "principalId": [
                552
            ],
            "principalRoleId": [
                552
            ],
            "principalType": [
                457
            ],
            "rowCause": [
                458
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingRoleDTO": {
            "canRead": [
                4
            ],
            "canUpdate": [
                4
            ],
            "id": [
                552
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                682
            ],
            "isUIEditable": [
                4
            ],
            "recordLimit": [
                10
            ],
            "viewId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RecordTargetInput": {
            "objectMetadataId": [
                552
            ],
            "recordId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                552
            ],
            "secondFieldMetadataId": [
                552
            ],
            "thirdFieldMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                277
            ],
            "sourceObjectMetadata": [
                399
            ],
            "targetFieldMetadata": [
                277
            ],
            "targetObjectMetadata": [
                399
            ],
            "type": [
                466
            ],
            "__typename": [
                1
            ]
        },
        "RelationType": {},
        "RemoveQueryFromEventStreamInput": {
            "eventStreamId": [
                1
            ],
            "queryId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ReportAppConnectionAuthFailureInput": {
            "id": [
                18
            ],
            "reason": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ResendEmailVerificationToken": {
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "RevokeApiKeyInput": {
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "RichTextBody": {
            "blocknote": [
                1
            ],
            "markdown": [
                1
            ],
            "tiptap": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Role": {
            "agents": [
                3
            ],
            "apiKeys": [
                44
            ],
            "applicationId": [
                552
            ],
            "canAccessAllAgentChatChannels": [
                4
            ],
            "canAccessAllTools": [
                4
            ],
            "canBeAssignedToAgents": [
                4
            ],
            "canBeAssignedToApiKeys": [
                4
            ],
            "canBeAssignedToUsers": [
                4
            ],
            "canDestroyAllObjectRecords": [
                4
            ],
            "canReadAllObjectRecords": [
                4
            ],
            "canSoftDeleteAllObjectRecords": [
                4
            ],
            "canUpdateAllObjectRecords": [
                4
            ],
            "canUpdateAllSettings": [
                4
            ],
            "description": [
                1
            ],
            "fieldPermissions": [
                284
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                407
            ],
            "permissionFlags": [
                473
            ],
            "rowLevelPermissionFieldPermissions": [
                284
            ],
            "rowLevelPermissionPredicateGroups": [
                476
            ],
            "rowLevelPermissionPredicates": [
                475
            ],
            "universalIdentifier": [
                552
            ],
            "workspaceMembers": [
                697
            ],
            "__typename": [
                1
            ]
        },
        "RolePermissionFlag": {
            "flag": [
                1
            ],
            "id": [
                552
            ],
            "roleId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "RotateClientSecret": {
            "clientSecret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicate": {
            "fieldMetadataId": [
                1
            ],
            "id": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "operand": [
                480
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "relationFieldMetadataId": [
                1
            ],
            "roleId": [
                1
            ],
            "rowLevelPermissionPredicateGroupId": [
                1
            ],
            "subFieldName": [
                1
            ],
            "value": [
                337
            ],
            "workspaceMemberFieldMetadataId": [
                1
            ],
            "workspaceMemberSubFieldName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroup": {
            "canDestroyRecords": [
                4
            ],
            "canReadRecords": [
                4
            ],
            "canSoftDeleteRecords": [
                4
            ],
            "canUpdateRecords": [
                4
            ],
            "id": [
                1
            ],
            "logicalOperator": [
                478
            ],
            "objectMetadataId": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "roleId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupInput": {
            "canDestroyRecords": [
                4
            ],
            "canReadRecords": [
                4
            ],
            "canSoftDeleteRecords": [
                4
            ],
            "canUpdateRecords": [
                4
            ],
            "id": [
                552
            ],
            "logicalOperator": [
                478
            ],
            "objectMetadataId": [
                552
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                552
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicateInput": {
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "operand": [
                480
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "relationFieldMetadataId": [
                552
            ],
            "rowLevelPermissionPredicateGroupId": [
                552
            ],
            "subFieldName": [
                1
            ],
            "value": [
                337
            ],
            "workspaceMemberFieldMetadataId": [
                1
            ],
            "workspaceMemberSubFieldName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateOperand": {},
        "RowLevelRecordsPermissions": {
            "canCreateRecords": [
                4
            ],
            "canDestroyRecords": [
                4
            ],
            "canReadRecords": [
                4
            ],
            "canSoftDeleteRecords": [
                4
            ],
            "canUpdateRecords": [
                4
            ],
            "predicateGroups": [
                476
            ],
            "predicates": [
                475
            ],
            "uneditableFields": [
                552
            ],
            "unreadableFields": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentInput": {
            "additionalInstructions": [
                1
            ],
            "agentUniversalIdentifier": [
                1
            ],
            "input": [
                484
            ],
            "messages": [
                484
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                337
            ],
            "runAsWorkspaceMemberId": [
                552
            ],
            "thread": [
                487
            ],
            "waitForCompletion": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                552
            ],
            "filename": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageInput": {
            "attachments": [
                483
            ],
            "content": [
                1
            ],
            "role": [
                485
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageRole": {},
        "RunAgentResult": {
            "error": [
                1
            ],
            "result": [
                337
            ],
            "runId": [
                552
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentThreadInput": {
            "key": [
                1
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SSOConnection": {
            "id": [
                552
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                490
            ],
            "type": [
                317
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                552
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                490
            ],
            "type": [
                317
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProviderStatus": {},
        "SdkClientChecksums": {
            "core": [
                1
            ],
            "metadata": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SearchField": {
            "createdAt": [
                221
            ],
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                552
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                552
            ],
            "messageChannelId": [
                552
            ],
            "messageThreadId": [
                552
            ],
            "text": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageOutput": {
            "messageId": [
                552
            ],
            "messageThreadId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                552
            ],
            "messageId": [
                1
            ],
            "queued": [
                4
            ],
            "recipientParticipantWorkspaceMemberIds": [
                552
            ],
            "streamId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailAttachmentInput": {
            "id": [
                1
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailInput": {
            "bcc": [
                1
            ],
            "body": [
                1
            ],
            "cc": [
                1
            ],
            "connectedAccountId": [
                1
            ],
            "draftMessageId": [
                1
            ],
            "files": [
                496
            ],
            "fromHandle": [
                1
            ],
            "inReplyTo": [
                1
            ],
            "subject": [
                1
            ],
            "targetRecord": [
                499
            ],
            "to": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailOutput": {
            "error": [
                1
            ],
            "messageThreadId": [
                1
            ],
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailTargetRecordInput": {
            "objectNameSingular": [
                1
            ],
            "recordId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailViaDomainOutput": {
            "messageId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageInput": {
            "idempotencyKey": [
                1
            ],
            "text": [
                1
            ],
            "threadKey": [
                1
            ],
            "title": [
                1
            ],
            "toolCall": [
                337
            ],
            "workspaceMemberIds": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "SendInvitations": {
            "errors": [
                1
            ],
            "result": [
                695
            ],
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignInput": {
            "campaignId": [
                1
            ],
            "scheduledAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                145
            ],
            "campaignId": [
                1
            ],
            "queuedCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignTestInput": {
            "body": [
                1
            ],
            "fromAddress": [
                1
            ],
            "subject": [
                1
            ],
            "toAddress": [
                1
            ],
            "unsubscribeTopicId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Sentry": {
            "dsn": [
                1
            ],
            "environment": [
                1
            ],
            "release": [
                1
            ],
            "tracesSampleRate": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "SetAppKeyValueInput": {
            "key": [
                1
            ],
            "scope": [
                48
            ],
            "value": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "frontComponentId": [
                552
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "position": [
                6
            ],
            "scope": [
                510
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItemScope": {},
        "SetupOIDCSsoInput": {
            "clientID": [
                1
            ],
            "clientSecret": [
                1
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SetupSAMLSsoInput": {
            "certificate": [
                1
            ],
            "fingerprint": [
                1
            ],
            "id": [
                552
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "ssoURL": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SetupSso": {
            "id": [
                552
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                490
            ],
            "type": [
                317
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                92
            ],
            "workspace": [
                707
            ],
            "__typename": [
                1
            ]
        },
        "SignUpInNewWorkspaceInput": {
            "affiliatePartnerName": [
                1
            ],
            "captchaToken": [
                1
            ],
            "displayName": [
                1
            ],
            "subdomain": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Skill": {
            "applicationId": [
                552
            ],
            "content": [
                1
            ],
            "createdAt": [
                221
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isCustom": [
                4
            ],
            "isSystem": [
                4
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                471
            ],
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                705
            ],
            "thread": [
                17
            ],
            "__typename": [
                1
            ]
        },
        "StopImpersonation": {
            "canRestoreImpersonatorSession": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SubdomainAvailabilityDTO": {
            "available": [
                4
            ],
            "isValid": [
                4
            ],
            "suggestedSubdomain": [
                1
            ],
            "suggestedSubdomains": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Subscription": {
            "eventLogsLive": [
                271,
                {
                    "fieldFilters": [
                        265,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        272,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                451,
                {
                    "input": [
                        203,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                355,
                {
                    "input": [
                        356,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                14,
                {
                    "agentUniversalIdentifier": [
                        552
                    ],
                    "runId": [
                        552
                    ],
                    "threadId": [
                        552
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "onEventSubscription": [
                273,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionInterval": {},
        "SubscriptionStatus": {},
        "Support": {
            "supportDriver": [
                525
            ],
            "supportFrontChatId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SupportDriver": {},
        "SyncAppMessageFoldersInput": {
            "folders": [
                50
            ],
            "messageChannelId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityType": {
            "action": [
                1
            ],
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "emit": [
                529
            ],
            "frontComponentUniversalIdentifier": [
                552
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "objectUniversalIdentifier": [
                552
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                552
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                552
            ],
            "on": [
                1
            ],
            "through": [
                530
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                552
            ],
            "relationFieldUniversalIdentifier": [
                552
            ],
            "triggerFieldUniversalIdentifiers": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "ToolIndexEntry": {
            "category": [
                1
            ],
            "description": [
                1
            ],
            "frontComponentId": [
                1
            ],
            "icon": [
                1
            ],
            "inputSchema": [
                337
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "objectName": [
                1
            ],
            "widgetName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TransientToken": {
            "transientToken": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                552
            ],
            "personFilter": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobResult": {
            "jobId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerInstallApplicationInput": {
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerInstallApplicationJobInput": {
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerInstallApplicationJobResult": {
            "jobId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerInstallApplicationResult": {
            "jobId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerUninstallApplicationInput": {
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerUninstallApplicationJobInput": {
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerUninstallApplicationJobResult": {
            "jobId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerUninstallApplicationResult": {
            "jobId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerUpgradeApplicationInput": {
            "targetVersion": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TriggerUpgradeApplicationResult": {
            "jobId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationBackupCodeStatus": {
            "remainingBackupCodeCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationBackupCodes": {
            "backupCodes": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationMethodSummary": {
            "status": [
                1
            ],
            "strategy": [
                1
            ],
            "twoFactorAuthenticationMethodId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                221
            ],
            "recoveryCode": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCodeRedemption": {
            "isTwoFactorAuthenticationReset": [
                4
            ],
            "provisioningUri": [
                1
            ],
            "tokens": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryStatus": {
            "hasVerifiedTwoFactorAuthenticationMethod": [
                4
            ],
            "isAwaitingRecoveryEnrollment": [
                4
            ],
            "pendingRecoveryCodeExpiresAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                552
            ],
            "gt": [
                552
            ],
            "gte": [
                552
            ],
            "iLike": [
                552
            ],
            "in": [
                552
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                552
            ],
            "lt": [
                552
            ],
            "lte": [
                552
            ],
            "neq": [
                552
            ],
            "notILike": [
                552
            ],
            "notIn": [
                552
            ],
            "notLike": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                221
            ],
            "description": [
                1
            ],
            "id": [
                552
            ],
            "name": [
                1
            ],
            "updatedAt": [
                221
            ],
            "visibility": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeTopicVisibility": {},
        "UpdateAgentChatChannelInput": {
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "roleIds": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateAgentInput": {
            "avatarColor": [
                1
            ],
            "avatarShape": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                337
            ],
            "modelId": [
                1
            ],
            "name": [
                1
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                337
            ],
            "roleId": [
                552
            ],
            "triggers": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApiKeyInput": {
            "expiresAt": [
                1
            ],
            "id": [
                552
            ],
            "name": [
                1
            ],
            "revokedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateAppMessageChannelInput": {
            "displayName": [
                1
            ],
            "id": [
                552
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                552
            ],
            "visibility": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationInput": {
            "autoUpgrade": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationInput": {
            "id": [
                1
            ],
            "update": [
                563
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationPayload": {
            "name": [
                1
            ],
            "oAuthRedirectUris": [
                1
            ],
            "oAuthScopes": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationVariableInput": {
            "id": [
                1
            ],
            "update": [
                565
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationVariablePayload": {
            "description": [
                1
            ],
            "resetValue": [
                4
            ],
            "value": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInput": {
            "id": [
                552
            ],
            "update": [
                567
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                138
            ],
            "excludePrivateEvents": [
                4
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                141
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                552
            ],
            "availabilityType": [
                165
            ],
            "engineComponentKey": [
                255
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                552
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateEmailGroupChannelInput": {
            "displayName": [
                1
            ],
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                337
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                4
            ],
            "isAuditLogged": [
                4
            ],
            "isLabelSyncedWithName": [
                4
            ],
            "isNullable": [
                4
            ],
            "isSearchable": [
                4
            ],
            "isSystem": [
                4
            ],
            "isUIEditable": [
                4
            ],
            "isUIReadOnly": [
                4
            ],
            "isUnique": [
                4
            ],
            "label": [
                1
            ],
            "morphRelationsUpdatePayload": [
                337
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "options": [
                337
            ],
            "settings": [
                337
            ],
            "translations": [
                387
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFrontComponentInput": {
            "id": [
                552
            ],
            "update": [
                572
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFrontComponentInputUpdates": {
            "description": [
                1
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateGettingStartedInput": {
            "completedStepActionKey": [
                307
            ],
            "completedStepChatThreadId": [
                1
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                307
            ],
            "snoozedUntil": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLabPublicFeatureFlagInput": {
            "publicFeatureFlag": [
                1
            ],
            "value": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInput": {
            "id": [
                552
            ],
            "update": [
                576
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                337
            ],
            "databaseEventTriggerSettings": [
                337
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                337
            ],
            "name": [
                1
            ],
            "sourceHandlerCode": [
                1
            ],
            "sourceHandlerPath": [
                1
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                337
            ],
            "workflowActionTriggerSettings": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                552
            ],
            "update": [
                578
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                552
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                552
            ],
            "update": [
                580
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                370
            ],
            "excludeGroupEmails": [
                4
            ],
            "excludeNonProfessionalEmails": [
                4
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                377
            ],
            "visibility": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                552
            ],
            "update": [
                582
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInputUpdates": {
            "isSynced": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFoldersInput": {
            "ids": [
                552
            ],
            "update": [
                582
            ],
            "__typename": [
                1
            ]
        },
        "UpdateNavigationMenuItemInput": {
            "color": [
                1
            ],
            "folderId": [
                552
            ],
            "icon": [
                1
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                552
            ],
            "position": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpdateObjectPayload": {
            "color": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "imageIdentifierFieldMetadataId": [
                552
            ],
            "isActive": [
                4
            ],
            "isLabelSyncedWithName": [
                4
            ],
            "isSearchable": [
                4
            ],
            "labelIdentifierFieldMetadataId": [
                552
            ],
            "labelPlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "nameSingular": [
                1
            ],
            "openRecordIn": [
                406
            ],
            "shortcut": [
                1
            ],
            "translations": [
                387
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                552
            ],
            "update": [
                570
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                552
            ],
            "update": [
                584
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                552
            ],
            "update": [
                585
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutInput": {
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "type": [
                423
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutTabInput": {
            "icon": [
                1
            ],
            "layoutMode": [
                422
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutTabWithWidgetsInput": {
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "layoutMode": [
                422
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                593
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                337
            ],
            "configuration": [
                337
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                552
            ],
            "pageLayoutTabId": [
                552
            ],
            "position": [
                337
            ],
            "title": [
                1
            ],
            "type": [
                683
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWidgetWithIdInput": {
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                337
            ],
            "configuration": [
                337
            ],
            "id": [
                552
            ],
            "objectMetadataId": [
                552
            ],
            "pageLayoutTabId": [
                552
            ],
            "position": [
                337
            ],
            "title": [
                1
            ],
            "type": [
                683
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWithTabsInput": {
            "isFirstTabPinned": [
                4
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "tabs": [
                591
            ],
            "type": [
                423
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                552
            ],
            "update": [
                596
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRolePayload": {
            "canAccessAllAgentChatChannels": [
                4
            ],
            "canAccessAllTools": [
                4
            ],
            "canBeAssignedToAgents": [
                4
            ],
            "canBeAssignedToApiKeys": [
                4
            ],
            "canBeAssignedToUsers": [
                4
            ],
            "canDestroyAllObjectRecords": [
                4
            ],
            "canReadAllObjectRecords": [
                4
            ],
            "canSoftDeleteAllObjectRecords": [
                4
            ],
            "canUpdateAllObjectRecords": [
                4
            ],
            "canUpdateAllSettings": [
                4
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateSkillInput": {
            "content": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateTimelineActivityTypeInput": {
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                387
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUnsubscribeTopicInput": {
            "description": [
                1
            ],
            "id": [
                1
            ],
            "name": [
                1
            ],
            "visibility": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                552
            ],
            "payload": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                552
            ],
            "update": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInputUpdates": {
            "description": [
                1
            ],
            "errorFieldMetadataId": [
                552
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                4
            ],
            "message": [
                1
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldGroupInput": {
            "id": [
                552
            ],
            "update": [
                604
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldGroupInputUpdates": {
            "deletedAt": [
                1
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                552
            ],
            "update": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                27
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "size": [
                6
            ],
            "viewFieldGroupId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                552
            ],
            "logicalOperator": [
                671
            ],
            "parentViewFilterGroupId": [
                552
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                552
            ],
            "update": [
                609
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                552
            ],
            "operand": [
                672
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                552
            ],
            "subFieldName": [
                1
            ],
            "value": [
                337
            ],
            "viewFilterGroupId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                552
            ],
            "update": [
                611
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                552
            ],
            "fieldValue": [
                1
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewInput": {
            "anyFieldFilterValue": [
                1
            ],
            "calendarEndFieldMetadataId": [
                552
            ],
            "calendarFieldMetadataId": [
                552
            ],
            "calendarLayout": [
                665
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                552
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                552
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                675
            ],
            "position": [
                6
            ],
            "shouldDisplayGroupsAsTabs": [
                4
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "translations": [
                387
            ],
            "type": [
                678
            ],
            "visibility": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                552
            ],
            "update": [
                614
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                677
            ],
            "subFieldName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWebhookInput": {
            "id": [
                552
            ],
            "update": [
                616
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWebhookInputUpdates": {
            "description": [
                1
            ],
            "operations": [
                1
            ],
            "roleId": [
                552
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceAllowedEmbeddingOriginsInput": {
            "operation": [
                1
            ],
            "origin": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceIframeMediaPermissionsInput": {
            "camera": [
                4
            ],
            "microphone": [
                4
            ],
            "origin": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceInput": {
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                35
            ],
            "aiChatAssistantProfile": [
                30
            ],
            "aiChatDirectMessageAssistantMode": [
                28
            ],
            "aiChatInboxAssistantMode": [
                28
            ],
            "aiChatModelTier": [
                35
            ],
            "aiDataPolicy": [
                34
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                337
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                552
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                6
            ],
            "inviteHash": [
                1
            ],
            "isAutoModelSelectionEnabled": [
                4
            ],
            "isCampaignClickTrackingEnabled": [
                4
            ],
            "isCampaignOpenTrackingEnabled": [
                4
            ],
            "isGoogleAuthBypassEnabled": [
                4
            ],
            "isGoogleAuthEnabled": [
                4
            ],
            "isInternalMessagesImportEnabled": [
                4
            ],
            "isMicrosoftAuthBypassEnabled": [
                4
            ],
            "isMicrosoftAuthEnabled": [
                4
            ],
            "isPasswordAuthBypassEnabled": [
                4
            ],
            "isPasswordAuthEnabled": [
                4
            ],
            "isPublicInviteLinkEnabled": [
                4
            ],
            "isTwoFactorAuthenticationEnforced": [
                4
            ],
            "logo": [
                1
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                6
            ],
            "workspaceDiscoverability": [
                694
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                337
            ],
            "workspaceMemberId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                285
            ],
            "roleId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                552
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                623
            ],
            "id": [
                552
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                623
            ],
            "groups": [
                624
            ],
            "widgetId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                408
            ],
            "roleId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpsertPermissionFlagsInput": {
            "permissionFlagKeys": [
                1
            ],
            "roleId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                552
            ],
            "predicateGroups": [
                477
            ],
            "predicates": [
                479
            ],
            "roleId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                476
            ],
            "predicates": [
                475
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                634
            ],
            "viewFields": [
                631
            ],
            "viewFilterGroups": [
                632
            ],
            "viewFilters": [
                633
            ],
            "viewSorts": [
                635
            ],
            "widgetId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                27
            ],
            "fieldMetadataId": [
                552
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "size": [
                6
            ],
            "viewFieldId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                552
            ],
            "logicalOperator": [
                671
            ],
            "parentViewFilterGroupId": [
                552
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "operand": [
                672
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                552
            ],
            "subFieldName": [
                1
            ],
            "value": [
                337
            ],
            "viewFilterGroupId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                552
            ],
            "calendarFieldMetadataId": [
                552
            ],
            "calendarLayout": [
                665
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                552
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                552
            ],
            "openRecordIn": [
                675
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                678
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                677
            ],
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                221
            ],
            "periodStart": [
                221
            ],
            "timeSeries": [
                649
            ],
            "usageByApplication": [
                638
            ],
            "usageByModel": [
                638
            ],
            "usageByOperationType": [
                638
            ],
            "usageByUser": [
                638
            ],
            "userDailyUsage": [
                651
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                641
            ],
            "periodEnd": [
                221
            ],
            "periodStart": [
                221
            ],
            "userWorkspaceId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UsageBreakdownItem": {
            "creditsUsed": [
                6
            ],
            "key": [
                1
            ],
            "label": [
                1
            ],
            "userCreditsUsed": [
                6
            ],
            "workspaceCreditsUsed": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimit": {
            "burstValue": [
                107
            ],
            "createdAt": [
                221
            ],
            "id": [
                552
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                107
            ],
            "operationType": [
                641
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                648
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                650
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                650
            ],
            "operationType": [
                641
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                640
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                644
            ],
            "resourceType": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                642
            ],
            "hasAllowancePeriod": [
                4
            ],
            "isIntraWorkspaceLimitEntitled": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaOperatorOnlyScope": {
            "operationType": [
                641
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                650
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                107
            ],
            "periodEnd": [
                221
            ],
            "periodStart": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                641
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                648
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                650
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                107
            ],
            "id": [
                552
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                107
            ],
            "operationType": [
                641
            ],
            "periodEnd": [
                221
            ],
            "periodStart": [
                221
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                107
            ],
            "resourceType": [
                648
            ],
            "spenderId": [
                1
            ],
            "spenderLabel": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                650
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                6
            ],
            "date": [
                1
            ],
            "workspaceCreditsUsed": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UsageUnit": {},
        "UsageUserDaily": {
            "dailyUsage": [
                649
            ],
            "userWorkspaceId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "User": {
            "availableWorkspaces": [
                98
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                221
            ],
            "currentUserWorkspace": [
                656
            ],
            "currentWorkspace": [
                688
            ],
            "deletedAt": [
                221
            ],
            "deletedWorkspaceMembers": [
                234
            ],
            "disabled": [
                4
            ],
            "email": [
                1
            ],
            "firstName": [
                1
            ],
            "hasPassword": [
                4
            ],
            "id": [
                552
            ],
            "isEmailVerified": [
                4
            ],
            "isWorkspaceCreator": [
                4
            ],
            "lastName": [
                1
            ],
            "locale": [
                1
            ],
            "onboardingStatus": [
                415
            ],
            "previousOnboardingStatus": [
                415
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                221
            ],
            "userVars": [
                338
            ],
            "userWorkspaces": [
                656
            ],
            "workspaceMember": [
                697
            ],
            "workspaceMembers": [
                697
            ],
            "workspaces": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "UserApplicationVariableValue": {
            "description": [
                1
            ],
            "isDeprecated": [
                4
            ],
            "isRequired": [
                4
            ],
            "isSecret": [
                4
            ],
            "key": [
                1
            ],
            "label": [
                1
            ],
            "options": [
                337
            ],
            "type": [
                1
            ],
            "value": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UserCreditsFallback": {},
        "UserSession": {
            "authProvider": [
                1
            ],
            "city": [
                1
            ],
            "country": [
                1
            ],
            "createdAt": [
                221
            ],
            "expiresAt": [
                221
            ],
            "id": [
                552
            ],
            "ipAddress": [
                1
            ],
            "isCurrent": [
                4
            ],
            "isImpersonating": [
                4
            ],
            "lastActiveAt": [
                221
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "id": [
                552
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                407
            ],
            "objectRecordsPermissions": [
                414
            ],
            "objectsPermissions": [
                407
            ],
            "permissionFlags": [
                432
            ],
            "twoFactorAuthenticationMethodSummary": [
                548
            ],
            "updatedAt": [
                221
            ],
            "user": [
                652
            ],
            "userId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                552
            ],
            "validationToken": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ValidatePasswordResetToken": {
            "email": [
                1
            ],
            "hasPassword": [
                4
            ],
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ValidationRule": {
            "description": [
                1
            ],
            "errorFieldMetadataId": [
                552
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "message": [
                1
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "VerificationRecord": {
            "key": [
                1
            ],
            "priority": [
                6
            ],
            "status": [
                1
            ],
            "type": [
                1
            ],
            "value": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "VerifyEmailAndGetLoginToken": {
            "loginToken": [
                92
            ],
            "workspaceUrls": [
                706
            ],
            "__typename": [
                1
            ]
        },
        "VerifyTwoFactorAuthenticationMethod": {
            "backupCodes": [
                1
            ],
            "success": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "VersionDistributionEntry": {
            "count": [
                10
            ],
            "version": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "View": {
            "anyFieldFilterValue": [
                1
            ],
            "applicationId": [
                552
            ],
            "calendarEndFieldMetadataId": [
                552
            ],
            "calendarFieldMetadataId": [
                552
            ],
            "calendarLayout": [
                665
            ],
            "createdAt": [
                221
            ],
            "createdByUserWorkspaceId": [
                552
            ],
            "deletedAt": [
                221
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isCompact": [
                4
            ],
            "isCustom": [
                4
            ],
            "isSystemSideEffect": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                552
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                674
            ],
            "mainGroupByFieldMetadataId": [
                552
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                552
            ],
            "openRecordIn": [
                675
            ],
            "position": [
                6
            ],
            "shouldDisplayGroupsAsTabs": [
                4
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                678
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "viewFieldGroups": [
                668
            ],
            "viewFields": [
                667
            ],
            "viewFilterGroups": [
                670
            ],
            "viewFilters": [
                669
            ],
            "viewGroups": [
                673
            ],
            "viewSorts": [
                676
            ],
            "visibility": [
                679
            ],
            "workspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                27
            ],
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isOverridden": [
                4
            ],
            "isSystemSideEffect": [
                4
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "size": [
                6
            ],
            "universalIdentifier": [
                552
            ],
            "updatedAt": [
                221
            ],
            "viewFieldGroupId": [
                552
            ],
            "viewId": [
                552
            ],
            "workspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "id": [
                552
            ],
            "isActive": [
                4
            ],
            "isOverridden": [
                4
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "updatedAt": [
                221
            ],
            "viewFields": [
                667
            ],
            "viewId": [
                552
            ],
            "workspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "operand": [
                672
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                552
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                221
            ],
            "value": [
                337
            ],
            "viewFilterGroupId": [
                552
            ],
            "viewId": [
                552
            ],
            "workspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "id": [
                552
            ],
            "logicalOperator": [
                671
            ],
            "parentViewFilterGroupId": [
                552
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                221
            ],
            "viewId": [
                552
            ],
            "workspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "fieldValue": [
                1
            ],
            "id": [
                552
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                221
            ],
            "viewId": [
                552
            ],
            "workspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "direction": [
                677
            ],
            "fieldMetadataId": [
                552
            ],
            "id": [
                552
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                221
            ],
            "viewId": [
                552
            ],
            "workspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "ViewSortDirection": {},
        "ViewType": {},
        "ViewVisibility": {},
        "Webhook": {
            "applicationId": [
                552
            ],
            "createdAt": [
                221
            ],
            "deletedAt": [
                221
            ],
            "description": [
                1
            ],
            "id": [
                552
            ],
            "operations": [
                1
            ],
            "role": [
                472
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                26
            ],
            "on_BarChartConfiguration": [
                101
            ],
            "on_CalendarConfiguration": [
                142
            ],
            "on_CallRecordingSummaryConfiguration": [
                143
            ],
            "on_CallRecordingTranscriptConfiguration": [
                144
            ],
            "on_ChatConfiguration": [
                152
            ],
            "on_ChatThreadsConfiguration": [
                155
            ],
            "on_EmailThreadConfiguration": [
                250
            ],
            "on_EmailsConfiguration": [
                254
            ],
            "on_FieldConfiguration": [
                278
            ],
            "on_FieldRichTextConfiguration": [
                286
            ],
            "on_FieldsConfiguration": [
                287
            ],
            "on_FilesConfiguration": [
                293
            ],
            "on_FormFieldConfiguration": [
                296
            ],
            "on_FrontComponentConfiguration": [
                298
            ],
            "on_IframeConfiguration": [
                318
            ],
            "on_LineChartConfiguration": [
                341
            ],
            "on_MessageCampaignBodyConfiguration": [
                366
            ],
            "on_MessageCampaignDetailsConfiguration": [
                367
            ],
            "on_NotesConfiguration": [
                398
            ],
            "on_PieChartConfiguration": [
                433
            ],
            "on_RecordTableConfiguration": [
                462
            ],
            "on_StandaloneRichTextConfiguration": [
                517
            ],
            "on_TasksConfiguration": [
                527
            ],
            "on_TimelineConfiguration": [
                531
            ],
            "on_ViewConfiguration": [
                666
            ],
            "on_WorkflowConfiguration": [
                685
            ],
            "on_WorkflowRunConfiguration": [
                686
            ],
            "on_WorkflowVersionConfiguration": [
                687
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowActionType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                689
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                35
            ],
            "aiChatAssistantProfile": [
                29
            ],
            "aiChatDirectMessageAssistantMode": [
                28
            ],
            "aiChatInboxAssistantMode": [
                28
            ],
            "aiChatModelTier": [
                35
            ],
            "aiDataPolicy": [
                33
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                337
            ],
            "allowImpersonation": [
                4
            ],
            "allowedEmbeddingOrigins": [
                1
            ],
            "billingCustomer": [
                109
            ],
            "billingEntitlements": [
                111
            ],
            "billingSubscriptions": [
                128
            ],
            "createdAt": [
                221
            ],
            "currentBillingSubscription": [
                128
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                472
            ],
            "deletedAt": [
                221
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                6
            ],
            "featureFlags": [
                275
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                552
            ],
            "iframeMediaPermissions": [
                319
            ],
            "installedApplications": [
                53
            ],
            "inviteHash": [
                1
            ],
            "isAutoModelSelectionEnabled": [
                4
            ],
            "isCampaignClickTrackingEnabled": [
                4
            ],
            "isCampaignOpenTrackingEnabled": [
                4
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "isGoogleAuthBypassEnabled": [
                4
            ],
            "isGoogleAuthEnabled": [
                4
            ],
            "isInternalMessagesImportEnabled": [
                4
            ],
            "isMicrosoftAuthBypassEnabled": [
                4
            ],
            "isMicrosoftAuthEnabled": [
                4
            ],
            "isPasswordAuthBypassEnabled": [
                4
            ],
            "isPasswordAuthEnabled": [
                4
            ],
            "isPublicInviteLinkEnabled": [
                4
            ],
            "isTrialAvailable": [
                4
            ],
            "isTwoFactorAuthenticationEnforced": [
                4
            ],
            "logo": [
                1
            ],
            "logoFileId": [
                552
            ],
            "metadataVersion": [
                6
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                6
            ],
            "updatedAt": [
                221
            ],
            "viewFields": [
                667
            ],
            "viewFilterGroups": [
                670
            ],
            "viewFilters": [
                669
            ],
            "viewGroups": [
                673
            ],
            "viewSorts": [
                676
            ],
            "views": [
                664
            ],
            "workspaceCustomApplication": [
                53
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                694
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                706
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceActivationStatus": {},
        "WorkspaceAiStats": {
            "conversationsCount": [
                10
            ],
            "skillsCount": [
                10
            ],
            "toolsCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCompanyEnrichmentOutcome": {},
        "WorkspaceCompanyEnrichmentResult": {
            "enrichment": [
                337
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                691
            ],
            "personEnrichment": [
                337
            ],
            "personOutcome": [
                704
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCreationDefaultsDTO": {
            "displayName": [
                1
            ],
            "subdomain": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceDiscoverability": {},
        "WorkspaceInvitation": {
            "email": [
                1
            ],
            "expiresAt": [
                221
            ],
            "id": [
                552
            ],
            "roleId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInviteHashValid": {
            "isValid": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMember": {
            "avatarUrl": [
                1
            ],
            "calendarStartDay": [
                10
            ],
            "colorScheme": [
                1
            ],
            "dateFormat": [
                699
            ],
            "id": [
                552
            ],
            "locale": [
                1
            ],
            "name": [
                300
            ],
            "numberFormat": [
                700
            ],
            "openRecordIn": [
                418
            ],
            "roles": [
                472
            ],
            "timeFormat": [
                701
            ],
            "timeZone": [
                1
            ],
            "uiScale": [
                1
            ],
            "userEmail": [
                1
            ],
            "userId": [
                552
            ],
            "userWorkspaceId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                552
            ],
            "variables": [
                653
            ],
            "workspaceMemberId": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberDateFormatEnum": {},
        "WorkspaceMemberNumberFormatEnum": {},
        "WorkspaceMemberTimeFormatEnum": {},
        "WorkspaceMigration": {
            "actions": [
                337
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceNameAndId": {
            "displayName": [
                1
            ],
            "id": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "WorkspacePersonEnrichmentOutcome": {},
        "WorkspaceSetupChatOutcome": {},
        "WorkspaceUrls": {
            "customUrl": [
                1
            ],
            "subdomainUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceUrlsAndId": {
            "id": [
                552
            ],
            "workspaceUrls": [
                706
            ],
            "__typename": [
                1
            ]
        }
    }
}