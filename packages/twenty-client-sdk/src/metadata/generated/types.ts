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
        264,
        270,
        274,
        278,
        281,
        288,
        305,
        307,
        313,
        315,
        328,
        335,
        336,
        337,
        349,
        351,
        368,
        369,
        370,
        371,
        372,
        373,
        375,
        376,
        377,
        380,
        381,
        383,
        386,
        391,
        395,
        404,
        411,
        413,
        416,
        420,
        421,
        426,
        430,
        453,
        455,
        456,
        464,
        476,
        478,
        483,
        488,
        508,
        520,
        521,
        523,
        548,
        550,
        552,
        617,
        637,
        644,
        646,
        650,
        661,
        667,
        668,
        670,
        671,
        673,
        674,
        675,
        678,
        679,
        680,
        685,
        687,
        690,
        695,
        696,
        697,
        700,
        701
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
                335
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
                548
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
                548
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
                335
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
                335
            ],
            "roleId": [
                548
            ],
            "triggers": [
                335
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
                548
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                548
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
                548
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
                548
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
                548
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                335
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
                548
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
                548
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                548
            ],
            "createdAt": [
                219
            ],
            "id": [
                548
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
                548
            ],
            "senderWorkspaceMemberId": [
                548
            ],
            "status": [
                1
            ],
            "threadId": [
                548
            ],
            "turnId": [
                548
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
                548
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                548
            ],
            "messageId": [
                548
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                335
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
                335
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                335
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
                548
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                548
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
                548
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
                548
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
                548
            ],
            "aggregateOperation": [
                27
            ],
            "configurationType": [
                678
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                335
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
                448
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
                548
            ],
            "name": [
                1
            ],
            "revokedAt": [
                219
            ],
            "role": [
                470
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
                548
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
                335
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                548
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
                548
            ],
            "role": [
                377
            ],
            "workspaceMemberId": [
                548
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
                548
            ],
            "applicationVariables": [
                85
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                335
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
                470
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                295
            ],
            "grantedIframeMediaPermissions": [
                317
            ],
            "healthCheckLogicFunctionId": [
                548
            ],
            "id": [
                548
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                348
            ],
            "logoFileId": [
                548
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                397
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                548
            ],
            "requestedIframeMediaPermissions": [
                317
            ],
            "runOnUserPreferences": [
                4
            ],
            "settingsCustomTabFrontComponentId": [
                548
            ],
            "settingsMenuItems": [
                507
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                548
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
                548
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
                548
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                548
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
                444
            ],
            "connectionProviderId": [
                548
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
                548
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
                548
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
                548
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
                335
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
                548
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
                288
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
                288
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
                288
            ],
            "fileId": [
                548
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
                548
            ],
            "connectionProviders": [
                57
            ],
            "hasUserHealthCheck": [
                4
            ],
            "settingsMenuItems": [
                507
            ],
            "variables": [
                649
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
                548
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
                548
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
                659
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                548
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
                548
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
                335
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
                548
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
                335
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
                548
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
                487
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
                548
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
                486
            ],
            "workspaceUrls": [
                702
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
                548
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
                678
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
                335
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
                411
            ],
            "primaryAxisGroupByFieldMetadataId": [
                548
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                313
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                411
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                548
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                313
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
                335
            ],
            "formattedToRawLookup": [
                335
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
                335
            ],
            "objectMetadataId": [
                548
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
                548
            ],
            "userCreditsFallback": [
                650
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
                521
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
                520
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
                520
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
                548
            ],
            "interval": [
                520
            ],
            "metadata": [
                335
            ],
            "phases": [
                129
            ],
            "status": [
                521
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
                548
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
                548
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
                548
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
                678
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                678
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                678
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
                678
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                335
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
                678
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
                391
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                393
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
                442
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                505
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                522
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
                548
            ],
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                548
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
                548
            ],
            "createdAt": [
                219
            ],
            "engineComponentKey": [
                253
            ],
            "frontComponent": [
                295
            ],
            "frontComponentId": [
                548
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                548
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
                548
            ],
            "pageLayoutId": [
                548
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
                548
            ],
            "updatedAt": [
                219
            ],
            "workflowVersionId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                403
            ],
            "on_PathCommandMenuItemPayload": [
                428
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
                286
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                548
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
                444
            ],
            "connectionProviderId": [
                548
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
                548
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
                548
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
                320
            ],
            "handle": [
                1
            ],
            "id": [
                548
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                548
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
                548
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
                335
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
                335
            ],
            "roleId": [
                548
            ],
            "triggers": [
                335
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                548
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                548
            ],
            "participantHandleFieldUniversalIdentifier": [
                548
            ],
            "visibility": [
                373
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
                548
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
                548
            ],
            "engineComponentKey": [
                253
            ],
            "frontComponentId": [
                548
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
                548
            ],
            "pageLayoutId": [
                548
            ],
            "payload": [
                335
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                548
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
                367
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
                335
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
                335
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                548
            ],
            "options": [
                335
            ],
            "relationCreationPayload": [
                335
            ],
            "settings": [
                335
            ],
            "type": [
                281
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
                548
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
                548
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
                328
            ],
            "objectMetadataId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                335
            ],
            "databaseEventTriggerSettings": [
                335
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                335
            ],
            "id": [
                548
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                335
            ],
            "source": [
                335
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                335
            ],
            "universalIdentifier": [
                548
            ],
            "workflowActionTriggerSettings": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                548
            ],
            "id": [
                548
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                548
            ],
            "color": [
                1
            ],
            "folderId": [
                548
            ],
            "icon": [
                1
            ],
            "id": [
                548
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
                548
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                548
            ],
            "targetRecordId": [
                548
            ],
            "type": [
                395
            ],
            "userWorkspaceId": [
                548
            ],
            "viewId": [
                548
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
                335
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
                548
            ],
            "type": [
                421
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                420
            ],
            "pageLayoutId": [
                548
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
                335
            ],
            "objectMetadataId": [
                548
            ],
            "pageLayoutTabId": [
                548
            ],
            "position": [
                335
            ],
            "title": [
                1
            ],
            "type": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                548
            ],
            "filter": [
                335
            ],
            "objectMetadataId": [
                548
            ],
            "orderBy": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                548
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                548
            ],
            "secondFieldMetadataId": [
                548
            ],
            "thirdFieldMetadataId": [
                548
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
                548
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
                552
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
                637
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                644
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                646
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
                548
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                548
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
                548
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
                548
            ],
            "id": [
                548
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
                548
            ],
            "viewId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                548
            ],
            "logicalOperator": [
                667
            ],
            "parentViewFilterGroupId": [
                548
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                548
            ],
            "id": [
                548
            ],
            "operand": [
                668
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                548
            ],
            "subFieldName": [
                1
            ],
            "value": [
                335
            ],
            "viewFilterGroupId": [
                548
            ],
            "viewId": [
                548
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
                548
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                548
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
                548
            ],
            "calendarFieldMetadataId": [
                548
            ],
            "calendarLayout": [
                661
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                548
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                548
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                670
            ],
            "mainGroupByFieldMetadataId": [
                548
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                548
            ],
            "openRecordIn": [
                671
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                674
            ],
            "visibility": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                673
            ],
            "fieldMetadataId": [
                548
            ],
            "id": [
                548
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                548
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
                548
            ],
            "operations": [
                1
            ],
            "roleId": [
                548
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
                637
            ],
            "resource": [
                644
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                548
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                548
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
                548
            ],
            "name": [
                298
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                548
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
                548
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
                548
            ],
            "pageLayoutId": [
                548
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
                548
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
                548
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                488
            ],
            "type": [
                315
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                548
            ],
            "status": [
                488
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
                678
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
                548
            ],
            "status": [
                250
            ],
            "tenantStatus": [
                251
            ],
            "unsubscribeHostnameStatus": [
                550
            ],
            "updatedAt": [
                219
            ],
            "verificationRecords": [
                656
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
                678
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
                335
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
                335
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
                335
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
                259
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
                264
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
                262
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                263
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
                265
            ],
            "first": [
                10
            ],
            "table": [
                270
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                266
            ],
            "records": [
                269
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
                335
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
                382
            ],
            "objectRecordEventsWithQueryIds": [
                410
            ],
            "queueJobEvents": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                548
            ],
            "payload": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                274
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
                548
            ],
            "createdAt": [
                219
            ],
            "defaultValue": [
                335
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
                548
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
                548
            ],
            "morphRelations": [
                463
            ],
            "name": [
                1
            ],
            "object": [
                397
            ],
            "objectMetadataId": [
                548
            ],
            "options": [
                335
            ],
            "relation": [
                463
            ],
            "settings": [
                335
            ],
            "type": [
                281
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
                678
            ],
            "fieldDisplayMode": [
                278
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
                279
            ],
            "pageInfo": [
                417
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
                275
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                280
            ],
            "id": [
                549
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
                549
            ],
            "or": [
                280
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
                548
            ],
            "id": [
                548
            ],
            "objectMetadataId": [
                548
            ],
            "roleId": [
                548
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
                548
            ],
            "objectMetadataId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                678
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                678
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
                548
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
                548
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
                548
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
                548
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
                678
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                548
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                488
            ],
            "type": [
                315
            ],
            "workspace": [
                699
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
                380
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                678
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
                317
            ],
            "applicationId": [
                548
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                84
            ],
            "applicationVariables": [
                335
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
                548
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
                548
            ],
            "updatedAt": [
                219
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                297
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                678
            ],
            "frontComponentId": [
                548
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                548
            ],
            "pageLayoutType": [
                421
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
                482
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                335
            ],
            "runId": [
                548
            ],
            "scope": [
                335
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
                335
            ],
            "runId": [
                548
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
                548
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
                548
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
                548
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
                305
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                305
            ],
            "snoozedUntil": [
                1
            ],
            "steps": [
                306
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                305
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
                307
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
                310
            ],
            "stepActionKey": [
                305
            ],
            "trigger": [
                311
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
                680
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
                548
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
                678
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
                321
            ],
            "IMAP": [
                321
            ],
            "SMTP": [
                321
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
                703
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
                548
            ],
            "threadId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                548
            ],
            "createdAt": [
                219
            ],
            "id": [
                548
            ],
            "indexFieldMetadataList": [
                326
            ],
            "indexType": [
                328
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
                324
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
                548
            ],
            "id": [
                548
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
                327
            ],
            "id": [
                549
            ],
            "isCustom": [
                134
            ],
            "or": [
                327
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                548
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
                331
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
                548
            ],
            "messageThreadId": [
                548
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
                337
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                548
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
                678
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
                335
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
                411
            ],
            "primaryAxisGroupByFieldMetadataId": [
                548
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                313
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                411
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                548
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                313
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
                335
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                343
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
                335
            ],
            "objectMetadataId": [
                548
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
                342
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                548
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
                548
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                219
            ],
            "cronTriggerSettings": [
                335
            ],
            "databaseEventTriggerSettings": [
                335
            ],
            "description": [
                1
            ],
            "executionMode": [
                349
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                335
            ],
            "id": [
                548
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
                335
            ],
            "universalIdentifier": [
                548
            ],
            "updatedAt": [
                219
            ],
            "workflowActionTriggerSettings": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                335
            ],
            "duration": [
                6
            ],
            "error": [
                335
            ],
            "logs": [
                1
            ],
            "status": [
                351
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                548
            ],
            "applicationUniversalIdentifier": [
                548
            ],
            "id": [
                548
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                548
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
                335
            ],
            "name": [
                1
            ],
            "objects": [
                358
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "requestedIframeMediaPermissions": [
                317
            ],
            "roles": [
                359
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
                360
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                361
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
                548
            ],
            "connectionProviderId": [
                548
            ],
            "createdAt": [
                219
            ],
            "id": [
                548
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
                363
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
                335
            ],
            "description": [
                1
            ],
            "inputSchema": [
                335
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
                678
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                678
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
                548
            ],
            "contactAutoCreationPolicy": [
                368
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
                548
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
                375
            ],
            "messagingProviderUniversalIdentifier": [
                548
            ],
            "participantHandleFieldUniversalIdentifier": [
                548
            ],
            "pendingGroupEmailsAction": [
                369
            ],
            "syncStage": [
                370
            ],
            "syncStageStartedAt": [
                219
            ],
            "syncStatus": [
                371
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
                372
            ],
            "updatedAt": [
                219
            ],
            "visibility": [
                373
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
                548
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                548
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                376
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
                548
            ],
            "reason": [
                380
            ],
            "source": [
                381
            ],
            "unsubscribeTopicId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                378
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
                409
            ],
            "recordId": [
                1
            ],
            "type": [
                383
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
                548
            ],
            "property": [
                1
            ],
            "provenance": [
                386
            ],
            "recordId": [
                548
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
                548
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                548
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
                389
            ],
            "views": [
                390
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
                548
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
                548
            ],
            "key": [
                670
            ],
            "objectMetadataId": [
                548
            ],
            "type": [
                674
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                514,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                684,
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
                        548,
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
                        548,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        318,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        548
                    ],
                    "threadId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        548,
                        "UUID!"
                    ],
                    "roleId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        548,
                        "UUID!"
                    ],
                    "roleId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        323,
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
                        520,
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
                        548,
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
                        548,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                415,
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
                290,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                290,
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
                290,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                290,
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
                367,
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
                        548
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
                289,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        288,
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
                295,
                {
                    "input": [
                        187,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                394,
                {
                    "inputs": [
                        193,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                664,
                {
                    "inputs": [
                        208,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                663,
                {
                    "inputs": [
                        209,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                669,
                {
                    "inputs": [
                        212,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                362,
                {
                    "input": [
                        191,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                378,
                {
                    "input": [
                        192,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                394,
                {
                    "input": [
                        193,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                289,
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
                511,
                {
                    "input": [
                        509,
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
                        548,
                        "UUID!"
                    ],
                    "properties": [
                        335
                    ],
                    "recordId": [
                        548,
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
                275,
                {
                    "input": [
                        195,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                324,
                {
                    "input": [
                        196,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                348,
                {
                    "input": [
                        190,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                397,
                {
                    "input": [
                        197,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                470,
                {
                    "createRoleInput": [
                        203,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                418,
                {
                    "input": [
                        198,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                419,
                {
                    "input": [
                        199,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                422,
                {
                    "input": [
                        200,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                441,
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
                462,
                {
                    "input": [
                        202,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                511,
                {
                    "input": [
                        510,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                514,
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
                        520,
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
                551,
                {
                    "input": [
                        205,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                635,
                {
                    "input": [
                        206,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                655,
                {
                    "input": [
                        207,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                660,
                {
                    "input": [
                        213,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                663,
                {
                    "input": [
                        209,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                664,
                {
                    "input": [
                        208,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                665,
                {
                    "input": [
                        211,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                666,
                {
                    "input": [
                        210,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                669,
                {
                    "input": [
                        212,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                672,
                {
                    "input": [
                        214,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                676,
                {
                    "input": [
                        215,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                514,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        548,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        548
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
                367,
                {
                    "id": [
                        548,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                166,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                684
            ],
            "deleteEmailGroupChannel": [
                367,
                {
                    "id": [
                        548,
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
                295,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                394,
                {
                    "ids": [
                        548,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                362,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                394,
                {
                    "id": [
                        548,
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
                275,
                {
                    "input": [
                        221,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                324,
                {
                    "input": [
                        222,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                348,
                {
                    "input": [
                        352,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                397,
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
                        548,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                462,
                {
                    "id": [
                        548,
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
                514,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                226,
                {
                    "twoFactorAuthenticationMethodId": [
                        548,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                648
            ],
            "deleteUserFromWorkspace": [
                652,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                655,
                {
                    "id": [
                        548,
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
                663,
                {
                    "input": [
                        228,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                664,
                {
                    "input": [
                        227,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                665,
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
                669,
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
                676,
                {
                    "id": [
                        548,
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
                663,
                {
                    "input": [
                        234,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                664,
                {
                    "input": [
                        233,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                665,
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
                669,
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
                        323,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                166,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                241,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                242,
                {
                    "id": [
                        548,
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
                        548
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
                688
            ],
            "executeOneLogicFunction": [
                350,
                {
                    "input": [
                        272,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                300,
                {
                    "input": [
                        299,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                45,
                {
                    "apiKeyId": [
                        548,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                90
            ],
            "generateTransientToken": [
                531
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                545,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        548,
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
                546,
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
                302,
                {
                    "input": [
                        303,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                355,
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
                414
            ],
            "grantApplicationCapabilities": [
                55,
                {
                    "input": [
                        312,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                322,
                {
                    "userId": [
                        548,
                        "UUID!"
                    ],
                    "workspaceId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                330,
                {
                    "input": [
                        329,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                332,
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
                332
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        548
                    ],
                    "threadId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                548,
                {
                    "workspaceMemberId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                308,
                {
                    "stepActionKey": [
                        305,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                260
            ],
            "removeAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        465,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                457,
                {
                    "principal": [
                        454,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        461,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        548,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        466,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                467,
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
                501,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                418,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                422,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                526,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                493,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        548,
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
                        468,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                472,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                484,
                {
                    "input": [
                        480,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                69,
                {
                    "applicationId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                69,
                {
                    "applicationId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                319,
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
                        548
                    ]
                }
            ],
            "sendAppChannelMessage": [
                492,
                {
                    "input": [
                        491,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                493,
                {
                    "browsingContext": [
                        335
                    ],
                    "channelId": [
                        548
                    ],
                    "fileAttachments": [
                        287,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        4
                    ],
                    "isAssistantParticipant": [
                        4
                    ],
                    "mentionedWorkspaceMemberIds": [
                        548,
                        "[UUID!]"
                    ],
                    "messageId": [
                        548,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "recipientWorkspaceMemberIds": [
                        548,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                496,
                {
                    "input": [
                        495,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                500,
                {
                    "input": [
                        499,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                501,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        548
                    ]
                }
            ],
            "sendMessageCampaign": [
                503,
                {
                    "input": [
                        502,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                498,
                {
                    "input": [
                        504,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                47,
                {
                    "input": [
                        506,
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
                260,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                457,
                {
                    "isPrivate": [
                        4,
                        "Boolean!"
                    ],
                    "target": [
                        461,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                457,
                {
                    "accessLevel": [
                        453,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        454,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        461,
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
                512,
                {
                    "input": [
                        513
                    ]
                }
            ],
            "signUpInWorkspace": [
                512,
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
                        548
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
                415,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                148,
                {
                    "connectedAccountId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                516,
                {
                    "companyContext": [
                        335
                    ],
                    "personContext": [
                        335
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                517
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
                374,
                {
                    "input": [
                        524,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                698,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        335,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "syncMcpServerTools": [
                362,
                {
                    "id": [
                        548,
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
                        335
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
                533,
                {
                    "input": [
                        532,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                537,
                {
                    "input": [
                        534,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                536,
                {
                    "input": [
                        535,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                541,
                {
                    "input": [
                        538,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                540,
                {
                    "input": [
                        539,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                543,
                {
                    "input": [
                        542,
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
                        548,
                        "UUID!"
                    ],
                    "input": [
                        553,
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
                        548,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                43,
                {
                    "input": [
                        555,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                367,
                {
                    "input": [
                        556,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                53,
                {
                    "id": [
                        548,
                        "UUID!"
                    ],
                    "input": [
                        557,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                79,
                {
                    "input": [
                        558,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                83,
                {
                    "input": [
                        560,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                135,
                {
                    "input": [
                        562,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                162,
                {
                    "input": [
                        564,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                367,
                {
                    "input": [
                        565,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                295,
                {
                    "input": [
                        567,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                304,
                {
                    "input": [
                        569,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                273,
                {
                    "input": [
                        570,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                394,
                {
                    "inputs": [
                        583,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                397,
                {
                    "inputs": [
                        584,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                669,
                {
                    "inputs": [
                        606,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                362,
                {
                    "input": [
                        573,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                367,
                {
                    "input": [
                        575,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                374,
                {
                    "input": [
                        577,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                374,
                {
                    "input": [
                        579,
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
                394,
                {
                    "input": [
                        583,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        554,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        548
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
                275,
                {
                    "input": [
                        582,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        571,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                397,
                {
                    "input": [
                        584,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                470,
                {
                    "updateRoleInput": [
                        591,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                418,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        585,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        586,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                422,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        588,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                418,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        590,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                333,
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
                514,
                {
                    "input": [
                        593,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                526,
                {
                    "input": [
                        594,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                551,
                {
                    "input": [
                        595,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                635,
                {
                    "input": [
                        596,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                107,
                {
                    "userCreditsFallback": [
                        650,
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
                655,
                {
                    "input": [
                        597,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                660,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        608,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                663,
                {
                    "input": [
                        601,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                664,
                {
                    "input": [
                        599,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                665,
                {
                    "input": [
                        604,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                666,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        603,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                669,
                {
                    "input": [
                        606,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                672,
                {
                    "input": [
                        609,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                676,
                {
                    "input": [
                        611,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                684,
                {
                    "data": [
                        615,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                684,
                {
                    "data": [
                        613,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                684,
                {
                    "data": [
                        614,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                693,
                {
                    "roleId": [
                        548,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        616,
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
                        617,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                286,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        617,
                        "Upload!"
                    ],
                    "fileFolder": [
                        288,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                290,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        617,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                290,
                {
                    "file": [
                        617,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                290,
                {
                    "file": [
                        617,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                290,
                {
                    "file": [
                        617,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                282,
                {
                    "upsertFieldPermissionsInput": [
                        618,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                660,
                {
                    "input": [
                        621,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                405,
                {
                    "upsertObjectPermissionsInput": [
                        622,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                471,
                {
                    "upsertPermissionFlagsInput": [
                        623,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                625,
                {
                    "input": [
                        624,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                660,
                {
                    "input": [
                        626,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                87,
                {
                    "input": [
                        653,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                657,
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
                658,
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
                548
            ],
            "applicationId": [
                548
            ],
            "color": [
                1
            ],
            "createdAt": [
                219
            ],
            "folderId": [
                548
            ],
            "icon": [
                1
            ],
            "id": [
                548
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
                548
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                548
            ],
            "targetRecordId": [
                548
            ],
            "targetRecordIdentifier": [
                450
            ],
            "type": [
                395
            ],
            "updatedAt": [
                219
            ],
            "userWorkspaceId": [
                548
            ],
            "viewId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                678
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                548
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
                400,
                {
                    "filter": [
                        280,
                        "FieldFilter!"
                    ],
                    "paging": [
                        217,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                275
            ],
            "icon": [
                1
            ],
            "id": [
                548
            ],
            "imageIdentifierFieldMetadataId": [
                548
            ],
            "indexMetadataList": [
                324
            ],
            "indexMetadatas": [
                402,
                {
                    "filter": [
                        327,
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
                548
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
                404
            ],
            "searchFieldMetadataList": [
                490
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
                399
            ],
            "pageInfo": [
                417
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
                397
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                279
            ],
            "pageInfo": [
                417
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                401
            ],
            "id": [
                549
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
                401
            ],
            "universalIdentifier": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                325
            ],
            "pageInfo": [
                417
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                548
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
                548
            ],
            "restrictedFields": [
                335
            ],
            "rowLevelPermissionPredicateGroups": [
                474
            ],
            "rowLevelPermissionPredicates": [
                473
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
                548
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
                409
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
                335
            ],
            "before": [
                335
            ],
            "diff": [
                335
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
                408
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
                548
            ],
            "restrictedFields": [
                335
            ],
            "rowLevelRecordsPermissions": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                413
            ],
            "previousOnboardingStatus": [
                413
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
                548
            ],
            "createdAt": [
                219
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                548
            ],
            "deletedAt": [
                219
            ],
            "id": [
                548
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
                548
            ],
            "tabs": [
                419
            ],
            "type": [
                421
            ],
            "universalIdentifier": [
                548
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
                548
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
                548
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
                420
            ],
            "pageLayoutId": [
                548
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                548
            ],
            "updatedAt": [
                219
            ],
            "widgets": [
                422
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                317
            ],
            "applicationId": [
                548
            ],
            "applicationName": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                335
            ],
            "configuration": [
                677
            ],
            "createdAt": [
                219
            ],
            "deletedAt": [
                219
            ],
            "gridPosition": [
                314
            ],
            "id": [
                548
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
                548
            ],
            "pageLayoutTabId": [
                548
            ],
            "position": [
                425
            ],
            "title": [
                1
            ],
            "type": [
                679
            ],
            "universalIdentifier": [
                548
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
                420
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
                420
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
                423
            ],
            "on_PageLayoutWidgetGridPosition": [
                424
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                427
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                426
            ],
            "index": [
                10
            ],
            "layoutMode": [
                420
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
                548
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
                548
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
                548
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
                548
            ],
            "aggregateOperation": [
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                678
            ],
            "dateGranularity": [
                411
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
                335
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                548
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
                313
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
                434
            ],
            "formattedToRawLookup": [
                335
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
                335
            ],
            "objectMetadataId": [
                548
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
                347
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
                366
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                548
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
                548
            ],
            "createdAt": [
                219
            ],
            "domain": [
                1
            ],
            "id": [
                548
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
                274
            ],
            "metadata": [
                443
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
                440
            ],
            "IMAP": [
                440
            ],
            "SMTP": [
                440
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
                548
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                702
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
                548
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
                        548,
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
                        548,
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
                        301,
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
                        344
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
                367,
                {
                    "filter": [
                        345
                    ]
                }
            ],
            "appMessageFolders": [
                374,
                {
                    "filter": [
                        346
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                56,
                {
                    "applicationId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                57,
                {
                    "applicationId": [
                        548,
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
                489,
                {
                    "applicationId": [
                        548,
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
                548,
                {
                    "calendarEventId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "agentUniversalIdentifier": [
                        548
                    ],
                    "threadId": [
                        548
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
                        548
                    ],
                    "threadId": [
                        548
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
                        548,
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
                692,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                518,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                162
            ],
            "currentUser": [
                648
            ],
            "currentUserApplicationAuthorizations": [
                54
            ],
            "currentUserSessions": [
                651
            ],
            "currentWorkspace": [
                684
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
                261
            ],
            "eventLogs": [
                268,
                {
                    "input": [
                        267,
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
                        548,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                275,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                277,
                {
                    "filter": [
                        280,
                        "FieldFilter!"
                    ],
                    "paging": [
                        217,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                439,
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
                338,
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
                348
            ],
            "findManyMarketplaceApps": [
                356,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                441
            ],
            "findMarketplaceAppDetail": [
                357,
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
                        548
                    ],
                    "universalIdentifier": [
                        548
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
                348,
                {
                    "input": [
                        352,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                338,
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
                338,
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
                686
            ],
            "findWorkspaceFromInviteHash": [
                684,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                691
            ],
            "frontComponent": [
                295,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                295
            ],
            "getAddressDetails": [
                435,
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
                470
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
                335,
                {
                    "input": [
                        352,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                168,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                249
            ],
            "getInviteSuggestions": [
                334
            ],
            "getJobs": [
                338,
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
                        352,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                418,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                419,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                422,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                422,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                418,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        421
                    ]
                }
            ],
            "getPermissionFlags": [
                429
            ],
            "getPublicWorkspaceDataByDomain": [
                445,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                446,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                124
            ],
            "getRole": [
                470,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                470
            ],
            "getSSOIdentityProviders": [
                292
            ],
            "getToolIndex": [
                530
            ],
            "getToolInputSchema": [
                335,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                632,
                {
                    "input": [
                        633
                    ]
                }
            ],
            "getView": [
                660,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                663,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                664,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                664,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                663,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                665,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                666,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                666,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                665,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                669,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                669,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                672,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                672,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                660,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        674,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                689
            ],
            "gettingStartedProgress": [
                304
            ],
            "gettingStartedWorkflowPreviews": [
                309
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
                340,
                {
                    "input": [
                        341,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                115
            ],
            "mcpServer": [
                362,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                362
            ],
            "messageSuppressions": [
                379,
                {
                    "input": [
                        293,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                384,
                {
                    "input": [
                        387,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                388
            ],
            "mostlyEmptyFieldMetadataIds": [
                548,
                {
                    "objectMetadataId": [
                        548,
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
                        548
                    ]
                }
            ],
            "myConnectedAccounts": [
                166
            ],
            "myMessageChannels": [
                367,
                {
                    "connectedAccountId": [
                        548
                    ]
                }
            ],
            "myMessageFolders": [
                374,
                {
                    "messageChannelId": [
                        548
                    ]
                }
            ],
            "myUserApplicationVariables": [
                694
            ],
            "navigationMenuItem": [
                394,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                394
            ],
            "object": [
                397,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                407
            ],
            "objects": [
                398,
                {
                    "filter": [
                        401,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        217,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                432,
                {
                    "input": [
                        433,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                143,
                {
                    "input": [
                        436,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                438,
                {
                    "input": [
                        437,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                357,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                356
            ],
            "recordPermissions": [
                452,
                {
                    "targets": [
                        461,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                457,
                {
                    "target": [
                        461,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                462
            ],
            "skill": [
                514,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                514
            ],
            "timelineActivityTypes": [
                526
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                547,
                {
                    "userId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                551
            ],
            "usageLimits": [
                635
            ],
            "usageQuotaDefinitions": [
                639
            ],
            "usageQuotaScopeConsumption": [
                641,
                {
                    "input": [
                        642,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                643
            ],
            "validatePasswordResetToken": [
                654,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                655,
                {
                    "objectMetadataId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                655,
                {
                    "fieldMetadataId": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                676,
                {
                    "id": [
                        548,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                676
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                548
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
                548
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
                548
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
                548
            ],
            "permissions": [
                451
            ],
            "recordId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                548
            ],
            "workspaceMemberId": [
                548
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
                451
            ],
            "roles": [
                459
            ],
            "shares": [
                458
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                453
            ],
            "id": [
                18
            ],
            "principalId": [
                548
            ],
            "principalRoleId": [
                548
            ],
            "principalType": [
                455
            ],
            "rowCause": [
                456
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
                548
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
                678
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
                548
            ],
            "recordId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                548
            ],
            "id": [
                548
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                548
            ],
            "secondFieldMetadataId": [
                548
            ],
            "thirdFieldMetadataId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                275
            ],
            "sourceObjectMetadata": [
                397
            ],
            "targetFieldMetadata": [
                275
            ],
            "targetObjectMetadata": [
                397
            ],
            "type": [
                464
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
                548
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
                548
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
                282
            ],
            "icon": [
                1
            ],
            "id": [
                548
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                405
            ],
            "permissionFlags": [
                471
            ],
            "rowLevelPermissionPredicateGroups": [
                474
            ],
            "rowLevelPermissionPredicates": [
                473
            ],
            "universalIdentifier": [
                548
            ],
            "workspaceMembers": [
                693
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
                548
            ],
            "roleId": [
                548
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
                478
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
                335
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
                476
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
                548
            ],
            "logicalOperator": [
                476
            ],
            "objectMetadataId": [
                548
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                548
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
                548
            ],
            "id": [
                548
            ],
            "operand": [
                478
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "relationFieldMetadataId": [
                548
            ],
            "rowLevelPermissionPredicateGroupId": [
                548
            ],
            "subFieldName": [
                1
            ],
            "value": [
                335
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
                474
            ],
            "predicates": [
                473
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
                482
            ],
            "messages": [
                482
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                335
            ],
            "runAsWorkspaceMemberId": [
                548
            ],
            "thread": [
                485
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
                548
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
                481
            ],
            "content": [
                1
            ],
            "role": [
                483
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
                335
            ],
            "runId": [
                548
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                548
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
                548
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                488
            ],
            "type": [
                315
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                548
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                488
            ],
            "type": [
                315
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
                548
            ],
            "id": [
                548
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                548
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
                548
            ],
            "messageChannelId": [
                548
            ],
            "messageThreadId": [
                548
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
                548
            ],
            "messageThreadId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                548
            ],
            "messageId": [
                1
            ],
            "queued": [
                4
            ],
            "recipientParticipantWorkspaceMemberIds": [
                548
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
                494
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
                497
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
                548
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
                335
            ],
            "workspaceMemberIds": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                548
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
                691
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
                335
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                548
            ],
            "createdAt": [
                219
            ],
            "frontComponentId": [
                548
            ],
            "icon": [
                1
            ],
            "id": [
                548
            ],
            "position": [
                6
            ],
            "scope": [
                508
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                548
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
                548
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
                548
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                488
            ],
            "type": [
                315
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
                703
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
                548
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
                548
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
                469
            ],
            "configurationType": [
                678
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                701
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
                269,
                {
                    "fieldFilters": [
                        263,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        270,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                449,
                {
                    "input": [
                        201,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                353,
                {
                    "input": [
                        354,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                14,
                {
                    "agentUniversalIdentifier": [
                        548
                    ],
                    "runId": [
                        548
                    ],
                    "threadId": [
                        548
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "onEventSubscription": [
                271,
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
                523
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                678
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
                548
            ],
            "createdAt": [
                219
            ],
            "emit": [
                527
            ],
            "frontComponentUniversalIdentifier": [
                548
            ],
            "icon": [
                1
            ],
            "id": [
                548
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
                548
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                548
            ],
            "universalIdentifier": [
                548
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
                548
            ],
            "on": [
                1
            ],
            "through": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                548
            ],
            "relationFieldUniversalIdentifier": [
                548
            ],
            "triggerFieldUniversalIdentifiers": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                678
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
                335
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
                548
            ],
            "personFilter": [
                335
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
                548
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
                548
            ],
            "gt": [
                548
            ],
            "gte": [
                548
            ],
            "iLike": [
                548
            ],
            "in": [
                548
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                548
            ],
            "lt": [
                548
            ],
            "lte": [
                548
            ],
            "neq": [
                548
            ],
            "notILike": [
                548
            ],
            "notIn": [
                548
            ],
            "notLike": [
                548
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
                548
            ],
            "name": [
                1
            ],
            "updatedAt": [
                219
            ],
            "visibility": [
                552
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
                548
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
                548
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                335
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
                335
            ],
            "roleId": [
                548
            ],
            "triggers": [
                335
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
                548
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
                548
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                548
            ],
            "visibility": [
                373
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
                559
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
                561
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
                548
            ],
            "update": [
                563
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
                548
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
                548
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                548
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                335
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
                335
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                548
            ],
            "options": [
                335
            ],
            "settings": [
                335
            ],
            "translations": [
                385
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
                548
            ],
            "update": [
                568
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
                305
            ],
            "completedStepChatThreadId": [
                1
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                305
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
                548
            ],
            "update": [
                572
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                335
            ],
            "databaseEventTriggerSettings": [
                335
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                335
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
                335
            ],
            "workflowActionTriggerSettings": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                548
            ],
            "update": [
                574
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                548
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
                548
            ],
            "update": [
                576
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                368
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
                375
            ],
            "visibility": [
                373
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                548
            ],
            "update": [
                578
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
                548
            ],
            "update": [
                578
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
                548
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
                548
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
                548
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
                548
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
                404
            ],
            "shortcut": [
                1
            ],
            "translations": [
                385
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                548
            ],
            "update": [
                566
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                548
            ],
            "update": [
                580
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                548
            ],
            "update": [
                581
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
                548
            ],
            "type": [
                421
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
                420
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
                548
            ],
            "layoutMode": [
                420
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                589
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
                335
            ],
            "configuration": [
                335
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                548
            ],
            "pageLayoutTabId": [
                548
            ],
            "position": [
                335
            ],
            "title": [
                1
            ],
            "type": [
                679
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
                335
            ],
            "configuration": [
                335
            ],
            "id": [
                548
            ],
            "objectMetadataId": [
                548
            ],
            "pageLayoutTabId": [
                548
            ],
            "position": [
                335
            ],
            "title": [
                1
            ],
            "type": [
                679
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
                548
            ],
            "tabs": [
                587
            ],
            "type": [
                421
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                548
            ],
            "update": [
                592
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
                548
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
                548
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                385
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
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                548
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
                548
            ],
            "update": [
                598
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
                548
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
                548
            ],
            "update": [
                600
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
                548
            ],
            "update": [
                602
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                548
            ],
            "logicalOperator": [
                667
            ],
            "parentViewFilterGroupId": [
                548
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                548
            ],
            "update": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                548
            ],
            "operand": [
                668
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                548
            ],
            "subFieldName": [
                1
            ],
            "value": [
                335
            ],
            "viewFilterGroupId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                548
            ],
            "update": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                548
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
                548
            ],
            "calendarFieldMetadataId": [
                548
            ],
            "calendarLayout": [
                661
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                548
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                548
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                548
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                671
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "translations": [
                385
            ],
            "type": [
                674
            ],
            "visibility": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                548
            ],
            "update": [
                610
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                673
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
                548
            ],
            "update": [
                612
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
                548
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
                335
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                548
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
                690
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                335
            ],
            "workspaceMemberId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                283
            ],
            "roleId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                548
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                619
            ],
            "id": [
                548
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
                619
            ],
            "groups": [
                620
            ],
            "widgetId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                406
            ],
            "roleId": [
                548
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                548
            ],
            "predicateGroups": [
                475
            ],
            "predicates": [
                477
            ],
            "roleId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                474
            ],
            "predicates": [
                473
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                630
            ],
            "viewFields": [
                627
            ],
            "viewFilterGroups": [
                628
            ],
            "viewFilters": [
                629
            ],
            "viewSorts": [
                631
            ],
            "widgetId": [
                548
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
                548
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                548
            ],
            "logicalOperator": [
                667
            ],
            "parentViewFilterGroupId": [
                548
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
                548
            ],
            "id": [
                548
            ],
            "operand": [
                668
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                548
            ],
            "subFieldName": [
                1
            ],
            "value": [
                335
            ],
            "viewFilterGroupId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                548
            ],
            "calendarFieldMetadataId": [
                548
            ],
            "calendarLayout": [
                661
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                548
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                548
            ],
            "openRecordIn": [
                671
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                674
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                673
            ],
            "fieldMetadataId": [
                548
            ],
            "id": [
                548
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
                645
            ],
            "usageByApplication": [
                634
            ],
            "usageByModel": [
                634
            ],
            "usageByOperationType": [
                634
            ],
            "usageByUser": [
                634
            ],
            "userDailyUsage": [
                647
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                637
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
                548
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                105
            ],
            "operationType": [
                637
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                644
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                646
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
                646
            ],
            "operationType": [
                637
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                636
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                640
            ],
            "resourceType": [
                644
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                638
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
                637
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                646
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
                637
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                644
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                646
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
                548
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                105
            ],
            "operationType": [
                637
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
                644
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
                646
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
                645
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
                652
            ],
            "currentWorkspace": [
                684
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
                548
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
                413
            ],
            "previousOnboardingStatus": [
                413
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                219
            ],
            "userVars": [
                336
            ],
            "userWorkspaces": [
                652
            ],
            "workspaceMember": [
                693
            ],
            "workspaceMembers": [
                693
            ],
            "workspaces": [
                652
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
                335
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
                548
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
                548
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
                548
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                405
            ],
            "objectRecordsPermissions": [
                412
            ],
            "objectsPermissions": [
                405
            ],
            "permissionFlags": [
                430
            ],
            "twoFactorAuthenticationMethodSummary": [
                544
            ],
            "updatedAt": [
                219
            ],
            "user": [
                648
            ],
            "userId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                548
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
                548
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
                548
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                548
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
                548
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
                702
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
                548
            ],
            "calendarEndFieldMetadataId": [
                548
            ],
            "calendarFieldMetadataId": [
                548
            ],
            "calendarLayout": [
                661
            ],
            "createdAt": [
                219
            ],
            "createdByUserWorkspaceId": [
                548
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
                548
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
                548
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                670
            ],
            "mainGroupByFieldMetadataId": [
                548
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                548
            ],
            "openRecordIn": [
                671
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                674
            ],
            "universalIdentifier": [
                548
            ],
            "updatedAt": [
                219
            ],
            "viewFieldGroups": [
                664
            ],
            "viewFields": [
                663
            ],
            "viewFilterGroups": [
                666
            ],
            "viewFilters": [
                665
            ],
            "viewGroups": [
                669
            ],
            "viewSorts": [
                672
            ],
            "visibility": [
                675
            ],
            "workspaceId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                678
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
                548
            ],
            "createdAt": [
                219
            ],
            "deletedAt": [
                219
            ],
            "fieldMetadataId": [
                548
            ],
            "id": [
                548
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
                548
            ],
            "updatedAt": [
                219
            ],
            "viewFieldGroupId": [
                548
            ],
            "viewId": [
                548
            ],
            "workspaceId": [
                548
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
                548
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
                663
            ],
            "viewId": [
                548
            ],
            "workspaceId": [
                548
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
                548
            ],
            "id": [
                548
            ],
            "operand": [
                668
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                548
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                219
            ],
            "value": [
                335
            ],
            "viewFilterGroupId": [
                548
            ],
            "viewId": [
                548
            ],
            "workspaceId": [
                548
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
                548
            ],
            "logicalOperator": [
                667
            ],
            "parentViewFilterGroupId": [
                548
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                219
            ],
            "viewId": [
                548
            ],
            "workspaceId": [
                548
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
                548
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
                548
            ],
            "workspaceId": [
                548
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
                673
            ],
            "fieldMetadataId": [
                548
            ],
            "id": [
                548
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                219
            ],
            "viewId": [
                548
            ],
            "workspaceId": [
                548
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
                548
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
                548
            ],
            "operations": [
                1
            ],
            "role": [
                470
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
                276
            ],
            "on_FieldRichTextConfiguration": [
                284
            ],
            "on_FieldsConfiguration": [
                285
            ],
            "on_FilesConfiguration": [
                291
            ],
            "on_FormFieldConfiguration": [
                294
            ],
            "on_FrontComponentConfiguration": [
                296
            ],
            "on_IframeConfiguration": [
                316
            ],
            "on_LineChartConfiguration": [
                339
            ],
            "on_MessageCampaignBodyConfiguration": [
                364
            ],
            "on_MessageCampaignDetailsConfiguration": [
                365
            ],
            "on_NotesConfiguration": [
                396
            ],
            "on_PieChartConfiguration": [
                431
            ],
            "on_RecordTableConfiguration": [
                460
            ],
            "on_StandaloneRichTextConfiguration": [
                515
            ],
            "on_TasksConfiguration": [
                525
            ],
            "on_TimelineConfiguration": [
                529
            ],
            "on_ViewConfiguration": [
                662
            ],
            "on_WorkflowConfiguration": [
                681
            ],
            "on_WorkflowRunConfiguration": [
                682
            ],
            "on_WorkflowVersionConfiguration": [
                683
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
                678
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                678
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                678
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                685
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
                335
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
                470
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
                273
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                548
            ],
            "iframeMediaPermissions": [
                317
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
                548
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
                663
            ],
            "viewFilterGroups": [
                666
            ],
            "viewFilters": [
                665
            ],
            "viewGroups": [
                669
            ],
            "viewSorts": [
                672
            ],
            "views": [
                660
            ],
            "workspaceCustomApplication": [
                53
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                690
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                702
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
                335
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                687
            ],
            "personEnrichment": [
                335
            ],
            "personOutcome": [
                700
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
                548
            ],
            "roleId": [
                548
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
                695
            ],
            "id": [
                548
            ],
            "locale": [
                1
            ],
            "name": [
                298
            ],
            "numberFormat": [
                696
            ],
            "openRecordIn": [
                416
            ],
            "roles": [
                470
            ],
            "timeFormat": [
                697
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
                548
            ],
            "userWorkspaceId": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                548
            ],
            "variables": [
                649
            ],
            "workspaceMemberId": [
                548
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
                335
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
                548
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
                548
            ],
            "workspaceUrls": [
                702
            ],
            "__typename": [
                1
            ]
        }
    }
}