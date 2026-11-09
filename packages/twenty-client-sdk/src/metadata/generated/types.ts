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
        62,
        70,
        80,
        86,
        99,
        103,
        104,
        106,
        111,
        117,
        123,
        128,
        134,
        137,
        138,
        139,
        140,
        148,
        150,
        164,
        168,
        170,
        172,
        219,
        220,
        247,
        251,
        252,
        254,
        265,
        271,
        275,
        279,
        282,
        289,
        306,
        308,
        314,
        316,
        329,
        336,
        337,
        338,
        350,
        352,
        369,
        370,
        371,
        372,
        373,
        374,
        376,
        377,
        378,
        381,
        382,
        384,
        387,
        392,
        396,
        405,
        412,
        414,
        417,
        421,
        422,
        427,
        431,
        454,
        456,
        457,
        465,
        477,
        479,
        484,
        489,
        509,
        521,
        522,
        524,
        549,
        551,
        553,
        618,
        638,
        645,
        647,
        651,
        662,
        668,
        669,
        671,
        672,
        674,
        675,
        676,
        679,
        680,
        681,
        686,
        688,
        691,
        696,
        697,
        698,
        701,
        702
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
                336
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
                549
            ],
            "createdAt": [
                220
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                336
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
                336
            ],
            "roleId": [
                549
            ],
            "triggers": [
                336
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "applicationId": [
                549
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                549
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
                549
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
                549
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                336
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
                220
            ],
            "deletedAt": [
                220
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
                220
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                220
            ],
            "id": [
                549
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                220
            ],
            "lastReadAt": [
                220
            ],
            "mentionsResolvedAt": [
                220
            ],
            "snoozedUntil": [
                220
            ],
            "threadId": [
                549
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                549
            ],
            "createdAt": [
                220
            ],
            "id": [
                549
            ],
            "parts": [
                22
            ],
            "processedAt": [
                220
            ],
            "reactions": [
                23
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                549
            ],
            "senderWorkspaceMemberId": [
                549
            ],
            "status": [
                1
            ],
            "threadId": [
                549
            ],
            "turnId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                220
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                549
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                549
            ],
            "messageId": [
                549
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                336
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
                336
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                336
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
                549
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                220
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
                220
            ],
            "errorMessage": [
                1
            ],
            "id": [
                549
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
                220
            ],
            "status": [
                25
            ],
            "threadId": [
                549
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
                549
            ],
            "aggregateOperation": [
                27
            ],
            "configurationType": [
                679
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                336
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "label": [
                1
            ],
            "numberFormat": [
                150
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                449
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
                106
            ],
            "kind": [
                1
            ],
            "limitValue": [
                106
            ],
            "periodEnd": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                106
            ],
            "limitValue": [
                106
            ],
            "periodEnd": [
                220
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
                220
            ],
            "expiresAt": [
                220
            ],
            "id": [
                549
            ],
            "name": [
                1
            ],
            "revokedAt": [
                220
            ],
            "role": [
                471
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                220
            ],
            "id": [
                549
            ],
            "name": [
                1
            ],
            "revokedAt": [
                220
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
                168
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
                336
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                549
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
                220
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
                549
            ],
            "role": [
                378
            ],
            "workspaceMemberId": [
                549
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
                82
            ],
            "applicationRegistrationId": [
                549
            ],
            "applicationVariables": [
                85
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                336
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                163
            ],
            "createdAt": [
                220
            ],
            "defaultLogicFunctionRole": [
                471
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                296
            ],
            "grantedIframeMediaPermissions": [
                318
            ],
            "healthCheckLogicFunctionId": [
                549
            ],
            "id": [
                549
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                349
            ],
            "logoFileId": [
                549
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                398
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                549
            ],
            "requestedIframeMediaPermissions": [
                318
            ],
            "runOnUserPreferences": [
                4
            ],
            "settingsCustomTabFrontComponentId": [
                549
            ],
            "settingsMenuItems": [
                508
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                549
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                220
            ],
            "id": [
                549
            ],
            "lastAuthorizedAt": [
                220
            ],
            "lastUsedAt": [
                220
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                549
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                549
            ],
            "archivedAt": [
                220
            ],
            "authFailedAt": [
                220
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                445
            ],
            "connectionProviderId": [
                549
            ],
            "createdAt": [
                220
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                549
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                220
            ],
            "lastSignedInAt": [
                220
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                168
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                220
            ],
            "userWorkspaceId": [
                549
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
                549
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
                172
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
        "ApplicationExport": {
            "application": [
                60
            ],
            "coverage": [
                61
            ],
            "files": [
                63
            ],
            "manifest": [
                336
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
                80
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
                62
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
                549
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
                289
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
                289
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
                220
            ],
            "fileFolder": [
                289
            ],
            "fileId": [
                549
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
                68
            ],
            "description": [
                1
            ],
            "status": [
                70
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
                72
            ],
            "bucketSizeInSeconds": [
                10
            ],
            "creditUsage": [
                73
            ],
            "creditsUsed": [
                6
            ],
            "failedRunCount": [
                10
            ],
            "functions": [
                74
            ],
            "issues": [
                75
            ],
            "lifecycle": [
                76
            ],
            "lifecycleFailureCount": [
                10
            ],
            "lookbackInHours": [
                10
            ],
            "periodEnd": [
                220
            ],
            "periodStart": [
                220
            ],
            "rateLimitEventCount": [
                10
            ],
            "runCount": [
                10
            ],
            "versions": [
                77
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                220
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
                220
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
                220
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
                220
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
                549
            ],
            "connectionProviders": [
                57
            ],
            "hasUserHealthCheck": [
                4
            ],
            "settingsMenuItems": [
                508
            ],
            "variables": [
                650
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                220
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                549
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
                549
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                80
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                220
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
                217
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
                660
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                549
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                80
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                220
            ],
            "description": [
                1
            ],
            "id": [
                549
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
                336
            ],
            "type": [
                1
            ],
            "updatedAt": [
                220
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
                91
            ],
            "applicationRefreshToken": [
                91
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
                549
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
                336
            ],
            "scope": [
                86
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
                220
            ],
            "domain": [
                1
            ],
            "id": [
                549
            ],
            "isValidated": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ArchiveInboxThreadInput": {
            "threadId": [
                549
            ],
            "workspaceMemberIds": [
                549
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
                488
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                220
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
                91
            ],
            "refreshToken": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                92
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
                549
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
                487
            ],
            "workspaceUrls": [
                703
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                96
            ],
            "availableWorkspacesForSignUp": [
                96
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                97
            ],
            "tokens": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                549
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                99
            ],
            "color": [
                1
            ],
            "configurationType": [
                679
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
                336
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupMode": [
                103
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                104
            ],
            "numberFormat": [
                150
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                412
            ],
            "primaryAxisGroupByFieldMetadataId": [
                549
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                314
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                412
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                549
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                314
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
                336
            ],
            "formattedToRawLookup": [
                336
            ],
            "groupMode": [
                103
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
                104
            ],
            "series": [
                105
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
                336
            ],
            "objectMetadataId": [
                549
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
                132
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
                549
            ],
            "userCreditsFallback": [
                651
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
                127
            ],
            "currentBillingSubscription": [
                127
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                111
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
                124
            ],
            "name": [
                1
            ],
            "prices": [
                118
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
                124
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
                112
            ],
            "downgradePlanKeys": [
                117
            ],
            "isCheckoutDefault": [
                4
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                113
            ],
            "planKey": [
                117
            ],
            "resourceCreditProducts": [
                112
            ],
            "upgradePlanKeys": [
                117
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
                134
            ],
            "recurringInterval": [
                521
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
                134
            ],
            "recurringInterval": [
                521
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                120
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
                124
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
                124
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                112
            ],
            "on_BillingMeteredProduct": [
                113
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
                117
            ],
            "priceUsageBased": [
                134
            ],
            "productKey": [
                123
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                220
            ],
            "periodStart": [
                220
            ],
            "productKey": [
                123
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
                129
            ],
            "cancelAt": [
                220
            ],
            "collectionMethod": [
                128
            ],
            "currentPeriodEnd": [
                220
            ],
            "hasUserCredits": [
                4
            ],
            "id": [
                549
            ],
            "interval": [
                521
            ],
            "metadata": [
                336
            ],
            "phases": [
                130
            ],
            "status": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                122
            ],
            "creditAmount": [
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                549
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
                131
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
                127
            ],
            "currentBillingSubscription": [
                127
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
                549
            ],
            "contactAutoCreationPolicy": [
                137
            ],
            "createdAt": [
                220
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                549
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                138
            ],
            "syncStageStartedAt": [
                220
            ],
            "syncStatus": [
                139
            ],
            "syncedAt": [
                220
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                220
            ],
            "visibility": [
                140
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
                679
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                679
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
                148
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
                679
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                336
            ],
            "error": [
                153
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
                679
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
                392
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                394
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
                157
            ],
            "aiModelTiers": [
                159
            ],
            "aiModels": [
                158
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
                90
            ],
            "billing": [
                107
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                147
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
                161
            ],
            "publicFeatureFlags": [
                443
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                506
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                523
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                220
            ],
            "link": [
                1
            ],
            "startAt": [
                220
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
                549
            ],
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                549
            ],
            "availabilityType": [
                164
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                549
            ],
            "createdAt": [
                220
            ],
            "engineComponentKey": [
                254
            ],
            "frontComponent": [
                296
            ],
            "frontComponentId": [
                549
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                549
            ],
            "pageLayoutId": [
                549
            ],
            "payload": [
                165
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                220
            ],
            "workflowVersionId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                404
            ],
            "on_PathCommandMenuItemPayload": [
                429
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                64
            ],
            "files": [
                287
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                549
            ],
            "archivedAt": [
                220
            ],
            "authFailedAt": [
                220
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                445
            ],
            "connectionProviderId": [
                549
            ],
            "createdAt": [
                220
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                549
            ],
            "lastCredentialsRefreshedAt": [
                220
            ],
            "lastSignedInAt": [
                220
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                168
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                220
            ],
            "userWorkspaceId": [
                549
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
                321
            ],
            "handle": [
                1
            ],
            "id": [
                549
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                247
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "CreateAgentInput": {
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
                336
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
                336
            ],
            "roleId": [
                549
            ],
            "triggers": [
                336
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                549
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                549
            ],
            "participantHandleFieldUniversalIdentifier": [
                549
            ],
            "visibility": [
                374
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                65
            ],
            "targets": [
                67
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                79
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
                549
            ],
            "availabilityType": [
                164
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                549
            ],
            "engineComponentKey": [
                254
            ],
            "frontComponentId": [
                549
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
                549
            ],
            "pageLayoutId": [
                549
            ],
            "payload": [
                336
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                549
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
                368
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
                336
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
                336
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                549
            ],
            "options": [
                336
            ],
            "relationCreationPayload": [
                336
            ],
            "settings": [
                336
            ],
            "type": [
                282
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
                549
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
                549
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
                189
            ],
            "indexType": [
                329
            ],
            "objectMetadataId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                336
            ],
            "databaseEventTriggerSettings": [
                336
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                336
            ],
            "id": [
                549
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                336
            ],
            "source": [
                336
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                336
            ],
            "universalIdentifier": [
                549
            ],
            "workflowActionTriggerSettings": [
                336
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                549
            ],
            "id": [
                549
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                549
            ],
            "color": [
                1
            ],
            "folderId": [
                549
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                549
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                549
            ],
            "targetRecordId": [
                549
            ],
            "type": [
                396
            ],
            "userWorkspaceId": [
                549
            ],
            "viewId": [
                549
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
                336
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
                187
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                190
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                195
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
                549
            ],
            "type": [
                422
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                421
            ],
            "pageLayoutId": [
                549
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
                336
            ],
            "objectMetadataId": [
                549
            ],
            "pageLayoutTabId": [
                549
            ],
            "position": [
                336
            ],
            "title": [
                1
            ],
            "type": [
                680
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                549
            ],
            "filter": [
                336
            ],
            "objectMetadataId": [
                549
            ],
            "orderBy": [
                336
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                549
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                549
            ],
            "secondFieldMetadataId": [
                549
            ],
            "thirdFieldMetadataId": [
                549
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
                549
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
                553
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                106
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                106
            ],
            "operationType": [
                638
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                645
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                647
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
                549
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                549
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
                549
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
                549
            ],
            "id": [
                549
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
                549
            ],
            "viewId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                549
            ],
            "logicalOperator": [
                668
            ],
            "parentViewFilterGroupId": [
                549
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                549
            ],
            "id": [
                549
            ],
            "operand": [
                669
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                549
            ],
            "subFieldName": [
                1
            ],
            "value": [
                336
            ],
            "viewFilterGroupId": [
                549
            ],
            "viewId": [
                549
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
                549
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                549
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
                549
            ],
            "calendarFieldMetadataId": [
                549
            ],
            "calendarLayout": [
                662
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                549
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                549
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                671
            ],
            "mainGroupByFieldMetadataId": [
                549
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                549
            ],
            "openRecordIn": [
                672
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                675
            ],
            "visibility": [
                676
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                674
            ],
            "fieldMetadataId": [
                549
            ],
            "id": [
                549
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                549
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
                549
            ],
            "operations": [
                1
            ],
            "roleId": [
                549
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
                638
            ],
            "resource": [
                645
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                170
            ],
            "before": [
                170
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                549
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                549
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
                549
            ],
            "name": [
                299
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                549
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
                549
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                240
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
                549
            ],
            "pageLayoutId": [
                549
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
                549
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
                549
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                489
            ],
            "type": [
                316
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                549
            ],
            "status": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                171
            ],
            "IMAP": [
                171
            ],
            "SMTP": [
                171
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
                679
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                220
            ],
            "domain": [
                1
            ],
            "id": [
                549
            ],
            "status": [
                251
            ],
            "tenantStatus": [
                252
            ],
            "unsubscribeHostnameStatus": [
                551
            ],
            "updatedAt": [
                220
            ],
            "verificationRecords": [
                657
            ],
            "verifiedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                679
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
                336
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
                336
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
                256
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                336
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
                260
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
                220
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
                220
            ],
            "currentPeriodEnd": [
                220
            ],
            "expiresAt": [
                220
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
                220
            ],
            "start": [
                220
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
                265
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
                263
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                264
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
                266
            ],
            "first": [
                10
            ],
            "table": [
                271
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                267
            ],
            "records": [
                270
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
                336
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                220
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
                383
            ],
            "objectRecordEventsWithQueryIds": [
                411
            ],
            "queueJobEvents": [
                339
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                549
            ],
            "payload": [
                336
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                275
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
                549
            ],
            "createdAt": [
                220
            ],
            "defaultValue": [
                336
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
                549
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
                549
            ],
            "morphRelations": [
                464
            ],
            "name": [
                1
            ],
            "object": [
                398
            ],
            "objectMetadataId": [
                549
            ],
            "options": [
                336
            ],
            "relation": [
                464
            ],
            "settings": [
                336
            ],
            "type": [
                282
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                679
            ],
            "fieldDisplayMode": [
                279
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
                280
            ],
            "pageInfo": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                170
            ],
            "node": [
                276
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                281
            ],
            "id": [
                550
            ],
            "isActive": [
                135
            ],
            "isSystem": [
                135
            ],
            "isUIEditable": [
                135
            ],
            "isUIReadOnly": [
                135
            ],
            "objectMetadataId": [
                550
            ],
            "or": [
                281
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
                549
            ],
            "id": [
                549
            ],
            "objectMetadataId": [
                549
            ],
            "roleId": [
                549
            ],
            "rowLevelPermissionPredicateGroupId": [
                549
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
                549
            ],
            "objectMetadataId": [
                549
            ],
            "rowLevelPermissionPredicateGroupId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                679
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
                220
            ],
            "id": [
                549
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
                549
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
                220
            ],
            "fileId": [
                549
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
                220
            ],
            "id": [
                549
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
                679
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                549
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                489
            ],
            "type": [
                316
            ],
            "workspace": [
                700
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
                381
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                679
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
                318
            ],
            "applicationId": [
                549
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                84
            ],
            "applicationVariables": [
                336
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
                220
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                549
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
                549
            ],
            "updatedAt": [
                220
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                298
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                679
            ],
            "frontComponentId": [
                549
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                549
            ],
            "pageLayoutType": [
                422
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
                483
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                336
            ],
            "runId": [
                549
            ],
            "scope": [
                336
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
                336
            ],
            "runId": [
                549
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
                549
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
                549
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
                549
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
                306
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                306
            ],
            "snoozedUntil": [
                1
            ],
            "steps": [
                307
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                306
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
                308
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
                311
            ],
            "stepActionKey": [
                306
            ],
            "trigger": [
                312
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
                681
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
                549
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
                679
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
                322
            ],
            "IMAP": [
                322
            ],
            "SMTP": [
                322
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
                247
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
                91
            ],
            "workspace": [
                704
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
                549
            ],
            "threadId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                549
            ],
            "createdAt": [
                220
            ],
            "id": [
                549
            ],
            "indexFieldMetadataList": [
                327
            ],
            "indexType": [
                329
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
                220
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                170
            ],
            "node": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                220
            ],
            "fieldMetadataId": [
                549
            ],
            "id": [
                549
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                328
            ],
            "id": [
                550
            ],
            "isCustom": [
                135
            ],
            "or": [
                328
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                549
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
                332
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
                549
            ],
            "messageThreadId": [
                549
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
                338
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                549
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                99
            ],
            "color": [
                1
            ],
            "configurationType": [
                679
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
                336
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
                150
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                412
            ],
            "primaryAxisGroupByFieldMetadataId": [
                549
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                314
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                412
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                549
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                314
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
                336
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                344
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
                336
            ],
            "objectMetadataId": [
                549
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
                343
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
                168
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                549
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
                549
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                220
            ],
            "cronTriggerSettings": [
                336
            ],
            "databaseEventTriggerSettings": [
                336
            ],
            "description": [
                1
            ],
            "executionMode": [
                350
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                336
            ],
            "id": [
                549
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
                336
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                220
            ],
            "workflowActionTriggerSettings": [
                336
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                336
            ],
            "duration": [
                6
            ],
            "error": [
                336
            ],
            "logs": [
                1
            ],
            "status": [
                352
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                549
            ],
            "applicationUniversalIdentifier": [
                549
            ],
            "id": [
                549
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                91
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
                336
            ],
            "name": [
                1
            ],
            "objects": [
                359
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "requestedIframeMediaPermissions": [
                318
            ],
            "roles": [
                360
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                80
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
                361
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                362
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
                549
            ],
            "connectionProviderId": [
                549
            ],
            "createdAt": [
                220
            ],
            "id": [
                549
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
                364
            ],
            "toolsSyncError": [
                1
            ],
            "toolsSyncedAt": [
                220
            ],
            "updatedAt": [
                220
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
                336
            ],
            "description": [
                1
            ],
            "inputSchema": [
                336
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
                679
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                679
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
                167
            ],
            "connectedAccountId": [
                549
            ],
            "contactAutoCreationPolicy": [
                369
            ],
            "createdAt": [
                220
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
                549
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
                376
            ],
            "messagingProviderUniversalIdentifier": [
                549
            ],
            "participantHandleFieldUniversalIdentifier": [
                549
            ],
            "pendingGroupEmailsAction": [
                370
            ],
            "syncStage": [
                371
            ],
            "syncStageStartedAt": [
                220
            ],
            "syncStatus": [
                372
            ],
            "syncedAt": [
                220
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                220
            ],
            "type": [
                373
            ],
            "updatedAt": [
                220
            ],
            "visibility": [
                374
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
                220
            ],
            "externalId": [
                1
            ],
            "id": [
                549
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                549
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                377
            ],
            "updatedAt": [
                220
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
                220
            ],
            "emailAddress": [
                1
            ],
            "id": [
                549
            ],
            "reason": [
                381
            ],
            "source": [
                382
            ],
            "unsubscribeTopicId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                379
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
                410
            ],
            "recordId": [
                1
            ],
            "type": [
                384
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
                549
            ],
            "property": [
                1
            ],
            "provenance": [
                387
            ],
            "recordId": [
                549
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
                549
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                162
            ],
            "objectMetadataItems": [
                390
            ],
            "views": [
                391
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
                549
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
                549
            ],
            "key": [
                671
            ],
            "objectMetadataId": [
                549
            ],
            "type": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                515,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                685,
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
                        549,
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
                        549,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        319,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "archiveInboxThread": [
                4,
                {
                    "input": [
                        88,
                        "ArchiveInboxThreadInput!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        549
                    ],
                    "threadId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        549,
                        "UUID!"
                    ],
                    "roleId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        549,
                        "UUID!"
                    ],
                    "roleId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        324,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                94,
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
                146,
                {
                    "input": [
                        145,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                133
            ],
            "cancelSwitchBillingPlan": [
                133
            ],
            "cancelSwitchResourceCreditPrice": [
                133
            ],
            "checkCustomDomainValidRecords": [
                241
            ],
            "checkPublicDomainValidRecords": [
                241,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                126,
                {
                    "plan": [
                        117,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        521,
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
                79,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                79,
                {
                    "fileId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                166,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        549,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                416,
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
                291,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                291,
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
                291,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                291,
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
                        173,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                43,
                {
                    "input": [
                        175,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                368,
                {
                    "input": [
                        176,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                177,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        66,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                178,
                {
                    "input": [
                        179,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                87,
                {
                    "input": [
                        180,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                115
            ],
            "createCalendarEvent": [
                182,
                {
                    "input": [
                        181,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                17,
                {
                    "channelId": [
                        549
                    ]
                }
            ],
            "createCommandMenuItem": [
                163,
                {
                    "input": [
                        183,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                239,
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
                185,
                {
                    "input": [
                        184,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                250,
                {
                    "input": [
                        186,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                290,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        289,
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
                296,
                {
                    "input": [
                        188,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                395,
                {
                    "inputs": [
                        194,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                665,
                {
                    "inputs": [
                        209,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                664,
                {
                    "inputs": [
                        210,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                670,
                {
                    "inputs": [
                        213,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                363,
                {
                    "input": [
                        192,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                379,
                {
                    "input": [
                        193,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                395,
                {
                    "input": [
                        194,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                290,
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
                512,
                {
                    "input": [
                        510,
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
                        549,
                        "UUID!"
                    ],
                    "properties": [
                        336
                    ],
                    "recordId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        174,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                276,
                {
                    "input": [
                        196,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                325,
                {
                    "input": [
                        197,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                349,
                {
                    "input": [
                        191,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                398,
                {
                    "input": [
                        198,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                471,
                {
                    "createRoleInput": [
                        204,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                419,
                {
                    "input": [
                        199,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                420,
                {
                    "input": [
                        200,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                423,
                {
                    "input": [
                        201,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                442,
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
                463,
                {
                    "input": [
                        203,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                512,
                {
                    "input": [
                        511,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                515,
                {
                    "input": [
                        205,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                115,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        117,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        521,
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
                552,
                {
                    "input": [
                        206,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                636,
                {
                    "input": [
                        207,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                656,
                {
                    "input": [
                        208,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                661,
                {
                    "input": [
                        214,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                664,
                {
                    "input": [
                        210,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                665,
                {
                    "input": [
                        209,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                666,
                {
                    "input": [
                        212,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                667,
                {
                    "input": [
                        211,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                670,
                {
                    "input": [
                        213,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                673,
                {
                    "input": [
                        215,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                677,
                {
                    "input": [
                        216,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                515,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        549,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        549
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
                368,
                {
                    "id": [
                        549,
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
                        221,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                163,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                167,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                685
            ],
            "deleteEmailGroupChannel": [
                368,
                {
                    "id": [
                        549,
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
                296,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                395,
                {
                    "ids": [
                        549,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                363,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                395,
                {
                    "id": [
                        549,
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
                276,
                {
                    "input": [
                        222,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                325,
                {
                    "input": [
                        223,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                349,
                {
                    "input": [
                        353,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                398,
                {
                    "input": [
                        224,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        549,
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
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                463,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                225,
                {
                    "input": [
                        226,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                515,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                227,
                {
                    "twoFactorAuthenticationMethodId": [
                        549,
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
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                649
            ],
            "deleteUserFromWorkspace": [
                653,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                656,
                {
                    "id": [
                        549,
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
                664,
                {
                    "input": [
                        229,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                665,
                {
                    "input": [
                        228,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                666,
                {
                    "input": [
                        230,
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
                670,
                {
                    "input": [
                        231,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        232,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                677,
                {
                    "id": [
                        549,
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
                664,
                {
                    "input": [
                        235,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                665,
                {
                    "input": [
                        234,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                666,
                {
                    "input": [
                        236,
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
                670,
                {
                    "input": [
                        237,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        238,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
                {
                    "input": [
                        324,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                167,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                242,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                243,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                244,
                {
                    "input": [
                        245,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                248,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        549
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                109
            ],
            "enqueueJob": [
                257,
                {
                    "input": [
                        255,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                259,
                {
                    "input": [
                        258,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                689
            ],
            "executeOneLogicFunction": [
                351,
                {
                    "input": [
                        273,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                301,
                {
                    "input": [
                        300,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                45,
                {
                    "apiKeyId": [
                        549,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                84,
                {
                    "applicationId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                91
            ],
            "generateTransientToken": [
                532
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                546,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                93,
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
                93,
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
                93,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                547,
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
                303,
                {
                    "input": [
                        304,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                356,
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
                415
            ],
            "grantApplicationCapabilities": [
                55,
                {
                    "input": [
                        313,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                323,
                {
                    "userId": [
                        549,
                        "UUID!"
                    ],
                    "workspaceId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                331,
                {
                    "input": [
                        330,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                333,
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
                333
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
                        549,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        549
                    ],
                    "threadId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                549,
                {
                    "workspaceMemberId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                309,
                {
                    "stepActionKey": [
                        306,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                261
            ],
            "removeAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        466,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                458,
                {
                    "principal": [
                        455,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        462,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                84,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                93,
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
                        549,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        467,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                468,
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
                502,
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
                163,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                420,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                423,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                527,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                494,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        549,
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
                        469,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                473,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                485,
                {
                    "input": [
                        481,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                69,
                {
                    "applicationId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                69,
                {
                    "applicationId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                320,
                {
                    "connectionParameters": [
                        246,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        549
                    ]
                }
            ],
            "sendAppChannelMessage": [
                493,
                {
                    "input": [
                        492,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                494,
                {
                    "browsingContext": [
                        336
                    ],
                    "channelId": [
                        549
                    ],
                    "fileAttachments": [
                        288,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        4
                    ],
                    "isAssistantParticipant": [
                        4
                    ],
                    "mentionedWorkspaceMemberIds": [
                        549,
                        "[UUID!]"
                    ],
                    "messageId": [
                        549,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "recipientWorkspaceMemberIds": [
                        549,
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
                        549,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                497,
                {
                    "input": [
                        496,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                501,
                {
                    "input": [
                        500,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                502,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        549
                    ]
                }
            ],
            "sendMessageCampaign": [
                504,
                {
                    "input": [
                        503,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                499,
                {
                    "input": [
                        505,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                47,
                {
                    "input": [
                        507,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                114,
                {
                    "partnerCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                261,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                458,
                {
                    "isPrivate": [
                        4,
                        "Boolean!"
                    ],
                    "target": [
                        462,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                458,
                {
                    "accessLevel": [
                        454,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        455,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        462,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                133,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                98,
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
                98,
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
                513,
                {
                    "input": [
                        514
                    ]
                }
            ],
            "signUpInWorkspace": [
                513,
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
                        549
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
                416,
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
                        220,
                        "DateTime!"
                    ],
                    "threadId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                149,
                {
                    "connectedAccountId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                517,
                {
                    "companyContext": [
                        336
                    ],
                    "personContext": [
                        336
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                518
            ],
            "switchBillingPlan": [
                133,
                {
                    "plan": [
                        117
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                133
            ],
            "syncAppMessageFolders": [
                375,
                {
                    "input": [
                        525,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                699,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        336,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "syncMcpServerTools": [
                363,
                {
                    "id": [
                        549,
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
                        336
                    ],
                    "type": [
                        41,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                79,
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
                534,
                {
                    "input": [
                        533,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                538,
                {
                    "input": [
                        535,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                537,
                {
                    "input": [
                        536,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                542,
                {
                    "input": [
                        539,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                541,
                {
                    "input": [
                        540,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                544,
                {
                    "input": [
                        543,
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
                        549,
                        "UUID!"
                    ],
                    "input": [
                        554,
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
                        220
                    ],
                    "threadIds": [
                        549,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                43,
                {
                    "input": [
                        556,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                368,
                {
                    "input": [
                        557,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                53,
                {
                    "id": [
                        549,
                        "UUID!"
                    ],
                    "input": [
                        558,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                79,
                {
                    "input": [
                        559,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                83,
                {
                    "input": [
                        561,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                136,
                {
                    "input": [
                        563,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                163,
                {
                    "input": [
                        565,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                368,
                {
                    "input": [
                        566,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                296,
                {
                    "input": [
                        568,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                305,
                {
                    "input": [
                        570,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                274,
                {
                    "input": [
                        571,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                395,
                {
                    "inputs": [
                        584,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                398,
                {
                    "inputs": [
                        585,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                670,
                {
                    "inputs": [
                        607,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                363,
                {
                    "input": [
                        574,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                368,
                {
                    "input": [
                        576,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                375,
                {
                    "input": [
                        578,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                375,
                {
                    "input": [
                        580,
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
                395,
                {
                    "input": [
                        584,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        555,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        549
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
                276,
                {
                    "input": [
                        583,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        572,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                398,
                {
                    "input": [
                        585,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                471,
                {
                    "updateRoleInput": [
                        592,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        586,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                420,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        587,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                423,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        589,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        591,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                334,
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
                515,
                {
                    "input": [
                        594,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                527,
                {
                    "input": [
                        595,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                552,
                {
                    "input": [
                        596,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                636,
                {
                    "input": [
                        597,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                108,
                {
                    "userCreditsFallback": [
                        651,
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
                656,
                {
                    "input": [
                        598,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                661,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        609,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                664,
                {
                    "input": [
                        602,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                665,
                {
                    "input": [
                        600,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                666,
                {
                    "input": [
                        605,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                667,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        604,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                670,
                {
                    "input": [
                        607,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                673,
                {
                    "input": [
                        610,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                677,
                {
                    "input": [
                        612,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                685,
                {
                    "data": [
                        616,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                685,
                {
                    "data": [
                        614,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                685,
                {
                    "data": [
                        615,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                694,
                {
                    "roleId": [
                        549,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        617,
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
                79,
                {
                    "file": [
                        618,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                287,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        618,
                        "Upload!"
                    ],
                    "fileFolder": [
                        289,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                291,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        618,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                291,
                {
                    "file": [
                        618,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                291,
                {
                    "file": [
                        618,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                291,
                {
                    "file": [
                        618,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                283,
                {
                    "upsertFieldPermissionsInput": [
                        619,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                661,
                {
                    "input": [
                        622,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                406,
                {
                    "upsertObjectPermissionsInput": [
                        623,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                472,
                {
                    "upsertPermissionFlagsInput": [
                        624,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                626,
                {
                    "input": [
                        625,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                661,
                {
                    "input": [
                        627,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                87,
                {
                    "input": [
                        654,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                658,
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
                98,
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
                250,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                659,
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
                549
            ],
            "applicationId": [
                549
            ],
            "color": [
                1
            ],
            "createdAt": [
                220
            ],
            "folderId": [
                549
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                549
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                549
            ],
            "targetRecordId": [
                549
            ],
            "targetRecordIdentifier": [
                451
            ],
            "type": [
                396
            ],
            "updatedAt": [
                220
            ],
            "userWorkspaceId": [
                549
            ],
            "viewId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                549
            ],
            "color": [
                1
            ],
            "createdAt": [
                220
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
                401,
                {
                    "filter": [
                        281,
                        "FieldFilter!"
                    ],
                    "paging": [
                        218,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                276
            ],
            "icon": [
                1
            ],
            "id": [
                549
            ],
            "imageIdentifierFieldMetadataId": [
                549
            ],
            "indexMetadataList": [
                325
            ],
            "indexMetadatas": [
                403,
                {
                    "filter": [
                        328,
                        "IndexFilter!"
                    ],
                    "paging": [
                        218,
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
                549
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
                405
            ],
            "searchFieldMetadataList": [
                491
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                400
            ],
            "pageInfo": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                170
            ],
            "node": [
                398
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                280
            ],
            "pageInfo": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                402
            ],
            "id": [
                550
            ],
            "isActive": [
                135
            ],
            "isRemote": [
                135
            ],
            "isSearchable": [
                135
            ],
            "isSystem": [
                135
            ],
            "isUICreatable": [
                135
            ],
            "isUIEditable": [
                135
            ],
            "isUIReadOnly": [
                135
            ],
            "or": [
                402
            ],
            "universalIdentifier": [
                550
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                326
            ],
            "pageInfo": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                549
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
                549
            ],
            "restrictedFields": [
                336
            ],
            "rowLevelPermissionPredicateGroups": [
                475
            ],
            "rowLevelPermissionPredicates": [
                474
            ],
            "uneditableFields": [
                549
            ],
            "unreadableFields": [
                549
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
                549
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
                219
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                410
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
                336
            ],
            "before": [
                336
            ],
            "diff": [
                336
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
                409
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
                549
            ],
            "restrictedFields": [
                336
            ],
            "rowLevelRecordsPermissions": [
                480
            ],
            "uneditableFields": [
                549
            ],
            "unreadableFields": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                414
            ],
            "previousOnboardingStatus": [
                414
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
                170
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                170
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                549
            ],
            "createdAt": [
                220
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                549
            ],
            "deletedAt": [
                220
            ],
            "id": [
                549
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
                549
            ],
            "tabs": [
                420
            ],
            "type": [
                422
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                549
            ],
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                421
            ],
            "pageLayoutId": [
                549
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                220
            ],
            "widgets": [
                423
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                318
            ],
            "applicationId": [
                549
            ],
            "applicationName": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                336
            ],
            "configuration": [
                678
            ],
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "gridPosition": [
                315
            ],
            "id": [
                549
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
                549
            ],
            "pageLayoutTabId": [
                549
            ],
            "position": [
                426
            ],
            "title": [
                1
            ],
            "type": [
                680
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                421
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
                421
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
                424
            ],
            "on_PageLayoutWidgetGridPosition": [
                425
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                428
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                427
            ],
            "index": [
                10
            ],
            "layoutMode": [
                421
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
                549
            ],
            "createdAt": [
                220
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                549
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                549
            ],
            "aggregateOperation": [
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                679
            ],
            "dateGranularity": [
                412
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
                336
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                549
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
                150
            ],
            "orderBy": [
                314
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
                435
            ],
            "formattedToRawLookup": [
                336
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
                336
            ],
            "objectMetadataId": [
                549
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
                348
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
                220
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                144
            ],
            "blockers": [
                367
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                549
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
                247
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
                549
            ],
            "createdAt": [
                220
            ],
            "domain": [
                1
            ],
            "id": [
                549
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
                275
            ],
            "metadata": [
                444
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
                441
            ],
            "IMAP": [
                441
            ],
            "SMTP": [
                441
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                89
            ],
            "authProviders": [
                90
            ],
            "displayName": [
                1
            ],
            "id": [
                549
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                703
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
                549
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
                        549,
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
                        549,
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
                        302,
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
                        345
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
                368,
                {
                    "filter": [
                        346
                    ]
                }
            ],
            "appMessageFolders": [
                375,
                {
                    "filter": [
                        347
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                56,
                {
                    "applicationId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                57,
                {
                    "applicationId": [
                        549,
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
                490,
                {
                    "applicationId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                101,
                {
                    "input": [
                        102,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                114
            ],
            "billingPlans": [
                116
            ],
            "billingPortalSession": [
                126,
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
                549,
                {
                    "calendarEventId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "agentUniversalIdentifier": [
                        549
                    ],
                    "threadId": [
                        549
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                152,
                {
                    "agentUniversalIdentifier": [
                        549
                    ],
                    "threadId": [
                        549
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
                        549,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                155,
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
                693,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                519,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                163,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                163
            ],
            "currentUser": [
                649
            ],
            "currentUserApplicationAuthorizations": [
                54
            ],
            "currentUserSessions": [
                652
            ],
            "currentWorkspace": [
                685
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
                262
            ],
            "eventLogs": [
                269,
                {
                    "input": [
                        268,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                59,
                {
                    "shouldIncludeDependencies": [
                        4
                    ],
                    "shouldIncludeSourceFiles": [
                        4
                    ],
                    "universalIdentifier": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                276,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                278,
                {
                    "filter": [
                        281,
                        "FieldFilter!"
                    ],
                    "paging": [
                        218,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                440,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                79,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                71,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        220
                    ],
                    "periodStart": [
                        220
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                81,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        220
                    ],
                    "periodStart": [
                        220
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                83,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                156,
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
                339,
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
                79
            ],
            "findManyApplications": [
                53
            ],
            "findManyLogicFunctions": [
                349
            ],
            "findManyMarketplaceApps": [
                357,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                442
            ],
            "findMarketplaceAppDetail": [
                358,
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
                        549
                    ],
                    "universalIdentifier": [
                        549
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                79,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                349,
                {
                    "input": [
                        353,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                339,
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
                339,
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
                687
            ],
            "findWorkspaceFromInviteHash": [
                685,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                692
            ],
            "frontComponent": [
                296,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                296
            ],
            "getAddressDetails": [
                436,
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
                471
            ],
            "getApprovedAccessDomains": [
                87
            ],
            "getAutoCompleteAddress": [
                95,
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
                336,
                {
                    "input": [
                        353,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                169,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                250
            ],
            "getInviteSuggestions": [
                335
            ],
            "getJobs": [
                339,
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
                        353,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                420,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                420,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                423,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                423,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                419,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        422
                    ]
                }
            ],
            "getPermissionFlags": [
                430
            ],
            "getPublicWorkspaceDataByDomain": [
                446,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                447,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                125
            ],
            "getRole": [
                471,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                471
            ],
            "getSSOIdentityProviders": [
                293
            ],
            "getToolIndex": [
                531
            ],
            "getToolInputSchema": [
                336,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                633,
                {
                    "input": [
                        634
                    ]
                }
            ],
            "getView": [
                661,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                664,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                665,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                665,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                664,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                666,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                667,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                667,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                666,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                670,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                670,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                673,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                673,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                661,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        675,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                690
            ],
            "gettingStartedProgress": [
                305
            ],
            "gettingStartedWorkflowPreviews": [
                310
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
                341,
                {
                    "input": [
                        342,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                116
            ],
            "mcpServer": [
                363,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                363
            ],
            "messageSuppressions": [
                380,
                {
                    "input": [
                        294,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                385,
                {
                    "input": [
                        388,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                389
            ],
            "mostlyEmptyFieldMetadataIds": [
                549,
                {
                    "objectMetadataId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                78
            ],
            "myCalendarChannels": [
                136,
                {
                    "connectedAccountId": [
                        549
                    ]
                }
            ],
            "myConnectedAccounts": [
                167
            ],
            "myMessageChannels": [
                368,
                {
                    "connectedAccountId": [
                        549
                    ]
                }
            ],
            "myMessageFolders": [
                375,
                {
                    "messageChannelId": [
                        549
                    ]
                }
            ],
            "myUserApplicationVariables": [
                695
            ],
            "navigationMenuItem": [
                395,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                395
            ],
            "object": [
                398,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                408
            ],
            "objects": [
                399,
                {
                    "filter": [
                        402,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        218,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                433,
                {
                    "input": [
                        434,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                144,
                {
                    "input": [
                        437,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                439,
                {
                    "input": [
                        438,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                358,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                357
            ],
            "recordPermissions": [
                453,
                {
                    "targets": [
                        462,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                458,
                {
                    "target": [
                        462,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                463
            ],
            "skill": [
                515,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                515
            ],
            "timelineActivityTypes": [
                527
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                548,
                {
                    "userId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                552
            ],
            "usageLimits": [
                636
            ],
            "usageQuotaDefinitions": [
                640
            ],
            "usageQuotaScopeConsumption": [
                642,
                {
                    "input": [
                        643,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                644
            ],
            "validatePasswordResetToken": [
                655,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                656,
                {
                    "objectMetadataId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                656,
                {
                    "fieldMetadataId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                677,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                677
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                549
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
                549
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
                549
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
                549
            ],
            "permissions": [
                452
            ],
            "recordId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                549
            ],
            "workspaceMemberId": [
                549
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
                452
            ],
            "roles": [
                460
            ],
            "shares": [
                459
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                454
            ],
            "id": [
                18
            ],
            "principalId": [
                549
            ],
            "principalRoleId": [
                549
            ],
            "principalType": [
                456
            ],
            "rowCause": [
                457
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
                549
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
                679
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
                549
            ],
            "recordId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                549
            ],
            "id": [
                549
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                549
            ],
            "secondFieldMetadataId": [
                549
            ],
            "thirdFieldMetadataId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                276
            ],
            "sourceObjectMetadata": [
                398
            ],
            "targetFieldMetadata": [
                276
            ],
            "targetObjectMetadata": [
                398
            ],
            "type": [
                465
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
                549
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
                549
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
                283
            ],
            "icon": [
                1
            ],
            "id": [
                549
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                406
            ],
            "permissionFlags": [
                472
            ],
            "rowLevelPermissionFieldPermissions": [
                283
            ],
            "rowLevelPermissionPredicateGroups": [
                475
            ],
            "rowLevelPermissionPredicates": [
                474
            ],
            "universalIdentifier": [
                549
            ],
            "workspaceMembers": [
                694
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
                549
            ],
            "roleId": [
                549
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
                479
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
                336
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
                477
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
                549
            ],
            "logicalOperator": [
                477
            ],
            "objectMetadataId": [
                549
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                549
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
                549
            ],
            "id": [
                549
            ],
            "operand": [
                479
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "relationFieldMetadataId": [
                549
            ],
            "rowLevelPermissionPredicateGroupId": [
                549
            ],
            "subFieldName": [
                1
            ],
            "value": [
                336
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
                475
            ],
            "predicates": [
                474
            ],
            "uneditableFields": [
                549
            ],
            "unreadableFields": [
                549
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
                483
            ],
            "messages": [
                483
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                336
            ],
            "runAsWorkspaceMemberId": [
                549
            ],
            "thread": [
                486
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
                549
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
                482
            ],
            "content": [
                1
            ],
            "role": [
                484
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
                336
            ],
            "runId": [
                549
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                549
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
                549
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                489
            ],
            "type": [
                316
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                549
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                489
            ],
            "type": [
                316
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
                220
            ],
            "fieldMetadataId": [
                549
            ],
            "id": [
                549
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                549
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                549
            ],
            "messageChannelId": [
                549
            ],
            "messageThreadId": [
                549
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
                549
            ],
            "messageThreadId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                549
            ],
            "messageId": [
                1
            ],
            "queued": [
                4
            ],
            "recipientParticipantWorkspaceMemberIds": [
                549
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
                495
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
                498
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
                549
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
                336
            ],
            "workspaceMemberIds": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                549
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
                692
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
                220
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                144
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
                336
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                549
            ],
            "createdAt": [
                220
            ],
            "frontComponentId": [
                549
            ],
            "icon": [
                1
            ],
            "id": [
                549
            ],
            "position": [
                6
            ],
            "scope": [
                509
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                220
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
                549
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
                549
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                489
            ],
            "type": [
                316
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                91
            ],
            "workspace": [
                704
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
                549
            ],
            "content": [
                1
            ],
            "createdAt": [
                220
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                220
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                470
            ],
            "configurationType": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                702
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
                270,
                {
                    "fieldFilters": [
                        264,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        271,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                450,
                {
                    "input": [
                        202,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                354,
                {
                    "input": [
                        355,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                14,
                {
                    "agentUniversalIdentifier": [
                        549
                    ],
                    "runId": [
                        549
                    ],
                    "threadId": [
                        549
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "onEventSubscription": [
                272,
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
                524
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                679
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
                549
            ],
            "createdAt": [
                220
            ],
            "emit": [
                528
            ],
            "frontComponentUniversalIdentifier": [
                549
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                549
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                549
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                549
            ],
            "on": [
                1
            ],
            "through": [
                529
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                549
            ],
            "relationFieldUniversalIdentifier": [
                549
            ],
            "triggerFieldUniversalIdentifiers": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                679
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
                336
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
                91
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                549
            ],
            "personFilter": [
                336
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
        "TwoFactorAuthenticationMethodSummary": {
            "status": [
                1
            ],
            "strategy": [
                1
            ],
            "twoFactorAuthenticationMethodId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                220
            ],
            "recoveryCode": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCodeRedemption": {
            "provisioningUri": [
                1
            ],
            "tokens": [
                92
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
                220
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                549
            ],
            "gt": [
                549
            ],
            "gte": [
                549
            ],
            "iLike": [
                549
            ],
            "in": [
                549
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                549
            ],
            "lt": [
                549
            ],
            "lte": [
                549
            ],
            "neq": [
                549
            ],
            "notILike": [
                549
            ],
            "notIn": [
                549
            ],
            "notLike": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                220
            ],
            "description": [
                1
            ],
            "id": [
                549
            ],
            "name": [
                1
            ],
            "updatedAt": [
                220
            ],
            "visibility": [
                553
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpdateAgentInput": {
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                549
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                336
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
                336
            ],
            "roleId": [
                549
            ],
            "triggers": [
                336
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
                549
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
                549
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                549
            ],
            "visibility": [
                374
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
                560
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
                562
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
                549
            ],
            "update": [
                564
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                137
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
                140
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
                549
            ],
            "availabilityType": [
                164
            ],
            "engineComponentKey": [
                254
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                549
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                549
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                336
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
                336
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                549
            ],
            "options": [
                336
            ],
            "settings": [
                336
            ],
            "translations": [
                386
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
                549
            ],
            "update": [
                569
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
                306
            ],
            "completedStepChatThreadId": [
                1
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                306
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
                549
            ],
            "update": [
                573
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                336
            ],
            "databaseEventTriggerSettings": [
                336
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                336
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
                336
            ],
            "workflowActionTriggerSettings": [
                336
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                549
            ],
            "update": [
                575
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                549
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
                549
            ],
            "update": [
                577
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                369
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
                376
            ],
            "visibility": [
                374
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                549
            ],
            "update": [
                579
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
                549
            ],
            "update": [
                579
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
                549
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
                549
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
                549
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
                549
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
                405
            ],
            "shortcut": [
                1
            ],
            "translations": [
                386
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                549
            ],
            "update": [
                567
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                549
            ],
            "update": [
                581
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                549
            ],
            "update": [
                582
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
                549
            ],
            "type": [
                422
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
                421
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
                549
            ],
            "layoutMode": [
                421
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                590
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
                336
            ],
            "configuration": [
                336
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                549
            ],
            "pageLayoutTabId": [
                549
            ],
            "position": [
                336
            ],
            "title": [
                1
            ],
            "type": [
                680
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
                336
            ],
            "configuration": [
                336
            ],
            "id": [
                549
            ],
            "objectMetadataId": [
                549
            ],
            "pageLayoutTabId": [
                549
            ],
            "position": [
                336
            ],
            "title": [
                1
            ],
            "type": [
                680
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
                549
            ],
            "tabs": [
                588
            ],
            "type": [
                422
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                549
            ],
            "update": [
                593
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
                549
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
                549
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                386
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
                553
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                549
            ],
            "payload": [
                207
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                549
            ],
            "update": [
                599
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
                549
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
                549
            ],
            "update": [
                601
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
                549
            ],
            "update": [
                603
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                549
            ],
            "logicalOperator": [
                668
            ],
            "parentViewFilterGroupId": [
                549
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                549
            ],
            "update": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                549
            ],
            "operand": [
                669
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                549
            ],
            "subFieldName": [
                1
            ],
            "value": [
                336
            ],
            "viewFilterGroupId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                549
            ],
            "update": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                549
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
                549
            ],
            "calendarFieldMetadataId": [
                549
            ],
            "calendarLayout": [
                662
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                549
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                549
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                549
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                672
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "translations": [
                386
            ],
            "type": [
                675
            ],
            "visibility": [
                676
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                549
            ],
            "update": [
                611
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                674
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
                549
            ],
            "update": [
                613
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
                549
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
                336
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                549
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
                691
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                336
            ],
            "workspaceMemberId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                284
            ],
            "roleId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                549
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                620
            ],
            "id": [
                549
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
                620
            ],
            "groups": [
                621
            ],
            "widgetId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                407
            ],
            "roleId": [
                549
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                549
            ],
            "predicateGroups": [
                476
            ],
            "predicates": [
                478
            ],
            "roleId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                475
            ],
            "predicates": [
                474
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                631
            ],
            "viewFields": [
                628
            ],
            "viewFilterGroups": [
                629
            ],
            "viewFilters": [
                630
            ],
            "viewSorts": [
                632
            ],
            "widgetId": [
                549
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
                549
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                549
            ],
            "logicalOperator": [
                668
            ],
            "parentViewFilterGroupId": [
                549
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
                549
            ],
            "id": [
                549
            ],
            "operand": [
                669
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                549
            ],
            "subFieldName": [
                1
            ],
            "value": [
                336
            ],
            "viewFilterGroupId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                549
            ],
            "calendarFieldMetadataId": [
                549
            ],
            "calendarLayout": [
                662
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                549
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                549
            ],
            "openRecordIn": [
                672
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                674
            ],
            "fieldMetadataId": [
                549
            ],
            "id": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                220
            ],
            "periodStart": [
                220
            ],
            "timeSeries": [
                646
            ],
            "usageByApplication": [
                635
            ],
            "usageByModel": [
                635
            ],
            "usageByOperationType": [
                635
            ],
            "usageByUser": [
                635
            ],
            "userDailyUsage": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                638
            ],
            "periodEnd": [
                220
            ],
            "periodStart": [
                220
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
                106
            ],
            "createdAt": [
                220
            ],
            "id": [
                549
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                106
            ],
            "operationType": [
                638
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                645
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                647
            ],
            "updatedAt": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                647
            ],
            "operationType": [
                638
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                637
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                641
            ],
            "resourceType": [
                645
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                639
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
                638
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                647
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                106
            ],
            "periodEnd": [
                220
            ],
            "periodStart": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                638
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                645
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                647
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                106
            ],
            "id": [
                549
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                106
            ],
            "operationType": [
                638
            ],
            "periodEnd": [
                220
            ],
            "periodStart": [
                220
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                106
            ],
            "resourceType": [
                645
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
                647
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
                646
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
                97
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                220
            ],
            "currentUserWorkspace": [
                653
            ],
            "currentWorkspace": [
                685
            ],
            "deletedAt": [
                220
            ],
            "deletedWorkspaceMembers": [
                233
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
                549
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
                414
            ],
            "previousOnboardingStatus": [
                414
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                220
            ],
            "userVars": [
                337
            ],
            "userWorkspaces": [
                653
            ],
            "workspaceMember": [
                694
            ],
            "workspaceMembers": [
                694
            ],
            "workspaces": [
                653
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
                336
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
                220
            ],
            "expiresAt": [
                220
            ],
            "id": [
                549
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
                220
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "id": [
                549
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                406
            ],
            "objectRecordsPermissions": [
                413
            ],
            "objectsPermissions": [
                406
            ],
            "permissionFlags": [
                431
            ],
            "twoFactorAuthenticationMethodSummary": [
                545
            ],
            "updatedAt": [
                220
            ],
            "user": [
                649
            ],
            "userId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                549
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
                549
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
                549
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                549
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
                91
            ],
            "workspaceUrls": [
                703
            ],
            "__typename": [
                1
            ]
        },
        "VerifyTwoFactorAuthenticationMethod": {
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
                549
            ],
            "calendarEndFieldMetadataId": [
                549
            ],
            "calendarFieldMetadataId": [
                549
            ],
            "calendarLayout": [
                662
            ],
            "createdAt": [
                220
            ],
            "createdByUserWorkspaceId": [
                549
            ],
            "deletedAt": [
                220
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                549
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
                549
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                671
            ],
            "mainGroupByFieldMetadataId": [
                549
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                549
            ],
            "openRecordIn": [
                672
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                675
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                220
            ],
            "viewFieldGroups": [
                665
            ],
            "viewFields": [
                664
            ],
            "viewFilterGroups": [
                667
            ],
            "viewFilters": [
                666
            ],
            "viewGroups": [
                670
            ],
            "viewSorts": [
                673
            ],
            "visibility": [
                676
            ],
            "workspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                679
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
                549
            ],
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "fieldMetadataId": [
                549
            ],
            "id": [
                549
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
                549
            ],
            "updatedAt": [
                220
            ],
            "viewFieldGroupId": [
                549
            ],
            "viewId": [
                549
            ],
            "workspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "id": [
                549
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
                220
            ],
            "viewFields": [
                664
            ],
            "viewId": [
                549
            ],
            "workspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "fieldMetadataId": [
                549
            ],
            "id": [
                549
            ],
            "operand": [
                669
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                549
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                220
            ],
            "value": [
                336
            ],
            "viewFilterGroupId": [
                549
            ],
            "viewId": [
                549
            ],
            "workspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "id": [
                549
            ],
            "logicalOperator": [
                668
            ],
            "parentViewFilterGroupId": [
                549
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                220
            ],
            "viewId": [
                549
            ],
            "workspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "fieldValue": [
                1
            ],
            "id": [
                549
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                220
            ],
            "viewId": [
                549
            ],
            "workspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "direction": [
                674
            ],
            "fieldMetadataId": [
                549
            ],
            "id": [
                549
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                220
            ],
            "viewId": [
                549
            ],
            "workspaceId": [
                549
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
                549
            ],
            "createdAt": [
                220
            ],
            "deletedAt": [
                220
            ],
            "description": [
                1
            ],
            "id": [
                549
            ],
            "operations": [
                1
            ],
            "role": [
                471
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                220
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
                100
            ],
            "on_CalendarConfiguration": [
                141
            ],
            "on_CallRecordingSummaryConfiguration": [
                142
            ],
            "on_CallRecordingTranscriptConfiguration": [
                143
            ],
            "on_ChatConfiguration": [
                151
            ],
            "on_ChatThreadsConfiguration": [
                154
            ],
            "on_EmailThreadConfiguration": [
                249
            ],
            "on_EmailsConfiguration": [
                253
            ],
            "on_FieldConfiguration": [
                277
            ],
            "on_FieldRichTextConfiguration": [
                285
            ],
            "on_FieldsConfiguration": [
                286
            ],
            "on_FilesConfiguration": [
                292
            ],
            "on_FormFieldConfiguration": [
                295
            ],
            "on_FrontComponentConfiguration": [
                297
            ],
            "on_IframeConfiguration": [
                317
            ],
            "on_LineChartConfiguration": [
                340
            ],
            "on_MessageCampaignBodyConfiguration": [
                365
            ],
            "on_MessageCampaignDetailsConfiguration": [
                366
            ],
            "on_NotesConfiguration": [
                397
            ],
            "on_PieChartConfiguration": [
                432
            ],
            "on_RecordTableConfiguration": [
                461
            ],
            "on_StandaloneRichTextConfiguration": [
                516
            ],
            "on_TasksConfiguration": [
                526
            ],
            "on_TimelineConfiguration": [
                530
            ],
            "on_ViewConfiguration": [
                663
            ],
            "on_WorkflowConfiguration": [
                682
            ],
            "on_WorkflowRunConfiguration": [
                683
            ],
            "on_WorkflowVersionConfiguration": [
                684
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
                679
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                686
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
                336
            ],
            "allowImpersonation": [
                4
            ],
            "allowedEmbeddingOrigins": [
                1
            ],
            "billingCustomer": [
                108
            ],
            "billingEntitlements": [
                110
            ],
            "billingSubscriptions": [
                127
            ],
            "createdAt": [
                220
            ],
            "currentBillingSubscription": [
                127
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                471
            ],
            "deletedAt": [
                220
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
                274
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                549
            ],
            "iframeMediaPermissions": [
                318
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
                549
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
                220
            ],
            "viewFields": [
                664
            ],
            "viewFilterGroups": [
                667
            ],
            "viewFilters": [
                666
            ],
            "viewGroups": [
                670
            ],
            "viewSorts": [
                673
            ],
            "views": [
                661
            ],
            "workspaceCustomApplication": [
                53
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                691
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                703
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
                336
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                688
            ],
            "personEnrichment": [
                336
            ],
            "personOutcome": [
                701
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
                220
            ],
            "id": [
                549
            ],
            "roleId": [
                549
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
                696
            ],
            "id": [
                549
            ],
            "locale": [
                1
            ],
            "name": [
                299
            ],
            "numberFormat": [
                697
            ],
            "openRecordIn": [
                417
            ],
            "roles": [
                471
            ],
            "timeFormat": [
                698
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
                549
            ],
            "userWorkspaceId": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                549
            ],
            "variables": [
                650
            ],
            "workspaceMemberId": [
                549
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
                336
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
                549
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
                549
            ],
            "workspaceUrls": [
                703
            ],
            "__typename": [
                1
            ]
        }
    }
}