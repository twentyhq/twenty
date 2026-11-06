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
        98,
        102,
        103,
        105,
        110,
        116,
        122,
        127,
        133,
        136,
        137,
        138,
        139,
        147,
        149,
        163,
        167,
        169,
        171,
        218,
        219,
        246,
        250,
        251,
        253,
        263,
        269,
        273,
        277,
        280,
        287,
        304,
        306,
        312,
        314,
        327,
        334,
        335,
        336,
        348,
        350,
        367,
        368,
        369,
        370,
        371,
        372,
        374,
        375,
        376,
        379,
        380,
        382,
        385,
        390,
        394,
        403,
        410,
        412,
        415,
        419,
        420,
        425,
        429,
        452,
        454,
        455,
        463,
        475,
        477,
        482,
        487,
        507,
        519,
        520,
        522,
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
                334
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
                219
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
                334
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
                334
            ],
            "roleId": [
                549
            ],
            "triggers": [
                334
            ],
            "updatedAt": [
                219
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
                334
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
                219
            ],
            "deletedAt": [
                219
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
                219
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                219
            ],
            "id": [
                549
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                219
            ],
            "lastReadAt": [
                219
            ],
            "mentionsResolvedAt": [
                219
            ],
            "snoozedUntil": [
                219
            ],
            "threadId": [
                549
            ],
            "updatedAt": [
                219
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
                219
            ],
            "id": [
                549
            ],
            "parts": [
                22
            ],
            "processedAt": [
                219
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
                219
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
                334
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
                334
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                334
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
                219
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
                219
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
                219
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
                334
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "label": [
                1
            ],
            "numberFormat": [
                149
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                447
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
                105
            ],
            "kind": [
                1
            ],
            "limitValue": [
                105
            ],
            "periodEnd": [
                219
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                105
            ],
            "limitValue": [
                105
            ],
            "periodEnd": [
                219
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
                219
            ],
            "expiresAt": [
                219
            ],
            "id": [
                549
            ],
            "name": [
                1
            ],
            "revokedAt": [
                219
            ],
            "role": [
                469
            ],
            "updatedAt": [
                219
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                219
            ],
            "id": [
                549
            ],
            "name": [
                1
            ],
            "revokedAt": [
                219
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
                167
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
                334
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
                219
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
                376
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
                334
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                162
            ],
            "createdAt": [
                219
            ],
            "defaultLogicFunctionRole": [
                469
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                294
            ],
            "grantedIframeMediaPermissions": [
                316
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
                347
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
                396
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                549
            ],
            "requestedIframeMediaPermissions": [
                316
            ],
            "runOnUserPreferences": [
                4
            ],
            "settingsCustomTabFrontComponentId": [
                549
            ],
            "settingsMenuItems": [
                506
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
                219
            ],
            "id": [
                549
            ],
            "lastAuthorizedAt": [
                219
            ],
            "lastUsedAt": [
                219
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
                219
            ],
            "authFailedAt": [
                219
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                443
            ],
            "connectionProviderId": [
                549
            ],
            "createdAt": [
                219
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
                219
            ],
            "lastSignedInAt": [
                219
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                167
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                219
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
                171
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
                334
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
                287
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
                287
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
                219
            ],
            "fileFolder": [
                287
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
                219
            ],
            "periodStart": [
                219
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
                219
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
                219
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
                219
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
                219
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
                506
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
                219
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
                219
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
                216
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
                219
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
                334
            ],
            "type": [
                1
            ],
            "updatedAt": [
                219
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
                90
            ],
            "applicationRefreshToken": [
                90
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
                334
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
                219
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
                486
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                219
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
                90
            ],
            "refreshToken": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                91
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
                485
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
                95
            ],
            "availableWorkspacesForSignUp": [
                95
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                96
            ],
            "tokens": [
                91
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
                98
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
                334
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupMode": [
                102
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                103
            ],
            "numberFormat": [
                149
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                410
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
                312
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                410
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
                312
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
                334
            ],
            "formattedToRawLookup": [
                334
            ],
            "groupMode": [
                102
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
                103
            ],
            "series": [
                104
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
                334
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
                131
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
                126
            ],
            "currentBillingSubscription": [
                126
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                520
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                110
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
                123
            ],
            "name": [
                1
            ],
            "prices": [
                117
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
                123
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
                111
            ],
            "downgradePlanKeys": [
                116
            ],
            "isCheckoutDefault": [
                4
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                112
            ],
            "planKey": [
                116
            ],
            "resourceCreditProducts": [
                111
            ],
            "upgradePlanKeys": [
                116
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
                133
            ],
            "recurringInterval": [
                519
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
                133
            ],
            "recurringInterval": [
                519
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                119
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
                123
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
                123
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                111
            ],
            "on_BillingMeteredProduct": [
                112
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
                116
            ],
            "priceUsageBased": [
                133
            ],
            "productKey": [
                122
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                219
            ],
            "periodStart": [
                219
            ],
            "productKey": [
                122
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
                128
            ],
            "cancelAt": [
                219
            ],
            "collectionMethod": [
                127
            ],
            "currentPeriodEnd": [
                219
            ],
            "hasUserCredits": [
                4
            ],
            "id": [
                549
            ],
            "interval": [
                519
            ],
            "metadata": [
                334
            ],
            "phases": [
                129
            ],
            "status": [
                520
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                121
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
                130
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
                126
            ],
            "currentBillingSubscription": [
                126
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
                136
            ],
            "createdAt": [
                219
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
                137
            ],
            "syncStageStartedAt": [
                219
            ],
            "syncStatus": [
                138
            ],
            "syncedAt": [
                219
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                219
            ],
            "visibility": [
                139
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
                147
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
                334
            ],
            "error": [
                152
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
                390
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                392
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
                156
            ],
            "aiModelTiers": [
                158
            ],
            "aiModels": [
                157
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
                89
            ],
            "billing": [
                106
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                146
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
                160
            ],
            "publicFeatureFlags": [
                441
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                504
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                521
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                219
            ],
            "link": [
                1
            ],
            "startAt": [
                219
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
                163
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
                219
            ],
            "engineComponentKey": [
                253
            ],
            "frontComponent": [
                294
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
                164
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
                219
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
                402
            ],
            "on_PathCommandMenuItemPayload": [
                427
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
                285
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
                219
            ],
            "authFailedAt": [
                219
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                443
            ],
            "connectionProviderId": [
                549
            ],
            "createdAt": [
                219
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
                219
            ],
            "lastSignedInAt": [
                219
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                167
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                219
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
                319
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
                246
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
                334
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
                334
            ],
            "roleId": [
                549
            ],
            "triggers": [
                334
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
                372
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
                163
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
                253
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
                334
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
                366
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
                334
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
                334
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                549
            ],
            "options": [
                334
            ],
            "relationCreationPayload": [
                334
            ],
            "settings": [
                334
            ],
            "type": [
                280
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
                188
            ],
            "indexType": [
                327
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
                334
            ],
            "databaseEventTriggerSettings": [
                334
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                334
            ],
            "id": [
                549
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                334
            ],
            "source": [
                334
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                334
            ],
            "universalIdentifier": [
                549
            ],
            "workflowActionTriggerSettings": [
                334
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
                394
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
                334
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
                186
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                194
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
                420
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                419
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
                334
            ],
            "objectMetadataId": [
                549
            ],
            "pageLayoutTabId": [
                549
            ],
            "position": [
                334
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
                334
            ],
            "objectMetadataId": [
                549
            ],
            "orderBy": [
                334
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
                105
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                105
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
                334
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
                169
            ],
            "before": [
                169
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
                297
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
                239
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
                487
            ],
            "type": [
                314
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                170
            ],
            "IMAP": [
                170
            ],
            "SMTP": [
                170
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
                219
            ],
            "domain": [
                1
            ],
            "id": [
                549
            ],
            "status": [
                250
            ],
            "tenantStatus": [
                251
            ],
            "unsubscribeHostnameStatus": [
                551
            ],
            "updatedAt": [
                219
            ],
            "verificationRecords": [
                657
            ],
            "verifiedAt": [
                219
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
                334
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
                334
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
                255
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                334
            ],
            "retryLimit": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobsResult": {
            "enqueued": [
                4
            ],
            "enqueuedJobsCount": [
                10
            ],
            "jobIds": [
                1
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EnterpriseLicenseInfoDTO": {
            "expiresAt": [
                219
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
                219
            ],
            "currentPeriodEnd": [
                219
            ],
            "expiresAt": [
                219
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
                219
            ],
            "start": [
                219
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
                263
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
                261
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                262
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
                264
            ],
            "first": [
                10
            ],
            "table": [
                269
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                265
            ],
            "records": [
                268
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
                334
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                219
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
                381
            ],
            "objectRecordEventsWithQueryIds": [
                409
            ],
            "queueJobEvents": [
                337
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
                334
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                273
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
                219
            ],
            "defaultValue": [
                334
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
                462
            ],
            "name": [
                1
            ],
            "object": [
                396
            ],
            "objectMetadataId": [
                549
            ],
            "options": [
                334
            ],
            "relation": [
                462
            ],
            "settings": [
                334
            ],
            "type": [
                280
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                219
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
                277
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
                278
            ],
            "pageInfo": [
                416
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                169
            ],
            "node": [
                274
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                279
            ],
            "id": [
                550
            ],
            "isActive": [
                134
            ],
            "isSystem": [
                134
            ],
            "isUIEditable": [
                134
            ],
            "isUIReadOnly": [
                134
            ],
            "objectMetadataId": [
                550
            ],
            "or": [
                279
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
                219
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
                219
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
                219
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
                487
            ],
            "type": [
                314
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
                379
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
                316
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
                334
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
                219
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
                219
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                296
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
                420
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
                481
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                334
            ],
            "runId": [
                549
            ],
            "scope": [
                334
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
                334
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
                304
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                304
            ],
            "snoozedUntil": [
                1
            ],
            "steps": [
                305
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                304
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
                306
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
                309
            ],
            "stepActionKey": [
                304
            ],
            "trigger": [
                310
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
                320
            ],
            "IMAP": [
                320
            ],
            "SMTP": [
                320
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
                246
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
                90
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
                219
            ],
            "id": [
                549
            ],
            "indexFieldMetadataList": [
                325
            ],
            "indexType": [
                327
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
                219
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                169
            ],
            "node": [
                323
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                219
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
                219
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                326
            ],
            "id": [
                550
            ],
            "isCustom": [
                134
            ],
            "or": [
                326
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
                330
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
                336
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
                98
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
                334
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
                149
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                410
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
                312
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                410
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
                312
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
                334
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                342
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
                334
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
                341
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
                167
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
                219
            ],
            "cronTriggerSettings": [
                334
            ],
            "databaseEventTriggerSettings": [
                334
            ],
            "description": [
                1
            ],
            "executionMode": [
                348
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                334
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
                334
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                219
            ],
            "workflowActionTriggerSettings": [
                334
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                334
            ],
            "duration": [
                6
            ],
            "error": [
                334
            ],
            "logs": [
                1
            ],
            "status": [
                350
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
                90
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
                334
            ],
            "name": [
                1
            ],
            "objects": [
                357
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "requestedIframeMediaPermissions": [
                316
            ],
            "roles": [
                358
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
                359
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                360
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
                219
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
                362
            ],
            "toolsSyncError": [
                1
            ],
            "toolsSyncedAt": [
                219
            ],
            "updatedAt": [
                219
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
                334
            ],
            "description": [
                1
            ],
            "inputSchema": [
                334
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
                166
            ],
            "connectedAccountId": [
                549
            ],
            "contactAutoCreationPolicy": [
                367
            ],
            "createdAt": [
                219
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
                374
            ],
            "messagingProviderUniversalIdentifier": [
                549
            ],
            "participantHandleFieldUniversalIdentifier": [
                549
            ],
            "pendingGroupEmailsAction": [
                368
            ],
            "syncStage": [
                369
            ],
            "syncStageStartedAt": [
                219
            ],
            "syncStatus": [
                370
            ],
            "syncedAt": [
                219
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                219
            ],
            "type": [
                371
            ],
            "updatedAt": [
                219
            ],
            "visibility": [
                372
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
                219
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
                375
            ],
            "updatedAt": [
                219
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
                219
            ],
            "emailAddress": [
                1
            ],
            "id": [
                549
            ],
            "reason": [
                379
            ],
            "source": [
                380
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
                377
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
                408
            ],
            "recordId": [
                1
            ],
            "type": [
                382
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
                385
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
                161
            ],
            "objectMetadataItems": [
                388
            ],
            "views": [
                389
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
                513,
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
                        317,
                        "[IframeMediaPermissionInput!]!"
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
                        322,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                93,
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
                145,
                {
                    "input": [
                        144,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                132
            ],
            "cancelSwitchBillingPlan": [
                132
            ],
            "cancelSwitchResourceCreditPrice": [
                132
            ],
            "checkCustomDomainValidRecords": [
                240
            ],
            "checkPublicDomainValidRecords": [
                240,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                125,
                {
                    "plan": [
                        116,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        519,
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
                165,
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
                414,
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
                289,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                289,
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
                289,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                289,
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
                        172,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                43,
                {
                    "input": [
                        174,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                366,
                {
                    "input": [
                        175,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                176,
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
                177,
                {
                    "input": [
                        178,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                87,
                {
                    "input": [
                        179,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                114
            ],
            "createCalendarEvent": [
                181,
                {
                    "input": [
                        180,
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
                162,
                {
                    "input": [
                        182,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                238,
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
                184,
                {
                    "input": [
                        183,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                249,
                {
                    "input": [
                        185,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                288,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        287,
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
                294,
                {
                    "input": [
                        187,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                393,
                {
                    "inputs": [
                        193,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                665,
                {
                    "inputs": [
                        208,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                664,
                {
                    "inputs": [
                        209,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                670,
                {
                    "inputs": [
                        212,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                361,
                {
                    "input": [
                        191,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                377,
                {
                    "input": [
                        192,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                393,
                {
                    "input": [
                        193,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                288,
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
                510,
                {
                    "input": [
                        508,
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
                        334
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
                        173,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                274,
                {
                    "input": [
                        195,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                323,
                {
                    "input": [
                        196,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                347,
                {
                    "input": [
                        190,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                396,
                {
                    "input": [
                        197,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                469,
                {
                    "createRoleInput": [
                        203,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                417,
                {
                    "input": [
                        198,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                418,
                {
                    "input": [
                        199,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                421,
                {
                    "input": [
                        200,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                440,
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
                461,
                {
                    "input": [
                        202,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                510,
                {
                    "input": [
                        509,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                513,
                {
                    "input": [
                        204,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                114,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        116,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        519,
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
                        205,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                636,
                {
                    "input": [
                        206,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                656,
                {
                    "input": [
                        207,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                661,
                {
                    "input": [
                        213,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                664,
                {
                    "input": [
                        209,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                665,
                {
                    "input": [
                        208,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                666,
                {
                    "input": [
                        211,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                667,
                {
                    "input": [
                        210,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                670,
                {
                    "input": [
                        212,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                673,
                {
                    "input": [
                        214,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                677,
                {
                    "input": [
                        215,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                513,
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
                366,
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
                        220,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                162,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                166,
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
                366,
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
                294,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                393,
                {
                    "ids": [
                        549,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                361,
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
                393,
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
                274,
                {
                    "input": [
                        221,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                323,
                {
                    "input": [
                        222,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                347,
                {
                    "input": [
                        351,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                396,
                {
                    "input": [
                        223,
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
                461,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                224,
                {
                    "input": [
                        225,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                513,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                226,
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
                        228,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                665,
                {
                    "input": [
                        227,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                666,
                {
                    "input": [
                        229,
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
                        230,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        231,
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
                        234,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                665,
                {
                    "input": [
                        233,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                666,
                {
                    "input": [
                        235,
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
                        236,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        237,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
                {
                    "input": [
                        322,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                166,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                241,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                242,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                243,
                {
                    "input": [
                        244,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                247,
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
                108
            ],
            "enqueueJob": [
                256,
                {
                    "input": [
                        254,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                258,
                {
                    "input": [
                        257,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                689
            ],
            "executeOneLogicFunction": [
                349,
                {
                    "input": [
                        271,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                299,
                {
                    "input": [
                        298,
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
                90
            ],
            "generateTransientToken": [
                530
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                544,
                {
                    "otp": [
                        1
                    ]
                }
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
                92,
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
                92,
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
                92,
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
                301,
                {
                    "input": [
                        302,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                354,
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
                413
            ],
            "grantApplicationCapabilities": [
                55,
                {
                    "input": [
                        311,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                321,
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
                329,
                {
                    "input": [
                        328,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                331,
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
                331
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
                307,
                {
                    "stepActionKey": [
                        304,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                259
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
                        464,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                456,
                {
                    "principal": [
                        453,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        460,
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
                92,
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
                        465,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                466,
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
                500,
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
                162,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                418,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                417,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                525,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                492,
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
                        467,
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
                471,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                483,
                {
                    "input": [
                        479,
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
                318,
                {
                    "connectionParameters": [
                        245,
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
                491,
                {
                    "input": [
                        490,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                492,
                {
                    "browsingContext": [
                        334
                    ],
                    "channelId": [
                        549
                    ],
                    "fileAttachments": [
                        286,
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
                495,
                {
                    "input": [
                        494,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                499,
                {
                    "input": [
                        498,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                500,
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
                502,
                {
                    "input": [
                        501,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                497,
                {
                    "input": [
                        503,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                47,
                {
                    "input": [
                        505,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                113,
                {
                    "partnerCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                259,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                456,
                {
                    "isPrivate": [
                        4,
                        "Boolean!"
                    ],
                    "target": [
                        460,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                456,
                {
                    "accessLevel": [
                        452,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        453,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        460,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                132,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                97,
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
                97,
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
                511,
                {
                    "input": [
                        512
                    ]
                }
            ],
            "signUpInWorkspace": [
                511,
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
                414,
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
                        219,
                        "DateTime!"
                    ],
                    "threadId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                148,
                {
                    "connectedAccountId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                515,
                {
                    "companyContext": [
                        334
                    ],
                    "personContext": [
                        334
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
                516
            ],
            "switchBillingPlan": [
                132,
                {
                    "plan": [
                        116
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                132
            ],
            "syncAppMessageFolders": [
                373,
                {
                    "input": [
                        523,
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
                        334,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "syncMcpServerTools": [
                361,
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
                        334
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
                532,
                {
                    "input": [
                        531,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                536,
                {
                    "input": [
                        533,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                535,
                {
                    "input": [
                        534,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                540,
                {
                    "input": [
                        537,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                539,
                {
                    "input": [
                        538,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                542,
                {
                    "input": [
                        541,
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
                        219
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
                366,
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
                135,
                {
                    "input": [
                        563,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                162,
                {
                    "input": [
                        565,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                366,
                {
                    "input": [
                        566,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                294,
                {
                    "input": [
                        568,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                303,
                {
                    "input": [
                        570,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                272,
                {
                    "input": [
                        571,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                393,
                {
                    "inputs": [
                        584,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                396,
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
                361,
                {
                    "input": [
                        574,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                366,
                {
                    "input": [
                        576,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                373,
                {
                    "input": [
                        578,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                373,
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
                393,
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
                274,
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
                396,
                {
                    "input": [
                        585,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                469,
                {
                    "updateRoleInput": [
                        592,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                417,
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
                418,
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
                421,
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
                417,
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
                332,
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
                513,
                {
                    "input": [
                        594,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                525,
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
                107,
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
                285,
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
                        287,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                289,
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
                289,
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
                289,
                {
                    "file": [
                        618,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                289,
                {
                    "file": [
                        618,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                281,
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
                404,
                {
                    "upsertObjectPermissionsInput": [
                        623,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                470,
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
                97,
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
                249,
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
                219
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
                449
            ],
            "type": [
                394
            ],
            "updatedAt": [
                219
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
                219
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
                399,
                {
                    "filter": [
                        279,
                        "FieldFilter!"
                    ],
                    "paging": [
                        217,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                274
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
                323
            ],
            "indexMetadatas": [
                401,
                {
                    "filter": [
                        326,
                        "IndexFilter!"
                    ],
                    "paging": [
                        217,
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
                403
            ],
            "searchFieldMetadataList": [
                489
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                219
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                398
            ],
            "pageInfo": [
                416
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                169
            ],
            "node": [
                396
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                278
            ],
            "pageInfo": [
                416
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                400
            ],
            "id": [
                550
            ],
            "isActive": [
                134
            ],
            "isRemote": [
                134
            ],
            "isSearchable": [
                134
            ],
            "isSystem": [
                134
            ],
            "isUICreatable": [
                134
            ],
            "isUIEditable": [
                134
            ],
            "isUIReadOnly": [
                134
            ],
            "or": [
                400
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
                324
            ],
            "pageInfo": [
                416
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
                334
            ],
            "rowLevelPermissionPredicateGroups": [
                473
            ],
            "rowLevelPermissionPredicates": [
                472
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
                218
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                408
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
                334
            ],
            "before": [
                334
            ],
            "diff": [
                334
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
                407
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
                334
            ],
            "rowLevelRecordsPermissions": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                412
            ],
            "previousOnboardingStatus": [
                412
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
                169
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                169
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
                219
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                549
            ],
            "deletedAt": [
                219
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
                418
            ],
            "type": [
                420
            ],
            "universalIdentifier": [
                549
            ],
            "updatedAt": [
                219
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
                219
            ],
            "deletedAt": [
                219
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
                419
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
                219
            ],
            "widgets": [
                421
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                316
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
                334
            ],
            "configuration": [
                678
            ],
            "createdAt": [
                219
            ],
            "deletedAt": [
                219
            ],
            "gridPosition": [
                313
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
                424
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
                219
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                419
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
                419
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
                422
            ],
            "on_PageLayoutWidgetGridPosition": [
                423
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                426
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                425
            ],
            "index": [
                10
            ],
            "layoutMode": [
                419
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
                219
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
                219
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
                410
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
                334
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
                149
            ],
            "orderBy": [
                312
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
                433
            ],
            "formattedToRawLookup": [
                334
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
                334
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
                346
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
                219
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                143
            ],
            "blockers": [
                365
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
                246
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
                219
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
                273
            ],
            "metadata": [
                442
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
                439
            ],
            "IMAP": [
                439
            ],
            "SMTP": [
                439
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                88
            ],
            "authProviders": [
                89
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
                        300,
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
                        343
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
                366,
                {
                    "filter": [
                        344
                    ]
                }
            ],
            "appMessageFolders": [
                373,
                {
                    "filter": [
                        345
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
                488,
                {
                    "applicationId": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                100,
                {
                    "input": [
                        101,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                113
            ],
            "billingPlans": [
                115
            ],
            "billingPortalSession": [
                125,
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
                151,
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
                154,
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
                517,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                162,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                162
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
                260
            ],
            "eventLogs": [
                267,
                {
                    "input": [
                        266,
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
                    "universalIdentifier": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                274,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                276,
                {
                    "filter": [
                        279,
                        "FieldFilter!"
                    ],
                    "paging": [
                        217,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                438,
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
                        219
                    ],
                    "periodStart": [
                        219
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
                        219
                    ],
                    "periodStart": [
                        219
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
                155,
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
                337,
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
                347
            ],
            "findManyMarketplaceApps": [
                355,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                440
            ],
            "findMarketplaceAppDetail": [
                356,
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
                347,
                {
                    "input": [
                        351,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                337,
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
                337,
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
                294,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                294
            ],
            "getAddressDetails": [
                434,
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
                469
            ],
            "getApprovedAccessDomains": [
                87
            ],
            "getAutoCompleteAddress": [
                94,
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
                334,
                {
                    "input": [
                        351,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                168,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                249
            ],
            "getInviteSuggestions": [
                333
            ],
            "getJobs": [
                337,
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
                        351,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                417,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                418,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                418,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                421,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                417,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        420
                    ]
                }
            ],
            "getPermissionFlags": [
                428
            ],
            "getPublicWorkspaceDataByDomain": [
                444,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                445,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                124
            ],
            "getRole": [
                469,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                469
            ],
            "getSSOIdentityProviders": [
                291
            ],
            "getToolIndex": [
                529
            ],
            "getToolInputSchema": [
                334,
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
                303
            ],
            "gettingStartedWorkflowPreviews": [
                308
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
                339,
                {
                    "input": [
                        340,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                115
            ],
            "mcpServer": [
                361,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                361
            ],
            "messageSuppressions": [
                378,
                {
                    "input": [
                        292,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                383,
                {
                    "input": [
                        386,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                387
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
                135,
                {
                    "connectedAccountId": [
                        549
                    ]
                }
            ],
            "myConnectedAccounts": [
                166
            ],
            "myMessageChannels": [
                366,
                {
                    "connectedAccountId": [
                        549
                    ]
                }
            ],
            "myMessageFolders": [
                373,
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
                393,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                393
            ],
            "object": [
                396,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                406
            ],
            "objects": [
                397,
                {
                    "filter": [
                        400,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        217,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                431,
                {
                    "input": [
                        432,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                143,
                {
                    "input": [
                        435,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                437,
                {
                    "input": [
                        436,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                356,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                355
            ],
            "recordPermissions": [
                451,
                {
                    "targets": [
                        460,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                456,
                {
                    "target": [
                        460,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                461
            ],
            "skill": [
                513,
                {
                    "id": [
                        549,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                513
            ],
            "timelineActivityTypes": [
                525
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                543
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
                450
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
                450
            ],
            "roles": [
                458
            ],
            "shares": [
                457
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                452
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
                454
            ],
            "rowCause": [
                455
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
                274
            ],
            "sourceObjectMetadata": [
                396
            ],
            "targetFieldMetadata": [
                274
            ],
            "targetObjectMetadata": [
                396
            ],
            "type": [
                463
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
                281
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
                404
            ],
            "permissionFlags": [
                470
            ],
            "rowLevelPermissionPredicateGroups": [
                473
            ],
            "rowLevelPermissionPredicates": [
                472
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
                477
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
                334
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
                475
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
                475
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
                477
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
                334
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
                473
            ],
            "predicates": [
                472
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
                481
            ],
            "messages": [
                481
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                334
            ],
            "runAsWorkspaceMemberId": [
                549
            ],
            "thread": [
                484
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
                480
            ],
            "content": [
                1
            ],
            "role": [
                482
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
                334
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
                487
            ],
            "type": [
                314
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
                487
            ],
            "type": [
                314
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
                219
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
                219
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
                493
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
                496
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
                334
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
                219
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                143
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
                334
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
                219
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
                507
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
                219
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
                487
            ],
            "type": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                90
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
                219
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
                219
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                468
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
                268,
                {
                    "fieldFilters": [
                        262,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        269,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                448,
                {
                    "input": [
                        201,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                352,
                {
                    "input": [
                        353,
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
                270,
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
                522
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
                219
            ],
            "emit": [
                526
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
                219
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
                527
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
                334
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
                90
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
                334
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                219
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
                91
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
                219
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
                219
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
                219
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
                334
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
                334
            ],
            "roleId": [
                549
            ],
            "triggers": [
                334
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
                372
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
                136
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
                139
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
                163
            ],
            "engineComponentKey": [
                253
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
                334
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
                334
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                549
            ],
            "options": [
                334
            ],
            "settings": [
                334
            ],
            "translations": [
                384
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
                304
            ],
            "completedStepChatThreadId": [
                1
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                304
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
                334
            ],
            "databaseEventTriggerSettings": [
                334
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                334
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
                334
            ],
            "workflowActionTriggerSettings": [
                334
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
                367
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
                374
            ],
            "visibility": [
                372
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
                403
            ],
            "shortcut": [
                1
            ],
            "translations": [
                384
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
                420
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
                419
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
                419
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
                334
            ],
            "configuration": [
                334
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
                334
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
                334
            ],
            "configuration": [
                334
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
                334
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
                420
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
                384
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
                206
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
                334
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
                384
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
                334
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
                334
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
                282
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
                405
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
                474
            ],
            "predicates": [
                476
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
                473
            ],
            "predicates": [
                472
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
                334
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
                219
            ],
            "periodStart": [
                219
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
                219
            ],
            "periodStart": [
                219
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
                105
            ],
            "createdAt": [
                219
            ],
            "id": [
                549
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                105
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
                219
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
                105
            ],
            "periodEnd": [
                219
            ],
            "periodStart": [
                219
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
                105
            ],
            "id": [
                549
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                105
            ],
            "operationType": [
                638
            ],
            "periodEnd": [
                219
            ],
            "periodStart": [
                219
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                105
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
                96
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                219
            ],
            "currentUserWorkspace": [
                653
            ],
            "currentWorkspace": [
                685
            ],
            "deletedAt": [
                219
            ],
            "deletedWorkspaceMembers": [
                232
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
                412
            ],
            "previousOnboardingStatus": [
                412
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                219
            ],
            "userVars": [
                335
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
                334
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
                219
            ],
            "expiresAt": [
                219
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
                219
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
                219
            ],
            "deletedAt": [
                219
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
                404
            ],
            "objectRecordsPermissions": [
                411
            ],
            "objectsPermissions": [
                404
            ],
            "permissionFlags": [
                429
            ],
            "twoFactorAuthenticationMethodSummary": [
                545
            ],
            "updatedAt": [
                219
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
                90
            ],
            "workspaceUrls": [
                703
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
                219
            ],
            "createdByUserWorkspaceId": [
                549
            ],
            "deletedAt": [
                219
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
                219
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
                219
            ],
            "deletedAt": [
                219
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
                219
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
                219
            ],
            "deletedAt": [
                219
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
                219
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
                219
            ],
            "deletedAt": [
                219
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
                219
            ],
            "value": [
                334
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
                219
            ],
            "deletedAt": [
                219
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
                219
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
                219
            ],
            "deletedAt": [
                219
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
                219
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
                219
            ],
            "deletedAt": [
                219
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
                219
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
                219
            ],
            "deletedAt": [
                219
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
                469
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                219
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
                99
            ],
            "on_CalendarConfiguration": [
                140
            ],
            "on_CallRecordingSummaryConfiguration": [
                141
            ],
            "on_CallRecordingTranscriptConfiguration": [
                142
            ],
            "on_ChatConfiguration": [
                150
            ],
            "on_ChatThreadsConfiguration": [
                153
            ],
            "on_EmailThreadConfiguration": [
                248
            ],
            "on_EmailsConfiguration": [
                252
            ],
            "on_FieldConfiguration": [
                275
            ],
            "on_FieldRichTextConfiguration": [
                283
            ],
            "on_FieldsConfiguration": [
                284
            ],
            "on_FilesConfiguration": [
                290
            ],
            "on_FormFieldConfiguration": [
                293
            ],
            "on_FrontComponentConfiguration": [
                295
            ],
            "on_IframeConfiguration": [
                315
            ],
            "on_LineChartConfiguration": [
                338
            ],
            "on_MessageCampaignBodyConfiguration": [
                363
            ],
            "on_MessageCampaignDetailsConfiguration": [
                364
            ],
            "on_NotesConfiguration": [
                395
            ],
            "on_PieChartConfiguration": [
                430
            ],
            "on_RecordTableConfiguration": [
                459
            ],
            "on_StandaloneRichTextConfiguration": [
                514
            ],
            "on_TasksConfiguration": [
                524
            ],
            "on_TimelineConfiguration": [
                528
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
                334
            ],
            "allowImpersonation": [
                4
            ],
            "allowedEmbeddingOrigins": [
                1
            ],
            "billingCustomer": [
                107
            ],
            "billingEntitlements": [
                109
            ],
            "billingSubscriptions": [
                126
            ],
            "createdAt": [
                219
            ],
            "currentBillingSubscription": [
                126
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                469
            ],
            "deletedAt": [
                219
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
                272
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
                316
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
                219
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
                334
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                688
            ],
            "personEnrichment": [
                334
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
                219
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
                297
            ],
            "numberFormat": [
                697
            ],
            "openRecordIn": [
                415
            ],
            "roles": [
                469
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
                334
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