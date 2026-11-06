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
        33,
        37,
        39,
        46,
        60,
        68,
        78,
        84,
        96,
        100,
        101,
        103,
        108,
        114,
        120,
        125,
        131,
        134,
        135,
        136,
        137,
        145,
        147,
        161,
        165,
        167,
        169,
        216,
        217,
        244,
        248,
        249,
        251,
        261,
        267,
        271,
        275,
        278,
        285,
        302,
        304,
        310,
        312,
        325,
        332,
        333,
        334,
        346,
        348,
        365,
        366,
        367,
        368,
        369,
        370,
        372,
        373,
        374,
        377,
        378,
        380,
        383,
        388,
        392,
        401,
        408,
        410,
        413,
        417,
        418,
        423,
        427,
        450,
        452,
        453,
        461,
        473,
        475,
        480,
        485,
        505,
        517,
        518,
        520,
        545,
        547,
        549,
        614,
        634,
        641,
        643,
        647,
        658,
        664,
        665,
        667,
        668,
        670,
        671,
        672,
        675,
        676,
        677,
        682,
        684,
        687,
        692,
        693,
        694,
        697,
        698
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
                332
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
                545
            ],
            "createdAt": [
                217
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                332
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
                332
            ],
            "roleId": [
                545
            ],
            "triggers": [
                332
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "applicationId": [
                545
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                545
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
                545
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
                545
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                332
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
                217
            ],
            "deletedAt": [
                217
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
                217
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                217
            ],
            "id": [
                545
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                217
            ],
            "lastReadAt": [
                217
            ],
            "mentionsResolvedAt": [
                217
            ],
            "snoozedUntil": [
                217
            ],
            "threadId": [
                545
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                545
            ],
            "createdAt": [
                217
            ],
            "id": [
                545
            ],
            "parts": [
                22
            ],
            "processedAt": [
                217
            ],
            "reactions": [
                23
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                545
            ],
            "senderWorkspaceMemberId": [
                545
            ],
            "status": [
                1
            ],
            "threadId": [
                545
            ],
            "turnId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                217
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                545
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                545
            ],
            "messageId": [
                545
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                332
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
                332
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                332
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
                545
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                217
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
                217
            ],
            "errorMessage": [
                1
            ],
            "id": [
                545
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
                217
            ],
            "status": [
                25
            ],
            "threadId": [
                545
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
                545
            ],
            "aggregateOperation": [
                27
            ],
            "configurationType": [
                675
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                332
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "label": [
                1
            ],
            "numberFormat": [
                147
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                445
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
        "AiChatUsage": {
            "consumedValue": [
                103
            ],
            "kind": [
                1
            ],
            "limitValue": [
                103
            ],
            "periodEnd": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                103
            ],
            "limitValue": [
                103
            ],
            "periodEnd": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "AiDataPolicy": {
            "dataResidency": [
                1
            ],
            "isZeroDataRetentionRequired": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AiDataPolicyInput": {
            "dataResidency": [
                1
            ],
            "isZeroDataRetentionRequired": [
                4
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
                36
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
                217
            ],
            "expiresAt": [
                217
            ],
            "id": [
                545
            ],
            "name": [
                1
            ],
            "revokedAt": [
                217
            ],
            "role": [
                467
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                217
            ],
            "id": [
                545
            ],
            "name": [
                1
            ],
            "revokedAt": [
                217
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
                165
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
                46
            ],
            "value": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                545
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
                47
            ],
            "externalId": [
                1
            ],
            "folderExternalIds": [
                1
            ],
            "participants": [
                50
            ],
            "receivedAt": [
                217
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
                545
            ],
            "role": [
                374
            ],
            "workspaceMemberId": [
                545
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
                80
            ],
            "applicationRegistrationId": [
                545
            ],
            "applicationVariables": [
                83
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                332
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                160
            ],
            "createdAt": [
                217
            ],
            "defaultLogicFunctionRole": [
                467
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                292
            ],
            "grantedIframeMediaPermissions": [
                314
            ],
            "healthCheckLogicFunctionId": [
                545
            ],
            "id": [
                545
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                345
            ],
            "logoFileId": [
                545
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                394
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                545
            ],
            "requestedIframeMediaPermissions": [
                314
            ],
            "runOnUserPreferences": [
                4
            ],
            "settingsCustomTabFrontComponentId": [
                545
            ],
            "settingsMenuItems": [
                504
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                545
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                217
            ],
            "id": [
                545
            ],
            "lastAuthorizedAt": [
                217
            ],
            "lastUsedAt": [
                217
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                545
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                545
            ],
            "archivedAt": [
                217
            ],
            "authFailedAt": [
                217
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                441
            ],
            "connectionProviderId": [
                545
            ],
            "createdAt": [
                217
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                545
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                217
            ],
            "lastSignedInAt": [
                217
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                165
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                217
            ],
            "userWorkspaceId": [
                545
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
                545
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                56
            ],
            "scope": [
                169
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
                58
            ],
            "coverage": [
                59
            ],
            "files": [
                61
            ],
            "manifest": [
                332
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
                78
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
                60
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
                545
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
                285
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
                285
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
                217
            ],
            "fileFolder": [
                285
            ],
            "fileId": [
                545
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
                66
            ],
            "description": [
                1
            ],
            "status": [
                68
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
                70
            ],
            "bucketSizeInSeconds": [
                10
            ],
            "creditUsage": [
                71
            ],
            "creditsUsed": [
                6
            ],
            "failedRunCount": [
                10
            ],
            "functions": [
                72
            ],
            "issues": [
                73
            ],
            "lifecycle": [
                74
            ],
            "lifecycleFailureCount": [
                10
            ],
            "lookbackInHours": [
                10
            ],
            "periodEnd": [
                217
            ],
            "periodStart": [
                217
            ],
            "rateLimitEventCount": [
                10
            ],
            "runCount": [
                10
            ],
            "versions": [
                75
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                217
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
                217
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
                217
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
                217
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
                545
            ],
            "connectionProviders": [
                55
            ],
            "hasUserHealthCheck": [
                4
            ],
            "settingsMenuItems": [
                504
            ],
            "variables": [
                646
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                217
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                545
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
                545
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                78
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                217
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
                214
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
                656
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                545
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                78
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                217
            ],
            "description": [
                1
            ],
            "id": [
                545
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
                332
            ],
            "type": [
                1
            ],
            "updatedAt": [
                217
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
                88
            ],
            "applicationRefreshToken": [
                88
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
                545
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
                332
            ],
            "scope": [
                84
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
                217
            ],
            "domain": [
                1
            ],
            "id": [
                545
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                217
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
                88
            ],
            "refreshToken": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                89
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
                545
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
                483
            ],
            "workspaceUrls": [
                699
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                93
            ],
            "availableWorkspacesForSignUp": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                94
            ],
            "tokens": [
                89
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                545
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                96
            ],
            "color": [
                1
            ],
            "configurationType": [
                675
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
                332
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupMode": [
                100
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                101
            ],
            "numberFormat": [
                147
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                408
            ],
            "primaryAxisGroupByFieldMetadataId": [
                545
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                310
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                408
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                545
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                310
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
                332
            ],
            "formattedToRawLookup": [
                332
            ],
            "groupMode": [
                100
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
                101
            ],
            "series": [
                102
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
                332
            ],
            "objectMetadataId": [
                545
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
                129
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
                545
            ],
            "userCreditsFallback": [
                647
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
                124
            ],
            "currentBillingSubscription": [
                124
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                518
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                108
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
                121
            ],
            "name": [
                1
            ],
            "prices": [
                115
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
                121
            ],
            "name": [
                1
            ],
            "prices": [
                116
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
                109
            ],
            "downgradePlanKeys": [
                114
            ],
            "isCheckoutDefault": [
                4
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                110
            ],
            "planKey": [
                114
            ],
            "resourceCreditProducts": [
                109
            ],
            "upgradePlanKeys": [
                114
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
                131
            ],
            "recurringInterval": [
                517
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
                131
            ],
            "recurringInterval": [
                517
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                117
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
                121
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
                121
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                109
            ],
            "on_BillingMeteredProduct": [
                110
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
                114
            ],
            "priceUsageBased": [
                131
            ],
            "productKey": [
                120
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                217
            ],
            "periodStart": [
                217
            ],
            "productKey": [
                120
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
                126
            ],
            "cancelAt": [
                217
            ],
            "collectionMethod": [
                125
            ],
            "currentPeriodEnd": [
                217
            ],
            "hasUserCredits": [
                4
            ],
            "id": [
                545
            ],
            "interval": [
                517
            ],
            "metadata": [
                332
            ],
            "phases": [
                127
            ],
            "status": [
                518
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                119
            ],
            "creditAmount": [
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                545
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
                128
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
                124
            ],
            "currentBillingSubscription": [
                124
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
                545
            ],
            "contactAutoCreationPolicy": [
                134
            ],
            "createdAt": [
                217
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                545
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                135
            ],
            "syncStageStartedAt": [
                217
            ],
            "syncStatus": [
                136
            ],
            "syncedAt": [
                217
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                217
            ],
            "visibility": [
                137
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
                675
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                675
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
                145
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
                675
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                332
            ],
            "error": [
                150
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
                675
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
                388
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                390
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
            "__typename": [
                1
            ]
        },
        "ClientAiModelTierConfig": {
            "modelId": [
                1
            ],
            "tier": [
                33
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                154
            ],
            "aiModelTiers": [
                156
            ],
            "aiModels": [
                155
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                40
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                87
            ],
            "billing": [
                104
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                144
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
                158
            ],
            "publicFeatureFlags": [
                439
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                502
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                519
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                217
            ],
            "link": [
                1
            ],
            "startAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                37
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
                545
            ],
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                545
            ],
            "availabilityType": [
                161
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                545
            ],
            "createdAt": [
                217
            ],
            "engineComponentKey": [
                251
            ],
            "frontComponent": [
                292
            ],
            "frontComponentId": [
                545
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                545
            ],
            "pageLayoutId": [
                545
            ],
            "payload": [
                162
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                545
            ],
            "updatedAt": [
                217
            ],
            "workflowVersionId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                400
            ],
            "on_PathCommandMenuItemPayload": [
                425
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                62
            ],
            "files": [
                283
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                545
            ],
            "archivedAt": [
                217
            ],
            "authFailedAt": [
                217
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                441
            ],
            "connectionProviderId": [
                545
            ],
            "createdAt": [
                217
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                545
            ],
            "lastCredentialsRefreshedAt": [
                217
            ],
            "lastSignedInAt": [
                217
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                165
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                217
            ],
            "userWorkspaceId": [
                545
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
                317
            ],
            "handle": [
                1
            ],
            "id": [
                545
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                244
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
                545
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
                332
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
                332
            ],
            "roleId": [
                545
            ],
            "triggers": [
                332
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                545
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                545
            ],
            "participantHandleFieldUniversalIdentifier": [
                545
            ],
            "visibility": [
                370
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                63
            ],
            "targets": [
                65
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                77
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
                545
            ],
            "availabilityType": [
                161
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                545
            ],
            "engineComponentKey": [
                251
            ],
            "frontComponentId": [
                545
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
                545
            ],
            "pageLayoutId": [
                545
            ],
            "payload": [
                332
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                545
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
                364
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
                332
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
                332
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                545
            ],
            "options": [
                332
            ],
            "relationCreationPayload": [
                332
            ],
            "settings": [
                332
            ],
            "type": [
                278
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
                545
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
                545
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
                186
            ],
            "indexType": [
                325
            ],
            "objectMetadataId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                332
            ],
            "databaseEventTriggerSettings": [
                332
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                332
            ],
            "id": [
                545
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                332
            ],
            "source": [
                332
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                332
            ],
            "universalIdentifier": [
                545
            ],
            "workflowActionTriggerSettings": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                545
            ],
            "id": [
                545
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                545
            ],
            "color": [
                1
            ],
            "folderId": [
                545
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                545
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                545
            ],
            "targetRecordId": [
                545
            ],
            "type": [
                392
            ],
            "userWorkspaceId": [
                545
            ],
            "viewId": [
                545
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
                332
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
                184
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                192
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
                545
            ],
            "type": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                417
            ],
            "pageLayoutId": [
                545
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
                332
            ],
            "objectMetadataId": [
                545
            ],
            "pageLayoutTabId": [
                545
            ],
            "position": [
                332
            ],
            "title": [
                1
            ],
            "type": [
                676
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                545
            ],
            "filter": [
                332
            ],
            "objectMetadataId": [
                545
            ],
            "orderBy": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                545
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                545
            ],
            "secondFieldMetadataId": [
                545
            ],
            "thirdFieldMetadataId": [
                545
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
                545
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                103
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                103
            ],
            "operationType": [
                634
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                641
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                643
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
                545
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                545
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
                545
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
                545
            ],
            "id": [
                545
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
                545
            ],
            "viewId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                545
            ],
            "logicalOperator": [
                664
            ],
            "parentViewFilterGroupId": [
                545
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                545
            ],
            "id": [
                545
            ],
            "operand": [
                665
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                545
            ],
            "subFieldName": [
                1
            ],
            "value": [
                332
            ],
            "viewFilterGroupId": [
                545
            ],
            "viewId": [
                545
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
                545
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                545
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
                545
            ],
            "calendarFieldMetadataId": [
                545
            ],
            "calendarLayout": [
                658
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                545
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                545
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                667
            ],
            "mainGroupByFieldMetadataId": [
                545
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                545
            ],
            "openRecordIn": [
                668
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                671
            ],
            "visibility": [
                672
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                670
            ],
            "fieldMetadataId": [
                545
            ],
            "id": [
                545
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                545
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
                545
            ],
            "operations": [
                1
            ],
            "roleId": [
                545
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
                634
            ],
            "resource": [
                641
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                167
            ],
            "before": [
                167
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                545
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                545
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
                545
            ],
            "name": [
                295
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                545
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
                545
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                237
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
                545
            ],
            "pageLayoutId": [
                545
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
                545
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
                545
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                485
            ],
            "type": [
                312
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                545
            ],
            "status": [
                485
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                168
            ],
            "IMAP": [
                168
            ],
            "SMTP": [
                168
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
                675
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                217
            ],
            "domain": [
                1
            ],
            "id": [
                545
            ],
            "status": [
                248
            ],
            "tenantStatus": [
                249
            ],
            "unsubscribeHostnameStatus": [
                547
            ],
            "updatedAt": [
                217
            ],
            "verificationRecords": [
                653
            ],
            "verifiedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                675
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
                332
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
                332
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
                253
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                332
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
                217
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
                217
            ],
            "currentPeriodEnd": [
                217
            ],
            "expiresAt": [
                217
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
                217
            ],
            "start": [
                217
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
                261
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
                259
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                260
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
                262
            ],
            "first": [
                10
            ],
            "table": [
                267
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                263
            ],
            "records": [
                266
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
                332
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                217
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
                379
            ],
            "objectRecordEventsWithQueryIds": [
                407
            ],
            "queueJobEvents": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                545
            ],
            "payload": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                271
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
                545
            ],
            "createdAt": [
                217
            ],
            "defaultValue": [
                332
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
                545
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
                545
            ],
            "morphRelations": [
                460
            ],
            "name": [
                1
            ],
            "object": [
                394
            ],
            "objectMetadataId": [
                545
            ],
            "options": [
                332
            ],
            "relation": [
                460
            ],
            "settings": [
                332
            ],
            "type": [
                278
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                675
            ],
            "fieldDisplayMode": [
                275
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
                276
            ],
            "pageInfo": [
                414
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                167
            ],
            "node": [
                272
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                277
            ],
            "id": [
                546
            ],
            "isActive": [
                132
            ],
            "isSystem": [
                132
            ],
            "isUIEditable": [
                132
            ],
            "isUIReadOnly": [
                132
            ],
            "objectMetadataId": [
                546
            ],
            "or": [
                277
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
                545
            ],
            "id": [
                545
            ],
            "objectMetadataId": [
                545
            ],
            "roleId": [
                545
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
                545
            ],
            "objectMetadataId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                675
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
                217
            ],
            "id": [
                545
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
                545
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
                217
            ],
            "fileId": [
                545
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
                217
            ],
            "id": [
                545
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
                675
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                545
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                485
            ],
            "type": [
                312
            ],
            "workspace": [
                696
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
                377
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                675
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
                314
            ],
            "applicationId": [
                545
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                82
            ],
            "applicationVariables": [
                332
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
                217
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                545
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
                545
            ],
            "updatedAt": [
                217
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                294
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                675
            ],
            "frontComponentId": [
                545
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                545
            ],
            "pageLayoutType": [
                418
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
                479
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                332
            ],
            "runId": [
                545
            ],
            "scope": [
                332
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
                332
            ],
            "runId": [
                545
            ],
            "success": [
                4
            ],
            "text": [
                1
            ],
            "usage": [
                34
            ],
            "__typename": [
                1
            ]
        },
        "GetApiKeyInput": {
            "id": [
                545
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
                545
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
                545
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
                302
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                302
            ],
            "snoozedUntil": [
                1
            ],
            "steps": [
                303
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                302
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
                304
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
                307
            ],
            "stepActionKey": [
                302
            ],
            "trigger": [
                308
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
                677
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
                545
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
                675
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
                318
            ],
            "IMAP": [
                318
            ],
            "SMTP": [
                318
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
                244
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
                88
            ],
            "workspace": [
                700
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
                545
            ],
            "threadId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                545
            ],
            "createdAt": [
                217
            ],
            "id": [
                545
            ],
            "indexFieldMetadataList": [
                323
            ],
            "indexType": [
                325
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
                217
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                167
            ],
            "node": [
                321
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                217
            ],
            "fieldMetadataId": [
                545
            ],
            "id": [
                545
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                324
            ],
            "id": [
                546
            ],
            "isCustom": [
                132
            ],
            "or": [
                324
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                545
            ],
            "messages": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                328
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
                545
            ],
            "messageThreadId": [
                545
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
                334
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                545
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                96
            ],
            "color": [
                1
            ],
            "configurationType": [
                675
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
                332
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
                147
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                408
            ],
            "primaryAxisGroupByFieldMetadataId": [
                545
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                310
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                408
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                545
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                310
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
                332
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                340
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
                332
            ],
            "objectMetadataId": [
                545
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
                339
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
                165
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                545
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
                545
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                217
            ],
            "cronTriggerSettings": [
                332
            ],
            "databaseEventTriggerSettings": [
                332
            ],
            "description": [
                1
            ],
            "executionMode": [
                346
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                332
            ],
            "id": [
                545
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
                332
            ],
            "universalIdentifier": [
                545
            ],
            "updatedAt": [
                217
            ],
            "workflowActionTriggerSettings": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                332
            ],
            "duration": [
                6
            ],
            "error": [
                332
            ],
            "logs": [
                1
            ],
            "status": [
                348
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                545
            ],
            "applicationUniversalIdentifier": [
                545
            ],
            "id": [
                545
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                88
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
                332
            ],
            "name": [
                1
            ],
            "objects": [
                355
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "requestedIframeMediaPermissions": [
                314
            ],
            "roles": [
                356
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                78
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
                357
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                358
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
                545
            ],
            "connectionProviderId": [
                545
            ],
            "createdAt": [
                217
            ],
            "id": [
                545
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
                360
            ],
            "toolsSyncError": [
                1
            ],
            "toolsSyncedAt": [
                217
            ],
            "updatedAt": [
                217
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
                332
            ],
            "description": [
                1
            ],
            "inputSchema": [
                332
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
                675
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                675
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
                164
            ],
            "connectedAccountId": [
                545
            ],
            "contactAutoCreationPolicy": [
                365
            ],
            "createdAt": [
                217
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
                545
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
                372
            ],
            "messagingProviderUniversalIdentifier": [
                545
            ],
            "participantHandleFieldUniversalIdentifier": [
                545
            ],
            "pendingGroupEmailsAction": [
                366
            ],
            "syncStage": [
                367
            ],
            "syncStageStartedAt": [
                217
            ],
            "syncStatus": [
                368
            ],
            "syncedAt": [
                217
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                217
            ],
            "type": [
                369
            ],
            "updatedAt": [
                217
            ],
            "visibility": [
                370
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
                217
            ],
            "externalId": [
                1
            ],
            "id": [
                545
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                545
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                373
            ],
            "updatedAt": [
                217
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
                217
            ],
            "emailAddress": [
                1
            ],
            "id": [
                545
            ],
            "reason": [
                377
            ],
            "source": [
                378
            ],
            "unsubscribeTopicId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                375
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
                406
            ],
            "recordId": [
                1
            ],
            "type": [
                380
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
                545
            ],
            "property": [
                1
            ],
            "provenance": [
                383
            ],
            "recordId": [
                545
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
                545
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                159
            ],
            "objectMetadataItems": [
                386
            ],
            "views": [
                387
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
                545
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
                545
            ],
            "key": [
                667
            ],
            "objectMetadataId": [
                545
            ],
            "type": [
                671
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                511,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                681,
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
                        545,
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
                51,
                {
                    "applicationId": [
                        545,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        315,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        545
                    ],
                    "threadId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        545,
                        "UUID!"
                    ],
                    "roleId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        545,
                        "UUID!"
                    ],
                    "roleId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        320,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                91,
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
                143,
                {
                    "input": [
                        142,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                130
            ],
            "cancelSwitchBillingPlan": [
                130
            ],
            "cancelSwitchResourceCreditPrice": [
                130
            ],
            "checkCustomDomainValidRecords": [
                238
            ],
            "checkPublicDomainValidRecords": [
                238,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                123,
                {
                    "plan": [
                        114,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        517,
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
                77,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                77,
                {
                    "fileId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                163,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        545,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                412,
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
                287,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                287,
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
                287,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                287,
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
                        170,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                41,
                {
                    "input": [
                        172,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                364,
                {
                    "input": [
                        173,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                174,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        64,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                175,
                {
                    "input": [
                        176,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                85,
                {
                    "input": [
                        177,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                112
            ],
            "createCalendarEvent": [
                179,
                {
                    "input": [
                        178,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                17,
                {
                    "channelId": [
                        545
                    ]
                }
            ],
            "createCommandMenuItem": [
                160,
                {
                    "input": [
                        180,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                236,
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
                182,
                {
                    "input": [
                        181,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                247,
                {
                    "input": [
                        183,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                286,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        285,
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
                292,
                {
                    "input": [
                        185,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                391,
                {
                    "inputs": [
                        191,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                661,
                {
                    "inputs": [
                        206,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                660,
                {
                    "inputs": [
                        207,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                666,
                {
                    "inputs": [
                        210,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                359,
                {
                    "input": [
                        189,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                375,
                {
                    "input": [
                        190,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                391,
                {
                    "input": [
                        191,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                286,
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
                508,
                {
                    "input": [
                        506,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                38,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        545,
                        "UUID!"
                    ],
                    "properties": [
                        332
                    ],
                    "recordId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        171,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                272,
                {
                    "input": [
                        193,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                321,
                {
                    "input": [
                        194,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                345,
                {
                    "input": [
                        188,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                394,
                {
                    "input": [
                        195,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                467,
                {
                    "createRoleInput": [
                        201,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                415,
                {
                    "input": [
                        196,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                416,
                {
                    "input": [
                        197,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                419,
                {
                    "input": [
                        198,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                438,
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
                459,
                {
                    "input": [
                        200,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                508,
                {
                    "input": [
                        507,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                511,
                {
                    "input": [
                        202,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                112,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        114,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        517,
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
                548,
                {
                    "input": [
                        203,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                632,
                {
                    "input": [
                        204,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                652,
                {
                    "input": [
                        205,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                657,
                {
                    "input": [
                        211,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                660,
                {
                    "input": [
                        207,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                661,
                {
                    "input": [
                        206,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                662,
                {
                    "input": [
                        209,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                663,
                {
                    "input": [
                        208,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                666,
                {
                    "input": [
                        210,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                669,
                {
                    "input": [
                        212,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                673,
                {
                    "input": [
                        213,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                511,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        545,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        545
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
                        46
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                364,
                {
                    "id": [
                        545,
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
                        218,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                160,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                164,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                681
            ],
            "deleteEmailGroupChannel": [
                364,
                {
                    "id": [
                        545,
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
                292,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                391,
                {
                    "ids": [
                        545,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                359,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                391,
                {
                    "id": [
                        545,
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
                272,
                {
                    "input": [
                        219,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                321,
                {
                    "input": [
                        220,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                345,
                {
                    "input": [
                        349,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                394,
                {
                    "input": [
                        221,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        545,
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
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                459,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                222,
                {
                    "input": [
                        223,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                511,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                224,
                {
                    "twoFactorAuthenticationMethodId": [
                        545,
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
                        545,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                645
            ],
            "deleteUserFromWorkspace": [
                649,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                652,
                {
                    "id": [
                        545,
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
                660,
                {
                    "input": [
                        226,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                661,
                {
                    "input": [
                        225,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                662,
                {
                    "input": [
                        227,
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
                666,
                {
                    "input": [
                        228,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        229,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                673,
                {
                    "id": [
                        545,
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
                660,
                {
                    "input": [
                        232,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                661,
                {
                    "input": [
                        231,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                662,
                {
                    "input": [
                        233,
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
                666,
                {
                    "input": [
                        234,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        235,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
                {
                    "input": [
                        320,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                164,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                239,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                240,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                241,
                {
                    "input": [
                        242,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                245,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        545
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                106
            ],
            "enqueueJob": [
                254,
                {
                    "input": [
                        252,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                256,
                {
                    "input": [
                        255,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                685
            ],
            "executeOneLogicFunction": [
                347,
                {
                    "input": [
                        269,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                297,
                {
                    "input": [
                        296,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                43,
                {
                    "apiKeyId": [
                        545,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                82,
                {
                    "applicationId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                88
            ],
            "generateTransientToken": [
                528
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                542,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                90,
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
                90,
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
                90,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                543,
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
                299,
                {
                    "input": [
                        300,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                352,
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
                411
            ],
            "grantApplicationCapabilities": [
                53,
                {
                    "input": [
                        309,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                319,
                {
                    "userId": [
                        545,
                        "UUID!"
                    ],
                    "workspaceId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                327,
                {
                    "input": [
                        326,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                329,
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
                329
            ],
            "installApplication": [
                51,
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
                        545,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        545
                    ],
                    "threadId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                305,
                {
                    "stepActionKey": [
                        302,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                257
            ],
            "removeAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        462,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                454,
                {
                    "principal": [
                        451,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        458,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                82,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                90,
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
                        545,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        463,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                464,
                {
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
                498,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                160,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                416,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                415,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                523,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                490,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                10
            ],
            "revokeApiKey": [
                41,
                {
                    "input": [
                        465,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                469,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                481,
                {
                    "input": [
                        477,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                67,
                {
                    "applicationId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                67,
                {
                    "applicationId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                316,
                {
                    "connectionParameters": [
                        243,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        545
                    ]
                }
            ],
            "sendAppChannelMessage": [
                489,
                {
                    "input": [
                        488,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                490,
                {
                    "browsingContext": [
                        332
                    ],
                    "channelId": [
                        545
                    ],
                    "fileAttachments": [
                        284,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        4
                    ],
                    "isAssistantParticipant": [
                        4
                    ],
                    "mentionedWorkspaceMemberIds": [
                        545,
                        "[UUID!]"
                    ],
                    "messageId": [
                        545,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "recipientWorkspaceMemberIds": [
                        545,
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
                        545,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                493,
                {
                    "input": [
                        492,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                497,
                {
                    "input": [
                        496,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                498,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        545
                    ]
                }
            ],
            "sendMessageCampaign": [
                500,
                {
                    "input": [
                        499,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                495,
                {
                    "input": [
                        501,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                45,
                {
                    "input": [
                        503,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                111,
                {
                    "partnerCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                257,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                454,
                {
                    "isPrivate": [
                        4,
                        "Boolean!"
                    ],
                    "target": [
                        458,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                454,
                {
                    "accessLevel": [
                        450,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        451,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        458,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                130,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                95,
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
                95,
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
            "signUpInNewWorkspace": [
                509,
                {
                    "input": [
                        510
                    ]
                }
            ],
            "signUpInWorkspace": [
                509,
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
                        545
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
                412,
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
                        217,
                        "DateTime!"
                    ],
                    "threadId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                146,
                {
                    "connectedAccountId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                513,
                {
                    "companyContext": [
                        332
                    ],
                    "personContext": [
                        332
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                514
            ],
            "switchBillingPlan": [
                130,
                {
                    "plan": [
                        114
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                130
            ],
            "syncAppMessageFolders": [
                371,
                {
                    "input": [
                        521,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                695,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        332,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "syncMcpServerTools": [
                359,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "trackAnalytics": [
                38,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        332
                    ],
                    "type": [
                        39,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                77,
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
                530,
                {
                    "input": [
                        529,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                534,
                {
                    "input": [
                        531,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                533,
                {
                    "input": [
                        532,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                538,
                {
                    "input": [
                        535,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                537,
                {
                    "input": [
                        536,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                540,
                {
                    "input": [
                        539,
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
                        545,
                        "UUID!"
                    ],
                    "input": [
                        550,
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
                        217
                    ],
                    "threadIds": [
                        545,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                41,
                {
                    "input": [
                        552,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                364,
                {
                    "input": [
                        553,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                51,
                {
                    "id": [
                        545,
                        "UUID!"
                    ],
                    "input": [
                        554,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                77,
                {
                    "input": [
                        555,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                81,
                {
                    "input": [
                        557,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                133,
                {
                    "input": [
                        559,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                160,
                {
                    "input": [
                        561,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                364,
                {
                    "input": [
                        562,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                292,
                {
                    "input": [
                        564,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                301,
                {
                    "input": [
                        566,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                270,
                {
                    "input": [
                        567,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                391,
                {
                    "inputs": [
                        580,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                394,
                {
                    "inputs": [
                        581,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                666,
                {
                    "inputs": [
                        603,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                359,
                {
                    "input": [
                        570,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                364,
                {
                    "input": [
                        572,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                371,
                {
                    "input": [
                        574,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                371,
                {
                    "input": [
                        576,
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
                391,
                {
                    "input": [
                        580,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        551,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        545
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
                272,
                {
                    "input": [
                        579,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        568,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                394,
                {
                    "input": [
                        581,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                467,
                {
                    "updateRoleInput": [
                        588,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                415,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        582,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                416,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        583,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        585,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                415,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        587,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                330,
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
                511,
                {
                    "input": [
                        590,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                523,
                {
                    "input": [
                        591,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                548,
                {
                    "input": [
                        592,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                632,
                {
                    "input": [
                        593,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                105,
                {
                    "userCreditsFallback": [
                        647,
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
                652,
                {
                    "input": [
                        594,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                657,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        605,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                660,
                {
                    "input": [
                        598,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                661,
                {
                    "input": [
                        596,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                662,
                {
                    "input": [
                        601,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                663,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        600,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                666,
                {
                    "input": [
                        603,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                669,
                {
                    "input": [
                        606,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                673,
                {
                    "input": [
                        608,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                681,
                {
                    "data": [
                        612,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                681,
                {
                    "data": [
                        610,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                681,
                {
                    "data": [
                        611,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                690,
                {
                    "roleId": [
                        545,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        613,
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
                77,
                {
                    "file": [
                        614,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                283,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        614,
                        "Upload!"
                    ],
                    "fileFolder": [
                        285,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                287,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        614,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                287,
                {
                    "file": [
                        614,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                287,
                {
                    "file": [
                        614,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                287,
                {
                    "file": [
                        614,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                279,
                {
                    "upsertFieldPermissionsInput": [
                        615,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                657,
                {
                    "input": [
                        618,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                402,
                {
                    "upsertObjectPermissionsInput": [
                        619,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                468,
                {
                    "upsertPermissionFlagsInput": [
                        620,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                622,
                {
                    "input": [
                        621,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                657,
                {
                    "input": [
                        623,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                85,
                {
                    "input": [
                        650,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                654,
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
                95,
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
                247,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                655,
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
                545
            ],
            "applicationId": [
                545
            ],
            "color": [
                1
            ],
            "createdAt": [
                217
            ],
            "folderId": [
                545
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                545
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                545
            ],
            "targetRecordId": [
                545
            ],
            "targetRecordIdentifier": [
                447
            ],
            "type": [
                392
            ],
            "updatedAt": [
                217
            ],
            "userWorkspaceId": [
                545
            ],
            "viewId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                545
            ],
            "color": [
                1
            ],
            "createdAt": [
                217
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
                397,
                {
                    "filter": [
                        277,
                        "FieldFilter!"
                    ],
                    "paging": [
                        215,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                272
            ],
            "icon": [
                1
            ],
            "id": [
                545
            ],
            "imageIdentifierFieldMetadataId": [
                545
            ],
            "indexMetadataList": [
                321
            ],
            "indexMetadatas": [
                399,
                {
                    "filter": [
                        324,
                        "IndexFilter!"
                    ],
                    "paging": [
                        215,
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
                545
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
                401
            ],
            "searchFieldMetadataList": [
                487
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                396
            ],
            "pageInfo": [
                414
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                167
            ],
            "node": [
                394
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                276
            ],
            "pageInfo": [
                414
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                398
            ],
            "id": [
                546
            ],
            "isActive": [
                132
            ],
            "isRemote": [
                132
            ],
            "isSearchable": [
                132
            ],
            "isSystem": [
                132
            ],
            "isUICreatable": [
                132
            ],
            "isUIEditable": [
                132
            ],
            "isUIReadOnly": [
                132
            ],
            "or": [
                398
            ],
            "universalIdentifier": [
                546
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                322
            ],
            "pageInfo": [
                414
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                545
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
                545
            ],
            "restrictedFields": [
                332
            ],
            "rowLevelPermissionPredicateGroups": [
                471
            ],
            "rowLevelPermissionPredicates": [
                470
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
                545
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
                216
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                406
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
                332
            ],
            "before": [
                332
            ],
            "diff": [
                332
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
                405
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
                545
            ],
            "restrictedFields": [
                332
            ],
            "rowLevelRecordsPermissions": [
                476
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                410
            ],
            "previousOnboardingStatus": [
                410
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
                167
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                167
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                545
            ],
            "createdAt": [
                217
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                545
            ],
            "deletedAt": [
                217
            ],
            "id": [
                545
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
                545
            ],
            "tabs": [
                416
            ],
            "type": [
                418
            ],
            "universalIdentifier": [
                545
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                545
            ],
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                417
            ],
            "pageLayoutId": [
                545
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                545
            ],
            "updatedAt": [
                217
            ],
            "widgets": [
                419
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                314
            ],
            "applicationId": [
                545
            ],
            "applicationName": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                332
            ],
            "configuration": [
                674
            ],
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "gridPosition": [
                311
            ],
            "id": [
                545
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
                545
            ],
            "pageLayoutTabId": [
                545
            ],
            "position": [
                422
            ],
            "title": [
                1
            ],
            "type": [
                676
            ],
            "universalIdentifier": [
                545
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                417
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
                417
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
                420
            ],
            "on_PageLayoutWidgetGridPosition": [
                421
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                424
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                423
            ],
            "index": [
                10
            ],
            "layoutMode": [
                417
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
                545
            ],
            "createdAt": [
                217
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                545
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                545
            ],
            "aggregateOperation": [
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                675
            ],
            "dateGranularity": [
                408
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
                332
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                545
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
                147
            ],
            "orderBy": [
                310
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
                431
            ],
            "formattedToRawLookup": [
                332
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
                332
            ],
            "objectMetadataId": [
                545
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
                344
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
                217
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                141
            ],
            "blockers": [
                363
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                545
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
                244
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
                545
            ],
            "createdAt": [
                217
            ],
            "domain": [
                1
            ],
            "id": [
                545
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
                271
            ],
            "metadata": [
                440
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
                437
            ],
            "IMAP": [
                437
            ],
            "SMTP": [
                437
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                86
            ],
            "authProviders": [
                87
            ],
            "displayName": [
                1
            ],
            "id": [
                545
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                699
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
                545
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
                        545,
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
                        545,
                        "UUID!"
                    ],
                    "limit": [
                        10,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                29
            ],
            "aiChatUserCreditsUsage": [
                30
            ],
            "apiKey": [
                41,
                {
                    "input": [
                        298,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                41
            ],
            "appConnection": [
                44,
                {
                    "id": [
                        18,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                44,
                {
                    "filter": [
                        341
                    ]
                }
            ],
            "appKeyValue": [
                45,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        46
                    ]
                }
            ],
            "appMessageChannels": [
                364,
                {
                    "filter": [
                        342
                    ]
                }
            ],
            "appMessageFolders": [
                371,
                {
                    "filter": [
                        343
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                54,
                {
                    "applicationId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                55,
                {
                    "applicationId": [
                        545,
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
                486,
                {
                    "applicationId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                98,
                {
                    "input": [
                        99,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                111
            ],
            "billingPlans": [
                113
            ],
            "billingPortalSession": [
                123,
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
                545,
                {
                    "calendarEventId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "agentUniversalIdentifier": [
                        545
                    ],
                    "threadId": [
                        545
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                149,
                {
                    "agentUniversalIdentifier": [
                        545
                    ],
                    "threadId": [
                        545
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
                        545,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                152,
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
                689,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                515,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                160,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                160
            ],
            "currentUser": [
                645
            ],
            "currentUserApplicationAuthorizations": [
                52
            ],
            "currentUserSessions": [
                648
            ],
            "currentWorkspace": [
                681
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
                258
            ],
            "eventLogs": [
                265,
                {
                    "input": [
                        264,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                57,
                {
                    "shouldIncludeDependencies": [
                        4
                    ],
                    "universalIdentifier": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                272,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                274,
                {
                    "filter": [
                        277,
                        "FieldFilter!"
                    ],
                    "paging": [
                        215,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                436,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                77,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                69,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        217
                    ],
                    "periodStart": [
                        217
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                79,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        217
                    ],
                    "periodStart": [
                        217
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                81,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                153,
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
                335,
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
                77
            ],
            "findManyApplications": [
                51
            ],
            "findManyLogicFunctions": [
                345
            ],
            "findManyMarketplaceApps": [
                353,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                438
            ],
            "findMarketplaceAppDetail": [
                354,
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
                51,
                {
                    "id": [
                        545
                    ],
                    "universalIdentifier": [
                        545
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                77,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                345,
                {
                    "input": [
                        349,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                335,
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
                335,
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
                683
            ],
            "findWorkspaceFromInviteHash": [
                681,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                688
            ],
            "frontComponent": [
                292,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                292
            ],
            "getAddressDetails": [
                432,
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
                35
            ],
            "getApiKeyRoles": [
                467
            ],
            "getApprovedAccessDomains": [
                85
            ],
            "getAutoCompleteAddress": [
                92,
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
                332,
                {
                    "input": [
                        349,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                166,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                247
            ],
            "getInviteSuggestions": [
                331
            ],
            "getJobs": [
                335,
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
                        349,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                415,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                416,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                416,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                419,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                415,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        418
                    ]
                }
            ],
            "getPermissionFlags": [
                426
            ],
            "getPublicWorkspaceDataByDomain": [
                442,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                443,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                122
            ],
            "getRole": [
                467,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                467
            ],
            "getSSOIdentityProviders": [
                289
            ],
            "getToolIndex": [
                527
            ],
            "getToolInputSchema": [
                332,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                629,
                {
                    "input": [
                        630
                    ]
                }
            ],
            "getView": [
                657,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                660,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                661,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                661,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                660,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                662,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                663,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                663,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                662,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                666,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                666,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                669,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                669,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                657,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        671,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                686
            ],
            "gettingStartedProgress": [
                301
            ],
            "gettingStartedWorkflowPreviews": [
                306
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
                337,
                {
                    "input": [
                        338,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                113
            ],
            "mcpServer": [
                359,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                359
            ],
            "messageSuppressions": [
                376,
                {
                    "input": [
                        290,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                381,
                {
                    "input": [
                        384,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                385
            ],
            "mostlyEmptyFieldMetadataIds": [
                545,
                {
                    "objectMetadataId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                76
            ],
            "myCalendarChannels": [
                133,
                {
                    "connectedAccountId": [
                        545
                    ]
                }
            ],
            "myConnectedAccounts": [
                164
            ],
            "myMessageChannels": [
                364,
                {
                    "connectedAccountId": [
                        545
                    ]
                }
            ],
            "myMessageFolders": [
                371,
                {
                    "messageChannelId": [
                        545
                    ]
                }
            ],
            "myUserApplicationVariables": [
                691
            ],
            "navigationMenuItem": [
                391,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                391
            ],
            "object": [
                394,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                404
            ],
            "objects": [
                395,
                {
                    "filter": [
                        398,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        215,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                429,
                {
                    "input": [
                        430,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                141,
                {
                    "input": [
                        433,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                435,
                {
                    "input": [
                        434,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                354,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                353
            ],
            "recordPermissions": [
                449,
                {
                    "targets": [
                        458,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                454,
                {
                    "target": [
                        458,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                459
            ],
            "skill": [
                511,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                511
            ],
            "timelineActivityTypes": [
                523
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                544,
                {
                    "userId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                548
            ],
            "usageLimits": [
                632
            ],
            "usageQuotaDefinitions": [
                636
            ],
            "usageQuotaScopeConsumption": [
                638,
                {
                    "input": [
                        639,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                640
            ],
            "validatePasswordResetToken": [
                651,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                652,
                {
                    "objectMetadataId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                652,
                {
                    "fieldMetadataId": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                673,
                {
                    "id": [
                        545,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                545
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
                545
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
                545
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
                545
            ],
            "permissions": [
                448
            ],
            "recordId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                545
            ],
            "workspaceMemberId": [
                545
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
                448
            ],
            "roles": [
                456
            ],
            "shares": [
                455
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                450
            ],
            "id": [
                18
            ],
            "principalId": [
                545
            ],
            "principalRoleId": [
                545
            ],
            "principalType": [
                452
            ],
            "rowCause": [
                453
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
                545
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
                675
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
                545
            ],
            "recordId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                545
            ],
            "id": [
                545
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                545
            ],
            "secondFieldMetadataId": [
                545
            ],
            "thirdFieldMetadataId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                272
            ],
            "sourceObjectMetadata": [
                394
            ],
            "targetFieldMetadata": [
                272
            ],
            "targetObjectMetadata": [
                394
            ],
            "type": [
                461
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
                545
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
                42
            ],
            "applicationId": [
                545
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
                279
            ],
            "icon": [
                1
            ],
            "id": [
                545
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                402
            ],
            "permissionFlags": [
                468
            ],
            "rowLevelPermissionPredicateGroups": [
                471
            ],
            "rowLevelPermissionPredicates": [
                470
            ],
            "universalIdentifier": [
                545
            ],
            "workspaceMembers": [
                690
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
                545
            ],
            "roleId": [
                545
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
                475
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
                332
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
                473
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
                545
            ],
            "logicalOperator": [
                473
            ],
            "objectMetadataId": [
                545
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                545
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
                545
            ],
            "id": [
                545
            ],
            "operand": [
                475
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "relationFieldMetadataId": [
                545
            ],
            "rowLevelPermissionPredicateGroupId": [
                545
            ],
            "subFieldName": [
                1
            ],
            "value": [
                332
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
                471
            ],
            "predicates": [
                470
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
                479
            ],
            "messages": [
                479
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                332
            ],
            "runAsWorkspaceMemberId": [
                545
            ],
            "thread": [
                482
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
                545
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
                478
            ],
            "content": [
                1
            ],
            "role": [
                480
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
                332
            ],
            "runId": [
                545
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                545
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
                545
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                485
            ],
            "type": [
                312
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                545
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                485
            ],
            "type": [
                312
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
                217
            ],
            "fieldMetadataId": [
                545
            ],
            "id": [
                545
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                545
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                545
            ],
            "messageChannelId": [
                545
            ],
            "messageThreadId": [
                545
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
                545
            ],
            "messageThreadId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                545
            ],
            "messageId": [
                1
            ],
            "queued": [
                4
            ],
            "recipientParticipantWorkspaceMemberIds": [
                545
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
                491
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
                494
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
                545
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
                332
            ],
            "workspaceMemberIds": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                545
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
                688
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
                217
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                141
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
                46
            ],
            "value": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                545
            ],
            "createdAt": [
                217
            ],
            "frontComponentId": [
                545
            ],
            "icon": [
                1
            ],
            "id": [
                545
            ],
            "position": [
                6
            ],
            "scope": [
                505
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                545
            ],
            "updatedAt": [
                217
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
                545
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
                545
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                485
            ],
            "type": [
                312
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                88
            ],
            "workspace": [
                700
            ],
            "__typename": [
                1
            ]
        },
        "SignUpInNewWorkspaceInput": {
            "captchaToken": [
                1
            ],
            "displayName": [
                1
            ],
            "partner": [
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
                545
            ],
            "content": [
                1
            ],
            "createdAt": [
                217
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                217
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                466
            ],
            "configurationType": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                698
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
                266,
                {
                    "fieldFilters": [
                        260,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        267,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                446,
                {
                    "input": [
                        199,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                350,
                {
                    "input": [
                        351,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                14,
                {
                    "agentUniversalIdentifier": [
                        545
                    ],
                    "runId": [
                        545
                    ],
                    "threadId": [
                        545
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "onEventSubscription": [
                268,
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
                520
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
                48
            ],
            "messageChannelId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                675
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
                545
            ],
            "createdAt": [
                217
            ],
            "emit": [
                524
            ],
            "frontComponentUniversalIdentifier": [
                545
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                545
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                545
            ],
            "universalIdentifier": [
                545
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                545
            ],
            "on": [
                1
            ],
            "through": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                545
            ],
            "relationFieldUniversalIdentifier": [
                545
            ],
            "triggerFieldUniversalIdentifiers": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                675
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
                332
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
                88
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                545
            ],
            "personFilter": [
                332
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                217
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
                89
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
                217
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                545
            ],
            "gt": [
                545
            ],
            "gte": [
                545
            ],
            "iLike": [
                545
            ],
            "in": [
                545
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                545
            ],
            "lt": [
                545
            ],
            "lte": [
                545
            ],
            "neq": [
                545
            ],
            "notILike": [
                545
            ],
            "notIn": [
                545
            ],
            "notLike": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                217
            ],
            "description": [
                1
            ],
            "id": [
                545
            ],
            "name": [
                1
            ],
            "updatedAt": [
                217
            ],
            "visibility": [
                549
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
                545
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
                545
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                332
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
                332
            ],
            "roleId": [
                545
            ],
            "triggers": [
                332
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
                545
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
                545
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                545
            ],
            "visibility": [
                370
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
                556
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
                558
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
                545
            ],
            "update": [
                560
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                134
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
                137
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
                545
            ],
            "availabilityType": [
                161
            ],
            "engineComponentKey": [
                251
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                545
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                545
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                332
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
                332
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                545
            ],
            "options": [
                332
            ],
            "settings": [
                332
            ],
            "translations": [
                382
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
                545
            ],
            "update": [
                565
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
                302
            ],
            "completedStepChatThreadId": [
                1
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                302
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
                545
            ],
            "update": [
                569
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                332
            ],
            "databaseEventTriggerSettings": [
                332
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                332
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
                332
            ],
            "workflowActionTriggerSettings": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                545
            ],
            "update": [
                571
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                545
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
                545
            ],
            "update": [
                573
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                365
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
                372
            ],
            "visibility": [
                370
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                545
            ],
            "update": [
                575
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
                545
            ],
            "update": [
                575
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
                545
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
                545
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
                545
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
                545
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
                401
            ],
            "shortcut": [
                1
            ],
            "translations": [
                382
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                545
            ],
            "update": [
                563
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                545
            ],
            "update": [
                577
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                545
            ],
            "update": [
                578
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
                545
            ],
            "type": [
                418
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
                417
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
                545
            ],
            "layoutMode": [
                417
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                586
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
                332
            ],
            "configuration": [
                332
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                545
            ],
            "pageLayoutTabId": [
                545
            ],
            "position": [
                332
            ],
            "title": [
                1
            ],
            "type": [
                676
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
                332
            ],
            "configuration": [
                332
            ],
            "id": [
                545
            ],
            "objectMetadataId": [
                545
            ],
            "pageLayoutTabId": [
                545
            ],
            "position": [
                332
            ],
            "title": [
                1
            ],
            "type": [
                676
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
                545
            ],
            "tabs": [
                584
            ],
            "type": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                545
            ],
            "update": [
                589
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
                545
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
                545
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                382
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
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                545
            ],
            "payload": [
                204
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                545
            ],
            "update": [
                595
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
                545
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
                545
            ],
            "update": [
                597
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
                545
            ],
            "update": [
                599
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                545
            ],
            "logicalOperator": [
                664
            ],
            "parentViewFilterGroupId": [
                545
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                545
            ],
            "update": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                545
            ],
            "operand": [
                665
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                545
            ],
            "subFieldName": [
                1
            ],
            "value": [
                332
            ],
            "viewFilterGroupId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                545
            ],
            "update": [
                604
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                545
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
                545
            ],
            "calendarFieldMetadataId": [
                545
            ],
            "calendarLayout": [
                658
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                545
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                545
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                545
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                668
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "translations": [
                382
            ],
            "type": [
                671
            ],
            "visibility": [
                672
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                545
            ],
            "update": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                670
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
                545
            ],
            "update": [
                609
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
                545
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
                33
            ],
            "aiChatDirectMessageAssistantMode": [
                28
            ],
            "aiChatInboxAssistantMode": [
                28
            ],
            "aiChatModelTier": [
                33
            ],
            "aiDataPolicy": [
                32
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                332
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                545
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
                687
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                332
            ],
            "workspaceMemberId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                280
            ],
            "roleId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                545
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                616
            ],
            "id": [
                545
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
                616
            ],
            "groups": [
                617
            ],
            "widgetId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                403
            ],
            "roleId": [
                545
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                545
            ],
            "predicateGroups": [
                472
            ],
            "predicates": [
                474
            ],
            "roleId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                471
            ],
            "predicates": [
                470
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                627
            ],
            "viewFields": [
                624
            ],
            "viewFilterGroups": [
                625
            ],
            "viewFilters": [
                626
            ],
            "viewSorts": [
                628
            ],
            "widgetId": [
                545
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
                545
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
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                545
            ],
            "logicalOperator": [
                664
            ],
            "parentViewFilterGroupId": [
                545
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
                545
            ],
            "id": [
                545
            ],
            "operand": [
                665
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                545
            ],
            "subFieldName": [
                1
            ],
            "value": [
                332
            ],
            "viewFilterGroupId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                545
            ],
            "calendarFieldMetadataId": [
                545
            ],
            "calendarLayout": [
                658
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                545
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                545
            ],
            "openRecordIn": [
                668
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                671
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                670
            ],
            "fieldMetadataId": [
                545
            ],
            "id": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                217
            ],
            "periodStart": [
                217
            ],
            "timeSeries": [
                642
            ],
            "usageByApplication": [
                631
            ],
            "usageByModel": [
                631
            ],
            "usageByOperationType": [
                631
            ],
            "usageByUser": [
                631
            ],
            "userDailyUsage": [
                644
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                634
            ],
            "periodEnd": [
                217
            ],
            "periodStart": [
                217
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
                103
            ],
            "createdAt": [
                217
            ],
            "id": [
                545
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                103
            ],
            "operationType": [
                634
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                641
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                643
            ],
            "updatedAt": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                643
            ],
            "operationType": [
                634
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                633
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                637
            ],
            "resourceType": [
                641
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                635
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
                634
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                643
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                103
            ],
            "periodEnd": [
                217
            ],
            "periodStart": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                634
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                641
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                643
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                103
            ],
            "id": [
                545
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                103
            ],
            "operationType": [
                634
            ],
            "periodEnd": [
                217
            ],
            "periodStart": [
                217
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                103
            ],
            "resourceType": [
                641
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
                643
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
                642
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
                94
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                217
            ],
            "currentUserWorkspace": [
                649
            ],
            "currentWorkspace": [
                681
            ],
            "deletedAt": [
                217
            ],
            "deletedWorkspaceMembers": [
                230
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
                545
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
                410
            ],
            "previousOnboardingStatus": [
                410
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                217
            ],
            "userVars": [
                333
            ],
            "userWorkspaces": [
                649
            ],
            "workspaceMember": [
                690
            ],
            "workspaceMembers": [
                690
            ],
            "workspaces": [
                649
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
                332
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
                217
            ],
            "expiresAt": [
                217
            ],
            "id": [
                545
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
                217
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "id": [
                545
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                402
            ],
            "objectRecordsPermissions": [
                409
            ],
            "objectsPermissions": [
                402
            ],
            "permissionFlags": [
                427
            ],
            "twoFactorAuthenticationMethodSummary": [
                541
            ],
            "updatedAt": [
                217
            ],
            "user": [
                645
            ],
            "userId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                545
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
                545
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
                545
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                545
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
                88
            ],
            "workspaceUrls": [
                699
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
                545
            ],
            "calendarEndFieldMetadataId": [
                545
            ],
            "calendarFieldMetadataId": [
                545
            ],
            "calendarLayout": [
                658
            ],
            "createdAt": [
                217
            ],
            "createdByUserWorkspaceId": [
                545
            ],
            "deletedAt": [
                217
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                545
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
                545
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                667
            ],
            "mainGroupByFieldMetadataId": [
                545
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                545
            ],
            "openRecordIn": [
                668
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                671
            ],
            "universalIdentifier": [
                545
            ],
            "updatedAt": [
                217
            ],
            "viewFieldGroups": [
                661
            ],
            "viewFields": [
                660
            ],
            "viewFilterGroups": [
                663
            ],
            "viewFilters": [
                662
            ],
            "viewGroups": [
                666
            ],
            "viewSorts": [
                669
            ],
            "visibility": [
                672
            ],
            "workspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                675
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
                545
            ],
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "fieldMetadataId": [
                545
            ],
            "id": [
                545
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
                545
            ],
            "updatedAt": [
                217
            ],
            "viewFieldGroupId": [
                545
            ],
            "viewId": [
                545
            ],
            "workspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "id": [
                545
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
                217
            ],
            "viewFields": [
                660
            ],
            "viewId": [
                545
            ],
            "workspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "fieldMetadataId": [
                545
            ],
            "id": [
                545
            ],
            "operand": [
                665
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                545
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                217
            ],
            "value": [
                332
            ],
            "viewFilterGroupId": [
                545
            ],
            "viewId": [
                545
            ],
            "workspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "id": [
                545
            ],
            "logicalOperator": [
                664
            ],
            "parentViewFilterGroupId": [
                545
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                217
            ],
            "viewId": [
                545
            ],
            "workspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "fieldValue": [
                1
            ],
            "id": [
                545
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                217
            ],
            "viewId": [
                545
            ],
            "workspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "direction": [
                670
            ],
            "fieldMetadataId": [
                545
            ],
            "id": [
                545
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                217
            ],
            "viewId": [
                545
            ],
            "workspaceId": [
                545
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
                545
            ],
            "createdAt": [
                217
            ],
            "deletedAt": [
                217
            ],
            "description": [
                1
            ],
            "id": [
                545
            ],
            "operations": [
                1
            ],
            "role": [
                467
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                217
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
                97
            ],
            "on_CalendarConfiguration": [
                138
            ],
            "on_CallRecordingSummaryConfiguration": [
                139
            ],
            "on_CallRecordingTranscriptConfiguration": [
                140
            ],
            "on_ChatConfiguration": [
                148
            ],
            "on_ChatThreadsConfiguration": [
                151
            ],
            "on_EmailThreadConfiguration": [
                246
            ],
            "on_EmailsConfiguration": [
                250
            ],
            "on_FieldConfiguration": [
                273
            ],
            "on_FieldRichTextConfiguration": [
                281
            ],
            "on_FieldsConfiguration": [
                282
            ],
            "on_FilesConfiguration": [
                288
            ],
            "on_FormFieldConfiguration": [
                291
            ],
            "on_FrontComponentConfiguration": [
                293
            ],
            "on_IframeConfiguration": [
                313
            ],
            "on_LineChartConfiguration": [
                336
            ],
            "on_MessageCampaignBodyConfiguration": [
                361
            ],
            "on_MessageCampaignDetailsConfiguration": [
                362
            ],
            "on_NotesConfiguration": [
                393
            ],
            "on_PieChartConfiguration": [
                428
            ],
            "on_RecordTableConfiguration": [
                457
            ],
            "on_StandaloneRichTextConfiguration": [
                512
            ],
            "on_TasksConfiguration": [
                522
            ],
            "on_TimelineConfiguration": [
                526
            ],
            "on_ViewConfiguration": [
                659
            ],
            "on_WorkflowConfiguration": [
                678
            ],
            "on_WorkflowRunConfiguration": [
                679
            ],
            "on_WorkflowVersionConfiguration": [
                680
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
                675
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                675
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                682
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                33
            ],
            "aiChatDirectMessageAssistantMode": [
                28
            ],
            "aiChatInboxAssistantMode": [
                28
            ],
            "aiChatModelTier": [
                33
            ],
            "aiDataPolicy": [
                31
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                332
            ],
            "allowImpersonation": [
                4
            ],
            "allowedEmbeddingOrigins": [
                1
            ],
            "billingCustomer": [
                105
            ],
            "billingEntitlements": [
                107
            ],
            "billingSubscriptions": [
                124
            ],
            "createdAt": [
                217
            ],
            "currentBillingSubscription": [
                124
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                467
            ],
            "deletedAt": [
                217
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
                270
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                545
            ],
            "iframeMediaPermissions": [
                314
            ],
            "installedApplications": [
                51
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
                545
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
                217
            ],
            "viewFields": [
                660
            ],
            "viewFilterGroups": [
                663
            ],
            "viewFilters": [
                662
            ],
            "viewGroups": [
                666
            ],
            "viewSorts": [
                669
            ],
            "views": [
                657
            ],
            "workspaceCustomApplication": [
                51
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                687
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                699
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
                332
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                684
            ],
            "personEnrichment": [
                332
            ],
            "personOutcome": [
                697
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
                217
            ],
            "id": [
                545
            ],
            "roleId": [
                545
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
                692
            ],
            "id": [
                545
            ],
            "locale": [
                1
            ],
            "name": [
                295
            ],
            "numberFormat": [
                693
            ],
            "openRecordIn": [
                413
            ],
            "roles": [
                467
            ],
            "timeFormat": [
                694
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
                545
            ],
            "userWorkspaceId": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                545
            ],
            "variables": [
                646
            ],
            "workspaceMemberId": [
                545
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
                332
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
                545
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
                545
            ],
            "workspaceUrls": [
                699
            ],
            "__typename": [
                1
            ]
        }
    }
}