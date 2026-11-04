export default {
    "scalars": [
        1,
        5,
        7,
        8,
        11,
        12,
        14,
        16,
        19,
        26,
        28,
        29,
        32,
        36,
        38,
        45,
        58,
        66,
        76,
        82,
        94,
        98,
        99,
        101,
        106,
        112,
        118,
        123,
        129,
        132,
        133,
        134,
        135,
        143,
        145,
        159,
        163,
        165,
        167,
        214,
        215,
        242,
        246,
        247,
        249,
        259,
        265,
        269,
        273,
        276,
        283,
        300,
        302,
        308,
        310,
        323,
        330,
        331,
        332,
        344,
        346,
        363,
        364,
        365,
        366,
        367,
        368,
        370,
        371,
        372,
        375,
        376,
        378,
        381,
        386,
        390,
        399,
        406,
        408,
        411,
        415,
        416,
        421,
        425,
        448,
        450,
        451,
        459,
        471,
        473,
        478,
        483,
        503,
        515,
        516,
        518,
        543,
        545,
        547,
        612,
        632,
        639,
        641,
        645,
        656,
        662,
        663,
        665,
        666,
        668,
        669,
        670,
        673,
        674,
        675,
        680,
        682,
        685,
        690,
        691,
        692,
        695,
        696
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
                330
            ],
            "queryId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AdminConsoleLoginToken": {
            "adminConsoleUrl": [
                1
            ],
            "loginToken": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Agent": {
            "applicationId": [
                543
            ],
            "createdAt": [
                215
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "isCustom": [
                5
            ],
            "isSystem": [
                5
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                330
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
                330
            ],
            "roleId": [
                543
            ],
            "triggers": [
                330
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "applicationId": [
                543
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isAccessible": [
                5
            ],
            "isCustom": [
                5
            ],
            "name": [
                1
            ],
            "position": [
                7
            ],
            "roleIds": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "Float": {},
        "AgentChatChannelAssignmentFilter": {},
        "AgentChatChannelRole": {
            "canAccessAllAgentChatChannels": [
                5
            ],
            "icon": [
                1
            ],
            "id": [
                543
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
                11
            ],
            "assignedToMeCount": [
                11
            ],
            "channelId": [
                543
            ],
            "doneCount": [
                11
            ],
            "hasUnreadAssignedToMe": [
                5
            ],
            "hasUnreadOpen": [
                5
            ],
            "mentionedCount": [
                11
            ],
            "needsInputCount": [
                11
            ],
            "openCount": [
                11
            ],
            "snoozedCount": [
                11
            ],
            "unassignedCount": [
                11
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
                5
            ],
            "threadIds": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                330
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
                11
            ],
            "assignedToMeThreadCount": [
                11
            ],
            "hasUnreadAssignedThread": [
                5
            ],
            "hasUnreadMentionThread": [
                5
            ],
            "hasUnreadOpenThread": [
                5
            ],
            "mentionThreadCount": [
                11
            ],
            "needsInputThreadCount": [
                11
            ],
            "openThreadCount": [
                11
            ],
            "unassignedThreadCount": [
                11
            ],
            "unreadOpenThreadCount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThread": {
            "contextWindowTokens": [
                11
            ],
            "conversationSize": [
                11
            ],
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "id": [
                19
            ],
            "isAssistantParticipant": [
                5
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                11
            ],
            "totalInputCredits": [
                7
            ],
            "totalInputTokens": [
                11
            ],
            "totalOutputCredits": [
                7
            ],
            "totalOutputTokens": [
                11
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                215
            ],
            "id": [
                543
            ],
            "isSubscribed": [
                5
            ],
            "lastMentionedAt": [
                215
            ],
            "lastReadAt": [
                215
            ],
            "mentionsResolvedAt": [
                215
            ],
            "snoozedUntil": [
                215
            ],
            "threadId": [
                543
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                543
            ],
            "createdAt": [
                215
            ],
            "id": [
                543
            ],
            "parts": [
                23
            ],
            "processedAt": [
                215
            ],
            "reactions": [
                24
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                543
            ],
            "senderWorkspaceMemberId": [
                543
            ],
            "status": [
                1
            ],
            "threadId": [
                543
            ],
            "turnId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                215
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                543
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                543
            ],
            "messageId": [
                543
            ],
            "orderIndex": [
                11
            ],
            "providerExecuted": [
                5
            ],
            "providerMetadata": [
                330
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
                330
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                330
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
                543
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                5
            ],
            "workspaceMemberIds": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                215
            ],
            "creatorName": [
                1
            ],
            "creatorSource": [
                1
            ],
            "credits": [
                7
            ],
            "endedAt": [
                215
            ],
            "errorMessage": [
                1
            ],
            "id": [
                543
            ],
            "input": [
                1
            ],
            "inputTokens": [
                11
            ],
            "modelId": [
                1
            ],
            "outputTokens": [
                11
            ],
            "reply": [
                1
            ],
            "startedAt": [
                215
            ],
            "status": [
                26
            ],
            "threadId": [
                543
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
                543
            ],
            "aggregateOperation": [
                28
            ],
            "configurationType": [
                673
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                5
            ],
            "filter": [
                330
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "label": [
                1
            ],
            "numberFormat": [
                145
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                443
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
                101
            ],
            "kind": [
                1
            ],
            "limitValue": [
                101
            ],
            "periodEnd": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                101
            ],
            "limitValue": [
                101
            ],
            "periodEnd": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "AiModelTier": {},
        "AiRunUsage": {
            "inputTokens": [
                11
            ],
            "outputTokens": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                11
            ],
            "sections": [
                35
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
                11
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "AnalyticsType": {},
        "ApiConfig": {
            "mutationMaximumAffectedRecords": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "ApiKey": {
            "createdAt": [
                215
            ],
            "expiresAt": [
                215
            ],
            "id": [
                543
            ],
            "name": [
                1
            ],
            "revokedAt": [
                215
            ],
            "role": [
                465
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                215
            ],
            "id": [
                543
            ],
            "name": [
                1
            ],
            "revokedAt": [
                215
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
                19
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
                163
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
                45
            ],
            "value": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageFolderInput": {
            "externalId": [
                1
            ],
            "isSynced": [
                5
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageInput": {
            "externalId": [
                1
            ],
            "folderExternalIds": [
                1
            ],
            "participants": [
                48
            ],
            "receivedAt": [
                215
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
                543
            ],
            "role": [
                372
            ],
            "workspaceMemberId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "Application": {
            "agents": [
                4
            ],
            "applicationRegistration": [
                78
            ],
            "applicationRegistrationId": [
                543
            ],
            "applicationVariables": [
                81
            ],
            "autoUpgrade": [
                5
            ],
            "availablePackages": [
                330
            ],
            "canBeUninstalled": [
                5
            ],
            "commandMenuItems": [
                158
            ],
            "createdAt": [
                215
            ],
            "defaultLogicFunctionRole": [
                465
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                290
            ],
            "grantedIframeMediaPermissions": [
                312
            ],
            "healthCheckLogicFunctionId": [
                543
            ],
            "id": [
                543
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                5
            ],
            "logicFunctions": [
                343
            ],
            "logoFileId": [
                543
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                392
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                543
            ],
            "requestedIframeMediaPermissions": [
                312
            ],
            "runOnUserPreferences": [
                5
            ],
            "settingsCustomTabFrontComponentId": [
                543
            ],
            "settingsMenuItems": [
                502
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
                543
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                543
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                215
            ],
            "id": [
                543
            ],
            "lastAuthorizedAt": [
                215
            ],
            "lastUsedAt": [
                215
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                543
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
                543
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                543
            ],
            "archivedAt": [
                215
            ],
            "authFailedAt": [
                215
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                439
            ],
            "connectionProviderId": [
                543
            ],
            "createdAt": [
                215
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                543
            ],
            "isOwnedByCurrentUser": [
                5
            ],
            "lastCredentialsRefreshedAt": [
                215
            ],
            "lastSignedInAt": [
                215
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                163
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                215
            ],
            "userWorkspaceId": [
                543
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
                543
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                54
            ],
            "scope": [
                167
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
                5
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
                56
            ],
            "coverage": [
                57
            ],
            "files": [
                59
            ],
            "manifest": [
                330
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
                76
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
                58
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
                543
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
                283
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
                283
            ],
            "filePath": [
                1
            ],
            "size": [
                11
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
                215
            ],
            "fileFolder": [
                283
            ],
            "fileId": [
                543
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
                64
            ],
            "description": [
                1
            ],
            "status": [
                66
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
                68
            ],
            "bucketSizeInSeconds": [
                11
            ],
            "creditUsage": [
                69
            ],
            "creditsUsed": [
                7
            ],
            "failedRunCount": [
                11
            ],
            "functions": [
                70
            ],
            "issues": [
                71
            ],
            "lifecycle": [
                72
            ],
            "lifecycleFailureCount": [
                11
            ],
            "lookbackInHours": [
                11
            ],
            "periodEnd": [
                215
            ],
            "periodStart": [
                215
            ],
            "rateLimitEventCount": [
                11
            ],
            "runCount": [
                11
            ],
            "versions": [
                73
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                215
            ],
            "errorCount": [
                11
            ],
            "rateLimitedJobCount": [
                11
            ],
            "rateLimitedRequestCount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringCreditBucket": {
            "bucketStart": [
                215
            ],
            "creditsUsed": [
                7
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
                11
            ],
            "logicFunctionName": [
                1
            ],
            "p95DurationMs": [
                7
            ],
            "runCount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringIssue": {
            "affectedInstallCount": [
                11
            ],
            "errorCode": [
                1
            ],
            "eventCount": [
                11
            ],
            "lastSeenAt": [
                215
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
                215
            ],
            "failedCount": [
                11
            ],
            "installCount": [
                11
            ],
            "uninstallCount": [
                11
            ],
            "upgradeCount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringVersion": {
            "activeInstallCount": [
                11
            ],
            "failedRunCount": [
                11
            ],
            "runCount": [
                11
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
                543
            ],
            "connectionProviders": [
                53
            ],
            "hasUserHealthCheck": [
                5
            ],
            "settingsMenuItems": [
                502
            ],
            "variables": [
                644
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                215
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                543
            ],
            "isConfigured": [
                5
            ],
            "isListed": [
                5
            ],
            "isPreInstalled": [
                5
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
                543
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                76
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSourceType": {},
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                11
            ],
            "autoUpdateEnabled": [
                11
            ],
            "creditsUsedBreakdown": [
                212
            ],
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                11
            ],
            "totalCreditsUsed": [
                7
            ],
            "versionDistribution": [
                654
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                543
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                76
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                215
            ],
            "description": [
                1
            ],
            "id": [
                543
            ],
            "isDeprecated": [
                5
            ],
            "isFilled": [
                5
            ],
            "isRequired": [
                5
            ],
            "isSecret": [
                5
            ],
            "key": [
                1
            ],
            "options": [
                330
            ],
            "type": [
                1
            ],
            "updatedAt": [
                215
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
                86
            ],
            "applicationRefreshToken": [
                86
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
                543
            ],
            "isDeprecated": [
                5
            ],
            "isRequired": [
                5
            ],
            "isSecret": [
                5
            ],
            "key": [
                1
            ],
            "label": [
                1
            ],
            "options": [
                330
            ],
            "scope": [
                82
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
                215
            ],
            "domain": [
                1
            ],
            "id": [
                543
            ],
            "isValidated": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "AuthBypassProviders": {
            "google": [
                5
            ],
            "microsoft": [
                5
            ],
            "password": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "AuthProviders": {
            "google": [
                5
            ],
            "magicLink": [
                5
            ],
            "microsoft": [
                5
            ],
            "password": [
                5
            ],
            "sso": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                215
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
                86
            ],
            "refreshToken": [
                86
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                87
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
                543
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
                481
            ],
            "workspaceUrls": [
                697
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                91
            ],
            "availableWorkspacesForSignUp": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                92
            ],
            "tokens": [
                87
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                543
            ],
            "aggregateOperation": [
                28
            ],
            "axisNameDisplay": [
                94
            ],
            "color": [
                1
            ],
            "configurationType": [
                673
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                5
            ],
            "displayLegend": [
                5
            ],
            "filter": [
                330
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "groupMode": [
                98
            ],
            "isCumulative": [
                5
            ],
            "layout": [
                99
            ],
            "numberFormat": [
                145
            ],
            "omitNullValues": [
                5
            ],
            "primaryAxisDateGranularity": [
                406
            ],
            "primaryAxisGroupByFieldMetadataId": [
                543
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                308
            ],
            "rangeMax": [
                7
            ],
            "rangeMin": [
                7
            ],
            "secondaryAxisGroupByDateGranularity": [
                406
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                543
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                308
            ],
            "splitMultiValueFields": [
                5
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
                330
            ],
            "formattedToRawLookup": [
                330
            ],
            "groupMode": [
                98
            ],
            "hasTooManyGroups": [
                5
            ],
            "indexBy": [
                1
            ],
            "keys": [
                1
            ],
            "layout": [
                99
            ],
            "series": [
                100
            ],
            "showDataLabels": [
                5
            ],
            "showLegend": [
                5
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
                330
            ],
            "objectMetadataId": [
                543
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
                5
            ],
            "stripePublishableKey": [
                1
            ],
            "trialPeriods": [
                127
            ],
            "__typename": [
                1
            ]
        },
        "BillingCustomer": {
            "hasPaymentMethod": [
                5
            ],
            "id": [
                543
            ],
            "userCreditsFallback": [
                645
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
                122
            ],
            "currentBillingSubscription": [
                122
            ],
            "hasPaymentMethod": [
                5
            ],
            "status": [
                516
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                106
            ],
            "value": [
                5
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
                119
            ],
            "name": [
                1
            ],
            "prices": [
                113
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
                119
            ],
            "name": [
                1
            ],
            "prices": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "BillingPartnerCode": {
            "isEditable": [
                5
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
                107
            ],
            "downgradePlanKeys": [
                112
            ],
            "isCheckoutDefault": [
                5
            ],
            "isSellable": [
                5
            ],
            "meteredProducts": [
                108
            ],
            "planKey": [
                112
            ],
            "resourceCreditProducts": [
                107
            ],
            "upgradePlanKeys": [
                112
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingPriceLicensed": {
            "creditAmount": [
                7
            ],
            "isSellable": [
                5
            ],
            "priceUsageType": [
                129
            ],
            "recurringInterval": [
                515
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "priceUsageType": [
                129
            ],
            "recurringInterval": [
                515
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                115
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceTier": {
            "flatAmount": [
                7
            ],
            "unitAmount": [
                7
            ],
            "upTo": [
                7
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
                119
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
                119
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                107
            ],
            "on_BillingMeteredProduct": [
                108
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
                112
            ],
            "priceUsageBased": [
                129
            ],
            "productKey": [
                118
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                215
            ],
            "periodStart": [
                215
            ],
            "productKey": [
                118
            ],
            "unitPriceCents": [
                7
            ],
            "userCreditsUsed": [
                7
            ],
            "workspaceCreditsExtraGranted": [
                7
            ],
            "workspaceCreditsGranted": [
                7
            ],
            "workspaceCreditsGrantedForSeats": [
                7
            ],
            "workspaceCreditsSeats": [
                11
            ],
            "workspaceCreditsTotalGranted": [
                7
            ],
            "workspaceCreditsUsed": [
                7
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
                124
            ],
            "cancelAt": [
                215
            ],
            "collectionMethod": [
                123
            ],
            "currentPeriodEnd": [
                215
            ],
            "hasUserCredits": [
                5
            ],
            "id": [
                543
            ],
            "interval": [
                515
            ],
            "metadata": [
                330
            ],
            "phases": [
                125
            ],
            "status": [
                516
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                117
            ],
            "creditAmount": [
                7
            ],
            "hasReachedCurrentPeriodCap": [
                5
            ],
            "id": [
                543
            ],
            "quantity": [
                7
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                7
            ],
            "items": [
                126
            ],
            "start_date": [
                7
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
                7
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                7
            ],
            "isCreditCardRequired": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "BillingUpdate": {
            "billingSubscriptions": [
                122
            ],
            "currentBillingSubscription": [
                122
            ],
            "__typename": [
                1
            ]
        },
        "BillingUsageType": {},
        "BooleanFieldComparison": {
            "is": [
                5
            ],
            "isNot": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "CalendarChannel": {
            "connectedAccountId": [
                543
            ],
            "contactAutoCreationPolicy": [
                132
            ],
            "createdAt": [
                215
            ],
            "excludePrivateEvents": [
                5
            ],
            "handle": [
                1
            ],
            "id": [
                543
            ],
            "isContactAutoCreationEnabled": [
                5
            ],
            "isSyncEnabled": [
                5
            ],
            "syncStage": [
                133
            ],
            "syncStageStartedAt": [
                215
            ],
            "syncStatus": [
                134
            ],
            "syncedAt": [
                215
            ],
            "throttleFailureCount": [
                7
            ],
            "updatedAt": [
                215
            ],
            "visibility": [
                135
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
                673
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "CampaignAudiencePreviewDTO": {
            "duplicateEmails": [
                11
            ],
            "globallyUnsubscribed": [
                11
            ],
            "hardSuppressed": [
                11
            ],
            "sendable": [
                11
            ],
            "topicUnsubscribed": [
                11
            ],
            "totalMembers": [
                11
            ],
            "trackingRefused": [
                11
            ],
            "withoutEmail": [
                11
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
                11
            ],
            "__typename": [
                1
            ]
        },
        "Captcha": {
            "provider": [
                143
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "ChartNumberFormat": {},
        "ChatConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                330
            ],
            "error": [
                148
            ],
            "maxSeq": [
                11
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
                673
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                7
            ],
            "exists": [
                5
            ],
            "isEmailVerified": [
                5
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
                5
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
                7
            ],
            "isAvailable": [
                5
            ],
            "isDeprecated": [
                5
            ],
            "label": [
                1
            ],
            "maxCriteriaPerQuestion": [
                7
            ],
            "maxScoreLevels": [
                7
            ],
            "medianLatencyMs": [
                7
            ],
            "modelId": [
                1
            ],
            "outputCostPerMillionTokens": [
                7
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
                7
            ],
            "costPerTask": [
                7
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
                7
            ],
            "intelligenceIndex": [
                7
            ],
            "isBenchmarkInherited": [
                5
            ],
            "isDeprecated": [
                5
            ],
            "label": [
                1
            ],
            "maxOutputTokens": [
                7
            ],
            "modelFamily": [
                386
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                388
            ],
            "outputCostPerMillionTokens": [
                7
            ],
            "outputTokensPerSecond": [
                7
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
                32
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "adminConsoleUrl": [
                1
            ],
            "aiEvaluationModels": [
                152
            ],
            "aiModelTiers": [
                154
            ],
            "aiModels": [
                153
            ],
            "allowRequestsToTwentyIcons": [
                5
            ],
            "analyticsEnabled": [
                5
            ],
            "api": [
                39
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                85
            ],
            "billing": [
                102
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                5
            ],
            "captcha": [
                142
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
                5
            ],
            "isBookCallOnboardingStepEnabled": [
                5
            ],
            "isClickHouseConfigured": [
                5
            ],
            "isCloudflareIntegrationEnabled": [
                5
            ],
            "isCompanyEnrichmentEnabled": [
                5
            ],
            "isConfigVariablesInDbEnabled": [
                5
            ],
            "isCookieSessionEnabled": [
                5
            ],
            "isEmailVerificationRequired": [
                5
            ],
            "isEmailingDomainInDemoMode": [
                5
            ],
            "isGoogleCalendarEnabled": [
                5
            ],
            "isGoogleMessagingEnabled": [
                5
            ],
            "isImapSmtpCaldavEnabled": [
                5
            ],
            "isMicrosoftCalendarEnabled": [
                5
            ],
            "isMicrosoftMessagingEnabled": [
                5
            ],
            "isMultiWorkspaceEnabled": [
                5
            ],
            "isOnboardingAiChatEnabled": [
                5
            ],
            "isWorkspaceSchemaDDLLocked": [
                5
            ],
            "maintenance": [
                156
            ],
            "publicFeatureFlags": [
                437
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                500
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                5
            ],
            "support": [
                517
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                215
            ],
            "link": [
                1
            ],
            "startAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                36
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
                543
            ],
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                543
            ],
            "availabilityType": [
                159
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                543
            ],
            "createdAt": [
                215
            ],
            "engineComponentKey": [
                249
            ],
            "frontComponent": [
                290
            ],
            "frontComponentId": [
                543
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "isPinned": [
                5
            ],
            "label": [
                1
            ],
            "navigationTargetObjectMetadataId": [
                543
            ],
            "pageLayoutId": [
                543
            ],
            "payload": [
                160
            ],
            "position": [
                7
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
            ],
            "workflowVersionId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                398
            ],
            "on_PathCommandMenuItemPayload": [
                423
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                60
            ],
            "files": [
                281
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                543
            ],
            "archivedAt": [
                215
            ],
            "authFailedAt": [
                215
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                439
            ],
            "connectionProviderId": [
                543
            ],
            "createdAt": [
                215
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                543
            ],
            "lastCredentialsRefreshedAt": [
                215
            ],
            "lastSignedInAt": [
                215
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                163
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                215
            ],
            "userWorkspaceId": [
                543
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
                315
            ],
            "handle": [
                1
            ],
            "id": [
                543
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                242
            ],
            "host": [
                1
            ],
            "password": [
                1
            ],
            "port": [
                7
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
                543
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
                330
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
                330
            ],
            "roleId": [
                543
            ],
            "triggers": [
                330
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
                543
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                543
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                543
            ],
            "participantHandleFieldUniversalIdentifier": [
                543
            ],
            "visibility": [
                368
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                61
            ],
            "targets": [
                63
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                75
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
                5
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
                5
            ],
            "location": [
                1
            ],
            "sendInvitations": [
                5
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
                5
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
                543
            ],
            "availabilityType": [
                159
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                543
            ],
            "engineComponentKey": [
                249
            ],
            "frontComponentId": [
                543
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "isPinned": [
                5
            ],
            "label": [
                1
            ],
            "navigationTargetObjectMetadataId": [
                543
            ],
            "pageLayoutId": [
                543
            ],
            "payload": [
                330
            ],
            "position": [
                7
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                543
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
                362
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
                330
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                5
            ],
            "isAuditLogged": [
                5
            ],
            "isLabelSyncedWithName": [
                5
            ],
            "isNullable": [
                5
            ],
            "isRemoteCreation": [
                5
            ],
            "isSearchable": [
                5
            ],
            "isSystem": [
                5
            ],
            "isUIEditable": [
                5
            ],
            "isUIReadOnly": [
                5
            ],
            "isUnique": [
                5
            ],
            "label": [
                1
            ],
            "morphRelationsCreationPayload": [
                330
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                543
            ],
            "options": [
                330
            ],
            "relationCreationPayload": [
                330
            ],
            "settings": [
                330
            ],
            "type": [
                276
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
                543
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
                543
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
                184
            ],
            "indexType": [
                323
            ],
            "objectMetadataId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                330
            ],
            "databaseEventTriggerSettings": [
                330
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                330
            ],
            "id": [
                543
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                330
            ],
            "source": [
                330
            ],
            "timeoutSeconds": [
                7
            ],
            "toolTriggerSettings": [
                330
            ],
            "universalIdentifier": [
                543
            ],
            "workflowActionTriggerSettings": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                543
            ],
            "id": [
                543
            ],
            "isActive": [
                5
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
                543
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                543
            ],
            "color": [
                1
            ],
            "folderId": [
                543
            ],
            "icon": [
                1
            ],
            "id": [
                543
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
                543
            ],
            "position": [
                7
            ],
            "targetObjectMetadataId": [
                543
            ],
            "targetRecordId": [
                543
            ],
            "type": [
                390
            ],
            "userWorkspaceId": [
                543
            ],
            "viewId": [
                543
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
                5
            ],
            "isRemote": [
                5
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
                330
            ],
            "shortcut": [
                1
            ],
            "skipNameField": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneFieldMetadataInput": {
            "field": [
                182
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                190
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
                543
            ],
            "type": [
                416
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                415
            ],
            "pageLayoutId": [
                543
            ],
            "position": [
                7
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
                330
            ],
            "objectMetadataId": [
                543
            ],
            "pageLayoutTabId": [
                543
            ],
            "position": [
                330
            ],
            "title": [
                1
            ],
            "type": [
                674
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                543
            ],
            "filter": [
                330
            ],
            "objectMetadataId": [
                543
            ],
            "orderBy": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                543
            ],
            "isInherent": [
                5
            ],
            "objectMetadataId": [
                543
            ],
            "secondFieldMetadataId": [
                543
            ],
            "thirdFieldMetadataId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "CreateRoleInput": {
            "canAccessAllAgentChatChannels": [
                5
            ],
            "canAccessAllTools": [
                5
            ],
            "canBeAssignedToAgents": [
                5
            ],
            "canBeAssignedToApiKeys": [
                5
            ],
            "canBeAssignedToUsers": [
                5
            ],
            "canDestroyAllObjectRecords": [
                5
            ],
            "canReadAllObjectRecords": [
                5
            ],
            "canSoftDeleteAllObjectRecords": [
                5
            ],
            "canUpdateAllObjectRecords": [
                5
            ],
            "canUpdateAllSettings": [
                5
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
                543
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
                547
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                101
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                101
            ],
            "operationType": [
                632
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                639
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                641
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
                543
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                5
            ],
            "message": [
                1
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                543
            ],
            "isVisible": [
                5
            ],
            "name": [
                1
            ],
            "position": [
                7
            ],
            "viewId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                28
            ],
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "size": [
                7
            ],
            "viewFieldGroupId": [
                543
            ],
            "viewId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                543
            ],
            "logicalOperator": [
                662
            ],
            "parentViewFilterGroupId": [
                543
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "viewId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "operand": [
                663
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                543
            ],
            "subFieldName": [
                1
            ],
            "value": [
                330
            ],
            "viewFilterGroupId": [
                543
            ],
            "viewId": [
                543
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
                543
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "viewId": [
                543
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
                543
            ],
            "calendarFieldMetadataId": [
                543
            ],
            "calendarLayout": [
                656
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isCompact": [
                5
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                543
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                665
            ],
            "mainGroupByFieldMetadataId": [
                543
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                543
            ],
            "openRecordIn": [
                666
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                669
            ],
            "visibility": [
                670
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                668
            ],
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                543
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
                543
            ],
            "operations": [
                1
            ],
            "roleId": [
                543
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
                7
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "operation": [
                632
            ],
            "resource": [
                639
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                165
            ],
            "before": [
                165
            ],
            "first": [
                11
            ],
            "last": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "DatabaseEventAction": {},
        "DateTime": {},
        "DeleteApprovedAccessDomainInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteTwoFactorAuthenticationMethod": {
            "success": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldGroupInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                543
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
                543
            ],
            "name": [
                293
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                543
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
                543
            ],
            "isCustomDomainEnabled": [
                5
            ],
            "records": [
                235
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
                543
            ],
            "pageLayoutId": [
                543
            ],
            "position": [
                7
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
                543
            ],
            "memberCount": [
                7
            ],
            "name": [
                1
            ],
            "position": [
                7
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
                543
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                483
            ],
            "type": [
                310
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                543
            ],
            "status": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                166
            ],
            "IMAP": [
                166
            ],
            "SMTP": [
                166
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                215
            ],
            "domain": [
                1
            ],
            "id": [
                543
            ],
            "status": [
                246
            ],
            "tenantStatus": [
                247
            ],
            "unsubscribeHostnameStatus": [
                545
            ],
            "updatedAt": [
                215
            ],
            "verificationRecords": [
                651
            ],
            "verifiedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "EngineComponentKey": {},
        "EnqueueJobInput": {
            "delayMs": [
                11
            ],
            "jobId": [
                1
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payload": [
                330
            ],
            "retryLimit": [
                11
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
                330
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobResult": {
            "enqueued": [
                5
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
                11
            ],
            "jobs": [
                251
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                330
            ],
            "retryLimit": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobsResult": {
            "enqueued": [
                5
            ],
            "enqueuedJobsCount": [
                11
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
                215
            ],
            "isValid": [
                5
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
                215
            ],
            "currentPeriodEnd": [
                215
            ],
            "expiresAt": [
                215
            ],
            "isCancellationScheduled": [
                5
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
                215
            ],
            "start": [
                215
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
                259
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
                257
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                258
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
                5
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
                260
            ],
            "first": [
                11
            ],
            "table": [
                265
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                261
            ],
            "records": [
                264
            ],
            "totalCount": [
                11
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
                5
            ],
            "objectMetadataId": [
                1
            ],
            "properties": [
                330
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                215
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
                377
            ],
            "objectRecordEventsWithQueryIds": [
                405
            ],
            "queueJobEvents": [
                333
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                543
            ],
            "payload": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                269
            ],
            "value": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagKey": {},
        "Field": {
            "applicationId": [
                543
            ],
            "createdAt": [
                215
            ],
            "defaultValue": [
                330
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
                543
            ],
            "isActive": [
                5
            ],
            "isAuditLogged": [
                5
            ],
            "isLabelSyncedWithName": [
                5
            ],
            "isNullable": [
                5
            ],
            "isSearchable": [
                5
            ],
            "isSystem": [
                5
            ],
            "isSystemSideEffect": [
                5
            ],
            "isUIEditable": [
                5
            ],
            "isUIReadOnly": [
                5
            ],
            "isUnique": [
                5
            ],
            "label": [
                1
            ],
            "morphId": [
                543
            ],
            "morphRelations": [
                458
            ],
            "name": [
                1
            ],
            "object": [
                392
            ],
            "objectMetadataId": [
                543
            ],
            "options": [
                330
            ],
            "relation": [
                458
            ],
            "settings": [
                330
            ],
            "type": [
                276
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                673
            ],
            "fieldDisplayMode": [
                273
            ],
            "fieldMetadataId": [
                1
            ],
            "isUIEditable": [
                5
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
                274
            ],
            "pageInfo": [
                412
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                165
            ],
            "node": [
                270
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                275
            ],
            "id": [
                544
            ],
            "isActive": [
                130
            ],
            "isSystem": [
                130
            ],
            "isUIEditable": [
                130
            ],
            "isUIReadOnly": [
                130
            ],
            "objectMetadataId": [
                544
            ],
            "or": [
                275
            ],
            "__typename": [
                1
            ]
        },
        "FieldMetadataType": {},
        "FieldPermission": {
            "canReadFieldValue": [
                5
            ],
            "canUpdateFieldValue": [
                5
            ],
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "objectMetadataId": [
                543
            ],
            "roleId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "FieldPermissionInput": {
            "canReadFieldValue": [
                5
            ],
            "canUpdateFieldValue": [
                5
            ],
            "fieldMetadataId": [
                543
            ],
            "objectMetadataId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                673
            ],
            "newFieldDefaultVisibility": [
                5
            ],
            "shouldAllowUserToSeeHiddenFields": [
                5
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
                215
            ],
            "id": [
                543
            ],
            "path": [
                1
            ],
            "size": [
                7
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
                543
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
                215
            ],
            "fileId": [
                543
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
                215
            ],
            "id": [
                543
            ],
            "path": [
                1
            ],
            "size": [
                7
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
                673
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                543
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                483
            ],
            "type": [
                310
            ],
            "workspace": [
                694
            ],
            "__typename": [
                1
            ]
        },
        "FindMessageSuppressionsInput": {
            "limit": [
                11
            ],
            "offset": [
                11
            ],
            "reason": [
                375
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                673
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
                312
            ],
            "applicationId": [
                543
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                80
            ],
            "applicationVariables": [
                330
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
                215
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                543
            ],
            "isHeadless": [
                5
            ],
            "name": [
                1
            ],
            "sourceComponentPath": [
                1
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
            ],
            "usesSdkClient": [
                5
            ],
            "widgetAvailability": [
                292
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                673
            ],
            "frontComponentId": [
                543
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                543
            ],
            "pageLayoutType": [
                416
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
                477
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                330
            ],
            "runId": [
                543
            ],
            "scope": [
                330
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
                330
            ],
            "runId": [
                543
            ],
            "success": [
                5
            ],
            "text": [
                1
            ],
            "usage": [
                33
            ],
            "__typename": [
                1
            ]
        },
        "GetApiKeyInput": {
            "id": [
                543
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
                543
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
                543
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
                300
            ],
            "isHidden": [
                5
            ],
            "selectedStepActionKey": [
                300
            ],
            "snoozedUntil": [
                1
            ],
            "steps": [
                301
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                300
            ],
            "description": [
                1
            ],
            "doneTitle": [
                1
            ],
            "icon": [
                1
            ],
            "iconColor": [
                1
            ],
            "kind": [
                302
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
                305
            ],
            "stepActionKey": [
                300
            ],
            "trigger": [
                306
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
                675
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
                543
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
                7
            ],
            "columnSpan": [
                7
            ],
            "row": [
                7
            ],
            "rowSpan": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                673
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
                5
            ],
            "microphone": [
                5
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
                5
            ],
            "microphone": [
                5
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavPublicConnectionParameters": {
            "CALDAV": [
                316
            ],
            "IMAP": [
                316
            ],
            "SMTP": [
                316
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
                242
            ],
            "host": [
                1
            ],
            "port": [
                7
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
                86
            ],
            "workspace": [
                698
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
                543
            ],
            "threadId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                543
            ],
            "createdAt": [
                215
            ],
            "id": [
                543
            ],
            "indexFieldMetadataList": [
                321
            ],
            "indexType": [
                323
            ],
            "indexWhereClause": [
                1
            ],
            "isCustom": [
                5
            ],
            "isSystemSideEffect": [
                5
            ],
            "isUnique": [
                5
            ],
            "name": [
                1
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                165
            ],
            "node": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                215
            ],
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "order": [
                7
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                322
            ],
            "id": [
                544
            ],
            "isCustom": [
                130
            ],
            "or": [
                322
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                543
            ],
            "messages": [
                47
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                326
            ],
            "__typename": [
                1
            ]
        },
        "IngestedAppMessage": {
            "externalId": [
                1
            ],
            "messageId": [
                543
            ],
            "messageThreadId": [
                543
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
                5
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
                11
            ],
            "enqueuedAt": [
                7
            ],
            "failedReason": [
                1
            ],
            "finishedAt": [
                7
            ],
            "jobId": [
                1
            ],
            "progress": [
                11
            ],
            "startedAt": [
                7
            ],
            "state": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                543
            ],
            "aggregateOperation": [
                28
            ],
            "axisNameDisplay": [
                94
            ],
            "color": [
                1
            ],
            "configurationType": [
                673
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                5
            ],
            "displayLegend": [
                5
            ],
            "filter": [
                330
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "isCumulative": [
                5
            ],
            "isStacked": [
                5
            ],
            "numberFormat": [
                145
            ],
            "omitNullValues": [
                5
            ],
            "primaryAxisDateGranularity": [
                406
            ],
            "primaryAxisGroupByFieldMetadataId": [
                543
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                308
            ],
            "rangeMax": [
                7
            ],
            "rangeMin": [
                7
            ],
            "secondaryAxisGroupByDateGranularity": [
                406
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                543
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                308
            ],
            "splitMultiValueFields": [
                5
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
                330
            ],
            "hasTooManyGroups": [
                5
            ],
            "series": [
                338
            ],
            "showDataLabels": [
                5
            ],
            "showLegend": [
                5
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
                330
            ],
            "objectMetadataId": [
                543
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
                7
            ],
            "__typename": [
                1
            ]
        },
        "LineChartSeries": {
            "data": [
                337
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
                163
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
                543
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "Location": {
            "lat": [
                7
            ],
            "lng": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunction": {
            "applicationId": [
                543
            ],
            "canRunOnDemand": [
                5
            ],
            "createdAt": [
                215
            ],
            "cronTriggerSettings": [
                330
            ],
            "databaseEventTriggerSettings": [
                330
            ],
            "description": [
                1
            ],
            "executionMode": [
                344
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                330
            ],
            "id": [
                543
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
                7
            ],
            "toolTriggerSettings": [
                330
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
            ],
            "workflowActionTriggerSettings": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                330
            ],
            "duration": [
                7
            ],
            "error": [
                330
            ],
            "logs": [
                1
            ],
            "status": [
                346
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "LogicFunctionIdInput": {
            "id": [
                19
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
                543
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                543
            ],
            "applicationUniversalIdentifier": [
                543
            ],
            "id": [
                543
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                86
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
                5
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
                5
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
                11
            ],
            "isListed": [
                5
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
                330
            ],
            "name": [
                1
            ],
            "objects": [
                353
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "requestedIframeMediaPermissions": [
                312
            ],
            "roles": [
                354
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                76
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
                5
            ],
            "canDestroyAllObjectRecords": [
                5
            ],
            "canReadAllObjectRecords": [
                5
            ],
            "canSoftDeleteAllObjectRecords": [
                5
            ],
            "canUpdateAllObjectRecords": [
                5
            ],
            "canUpdateAllSettings": [
                5
            ],
            "description": [
                1
            ],
            "fieldPermissions": [
                355
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                356
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
                5
            ],
            "canUpdateFieldValue": [
                5
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
                5
            ],
            "canReadObjectRecords": [
                5
            ],
            "canSoftDeleteObjectRecords": [
                5
            ],
            "canUpdateObjectRecords": [
                5
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
                543
            ],
            "connectionProviderId": [
                543
            ],
            "createdAt": [
                215
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "tools": [
                358
            ],
            "toolsSyncError": [
                1
            ],
            "toolsSyncedAt": [
                215
            ],
            "updatedAt": [
                215
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
                330
            ],
            "description": [
                1
            ],
            "inputSchema": [
                330
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
                673
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                673
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
                162
            ],
            "connectedAccountId": [
                543
            ],
            "contactAutoCreationPolicy": [
                363
            ],
            "createdAt": [
                215
            ],
            "displayName": [
                1
            ],
            "excludeGroupEmails": [
                5
            ],
            "excludeNonProfessionalEmails": [
                5
            ],
            "handle": [
                1
            ],
            "id": [
                543
            ],
            "importProgress": [
                11
            ],
            "isContactAutoCreationEnabled": [
                5
            ],
            "isSyncEnabled": [
                5
            ],
            "messageFolderImportPolicy": [
                370
            ],
            "messagingProviderUniversalIdentifier": [
                543
            ],
            "participantHandleFieldUniversalIdentifier": [
                543
            ],
            "pendingGroupEmailsAction": [
                364
            ],
            "syncStage": [
                365
            ],
            "syncStageStartedAt": [
                215
            ],
            "syncStatus": [
                366
            ],
            "syncedAt": [
                215
            ],
            "throttleFailureCount": [
                7
            ],
            "throttleRetryAfter": [
                215
            ],
            "type": [
                367
            ],
            "updatedAt": [
                215
            ],
            "visibility": [
                368
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
                215
            ],
            "externalId": [
                1
            ],
            "id": [
                543
            ],
            "isSentFolder": [
                5
            ],
            "isSynced": [
                5
            ],
            "messageChannelId": [
                543
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                371
            ],
            "updatedAt": [
                215
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
                215
            ],
            "emailAddress": [
                1
            ],
            "id": [
                543
            ],
            "reason": [
                375
            ],
            "source": [
                376
            ],
            "unsubscribeTopicId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                373
            ],
            "totalCount": [
                11
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
                404
            ],
            "recordId": [
                1
            ],
            "type": [
                378
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
                543
            ],
            "property": [
                1
            ],
            "provenance": [
                381
            ],
            "recordId": [
                543
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
                543
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                157
            ],
            "objectMetadataItems": [
                384
            ],
            "views": [
                385
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
                543
            ],
            "isActive": [
                5
            ],
            "isRemote": [
                5
            ],
            "isSystem": [
                5
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
                543
            ],
            "key": [
                665
            ],
            "objectMetadataId": [
                543
            ],
            "type": [
                669
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                509,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                679,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                24,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "addQueryToEventStream": [
                5,
                {
                    "input": [
                        2,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "approveApplicationIframeMediaPermissions": [
                49,
                {
                    "applicationId": [
                        543,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        313,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                5,
                {
                    "assigneeWorkspaceMemberId": [
                        543
                    ],
                    "threadId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                5,
                {
                    "agentId": [
                        543,
                        "UUID!"
                    ],
                    "roleId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                5,
                {
                    "apiKeyId": [
                        543,
                        "UUID!"
                    ],
                    "roleId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                5,
                {
                    "input": [
                        318,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                89,
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
                141,
                {
                    "input": [
                        140,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                128
            ],
            "cancelSwitchBillingPlan": [
                128
            ],
            "cancelSwitchResourceCreditPrice": [
                128
            ],
            "checkCustomDomainValidRecords": [
                236
            ],
            "checkPublicDomainValidRecords": [
                236,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                121,
                {
                    "plan": [
                        112,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        515,
                        "SubscriptionInterval!"
                    ],
                    "requirePaymentMethod": [
                        5,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                75,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                75,
                {
                    "fileId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                161,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        543,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                410,
                {
                    "hasBookedCall": [
                        5,
                        "Boolean!"
                    ],
                    "isAutoSkipped": [
                        5,
                        "Boolean!"
                    ]
                }
            ],
            "completeFileUpload": [
                285,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                285,
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
                285,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                285,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createAdminConsoleLoginToken": [
                3
            ],
            "createAgentChatChannel": [
                6,
                {
                    "input": [
                        168,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                40,
                {
                    "input": [
                        170,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                362,
                {
                    "input": [
                        171,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                172,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        62,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                173,
                {
                    "input": [
                        174,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                83,
                {
                    "input": [
                        175,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                110
            ],
            "createCalendarEvent": [
                177,
                {
                    "input": [
                        176,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                18,
                {
                    "channelId": [
                        543
                    ]
                }
            ],
            "createCommandMenuItem": [
                158,
                {
                    "input": [
                        178,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                234,
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
                180,
                {
                    "input": [
                        179,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                245,
                {
                    "input": [
                        181,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                284,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        283,
                        "FileFolder!"
                    ],
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        7,
                        "Float!"
                    ]
                }
            ],
            "createFrontComponent": [
                290,
                {
                    "input": [
                        183,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                389,
                {
                    "inputs": [
                        189,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                659,
                {
                    "inputs": [
                        204,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                658,
                {
                    "inputs": [
                        205,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                664,
                {
                    "inputs": [
                        208,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                357,
                {
                    "input": [
                        187,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                373,
                {
                    "input": [
                        188,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                389,
                {
                    "input": [
                        189,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                284,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        7,
                        "Float!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                506,
                {
                    "input": [
                        504,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                37,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        543,
                        "UUID!"
                    ],
                    "properties": [
                        330
                    ],
                    "recordId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                4,
                {
                    "input": [
                        169,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                270,
                {
                    "input": [
                        191,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                319,
                {
                    "input": [
                        192,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                343,
                {
                    "input": [
                        186,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                392,
                {
                    "input": [
                        193,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                465,
                {
                    "createRoleInput": [
                        199,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                413,
                {
                    "input": [
                        194,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                414,
                {
                    "input": [
                        195,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                417,
                {
                    "input": [
                        196,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                436,
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
                457,
                {
                    "input": [
                        198,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                506,
                {
                    "input": [
                        505,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                509,
                {
                    "input": [
                        200,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                110,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        112,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        515,
                        "SubscriptionInterval!"
                    ],
                    "requirePaymentMethod": [
                        5,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ]
                }
            ],
            "createUnsubscribeTopic": [
                546,
                {
                    "input": [
                        201,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                630,
                {
                    "input": [
                        202,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                650,
                {
                    "input": [
                        203,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                655,
                {
                    "input": [
                        209,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                658,
                {
                    "input": [
                        205,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                659,
                {
                    "input": [
                        204,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                660,
                {
                    "input": [
                        207,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                661,
                {
                    "input": [
                        206,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                664,
                {
                    "input": [
                        208,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                667,
                {
                    "input": [
                        210,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                671,
                {
                    "input": [
                        211,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                509,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                5,
                {
                    "channelId": [
                        543,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        543
                    ]
                }
            ],
            "deleteAppKeyValue": [
                5,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        45
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                362,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteApplicationRegistration": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                5,
                {
                    "input": [
                        216,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                158,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                162,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                679
            ],
            "deleteEmailGroupChannel": [
                362,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteEmailingDomain": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                290,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                389,
                {
                    "ids": [
                        543,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                357,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                5,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                389,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                4,
                {
                    "input": [
                        21,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                270,
                {
                    "input": [
                        217,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                319,
                {
                    "input": [
                        218,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                343,
                {
                    "input": [
                        347,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                392,
                {
                    "input": [
                        219,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deletePublicDomain": [
                5,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteQueuedChatMessage": [
                5,
                {
                    "messageId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                457,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                220,
                {
                    "input": [
                        221,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                509,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                222,
                {
                    "twoFactorAuthenticationMethodId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteUnsubscribeTopic": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUsageLimit": [
                5,
                {
                    "usageLimitId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                643
            ],
            "deleteUserFromWorkspace": [
                647,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                650,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "deleteView": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteViewField": [
                658,
                {
                    "input": [
                        224,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                659,
                {
                    "input": [
                        223,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                660,
                {
                    "input": [
                        225,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilterGroup": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteViewGroup": [
                664,
                {
                    "input": [
                        226,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                5,
                {
                    "input": [
                        227,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                671,
                {
                    "id": [
                        543,
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
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayoutTab": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayoutWidget": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyView": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyViewField": [
                658,
                {
                    "input": [
                        230,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                659,
                {
                    "input": [
                        229,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                660,
                {
                    "input": [
                        231,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilterGroup": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyViewGroup": [
                664,
                {
                    "input": [
                        232,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                5,
                {
                    "input": [
                        233,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                5,
                {
                    "input": [
                        318,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                162,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                237,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                238,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                239,
                {
                    "input": [
                        240,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                243,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        543
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                104
            ],
            "enqueueJob": [
                252,
                {
                    "input": [
                        250,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                254,
                {
                    "input": [
                        253,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                683
            ],
            "executeOneLogicFunction": [
                345,
                {
                    "input": [
                        267,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                295,
                {
                    "input": [
                        294,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                42,
                {
                    "apiKeyId": [
                        543,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                80,
                {
                    "applicationId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                86
            ],
            "generateTransientToken": [
                526
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                540,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                88,
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
                88,
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
                88,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                541,
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
                297,
                {
                    "input": [
                        298,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                350,
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
                409
            ],
            "grantApplicationCapabilities": [
                51,
                {
                    "input": [
                        307,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                317,
                {
                    "userId": [
                        543,
                        "UUID!"
                    ],
                    "workspaceId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                325,
                {
                    "input": [
                        324,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                327,
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
                327
            ],
            "installApplication": [
                49,
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
                5,
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
                5,
                {
                    "threadId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                5,
                {
                    "channelId": [
                        543
                    ],
                    "threadId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                303,
                {
                    "stepActionKey": [
                        300,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                5
            ],
            "releaseEnterpriseServerBinding": [
                255
            ],
            "removeAgentChatMessageReaction": [
                24,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                5,
                {
                    "input": [
                        460,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                452,
                {
                    "principal": [
                        449,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        456,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                5,
                {
                    "agentId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                80,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                88,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "reopenAgentChatThreadInChannel": [
                5,
                {
                    "threadId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                5,
                {
                    "input": [
                        461,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                462,
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
                496,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                158,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                414,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                417,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                521,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                488,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                11
            ],
            "revokeApiKey": [
                40,
                {
                    "input": [
                        463,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                5,
                {
                    "applicationAuthorizationId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                5,
                {
                    "userId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                5,
                {
                    "userSessionId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                467,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                479,
                {
                    "input": [
                        475,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                65,
                {
                    "applicationId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                65,
                {
                    "applicationId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                314,
                {
                    "connectionParameters": [
                        241,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        543
                    ]
                }
            ],
            "sendAppChannelMessage": [
                487,
                {
                    "input": [
                        486,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                488,
                {
                    "browsingContext": [
                        330
                    ],
                    "channelId": [
                        543
                    ],
                    "fileAttachments": [
                        282,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        5
                    ],
                    "isAssistantParticipant": [
                        5
                    ],
                    "mentionedWorkspaceMemberIds": [
                        543,
                        "[UUID!]"
                    ],
                    "messageId": [
                        543,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "recipientWorkspaceMemberIds": [
                        543,
                        "[UUID!]"
                    ],
                    "shouldAssistantReply": [
                        5
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "threadId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                491,
                {
                    "input": [
                        490,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                495,
                {
                    "input": [
                        494,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                496,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        543
                    ]
                }
            ],
            "sendMessageCampaign": [
                498,
                {
                    "input": [
                        497,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                493,
                {
                    "input": [
                        499,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                44,
                {
                    "input": [
                        501,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                109,
                {
                    "partnerCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                255,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                452,
                {
                    "isPrivate": [
                        5,
                        "Boolean!"
                    ],
                    "target": [
                        456,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                452,
                {
                    "accessLevel": [
                        448,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        449,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        456,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                128,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                93,
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
                5,
                {
                    "refreshToken": [
                        1
                    ]
                }
            ],
            "signUp": [
                93,
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
                507,
                {
                    "input": [
                        508
                    ]
                }
            ],
            "signUpInWorkspace": [
                507,
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
                        543
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
                410,
                {
                    "isAutoSkipped": [
                        5,
                        "Boolean!"
                    ]
                }
            ],
            "snoozeAgentChatThreadInChannel": [
                5,
                {
                    "snoozedUntil": [
                        215,
                        "DateTime!"
                    ],
                    "threadId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                144,
                {
                    "connectedAccountId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                511,
                {
                    "companyContext": [
                        330
                    ],
                    "personContext": [
                        330
                    ]
                }
            ],
            "stopAgentChatStream": [
                5,
                {
                    "threadId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                512
            ],
            "switchBillingPlan": [
                128,
                {
                    "plan": [
                        112
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                128
            ],
            "syncAppMessageFolders": [
                369,
                {
                    "input": [
                        519,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                693,
                {
                    "dryRun": [
                        5
                    ],
                    "inferDeletionFromMissingEntities": [
                        5
                    ],
                    "manifest": [
                        330,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                5
            ],
            "syncMcpServerTools": [
                357,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "trackAnalytics": [
                37,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        330
                    ],
                    "type": [
                        38,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                75,
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
                528,
                {
                    "input": [
                        527,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                532,
                {
                    "input": [
                        529,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                531,
                {
                    "input": [
                        530,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                536,
                {
                    "input": [
                        533,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                535,
                {
                    "input": [
                        534,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                538,
                {
                    "input": [
                        537,
                        "TriggerUpgradeApplicationInput!"
                    ]
                }
            ],
            "uninstallApplication": [
                5,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateAgentChatChannel": [
                6,
                {
                    "channelId": [
                        543,
                        "UUID!"
                    ],
                    "input": [
                        548,
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
                        215
                    ],
                    "threadIds": [
                        543,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                40,
                {
                    "input": [
                        550,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                362,
                {
                    "input": [
                        551,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                49,
                {
                    "id": [
                        543,
                        "UUID!"
                    ],
                    "input": [
                        552,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                75,
                {
                    "input": [
                        553,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                79,
                {
                    "input": [
                        555,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                131,
                {
                    "input": [
                        557,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                158,
                {
                    "input": [
                        559,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                362,
                {
                    "input": [
                        560,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                290,
                {
                    "input": [
                        562,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                299,
                {
                    "input": [
                        564,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                268,
                {
                    "input": [
                        565,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                389,
                {
                    "inputs": [
                        578,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                392,
                {
                    "inputs": [
                        579,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                664,
                {
                    "inputs": [
                        601,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                357,
                {
                    "input": [
                        568,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                362,
                {
                    "input": [
                        570,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                369,
                {
                    "input": [
                        572,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                369,
                {
                    "input": [
                        574,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateMyUserApplicationVariable": [
                5,
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
                389,
                {
                    "input": [
                        578,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                4,
                {
                    "input": [
                        549,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                5,
                {
                    "applicationId": [
                        543
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
                270,
                {
                    "input": [
                        577,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                5,
                {
                    "input": [
                        566,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                392,
                {
                    "input": [
                        579,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                465,
                {
                    "updateRoleInput": [
                        586,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        580,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                414,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        581,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                417,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        583,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        585,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                328,
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
                509,
                {
                    "input": [
                        588,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                521,
                {
                    "input": [
                        589,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                546,
                {
                    "input": [
                        590,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                630,
                {
                    "input": [
                        591,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                103,
                {
                    "userCreditsFallback": [
                        645,
                        "UserCreditsFallback!"
                    ]
                }
            ],
            "updateUserEmail": [
                5,
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
                650,
                {
                    "input": [
                        592,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                655,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        603,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                658,
                {
                    "input": [
                        596,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                659,
                {
                    "input": [
                        594,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                660,
                {
                    "input": [
                        599,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                661,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        598,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                664,
                {
                    "input": [
                        601,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                667,
                {
                    "input": [
                        604,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                671,
                {
                    "input": [
                        606,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                679,
                {
                    "data": [
                        610,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                679,
                {
                    "data": [
                        608,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                679,
                {
                    "data": [
                        609,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                688,
                {
                    "roleId": [
                        543,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                5,
                {
                    "input": [
                        611,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "upgradeApplication": [
                5,
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
                75,
                {
                    "file": [
                        612,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                281,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        612,
                        "Upload!"
                    ],
                    "fileFolder": [
                        283,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                285,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        612,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                285,
                {
                    "file": [
                        612,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                285,
                {
                    "file": [
                        612,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                285,
                {
                    "file": [
                        612,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                277,
                {
                    "upsertFieldPermissionsInput": [
                        613,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                655,
                {
                    "input": [
                        616,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                400,
                {
                    "upsertObjectPermissionsInput": [
                        617,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                466,
                {
                    "upsertPermissionFlagsInput": [
                        618,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                620,
                {
                    "input": [
                        619,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                655,
                {
                    "input": [
                        621,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                83,
                {
                    "input": [
                        648,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                652,
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
                93,
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
                245,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                653,
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
                5
            ],
            "webSearch": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItem": {
            "agentChatChannelId": [
                543
            ],
            "applicationId": [
                543
            ],
            "color": [
                1
            ],
            "createdAt": [
                215
            ],
            "folderId": [
                543
            ],
            "icon": [
                1
            ],
            "id": [
                543
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
                543
            ],
            "position": [
                7
            ],
            "targetObjectMetadataId": [
                543
            ],
            "targetRecordId": [
                543
            ],
            "targetRecordIdentifier": [
                445
            ],
            "type": [
                390
            ],
            "updatedAt": [
                215
            ],
            "userWorkspaceId": [
                543
            ],
            "viewId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                543
            ],
            "color": [
                1
            ],
            "createdAt": [
                215
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
                395,
                {
                    "filter": [
                        275,
                        "FieldFilter!"
                    ],
                    "paging": [
                        213,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                270
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "imageIdentifierFieldMetadataId": [
                543
            ],
            "indexMetadataList": [
                319
            ],
            "indexMetadatas": [
                397,
                {
                    "filter": [
                        322,
                        "IndexFilter!"
                    ],
                    "paging": [
                        213,
                        "CursorPaging!"
                    ]
                }
            ],
            "isActive": [
                5
            ],
            "isAuditLogged": [
                5
            ],
            "isLabelSyncedWithName": [
                5
            ],
            "isRemote": [
                5
            ],
            "isSearchable": [
                5
            ],
            "isSystem": [
                5
            ],
            "isUICreatable": [
                5
            ],
            "isUIEditable": [
                5
            ],
            "isUIReadOnly": [
                5
            ],
            "labelIdentifierFieldMetadataId": [
                543
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
                399
            ],
            "searchFieldMetadataList": [
                485
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                394
            ],
            "pageInfo": [
                412
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                165
            ],
            "node": [
                392
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                274
            ],
            "pageInfo": [
                412
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                396
            ],
            "id": [
                544
            ],
            "isActive": [
                130
            ],
            "isRemote": [
                130
            ],
            "isSearchable": [
                130
            ],
            "isSystem": [
                130
            ],
            "isUICreatable": [
                130
            ],
            "isUIEditable": [
                130
            ],
            "isUIReadOnly": [
                130
            ],
            "or": [
                396
            ],
            "universalIdentifier": [
                544
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                320
            ],
            "pageInfo": [
                412
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "ObjectOpenRecordIn": {},
        "ObjectPermission": {
            "canDestroyObjectRecords": [
                5
            ],
            "canReadObjectRecords": [
                5
            ],
            "canSoftDeleteObjectRecords": [
                5
            ],
            "canUpdateObjectRecords": [
                5
            ],
            "objectMetadataId": [
                543
            ],
            "restrictedFields": [
                330
            ],
            "rowLevelPermissionPredicateGroups": [
                469
            ],
            "rowLevelPermissionPredicates": [
                468
            ],
            "__typename": [
                1
            ]
        },
        "ObjectPermissionInput": {
            "canDestroyObjectRecords": [
                5
            ],
            "canReadObjectRecords": [
                5
            ],
            "canSoftDeleteObjectRecords": [
                5
            ],
            "canUpdateObjectRecords": [
                5
            ],
            "objectMetadataId": [
                543
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
                11
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordEvent": {
            "action": [
                214
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                404
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
                330
            ],
            "before": [
                330
            ],
            "diff": [
                330
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
                403
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
                5
            ],
            "canReadAllRecords": [
                5
            ],
            "canSoftDeleteAllRecords": [
                5
            ],
            "canUpdateAllRecords": [
                5
            ],
            "objectMetadataId": [
                543
            ],
            "restrictedFields": [
                330
            ],
            "rowLevelRecordsPermissions": [
                474
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                408
            ],
            "previousOnboardingStatus": [
                408
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStepSuccess": {
            "success": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "OpenRecordIn": {},
        "PageInfo": {
            "endCursor": [
                165
            ],
            "hasNextPage": [
                5
            ],
            "hasPreviousPage": [
                5
            ],
            "startCursor": [
                165
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                543
            ],
            "createdAt": [
                215
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                543
            ],
            "deletedAt": [
                215
            ],
            "id": [
                543
            ],
            "isFirstTabPinned": [
                5
            ],
            "isSystemSideEffect": [
                5
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                543
            ],
            "tabs": [
                414
            ],
            "type": [
                416
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                543
            ],
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "isOverridden": [
                5
            ],
            "isSystemSideEffect": [
                5
            ],
            "layoutMode": [
                415
            ],
            "pageLayoutId": [
                543
            ],
            "position": [
                7
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
            ],
            "widgets": [
                417
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                312
            ],
            "applicationId": [
                543
            ],
            "applicationName": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                330
            ],
            "configuration": [
                672
            ],
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "gridPosition": [
                309
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "isOverridden": [
                5
            ],
            "isSystemSideEffect": [
                5
            ],
            "objectMetadataId": [
                543
            ],
            "pageLayoutTabId": [
                543
            ],
            "position": [
                420
            ],
            "title": [
                1
            ],
            "type": [
                674
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                415
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "column": [
                11
            ],
            "columnSpan": [
                11
            ],
            "layoutMode": [
                415
            ],
            "row": [
                11
            ],
            "rowSpan": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetCanvasPosition": [
                418
            ],
            "on_PageLayoutWidgetGridPosition": [
                419
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                422
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                421
            ],
            "index": [
                11
            ],
            "layoutMode": [
                415
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
                543
            ],
            "createdAt": [
                215
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                543
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
                543
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                543
            ],
            "aggregateOperation": [
                28
            ],
            "color": [
                1
            ],
            "configurationType": [
                673
            ],
            "dateGranularity": [
                406
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                5
            ],
            "displayLegend": [
                5
            ],
            "filter": [
                330
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "groupByFieldMetadataId": [
                543
            ],
            "groupBySubFieldName": [
                1
            ],
            "hideEmptyCategory": [
                5
            ],
            "manualSortOrder": [
                1
            ],
            "numberFormat": [
                145
            ],
            "orderBy": [
                308
            ],
            "showCenterMetric": [
                5
            ],
            "splitMultiValueFields": [
                5
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
                429
            ],
            "formattedToRawLookup": [
                330
            ],
            "hasTooManyGroups": [
                5
            ],
            "showCenterMetric": [
                5
            ],
            "showDataLabels": [
                5
            ],
            "showLegend": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "PieChartDataInput": {
            "configuration": [
                330
            ],
            "objectMetadataId": [
                543
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
                7
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
                342
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
                215
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                139
            ],
            "blockers": [
                361
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                543
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
                242
            ],
            "host": [
                1
            ],
            "port": [
                7
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
                543
            ],
            "createdAt": [
                215
            ],
            "domain": [
                1
            ],
            "id": [
                543
            ],
            "isValidated": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "PublicFeatureFlag": {
            "key": [
                269
            ],
            "metadata": [
                438
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
                435
            ],
            "IMAP": [
                435
            ],
            "SMTP": [
                435
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                84
            ],
            "authProviders": [
                85
            ],
            "displayName": [
                1
            ],
            "id": [
                543
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                697
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
                543
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
                9
            ],
            "agentChatChannelSummaries": [
                10
            ],
            "agentChatChannelThreadIds": [
                13,
                {
                    "after": [
                        1
                    ],
                    "assignment": [
                        8
                    ],
                    "channelId": [
                        543,
                        "UUID!"
                    ],
                    "filter": [
                        12
                    ],
                    "first": [
                        11
                    ],
                    "status": [
                        14
                    ]
                }
            ],
            "agentChatChannels": [
                6
            ],
            "agentChatOpenThreadsSummary": [
                17
            ],
            "agentRuns": [
                25,
                {
                    "agentId": [
                        543,
                        "UUID!"
                    ],
                    "limit": [
                        11,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                30
            ],
            "aiChatUserCreditsUsage": [
                31
            ],
            "apiKey": [
                40,
                {
                    "input": [
                        296,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                40
            ],
            "appConnection": [
                43,
                {
                    "id": [
                        19,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                43,
                {
                    "filter": [
                        339
                    ]
                }
            ],
            "appKeyValue": [
                44,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        45
                    ]
                }
            ],
            "appMessageChannels": [
                362,
                {
                    "filter": [
                        340
                    ]
                }
            ],
            "appMessageFolders": [
                369,
                {
                    "filter": [
                        341
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                52,
                {
                    "applicationId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                53,
                {
                    "applicationId": [
                        543,
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
                484,
                {
                    "applicationId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                96,
                {
                    "input": [
                        97,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                109
            ],
            "billingPlans": [
                111
            ],
            "billingPortalSession": [
                121,
                {
                    "forPaymentMethodUpdate": [
                        5
                    ],
                    "returnUrlPath": [
                        1
                    ]
                }
            ],
            "callRecordingIdForCalendarEvent": [
                543,
                {
                    "calendarEventId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                22,
                {
                    "agentUniversalIdentifier": [
                        543
                    ],
                    "threadId": [
                        543
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                147,
                {
                    "agentUniversalIdentifier": [
                        543
                    ],
                    "threadId": [
                        543
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "chatThread": [
                18,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                150,
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
                687,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                513,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                158,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                158
            ],
            "currentUser": [
                643
            ],
            "currentUserApplicationAuthorizations": [
                50
            ],
            "currentUserSessions": [
                646
            ],
            "currentWorkspace": [
                679
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
                256
            ],
            "eventLogs": [
                263,
                {
                    "input": [
                        262,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                55,
                {
                    "shouldIncludeDependencies": [
                        5
                    ],
                    "universalIdentifier": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                270,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                272,
                {
                    "filter": [
                        275,
                        "FieldFilter!"
                    ],
                    "paging": [
                        213,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                434,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                75,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                67,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        215
                    ],
                    "periodStart": [
                        215
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                77,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        215
                    ],
                    "periodStart": [
                        215
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                79,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                151,
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
                333,
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
                4
            ],
            "findManyApplicationRegistrations": [
                75
            ],
            "findManyApplications": [
                49
            ],
            "findManyLogicFunctions": [
                343
            ],
            "findManyMarketplaceApps": [
                351,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                436
            ],
            "findMarketplaceAppDetail": [
                352,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneAgent": [
                4,
                {
                    "input": [
                        21,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                49,
                {
                    "id": [
                        543
                    ],
                    "universalIdentifier": [
                        543
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                75,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                343,
                {
                    "input": [
                        347,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                333,
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
                333,
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
                681
            ],
            "findWorkspaceFromInviteHash": [
                679,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                686
            ],
            "frontComponent": [
                290,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                290
            ],
            "getAddressDetails": [
                430,
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
                34
            ],
            "getApiKeyRoles": [
                465
            ],
            "getApprovedAccessDomains": [
                83
            ],
            "getAutoCompleteAddress": [
                90,
                {
                    "address": [
                        1,
                        "String!"
                    ],
                    "country": [
                        1
                    ],
                    "isFieldCity": [
                        5
                    ],
                    "token": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAvailablePackages": [
                330,
                {
                    "input": [
                        347,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                164,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                245
            ],
            "getInviteSuggestions": [
                329
            ],
            "getJobs": [
                333,
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
                        347,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                414,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                414,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                417,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                417,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                413,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        416
                    ]
                }
            ],
            "getPermissionFlags": [
                424
            ],
            "getPublicWorkspaceDataByDomain": [
                440,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                441,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                120
            ],
            "getRole": [
                465,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                465
            ],
            "getSSOIdentityProviders": [
                287
            ],
            "getToolIndex": [
                525
            ],
            "getToolInputSchema": [
                330,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                627,
                {
                    "input": [
                        628
                    ]
                }
            ],
            "getView": [
                655,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                658,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                659,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                659,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                658,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                660,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                661,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                661,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                660,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                664,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                664,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                667,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                667,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                655,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        669,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                684
            ],
            "gettingStartedProgress": [
                299
            ],
            "gettingStartedWorkflowPreviews": [
                304
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
                5,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "lineChartData": [
                335,
                {
                    "input": [
                        336,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                111
            ],
            "mcpServer": [
                357,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                357
            ],
            "messageSuppressions": [
                374,
                {
                    "input": [
                        288,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                379,
                {
                    "input": [
                        382,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                383
            ],
            "mostlyEmptyFieldMetadataIds": [
                543,
                {
                    "objectMetadataId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                74
            ],
            "myCalendarChannels": [
                131,
                {
                    "connectedAccountId": [
                        543
                    ]
                }
            ],
            "myConnectedAccounts": [
                162
            ],
            "myMessageChannels": [
                362,
                {
                    "connectedAccountId": [
                        543
                    ]
                }
            ],
            "myMessageFolders": [
                369,
                {
                    "messageChannelId": [
                        543
                    ]
                }
            ],
            "myUserApplicationVariables": [
                689
            ],
            "navigationMenuItem": [
                389,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                389
            ],
            "object": [
                392,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                402
            ],
            "objects": [
                393,
                {
                    "filter": [
                        396,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        213,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                427,
                {
                    "input": [
                        428,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                139,
                {
                    "input": [
                        431,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                433,
                {
                    "input": [
                        432,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                352,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                351
            ],
            "recordPermissions": [
                447,
                {
                    "targets": [
                        456,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                452,
                {
                    "target": [
                        456,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                457
            ],
            "skill": [
                509,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                509
            ],
            "timelineActivityTypes": [
                521
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                542,
                {
                    "userId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                546
            ],
            "usageLimits": [
                630
            ],
            "usageQuotaDefinitions": [
                634
            ],
            "usageQuotaScopeConsumption": [
                636,
                {
                    "input": [
                        637,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                638
            ],
            "validatePasswordResetToken": [
                649,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                650,
                {
                    "objectMetadataId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                650,
                {
                    "fieldMetadataId": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                671,
                {
                    "id": [
                        543,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                671
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                543
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
                543
            ],
            "progress": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "RecordIdentifier": {
            "id": [
                543
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
                5
            ],
            "canRead": [
                5
            ],
            "canSoftDelete": [
                5
            ],
            "canUpdate": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "RecordPermissionsResult": {
            "objectMetadataId": [
                543
            ],
            "permissions": [
                446
            ],
            "recordId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                543
            ],
            "workspaceMemberId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharePrincipalType": {},
        "RecordShareRowCause": {},
        "RecordSharingDTO": {
            "canManageSharing": [
                5
            ],
            "hasManagedGeneralAccess": [
                5
            ],
            "isPrivate": [
                5
            ],
            "isShareable": [
                5
            ],
            "permissions": [
                446
            ],
            "roles": [
                454
            ],
            "shares": [
                453
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                448
            ],
            "id": [
                19
            ],
            "principalId": [
                543
            ],
            "principalRoleId": [
                543
            ],
            "principalType": [
                450
            ],
            "rowCause": [
                451
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingRoleDTO": {
            "canRead": [
                5
            ],
            "canUpdate": [
                5
            ],
            "id": [
                543
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
                673
            ],
            "isUIEditable": [
                5
            ],
            "recordLimit": [
                11
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
                543
            ],
            "recordId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "isInherent": [
                5
            ],
            "objectMetadataId": [
                543
            ],
            "secondFieldMetadataId": [
                543
            ],
            "thirdFieldMetadataId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                270
            ],
            "sourceObjectMetadata": [
                392
            ],
            "targetFieldMetadata": [
                270
            ],
            "targetObjectMetadata": [
                392
            ],
            "type": [
                459
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
                19
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "RevokeApiKeyInput": {
            "id": [
                543
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
                4
            ],
            "apiKeys": [
                41
            ],
            "applicationId": [
                543
            ],
            "canAccessAllAgentChatChannels": [
                5
            ],
            "canAccessAllTools": [
                5
            ],
            "canBeAssignedToAgents": [
                5
            ],
            "canBeAssignedToApiKeys": [
                5
            ],
            "canBeAssignedToUsers": [
                5
            ],
            "canDestroyAllObjectRecords": [
                5
            ],
            "canReadAllObjectRecords": [
                5
            ],
            "canSoftDeleteAllObjectRecords": [
                5
            ],
            "canUpdateAllObjectRecords": [
                5
            ],
            "canUpdateAllSettings": [
                5
            ],
            "description": [
                1
            ],
            "fieldPermissions": [
                277
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isEditable": [
                5
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                400
            ],
            "permissionFlags": [
                466
            ],
            "rowLevelPermissionPredicateGroups": [
                469
            ],
            "rowLevelPermissionPredicates": [
                468
            ],
            "universalIdentifier": [
                543
            ],
            "workspaceMembers": [
                688
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
                543
            ],
            "roleId": [
                543
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
                473
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                7
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
                330
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
                5
            ],
            "canReadRecords": [
                5
            ],
            "canSoftDeleteRecords": [
                5
            ],
            "canUpdateRecords": [
                5
            ],
            "id": [
                1
            ],
            "logicalOperator": [
                471
            ],
            "objectMetadataId": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                7
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
                5
            ],
            "canReadRecords": [
                5
            ],
            "canSoftDeleteRecords": [
                5
            ],
            "canUpdateRecords": [
                5
            ],
            "id": [
                543
            ],
            "logicalOperator": [
                471
            ],
            "objectMetadataId": [
                543
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                543
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicateInput": {
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "operand": [
                473
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                7
            ],
            "relationFieldMetadataId": [
                543
            ],
            "rowLevelPermissionPredicateGroupId": [
                543
            ],
            "subFieldName": [
                1
            ],
            "value": [
                330
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
                5
            ],
            "canReadRecords": [
                5
            ],
            "canSoftDeleteRecords": [
                5
            ],
            "canUpdateRecords": [
                5
            ],
            "predicateGroups": [
                469
            ],
            "predicates": [
                468
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
                477
            ],
            "messages": [
                477
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                330
            ],
            "runAsWorkspaceMemberId": [
                543
            ],
            "thread": [
                480
            ],
            "waitForCompletion": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                543
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
                476
            ],
            "content": [
                1
            ],
            "role": [
                478
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
                330
            ],
            "runId": [
                543
            ],
            "status": [
                1
            ],
            "success": [
                5
            ],
            "threadId": [
                543
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
                543
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                483
            ],
            "type": [
                310
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                543
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                483
            ],
            "type": [
                310
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
                215
            ],
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "position": [
                7
            ],
            "tsVectorFieldMetadataId": [
                543
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                543
            ],
            "messageChannelId": [
                543
            ],
            "messageThreadId": [
                543
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
                543
            ],
            "messageThreadId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                543
            ],
            "messageId": [
                1
            ],
            "queued": [
                5
            ],
            "recipientParticipantWorkspaceMemberIds": [
                543
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
                489
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
                492
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
                5
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
                543
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
                330
            ],
            "workspaceMemberIds": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                543
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
                686
            ],
            "success": [
                5
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
                215
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                139
            ],
            "campaignId": [
                1
            ],
            "queuedCount": [
                11
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
                7
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
                45
            ],
            "value": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                543
            ],
            "createdAt": [
                215
            ],
            "frontComponentId": [
                543
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "position": [
                7
            ],
            "scope": [
                503
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
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
                543
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
                543
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                483
            ],
            "type": [
                310
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                86
            ],
            "workspace": [
                698
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
                543
            ],
            "content": [
                1
            ],
            "createdAt": [
                215
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "isCustom": [
                5
            ],
            "isSystem": [
                5
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                464
            ],
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                696
            ],
            "thread": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "StopImpersonation": {
            "canRestoreImpersonatorSession": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "SubdomainAvailabilityDTO": {
            "available": [
                5
            ],
            "isValid": [
                5
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
                264,
                {
                    "fieldFilters": [
                        258,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        265,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                444,
                {
                    "input": [
                        197,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                348,
                {
                    "input": [
                        349,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                15,
                {
                    "agentUniversalIdentifier": [
                        543
                    ],
                    "runId": [
                        543
                    ],
                    "threadId": [
                        543
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "onEventSubscription": [
                266,
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
                518
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
                46
            ],
            "messageChannelId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                673
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
                543
            ],
            "createdAt": [
                215
            ],
            "emit": [
                522
            ],
            "frontComponentUniversalIdentifier": [
                543
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "name": [
                1
            ],
            "objectUniversalIdentifier": [
                543
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                543
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                543
            ],
            "on": [
                1
            ],
            "through": [
                523
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                543
            ],
            "relationFieldUniversalIdentifier": [
                543
            ],
            "triggerFieldUniversalIdentifiers": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                673
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
                330
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
                86
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                543
            ],
            "personFilter": [
                330
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
                543
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                215
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
                87
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryStatus": {
            "hasVerifiedTwoFactorAuthenticationMethod": [
                5
            ],
            "isAwaitingRecoveryEnrollment": [
                5
            ],
            "pendingRecoveryCodeExpiresAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                543
            ],
            "gt": [
                543
            ],
            "gte": [
                543
            ],
            "iLike": [
                543
            ],
            "in": [
                543
            ],
            "is": [
                5
            ],
            "isNot": [
                5
            ],
            "like": [
                543
            ],
            "lt": [
                543
            ],
            "lte": [
                543
            ],
            "neq": [
                543
            ],
            "notILike": [
                543
            ],
            "notIn": [
                543
            ],
            "notLike": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                215
            ],
            "description": [
                1
            ],
            "id": [
                543
            ],
            "name": [
                1
            ],
            "updatedAt": [
                215
            ],
            "visibility": [
                547
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
                7
            ],
            "roleIds": [
                543
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
                543
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                330
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
                330
            ],
            "roleId": [
                543
            ],
            "triggers": [
                330
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
                543
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
                543
            ],
            "isSyncEnabled": [
                5
            ],
            "messagingProviderUniversalIdentifier": [
                543
            ],
            "visibility": [
                368
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationInput": {
            "autoUpgrade": [
                5
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
                554
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
                556
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
                5
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
                543
            ],
            "update": [
                558
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                132
            ],
            "excludePrivateEvents": [
                5
            ],
            "isContactAutoCreationEnabled": [
                5
            ],
            "isSyncEnabled": [
                5
            ],
            "visibility": [
                135
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
                543
            ],
            "availabilityType": [
                159
            ],
            "engineComponentKey": [
                249
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isPinned": [
                5
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                543
            ],
            "position": [
                7
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
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                330
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                5
            ],
            "isAuditLogged": [
                5
            ],
            "isLabelSyncedWithName": [
                5
            ],
            "isNullable": [
                5
            ],
            "isSearchable": [
                5
            ],
            "isSystem": [
                5
            ],
            "isUIEditable": [
                5
            ],
            "isUIReadOnly": [
                5
            ],
            "isUnique": [
                5
            ],
            "label": [
                1
            ],
            "morphRelationsUpdatePayload": [
                330
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                543
            ],
            "options": [
                330
            ],
            "settings": [
                330
            ],
            "translations": [
                380
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
                543
            ],
            "update": [
                563
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
                300
            ],
            "isHidden": [
                5
            ],
            "selectedStepActionKey": [
                300
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInput": {
            "id": [
                543
            ],
            "update": [
                567
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                330
            ],
            "databaseEventTriggerSettings": [
                330
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                330
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
                7
            ],
            "toolTriggerSettings": [
                330
            ],
            "workflowActionTriggerSettings": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                543
            ],
            "update": [
                569
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                543
            ],
            "isActive": [
                5
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
                543
            ],
            "update": [
                571
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                363
            ],
            "excludeGroupEmails": [
                5
            ],
            "excludeNonProfessionalEmails": [
                5
            ],
            "isContactAutoCreationEnabled": [
                5
            ],
            "isSyncEnabled": [
                5
            ],
            "messageFolderImportPolicy": [
                370
            ],
            "visibility": [
                368
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                543
            ],
            "update": [
                573
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInputUpdates": {
            "isSynced": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFoldersInput": {
            "ids": [
                543
            ],
            "update": [
                573
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
                543
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
                543
            ],
            "position": [
                7
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
                543
            ],
            "isActive": [
                5
            ],
            "isLabelSyncedWithName": [
                5
            ],
            "isSearchable": [
                5
            ],
            "labelIdentifierFieldMetadataId": [
                543
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
                399
            ],
            "shortcut": [
                1
            ],
            "translations": [
                380
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                543
            ],
            "update": [
                561
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                543
            ],
            "update": [
                575
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                543
            ],
            "update": [
                576
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
                543
            ],
            "type": [
                416
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
                415
            ],
            "position": [
                7
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
                543
            ],
            "layoutMode": [
                415
            ],
            "position": [
                7
            ],
            "title": [
                1
            ],
            "widgets": [
                584
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
                330
            ],
            "configuration": [
                330
            ],
            "isActive": [
                5
            ],
            "objectMetadataId": [
                543
            ],
            "pageLayoutTabId": [
                543
            ],
            "position": [
                330
            ],
            "title": [
                1
            ],
            "type": [
                674
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
                330
            ],
            "configuration": [
                330
            ],
            "id": [
                543
            ],
            "objectMetadataId": [
                543
            ],
            "pageLayoutTabId": [
                543
            ],
            "position": [
                330
            ],
            "title": [
                1
            ],
            "type": [
                674
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWithTabsInput": {
            "isFirstTabPinned": [
                5
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                543
            ],
            "tabs": [
                582
            ],
            "type": [
                416
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                543
            ],
            "update": [
                587
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRolePayload": {
            "canAccessAllAgentChatChannels": [
                5
            ],
            "canAccessAllTools": [
                5
            ],
            "canBeAssignedToAgents": [
                5
            ],
            "canBeAssignedToApiKeys": [
                5
            ],
            "canBeAssignedToUsers": [
                5
            ],
            "canDestroyAllObjectRecords": [
                5
            ],
            "canReadAllObjectRecords": [
                5
            ],
            "canSoftDeleteAllObjectRecords": [
                5
            ],
            "canUpdateAllObjectRecords": [
                5
            ],
            "canUpdateAllSettings": [
                5
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
                543
            ],
            "isActive": [
                5
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
                543
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "translations": [
                380
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
                547
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                543
            ],
            "payload": [
                202
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                543
            ],
            "update": [
                593
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
                543
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                5
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
                543
            ],
            "update": [
                595
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
                5
            ],
            "name": [
                1
            ],
            "position": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                543
            ],
            "update": [
                597
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                28
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "size": [
                7
            ],
            "viewFieldGroupId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                543
            ],
            "logicalOperator": [
                662
            ],
            "parentViewFilterGroupId": [
                543
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "viewId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                543
            ],
            "update": [
                600
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                543
            ],
            "operand": [
                663
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                543
            ],
            "subFieldName": [
                1
            ],
            "value": [
                330
            ],
            "viewFilterGroupId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                543
            ],
            "update": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                543
            ],
            "fieldValue": [
                1
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
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
                543
            ],
            "calendarFieldMetadataId": [
                543
            ],
            "calendarLayout": [
                656
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isCompact": [
                5
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                543
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                543
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                666
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "translations": [
                380
            ],
            "type": [
                669
            ],
            "visibility": [
                670
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                543
            ],
            "update": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                668
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
                543
            ],
            "update": [
                607
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
                543
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
                5
            ],
            "microphone": [
                5
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
                32
            ],
            "aiChatDirectMessageAssistantMode": [
                29
            ],
            "aiChatInboxAssistantMode": [
                29
            ],
            "aiChatModelTier": [
                32
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                330
            ],
            "allowImpersonation": [
                5
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                543
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                7
            ],
            "inviteHash": [
                1
            ],
            "isAutoModelSelectionEnabled": [
                5
            ],
            "isCampaignClickTrackingEnabled": [
                5
            ],
            "isCampaignOpenTrackingEnabled": [
                5
            ],
            "isGoogleAuthBypassEnabled": [
                5
            ],
            "isGoogleAuthEnabled": [
                5
            ],
            "isInternalMessagesImportEnabled": [
                5
            ],
            "isMicrosoftAuthBypassEnabled": [
                5
            ],
            "isMicrosoftAuthEnabled": [
                5
            ],
            "isPasswordAuthBypassEnabled": [
                5
            ],
            "isPasswordAuthEnabled": [
                5
            ],
            "isPublicInviteLinkEnabled": [
                5
            ],
            "isTwoFactorAuthenticationEnforced": [
                5
            ],
            "logo": [
                1
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                7
            ],
            "workspaceDiscoverability": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                330
            ],
            "workspaceMemberId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                278
            ],
            "roleId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                543
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "viewFieldId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                614
            ],
            "id": [
                543
            ],
            "isVisible": [
                5
            ],
            "name": [
                1
            ],
            "position": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                614
            ],
            "groups": [
                615
            ],
            "widgetId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                401
            ],
            "roleId": [
                543
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
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                543
            ],
            "predicateGroups": [
                470
            ],
            "predicates": [
                472
            ],
            "roleId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                469
            ],
            "predicates": [
                468
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                625
            ],
            "viewFields": [
                622
            ],
            "viewFilterGroups": [
                623
            ],
            "viewFilters": [
                624
            ],
            "viewSorts": [
                626
            ],
            "widgetId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                28
            ],
            "fieldMetadataId": [
                543
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "size": [
                7
            ],
            "viewFieldId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                543
            ],
            "logicalOperator": [
                662
            ],
            "parentViewFilterGroupId": [
                543
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "operand": [
                663
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                543
            ],
            "subFieldName": [
                1
            ],
            "value": [
                330
            ],
            "viewFilterGroupId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                543
            ],
            "calendarFieldMetadataId": [
                543
            ],
            "calendarLayout": [
                656
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                543
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                543
            ],
            "openRecordIn": [
                666
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                669
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                668
            ],
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                215
            ],
            "periodStart": [
                215
            ],
            "timeSeries": [
                640
            ],
            "usageByApplication": [
                629
            ],
            "usageByModel": [
                629
            ],
            "usageByOperationType": [
                629
            ],
            "usageByUser": [
                629
            ],
            "userDailyUsage": [
                642
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                632
            ],
            "periodEnd": [
                215
            ],
            "periodStart": [
                215
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
                7
            ],
            "key": [
                1
            ],
            "label": [
                1
            ],
            "userCreditsUsed": [
                7
            ],
            "workspaceCreditsUsed": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimit": {
            "burstValue": [
                101
            ],
            "createdAt": [
                215
            ],
            "id": [
                543
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                101
            ],
            "operationType": [
                632
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                639
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                641
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                641
            ],
            "operationType": [
                632
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                631
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                635
            ],
            "resourceType": [
                639
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                633
            ],
            "hasAllowancePeriod": [
                5
            ],
            "isIntraWorkspaceLimitEntitled": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaOperatorOnlyScope": {
            "operationType": [
                632
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                641
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                101
            ],
            "periodEnd": [
                215
            ],
            "periodStart": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                632
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                639
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                641
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                101
            ],
            "id": [
                543
            ],
            "isEnforced": [
                5
            ],
            "limitValue": [
                101
            ],
            "operationType": [
                632
            ],
            "periodEnd": [
                215
            ],
            "periodStart": [
                215
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                101
            ],
            "resourceType": [
                639
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
                641
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                7
            ],
            "date": [
                1
            ],
            "workspaceCreditsUsed": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UsageUnit": {},
        "UsageUserDaily": {
            "dailyUsage": [
                640
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
                92
            ],
            "canAccessFullAdminPanel": [
                5
            ],
            "canImpersonate": [
                5
            ],
            "createdAt": [
                215
            ],
            "currentUserWorkspace": [
                647
            ],
            "currentWorkspace": [
                679
            ],
            "deletedAt": [
                215
            ],
            "deletedWorkspaceMembers": [
                228
            ],
            "disabled": [
                5
            ],
            "email": [
                1
            ],
            "firstName": [
                1
            ],
            "hasPassword": [
                5
            ],
            "id": [
                543
            ],
            "isEmailVerified": [
                5
            ],
            "isWorkspaceCreator": [
                5
            ],
            "lastName": [
                1
            ],
            "locale": [
                1
            ],
            "onboardingStatus": [
                408
            ],
            "previousOnboardingStatus": [
                408
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                215
            ],
            "userVars": [
                331
            ],
            "userWorkspaces": [
                647
            ],
            "workspaceMember": [
                688
            ],
            "workspaceMembers": [
                688
            ],
            "workspaces": [
                647
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
                5
            ],
            "isRequired": [
                5
            ],
            "isSecret": [
                5
            ],
            "key": [
                1
            ],
            "label": [
                1
            ],
            "options": [
                330
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
                215
            ],
            "expiresAt": [
                215
            ],
            "id": [
                543
            ],
            "ipAddress": [
                1
            ],
            "isCurrent": [
                5
            ],
            "isImpersonating": [
                5
            ],
            "lastActiveAt": [
                215
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "id": [
                543
            ],
            "isImpersonating": [
                5
            ],
            "locale": [
                1
            ],
            "objectRecordsPermissions": [
                407
            ],
            "permissionFlags": [
                425
            ],
            "twoFactorAuthenticationMethodSummary": [
                539
            ],
            "updatedAt": [
                215
            ],
            "user": [
                643
            ],
            "userId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                543
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
                5
            ],
            "id": [
                543
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
                543
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "message": [
                1
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                543
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
                7
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
                86
            ],
            "workspaceUrls": [
                697
            ],
            "__typename": [
                1
            ]
        },
        "VerifyTwoFactorAuthenticationMethod": {
            "success": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "VersionDistributionEntry": {
            "count": [
                11
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
                543
            ],
            "calendarEndFieldMetadataId": [
                543
            ],
            "calendarFieldMetadataId": [
                543
            ],
            "calendarLayout": [
                656
            ],
            "createdAt": [
                215
            ],
            "createdByUserWorkspaceId": [
                543
            ],
            "deletedAt": [
                215
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "isCompact": [
                5
            ],
            "isCustom": [
                5
            ],
            "isSystemSideEffect": [
                5
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                543
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                665
            ],
            "mainGroupByFieldMetadataId": [
                543
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                543
            ],
            "openRecordIn": [
                666
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                669
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
            ],
            "viewFieldGroups": [
                659
            ],
            "viewFields": [
                658
            ],
            "viewFilterGroups": [
                661
            ],
            "viewFilters": [
                660
            ],
            "viewGroups": [
                664
            ],
            "viewSorts": [
                667
            ],
            "visibility": [
                670
            ],
            "workspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                28
            ],
            "applicationId": [
                543
            ],
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "isOverridden": [
                5
            ],
            "isSystemSideEffect": [
                5
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "size": [
                7
            ],
            "universalIdentifier": [
                543
            ],
            "updatedAt": [
                215
            ],
            "viewFieldGroupId": [
                543
            ],
            "viewId": [
                543
            ],
            "workspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "id": [
                543
            ],
            "isActive": [
                5
            ],
            "isOverridden": [
                5
            ],
            "isVisible": [
                5
            ],
            "name": [
                1
            ],
            "position": [
                7
            ],
            "updatedAt": [
                215
            ],
            "viewFields": [
                658
            ],
            "viewId": [
                543
            ],
            "workspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "operand": [
                663
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                543
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                215
            ],
            "value": [
                330
            ],
            "viewFilterGroupId": [
                543
            ],
            "viewId": [
                543
            ],
            "workspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "id": [
                543
            ],
            "logicalOperator": [
                662
            ],
            "parentViewFilterGroupId": [
                543
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "updatedAt": [
                215
            ],
            "viewId": [
                543
            ],
            "workspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "fieldValue": [
                1
            ],
            "id": [
                543
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "updatedAt": [
                215
            ],
            "viewId": [
                543
            ],
            "workspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "direction": [
                668
            ],
            "fieldMetadataId": [
                543
            ],
            "id": [
                543
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                215
            ],
            "viewId": [
                543
            ],
            "workspaceId": [
                543
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
                543
            ],
            "createdAt": [
                215
            ],
            "deletedAt": [
                215
            ],
            "description": [
                1
            ],
            "id": [
                543
            ],
            "operations": [
                1
            ],
            "role": [
                465
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                27
            ],
            "on_BarChartConfiguration": [
                95
            ],
            "on_CalendarConfiguration": [
                136
            ],
            "on_CallRecordingSummaryConfiguration": [
                137
            ],
            "on_CallRecordingTranscriptConfiguration": [
                138
            ],
            "on_ChatConfiguration": [
                146
            ],
            "on_ChatThreadsConfiguration": [
                149
            ],
            "on_EmailThreadConfiguration": [
                244
            ],
            "on_EmailsConfiguration": [
                248
            ],
            "on_FieldConfiguration": [
                271
            ],
            "on_FieldRichTextConfiguration": [
                279
            ],
            "on_FieldsConfiguration": [
                280
            ],
            "on_FilesConfiguration": [
                286
            ],
            "on_FormFieldConfiguration": [
                289
            ],
            "on_FrontComponentConfiguration": [
                291
            ],
            "on_IframeConfiguration": [
                311
            ],
            "on_LineChartConfiguration": [
                334
            ],
            "on_MessageCampaignBodyConfiguration": [
                359
            ],
            "on_MessageCampaignDetailsConfiguration": [
                360
            ],
            "on_NotesConfiguration": [
                391
            ],
            "on_PieChartConfiguration": [
                426
            ],
            "on_RecordTableConfiguration": [
                455
            ],
            "on_StandaloneRichTextConfiguration": [
                510
            ],
            "on_TasksConfiguration": [
                520
            ],
            "on_TimelineConfiguration": [
                524
            ],
            "on_ViewConfiguration": [
                657
            ],
            "on_WorkflowConfiguration": [
                676
            ],
            "on_WorkflowRunConfiguration": [
                677
            ],
            "on_WorkflowVersionConfiguration": [
                678
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
                673
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                680
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                32
            ],
            "aiChatDirectMessageAssistantMode": [
                29
            ],
            "aiChatInboxAssistantMode": [
                29
            ],
            "aiChatModelTier": [
                32
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                330
            ],
            "allowImpersonation": [
                5
            ],
            "allowedEmbeddingOrigins": [
                1
            ],
            "billingCustomer": [
                103
            ],
            "billingEntitlements": [
                105
            ],
            "billingSubscriptions": [
                122
            ],
            "createdAt": [
                215
            ],
            "currentBillingSubscription": [
                122
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                465
            ],
            "deletedAt": [
                215
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                7
            ],
            "featureFlags": [
                268
            ],
            "hasValidEnterpriseValidityToken": [
                5
            ],
            "hasValidSignedEnterpriseKey": [
                5
            ],
            "id": [
                543
            ],
            "iframeMediaPermissions": [
                312
            ],
            "installedApplications": [
                49
            ],
            "inviteHash": [
                1
            ],
            "isAutoModelSelectionEnabled": [
                5
            ],
            "isCampaignClickTrackingEnabled": [
                5
            ],
            "isCampaignOpenTrackingEnabled": [
                5
            ],
            "isCustomDomainEnabled": [
                5
            ],
            "isGoogleAuthBypassEnabled": [
                5
            ],
            "isGoogleAuthEnabled": [
                5
            ],
            "isInternalMessagesImportEnabled": [
                5
            ],
            "isMicrosoftAuthBypassEnabled": [
                5
            ],
            "isMicrosoftAuthEnabled": [
                5
            ],
            "isPasswordAuthBypassEnabled": [
                5
            ],
            "isPasswordAuthEnabled": [
                5
            ],
            "isPublicInviteLinkEnabled": [
                5
            ],
            "isTrialAvailable": [
                5
            ],
            "isTwoFactorAuthenticationEnforced": [
                5
            ],
            "logo": [
                1
            ],
            "logoFileId": [
                543
            ],
            "metadataVersion": [
                7
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                7
            ],
            "updatedAt": [
                215
            ],
            "viewFields": [
                658
            ],
            "viewFilterGroups": [
                661
            ],
            "viewFilters": [
                660
            ],
            "viewGroups": [
                664
            ],
            "viewSorts": [
                667
            ],
            "views": [
                655
            ],
            "workspaceCustomApplication": [
                49
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                685
            ],
            "workspaceMembersCount": [
                7
            ],
            "workspaceUrls": [
                697
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceActivationStatus": {},
        "WorkspaceAiStats": {
            "conversationsCount": [
                11
            ],
            "skillsCount": [
                11
            ],
            "toolsCount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCompanyEnrichmentOutcome": {},
        "WorkspaceCompanyEnrichmentResult": {
            "enrichment": [
                330
            ],
            "isBookCallOnboardingStepPending": [
                5
            ],
            "outcome": [
                682
            ],
            "personEnrichment": [
                330
            ],
            "personOutcome": [
                695
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
                215
            ],
            "id": [
                543
            ],
            "roleId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInviteHashValid": {
            "isValid": [
                5
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
                11
            ],
            "colorScheme": [
                1
            ],
            "dateFormat": [
                690
            ],
            "id": [
                543
            ],
            "locale": [
                1
            ],
            "name": [
                293
            ],
            "numberFormat": [
                691
            ],
            "openRecordIn": [
                411
            ],
            "roles": [
                465
            ],
            "timeFormat": [
                692
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
                543
            ],
            "userWorkspaceId": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                543
            ],
            "variables": [
                644
            ],
            "workspaceMemberId": [
                543
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
                330
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
                543
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
                543
            ],
            "workspaceUrls": [
                697
            ],
            "__typename": [
                1
            ]
        }
    }
}