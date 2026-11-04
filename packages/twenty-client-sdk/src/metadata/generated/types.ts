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
        111,
        117,
        122,
        128,
        131,
        132,
        133,
        134,
        142,
        144,
        158,
        162,
        164,
        166,
        213,
        214,
        241,
        245,
        246,
        248,
        258,
        264,
        268,
        272,
        275,
        282,
        299,
        301,
        307,
        309,
        322,
        329,
        330,
        331,
        343,
        345,
        362,
        363,
        364,
        365,
        366,
        367,
        369,
        370,
        371,
        374,
        375,
        377,
        380,
        385,
        389,
        398,
        405,
        406,
        409,
        413,
        414,
        419,
        423,
        446,
        448,
        449,
        457,
        469,
        471,
        475,
        480,
        500,
        512,
        513,
        515,
        540,
        542,
        544,
        609,
        629,
        636,
        638,
        642,
        653,
        659,
        660,
        662,
        663,
        665,
        666,
        667,
        670,
        671,
        672,
        677,
        679,
        682,
        687,
        688,
        689,
        692,
        693
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
                329
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
                540
            ],
            "createdAt": [
                214
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                540
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
                329
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
                329
            ],
            "roleId": [
                540
            ],
            "triggers": [
                329
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "applicationId": [
                540
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                540
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
                540
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
                540
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
                540
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                329
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
                214
            ],
            "deletedAt": [
                214
            ],
            "id": [
                19
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
                214
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                214
            ],
            "id": [
                540
            ],
            "isSubscribed": [
                5
            ],
            "lastMentionedAt": [
                214
            ],
            "lastReadAt": [
                214
            ],
            "mentionsResolvedAt": [
                214
            ],
            "snoozedUntil": [
                214
            ],
            "threadId": [
                540
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                540
            ],
            "createdAt": [
                214
            ],
            "id": [
                540
            ],
            "parts": [
                23
            ],
            "processedAt": [
                214
            ],
            "reactions": [
                24
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                540
            ],
            "senderWorkspaceMemberId": [
                540
            ],
            "status": [
                1
            ],
            "threadId": [
                540
            ],
            "turnId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                214
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                540
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                540
            ],
            "messageId": [
                540
            ],
            "orderIndex": [
                11
            ],
            "providerExecuted": [
                5
            ],
            "providerMetadata": [
                329
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
                329
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                329
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
                540
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                5
            ],
            "workspaceMemberIds": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                214
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
                214
            ],
            "errorMessage": [
                1
            ],
            "id": [
                540
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
                214
            ],
            "status": [
                26
            ],
            "threadId": [
                540
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
                540
            ],
            "aggregateOperation": [
                28
            ],
            "configurationType": [
                670
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                5
            ],
            "filter": [
                329
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "label": [
                1
            ],
            "numberFormat": [
                144
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                441
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
                214
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
                214
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
                214
            ],
            "expiresAt": [
                214
            ],
            "id": [
                540
            ],
            "name": [
                1
            ],
            "revokedAt": [
                214
            ],
            "role": [
                463
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                214
            ],
            "id": [
                540
            ],
            "name": [
                1
            ],
            "revokedAt": [
                214
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
                162
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
                329
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
                214
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
                540
            ],
            "role": [
                371
            ],
            "workspaceMemberId": [
                540
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
                540
            ],
            "applicationVariables": [
                81
            ],
            "autoUpgrade": [
                5
            ],
            "availablePackages": [
                329
            ],
            "canBeUninstalled": [
                5
            ],
            "commandMenuItems": [
                157
            ],
            "createdAt": [
                214
            ],
            "defaultLogicFunctionRole": [
                463
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                289
            ],
            "grantedIframeMediaPermissions": [
                311
            ],
            "healthCheckLogicFunctionId": [
                540
            ],
            "id": [
                540
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                5
            ],
            "logicFunctions": [
                342
            ],
            "logoFileId": [
                540
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                391
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                540
            ],
            "requestedIframeMediaPermissions": [
                311
            ],
            "runOnUserPreferences": [
                5
            ],
            "settingsCustomTabFrontComponentId": [
                540
            ],
            "settingsMenuItems": [
                499
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                540
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                214
            ],
            "id": [
                540
            ],
            "lastAuthorizedAt": [
                214
            ],
            "lastUsedAt": [
                214
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                540
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                540
            ],
            "archivedAt": [
                214
            ],
            "authFailedAt": [
                214
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                437
            ],
            "connectionProviderId": [
                540
            ],
            "createdAt": [
                214
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                540
            ],
            "isOwnedByCurrentUser": [
                5
            ],
            "lastCredentialsRefreshedAt": [
                214
            ],
            "lastSignedInAt": [
                214
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                162
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                214
            ],
            "userWorkspaceId": [
                540
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
                540
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
                166
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
                329
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
                540
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
                282
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
                282
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
                214
            ],
            "fileFolder": [
                282
            ],
            "fileId": [
                540
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
                214
            ],
            "periodStart": [
                214
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
                214
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
                214
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
                214
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
                214
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
                540
            ],
            "connectionProviders": [
                53
            ],
            "hasUserHealthCheck": [
                5
            ],
            "settingsMenuItems": [
                499
            ],
            "variables": [
                641
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                214
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                540
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
                540
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
                214
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
                211
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
                651
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                540
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
                214
            ],
            "description": [
                1
            ],
            "id": [
                540
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
                329
            ],
            "type": [
                1
            ],
            "updatedAt": [
                214
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
                540
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
                329
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
                214
            ],
            "domain": [
                1
            ],
            "id": [
                540
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                214
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
                540
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
                478
            ],
            "workspaceUrls": [
                694
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
                540
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
                670
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
                329
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
                144
            ],
            "omitNullValues": [
                5
            ],
            "primaryAxisDateGranularity": [
                405
            ],
            "primaryAxisGroupByFieldMetadataId": [
                540
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                307
            ],
            "rangeMax": [
                7
            ],
            "rangeMin": [
                7
            ],
            "secondaryAxisGroupByDateGranularity": [
                405
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                540
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                307
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
                329
            ],
            "formattedToRawLookup": [
                329
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
                329
            ],
            "objectMetadataId": [
                540
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
                126
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
                540
            ],
            "userCreditsFallback": [
                642
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
                121
            ],
            "currentBillingSubscription": [
                121
            ],
            "hasPaymentMethod": [
                5
            ],
            "status": [
                513
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
                118
            ],
            "name": [
                1
            ],
            "prices": [
                112
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
                118
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
                111
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
                111
            ],
            "resourceCreditProducts": [
                107
            ],
            "upgradePlanKeys": [
                111
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
                128
            ],
            "recurringInterval": [
                512
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
                128
            ],
            "recurringInterval": [
                512
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                114
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
                118
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
                118
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
                111
            ],
            "priceUsageBased": [
                128
            ],
            "productKey": [
                117
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                214
            ],
            "periodStart": [
                214
            ],
            "productKey": [
                117
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
                123
            ],
            "cancelAt": [
                214
            ],
            "collectionMethod": [
                122
            ],
            "currentPeriodEnd": [
                214
            ],
            "hasUserCredits": [
                5
            ],
            "id": [
                540
            ],
            "interval": [
                512
            ],
            "metadata": [
                329
            ],
            "phases": [
                124
            ],
            "status": [
                513
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                116
            ],
            "creditAmount": [
                7
            ],
            "hasReachedCurrentPeriodCap": [
                5
            ],
            "id": [
                540
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
                125
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
                121
            ],
            "currentBillingSubscription": [
                121
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
                540
            ],
            "contactAutoCreationPolicy": [
                131
            ],
            "createdAt": [
                214
            ],
            "excludePrivateEvents": [
                5
            ],
            "handle": [
                1
            ],
            "id": [
                540
            ],
            "isContactAutoCreationEnabled": [
                5
            ],
            "isSyncEnabled": [
                5
            ],
            "syncStage": [
                132
            ],
            "syncStageStartedAt": [
                214
            ],
            "syncStatus": [
                133
            ],
            "syncedAt": [
                214
            ],
            "throttleFailureCount": [
                7
            ],
            "updatedAt": [
                214
            ],
            "visibility": [
                134
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
                670
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                670
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                670
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
                142
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
                670
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                329
            ],
            "error": [
                147
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
                670
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
                385
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                387
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
                151
            ],
            "aiModelTiers": [
                153
            ],
            "aiModels": [
                152
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
                141
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
                155
            ],
            "publicFeatureFlags": [
                435
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                497
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                5
            ],
            "support": [
                514
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                214
            ],
            "link": [
                1
            ],
            "startAt": [
                214
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
                540
            ],
            "availabilityObjectMetadataId": [
                540
            ],
            "availabilityType": [
                158
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                540
            ],
            "createdAt": [
                214
            ],
            "engineComponentKey": [
                248
            ],
            "frontComponent": [
                289
            ],
            "frontComponentId": [
                540
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                540
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
                540
            ],
            "pageLayoutId": [
                540
            ],
            "payload": [
                159
            ],
            "position": [
                7
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                540
            ],
            "updatedAt": [
                214
            ],
            "workflowVersionId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                397
            ],
            "on_PathCommandMenuItemPayload": [
                421
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
                280
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                540
            ],
            "archivedAt": [
                214
            ],
            "authFailedAt": [
                214
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                437
            ],
            "connectionProviderId": [
                540
            ],
            "createdAt": [
                214
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                540
            ],
            "lastCredentialsRefreshedAt": [
                214
            ],
            "lastSignedInAt": [
                214
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                162
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                214
            ],
            "userWorkspaceId": [
                540
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
                314
            ],
            "handle": [
                1
            ],
            "id": [
                540
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                241
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
                540
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
                329
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
                329
            ],
            "roleId": [
                540
            ],
            "triggers": [
                329
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                540
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                540
            ],
            "participantHandleFieldUniversalIdentifier": [
                540
            ],
            "visibility": [
                367
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
            "availabilityObjectMetadataId": [
                540
            ],
            "availabilityType": [
                158
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                540
            ],
            "engineComponentKey": [
                248
            ],
            "frontComponentId": [
                540
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
                540
            ],
            "pageLayoutId": [
                540
            ],
            "payload": [
                329
            ],
            "position": [
                7
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                540
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
                361
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
                329
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
                329
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                540
            ],
            "options": [
                329
            ],
            "relationCreationPayload": [
                329
            ],
            "settings": [
                329
            ],
            "type": [
                275
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
                540
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
                540
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
                183
            ],
            "indexType": [
                322
            ],
            "objectMetadataId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                329
            ],
            "databaseEventTriggerSettings": [
                329
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                329
            ],
            "id": [
                540
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                329
            ],
            "source": [
                329
            ],
            "timeoutSeconds": [
                7
            ],
            "toolTriggerSettings": [
                329
            ],
            "universalIdentifier": [
                540
            ],
            "workflowActionTriggerSettings": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                540
            ],
            "id": [
                540
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                540
            ],
            "color": [
                1
            ],
            "folderId": [
                540
            ],
            "icon": [
                1
            ],
            "id": [
                540
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                540
            ],
            "position": [
                7
            ],
            "targetObjectMetadataId": [
                540
            ],
            "targetRecordId": [
                540
            ],
            "type": [
                389
            ],
            "userWorkspaceId": [
                540
            ],
            "viewId": [
                540
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
                329
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
                181
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                189
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
                540
            ],
            "type": [
                414
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                413
            ],
            "pageLayoutId": [
                540
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
                329
            ],
            "objectMetadataId": [
                540
            ],
            "pageLayoutTabId": [
                540
            ],
            "position": [
                329
            ],
            "title": [
                1
            ],
            "type": [
                671
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                540
            ],
            "filter": [
                329
            ],
            "objectMetadataId": [
                540
            ],
            "orderBy": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                540
            ],
            "isInherent": [
                5
            ],
            "objectMetadataId": [
                540
            ],
            "secondFieldMetadataId": [
                540
            ],
            "thirdFieldMetadataId": [
                540
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
                540
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
                544
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
                629
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                636
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                638
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
                540
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                540
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
                540
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
                540
            ],
            "id": [
                540
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
                540
            ],
            "viewId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                540
            ],
            "logicalOperator": [
                659
            ],
            "parentViewFilterGroupId": [
                540
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "viewId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                540
            ],
            "id": [
                540
            ],
            "operand": [
                660
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                540
            ],
            "subFieldName": [
                1
            ],
            "value": [
                329
            ],
            "viewFilterGroupId": [
                540
            ],
            "viewId": [
                540
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
                540
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "viewId": [
                540
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
                540
            ],
            "calendarFieldMetadataId": [
                540
            ],
            "calendarLayout": [
                653
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                540
            ],
            "isCompact": [
                5
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                540
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                662
            ],
            "mainGroupByFieldMetadataId": [
                540
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                540
            ],
            "openRecordIn": [
                663
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                666
            ],
            "visibility": [
                667
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                665
            ],
            "fieldMetadataId": [
                540
            ],
            "id": [
                540
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                540
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
                540
            ],
            "operations": [
                1
            ],
            "roleId": [
                540
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
                629
            ],
            "resource": [
                636
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                164
            ],
            "before": [
                164
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                540
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                540
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
                540
            ],
            "name": [
                292
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                540
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
                540
            ],
            "isCustomDomainEnabled": [
                5
            ],
            "records": [
                234
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
                540
            ],
            "pageLayoutId": [
                540
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
                540
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
                540
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                480
            ],
            "type": [
                309
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                540
            ],
            "status": [
                480
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                165
            ],
            "IMAP": [
                165
            ],
            "SMTP": [
                165
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
                670
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                214
            ],
            "domain": [
                1
            ],
            "id": [
                540
            ],
            "status": [
                245
            ],
            "tenantStatus": [
                246
            ],
            "unsubscribeHostnameStatus": [
                542
            ],
            "updatedAt": [
                214
            ],
            "verificationRecords": [
                648
            ],
            "verifiedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                670
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
                329
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
                329
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
                250
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                329
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
                214
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
                214
            ],
            "currentPeriodEnd": [
                214
            ],
            "expiresAt": [
                214
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
                214
            ],
            "start": [
                214
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
                258
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
                256
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                257
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
                259
            ],
            "first": [
                11
            ],
            "table": [
                264
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                260
            ],
            "records": [
                263
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
                329
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                214
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
                376
            ],
            "objectRecordEventsWithQueryIds": [
                404
            ],
            "queueJobEvents": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                540
            ],
            "payload": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                268
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
                540
            ],
            "createdAt": [
                214
            ],
            "defaultValue": [
                329
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
                540
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
                540
            ],
            "morphRelations": [
                456
            ],
            "name": [
                1
            ],
            "object": [
                391
            ],
            "objectMetadataId": [
                540
            ],
            "options": [
                329
            ],
            "relation": [
                456
            ],
            "settings": [
                329
            ],
            "type": [
                275
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                670
            ],
            "fieldDisplayMode": [
                272
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
                273
            ],
            "pageInfo": [
                410
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                164
            ],
            "node": [
                269
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                274
            ],
            "id": [
                541
            ],
            "isActive": [
                129
            ],
            "isSystem": [
                129
            ],
            "isUIEditable": [
                129
            ],
            "isUIReadOnly": [
                129
            ],
            "objectMetadataId": [
                541
            ],
            "or": [
                274
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
                540
            ],
            "id": [
                540
            ],
            "objectMetadataId": [
                540
            ],
            "roleId": [
                540
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
                540
            ],
            "objectMetadataId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                670
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                670
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
                214
            ],
            "id": [
                540
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
                540
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
                214
            ],
            "fileId": [
                540
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
                214
            ],
            "id": [
                540
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
                670
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                540
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                480
            ],
            "type": [
                309
            ],
            "workspace": [
                691
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
                374
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                670
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
                311
            ],
            "applicationId": [
                540
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                80
            ],
            "applicationVariables": [
                329
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
                214
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                540
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
                540
            ],
            "updatedAt": [
                214
            ],
            "usesSdkClient": [
                5
            ],
            "widgetAvailability": [
                291
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                670
            ],
            "frontComponentId": [
                540
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                540
            ],
            "pageLayoutType": [
                414
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
                474
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                329
            ],
            "runId": [
                540
            ],
            "scope": [
                329
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
                329
            ],
            "runId": [
                540
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
                540
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
                540
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
                540
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
                299
            ],
            "isHidden": [
                5
            ],
            "selectedStepActionKey": [
                299
            ],
            "snoozedUntil": [
                1
            ],
            "steps": [
                300
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                299
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
                301
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
                304
            ],
            "stepActionKey": [
                299
            ],
            "trigger": [
                305
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
                672
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
                540
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
                670
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
                315
            ],
            "IMAP": [
                315
            ],
            "SMTP": [
                315
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
                241
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
                695
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
                540
            ],
            "threadId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                540
            ],
            "createdAt": [
                214
            ],
            "id": [
                540
            ],
            "indexFieldMetadataList": [
                320
            ],
            "indexType": [
                322
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
                214
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                164
            ],
            "node": [
                318
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                214
            ],
            "fieldMetadataId": [
                540
            ],
            "id": [
                540
            ],
            "order": [
                7
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                321
            ],
            "id": [
                541
            ],
            "isCustom": [
                129
            ],
            "or": [
                321
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                540
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
                325
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
                540
            ],
            "messageThreadId": [
                540
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
                331
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                540
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
                670
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
                329
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
                144
            ],
            "omitNullValues": [
                5
            ],
            "primaryAxisDateGranularity": [
                405
            ],
            "primaryAxisGroupByFieldMetadataId": [
                540
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                307
            ],
            "rangeMax": [
                7
            ],
            "rangeMin": [
                7
            ],
            "secondaryAxisGroupByDateGranularity": [
                405
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                540
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                307
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
                329
            ],
            "hasTooManyGroups": [
                5
            ],
            "series": [
                337
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
                329
            ],
            "objectMetadataId": [
                540
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
                336
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
                162
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                540
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
                540
            ],
            "canRunOnDemand": [
                5
            ],
            "createdAt": [
                214
            ],
            "cronTriggerSettings": [
                329
            ],
            "databaseEventTriggerSettings": [
                329
            ],
            "description": [
                1
            ],
            "executionMode": [
                343
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                329
            ],
            "id": [
                540
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
                329
            ],
            "universalIdentifier": [
                540
            ],
            "updatedAt": [
                214
            ],
            "workflowActionTriggerSettings": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                329
            ],
            "duration": [
                7
            ],
            "error": [
                329
            ],
            "logs": [
                1
            ],
            "status": [
                345
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                540
            ],
            "applicationUniversalIdentifier": [
                540
            ],
            "id": [
                540
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                540
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
                329
            ],
            "name": [
                1
            ],
            "objects": [
                352
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "requestedIframeMediaPermissions": [
                311
            ],
            "roles": [
                353
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
                354
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                355
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
                540
            ],
            "connectionProviderId": [
                540
            ],
            "createdAt": [
                214
            ],
            "id": [
                540
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
                357
            ],
            "toolsSyncError": [
                1
            ],
            "toolsSyncedAt": [
                214
            ],
            "updatedAt": [
                214
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
                329
            ],
            "description": [
                1
            ],
            "inputSchema": [
                329
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
                670
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                670
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
                161
            ],
            "connectedAccountId": [
                540
            ],
            "contactAutoCreationPolicy": [
                362
            ],
            "createdAt": [
                214
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
                540
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
                369
            ],
            "messagingProviderUniversalIdentifier": [
                540
            ],
            "participantHandleFieldUniversalIdentifier": [
                540
            ],
            "pendingGroupEmailsAction": [
                363
            ],
            "syncStage": [
                364
            ],
            "syncStageStartedAt": [
                214
            ],
            "syncStatus": [
                365
            ],
            "syncedAt": [
                214
            ],
            "throttleFailureCount": [
                7
            ],
            "throttleRetryAfter": [
                214
            ],
            "type": [
                366
            ],
            "updatedAt": [
                214
            ],
            "visibility": [
                367
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
                214
            ],
            "externalId": [
                1
            ],
            "id": [
                540
            ],
            "isSentFolder": [
                5
            ],
            "isSynced": [
                5
            ],
            "messageChannelId": [
                540
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                370
            ],
            "updatedAt": [
                214
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
                214
            ],
            "emailAddress": [
                1
            ],
            "id": [
                540
            ],
            "reason": [
                374
            ],
            "source": [
                375
            ],
            "unsubscribeTopicId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                372
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
                403
            ],
            "recordId": [
                1
            ],
            "type": [
                377
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
                540
            ],
            "property": [
                1
            ],
            "provenance": [
                380
            ],
            "recordId": [
                540
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
                540
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                156
            ],
            "objectMetadataItems": [
                383
            ],
            "views": [
                384
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
                540
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
                540
            ],
            "key": [
                662
            ],
            "objectMetadataId": [
                540
            ],
            "type": [
                666
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                506,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                676,
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
                        540,
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
                        540,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        312,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                5,
                {
                    "assigneeWorkspaceMemberId": [
                        540
                    ],
                    "threadId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                5,
                {
                    "agentId": [
                        540,
                        "UUID!"
                    ],
                    "roleId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                5,
                {
                    "apiKeyId": [
                        540,
                        "UUID!"
                    ],
                    "roleId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                5,
                {
                    "input": [
                        317,
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
                140,
                {
                    "input": [
                        139,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                127
            ],
            "cancelSwitchBillingPlan": [
                127
            ],
            "cancelSwitchResourceCreditPrice": [
                127
            ],
            "checkCustomDomainValidRecords": [
                235
            ],
            "checkPublicDomainValidRecords": [
                235,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                120,
                {
                    "plan": [
                        111,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        512,
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
                        540,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                160,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        540,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                408,
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
                284,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                284,
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
                284,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                284,
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
                        167,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                40,
                {
                    "input": [
                        169,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                361,
                {
                    "input": [
                        170,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                171,
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
                172,
                {
                    "input": [
                        173,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                83,
                {
                    "input": [
                        174,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                109
            ],
            "createCalendarEvent": [
                176,
                {
                    "input": [
                        175,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                18,
                {
                    "channelId": [
                        540
                    ]
                }
            ],
            "createCommandMenuItem": [
                157,
                {
                    "input": [
                        177,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                233,
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
                179,
                {
                    "input": [
                        178,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                244,
                {
                    "input": [
                        180,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                283,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        282,
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
                289,
                {
                    "input": [
                        182,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                388,
                {
                    "inputs": [
                        188,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                656,
                {
                    "inputs": [
                        203,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                655,
                {
                    "inputs": [
                        204,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                661,
                {
                    "inputs": [
                        207,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                356,
                {
                    "input": [
                        186,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                372,
                {
                    "input": [
                        187,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                388,
                {
                    "input": [
                        188,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                283,
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
                503,
                {
                    "input": [
                        501,
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
                        540,
                        "UUID!"
                    ],
                    "properties": [
                        329
                    ],
                    "recordId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                4,
                {
                    "input": [
                        168,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                269,
                {
                    "input": [
                        190,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                318,
                {
                    "input": [
                        191,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                342,
                {
                    "input": [
                        185,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                391,
                {
                    "input": [
                        192,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                463,
                {
                    "createRoleInput": [
                        198,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                411,
                {
                    "input": [
                        193,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                412,
                {
                    "input": [
                        194,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                415,
                {
                    "input": [
                        195,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                434,
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
                455,
                {
                    "input": [
                        197,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                503,
                {
                    "input": [
                        502,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                506,
                {
                    "input": [
                        199,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                109,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        111,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        512,
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
                543,
                {
                    "input": [
                        200,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                627,
                {
                    "input": [
                        201,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                647,
                {
                    "input": [
                        202,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                652,
                {
                    "input": [
                        208,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                655,
                {
                    "input": [
                        204,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                656,
                {
                    "input": [
                        203,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                657,
                {
                    "input": [
                        206,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                658,
                {
                    "input": [
                        205,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                661,
                {
                    "input": [
                        207,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                664,
                {
                    "input": [
                        209,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                668,
                {
                    "input": [
                        210,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                506,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                5,
                {
                    "channelId": [
                        540,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        540
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
                361,
                {
                    "id": [
                        540,
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
                        215,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                157,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                161,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                676
            ],
            "deleteEmailGroupChannel": [
                361,
                {
                    "id": [
                        540,
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
                289,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                388,
                {
                    "ids": [
                        540,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                356,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                5,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                388,
                {
                    "id": [
                        540,
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
                269,
                {
                    "input": [
                        216,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                318,
                {
                    "input": [
                        217,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                342,
                {
                    "input": [
                        346,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                391,
                {
                    "input": [
                        218,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        540,
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
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                455,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                219,
                {
                    "input": [
                        220,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                506,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                221,
                {
                    "twoFactorAuthenticationMethodId": [
                        540,
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
                        540,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                640
            ],
            "deleteUserFromWorkspace": [
                644,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                647,
                {
                    "id": [
                        540,
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
                655,
                {
                    "input": [
                        223,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                656,
                {
                    "input": [
                        222,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                657,
                {
                    "input": [
                        224,
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
                661,
                {
                    "input": [
                        225,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                5,
                {
                    "input": [
                        226,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                668,
                {
                    "id": [
                        540,
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
                655,
                {
                    "input": [
                        229,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                656,
                {
                    "input": [
                        228,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                657,
                {
                    "input": [
                        230,
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
                661,
                {
                    "input": [
                        231,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                5,
                {
                    "input": [
                        232,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                5,
                {
                    "input": [
                        317,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                161,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                236,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                237,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                238,
                {
                    "input": [
                        239,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                242,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        540
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                104
            ],
            "enqueueJob": [
                251,
                {
                    "input": [
                        249,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                253,
                {
                    "input": [
                        252,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                680
            ],
            "executeOneLogicFunction": [
                344,
                {
                    "input": [
                        266,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                294,
                {
                    "input": [
                        293,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                42,
                {
                    "apiKeyId": [
                        540,
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
                        540,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                86
            ],
            "generateTransientToken": [
                523
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                537,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        540,
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
                538,
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
                296,
                {
                    "input": [
                        297,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                349,
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
                407
            ],
            "grantApplicationCapabilities": [
                51,
                {
                    "input": [
                        306,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                316,
                {
                    "userId": [
                        540,
                        "UUID!"
                    ],
                    "workspaceId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                324,
                {
                    "input": [
                        323,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                326,
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
                326
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
                        540,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                5,
                {
                    "channelId": [
                        540
                    ],
                    "threadId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                302,
                {
                    "stepActionKey": [
                        299,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                5
            ],
            "releaseEnterpriseServerBinding": [
                254
            ],
            "removeAgentChatMessageReaction": [
                24,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                5,
                {
                    "input": [
                        458,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                450,
                {
                    "principal": [
                        447,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        454,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                5,
                {
                    "agentId": [
                        540,
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
                        540,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                5,
                {
                    "input": [
                        459,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                460,
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
                493,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                157,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                412,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                411,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                415,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                518,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                485,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        540,
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
                        461,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                5,
                {
                    "applicationAuthorizationId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                5,
                {
                    "userId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                5,
                {
                    "userSessionId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                465,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                476,
                {
                    "input": [
                        472,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                65,
                {
                    "applicationId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                65,
                {
                    "applicationId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                313,
                {
                    "connectionParameters": [
                        240,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        540
                    ]
                }
            ],
            "sendAppChannelMessage": [
                484,
                {
                    "input": [
                        483,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                485,
                {
                    "browsingContext": [
                        329
                    ],
                    "channelId": [
                        540
                    ],
                    "fileAttachments": [
                        281,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        540,
                        "[UUID!]"
                    ],
                    "messageId": [
                        540,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "shouldAssistantReply": [
                        5
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "threadId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                488,
                {
                    "input": [
                        487,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                492,
                {
                    "input": [
                        491,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                493,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        540
                    ]
                }
            ],
            "sendMessageCampaign": [
                495,
                {
                    "input": [
                        494,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                490,
                {
                    "input": [
                        496,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                44,
                {
                    "input": [
                        498,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                254,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                450,
                {
                    "isPrivate": [
                        5,
                        "Boolean!"
                    ],
                    "target": [
                        454,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                450,
                {
                    "accessLevel": [
                        446,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        447,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        454,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                127,
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
                504,
                {
                    "input": [
                        505
                    ]
                }
            ],
            "signUpInWorkspace": [
                504,
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
                        540
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
                408,
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
                        214,
                        "DateTime!"
                    ],
                    "threadId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                143,
                {
                    "connectedAccountId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                508,
                {
                    "companyContext": [
                        329
                    ],
                    "personContext": [
                        329
                    ]
                }
            ],
            "stopAgentChatStream": [
                5,
                {
                    "threadId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                509
            ],
            "switchBillingPlan": [
                127,
                {
                    "plan": [
                        111
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                127
            ],
            "syncAppMessageFolders": [
                368,
                {
                    "input": [
                        516,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                690,
                {
                    "dryRun": [
                        5
                    ],
                    "inferDeletionFromMissingEntities": [
                        5
                    ],
                    "manifest": [
                        329,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                5
            ],
            "syncMcpServerTools": [
                356,
                {
                    "id": [
                        540,
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
                        329
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
                525,
                {
                    "input": [
                        524,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                529,
                {
                    "input": [
                        526,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                528,
                {
                    "input": [
                        527,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                533,
                {
                    "input": [
                        530,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                532,
                {
                    "input": [
                        531,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                535,
                {
                    "input": [
                        534,
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
                        540,
                        "UUID!"
                    ],
                    "input": [
                        545,
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
                        214
                    ],
                    "threadIds": [
                        540,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                40,
                {
                    "input": [
                        547,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                361,
                {
                    "input": [
                        548,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                49,
                {
                    "id": [
                        540,
                        "UUID!"
                    ],
                    "input": [
                        549,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                75,
                {
                    "input": [
                        550,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                79,
                {
                    "input": [
                        552,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                130,
                {
                    "input": [
                        554,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                157,
                {
                    "input": [
                        556,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                361,
                {
                    "input": [
                        557,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                289,
                {
                    "input": [
                        559,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                298,
                {
                    "input": [
                        561,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                267,
                {
                    "input": [
                        562,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                388,
                {
                    "inputs": [
                        575,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                391,
                {
                    "inputs": [
                        576,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                661,
                {
                    "inputs": [
                        598,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                356,
                {
                    "input": [
                        565,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                361,
                {
                    "input": [
                        567,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                368,
                {
                    "input": [
                        569,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                368,
                {
                    "input": [
                        571,
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
                388,
                {
                    "input": [
                        575,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                4,
                {
                    "input": [
                        546,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                5,
                {
                    "applicationId": [
                        540
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
                269,
                {
                    "input": [
                        574,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                5,
                {
                    "input": [
                        563,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                391,
                {
                    "input": [
                        576,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                463,
                {
                    "updateRoleInput": [
                        583,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                411,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        577,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                412,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        578,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                415,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        580,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                411,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        582,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                327,
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
                506,
                {
                    "input": [
                        585,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                518,
                {
                    "input": [
                        586,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                543,
                {
                    "input": [
                        587,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                627,
                {
                    "input": [
                        588,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                103,
                {
                    "userCreditsFallback": [
                        642,
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
                647,
                {
                    "input": [
                        589,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                652,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        600,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                655,
                {
                    "input": [
                        593,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                656,
                {
                    "input": [
                        591,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                657,
                {
                    "input": [
                        596,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                658,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        595,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                661,
                {
                    "input": [
                        598,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                664,
                {
                    "input": [
                        601,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                668,
                {
                    "input": [
                        603,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                676,
                {
                    "data": [
                        607,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                676,
                {
                    "data": [
                        605,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                676,
                {
                    "data": [
                        606,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                685,
                {
                    "roleId": [
                        540,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                5,
                {
                    "input": [
                        608,
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
                        609,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                280,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        609,
                        "Upload!"
                    ],
                    "fileFolder": [
                        282,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                284,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        609,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                284,
                {
                    "file": [
                        609,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                284,
                {
                    "file": [
                        609,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                284,
                {
                    "file": [
                        609,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                276,
                {
                    "upsertFieldPermissionsInput": [
                        610,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                652,
                {
                    "input": [
                        613,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                399,
                {
                    "upsertObjectPermissionsInput": [
                        614,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                464,
                {
                    "upsertPermissionFlagsInput": [
                        615,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                617,
                {
                    "input": [
                        616,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                652,
                {
                    "input": [
                        618,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                83,
                {
                    "input": [
                        645,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                649,
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
                244,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                650,
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
                540
            ],
            "applicationId": [
                540
            ],
            "color": [
                1
            ],
            "createdAt": [
                214
            ],
            "folderId": [
                540
            ],
            "icon": [
                1
            ],
            "id": [
                540
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                540
            ],
            "position": [
                7
            ],
            "targetObjectMetadataId": [
                540
            ],
            "targetRecordId": [
                540
            ],
            "targetRecordIdentifier": [
                443
            ],
            "type": [
                389
            ],
            "updatedAt": [
                214
            ],
            "userWorkspaceId": [
                540
            ],
            "viewId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                670
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                540
            ],
            "color": [
                1
            ],
            "createdAt": [
                214
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
                394,
                {
                    "filter": [
                        274,
                        "FieldFilter!"
                    ],
                    "paging": [
                        212,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                269
            ],
            "icon": [
                1
            ],
            "id": [
                540
            ],
            "imageIdentifierFieldMetadataId": [
                540
            ],
            "indexMetadataList": [
                318
            ],
            "indexMetadatas": [
                396,
                {
                    "filter": [
                        321,
                        "IndexFilter!"
                    ],
                    "paging": [
                        212,
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
                540
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
                398
            ],
            "searchFieldMetadataList": [
                482
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                393
            ],
            "pageInfo": [
                410
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                164
            ],
            "node": [
                391
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                273
            ],
            "pageInfo": [
                410
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                395
            ],
            "id": [
                541
            ],
            "isActive": [
                129
            ],
            "isRemote": [
                129
            ],
            "isSearchable": [
                129
            ],
            "isSystem": [
                129
            ],
            "isUICreatable": [
                129
            ],
            "isUIEditable": [
                129
            ],
            "isUIReadOnly": [
                129
            ],
            "or": [
                395
            ],
            "universalIdentifier": [
                541
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                319
            ],
            "pageInfo": [
                410
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                540
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
                540
            ],
            "restrictedFields": [
                329
            ],
            "rowLevelPermissionPredicateGroups": [
                467
            ],
            "rowLevelPermissionPredicates": [
                466
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
                540
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
                213
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                403
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
                329
            ],
            "before": [
                329
            ],
            "diff": [
                329
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
                402
            ],
            "queryIds": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                406
            ],
            "previousOnboardingStatus": [
                406
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
                164
            ],
            "hasNextPage": [
                5
            ],
            "hasPreviousPage": [
                5
            ],
            "startCursor": [
                164
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                540
            ],
            "createdAt": [
                214
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                540
            ],
            "deletedAt": [
                214
            ],
            "id": [
                540
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
                540
            ],
            "tabs": [
                412
            ],
            "type": [
                414
            ],
            "universalIdentifier": [
                540
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                540
            ],
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "icon": [
                1
            ],
            "id": [
                540
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
                413
            ],
            "pageLayoutId": [
                540
            ],
            "position": [
                7
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                540
            ],
            "updatedAt": [
                214
            ],
            "widgets": [
                415
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                311
            ],
            "applicationId": [
                540
            ],
            "applicationName": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                329
            ],
            "configuration": [
                669
            ],
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "gridPosition": [
                308
            ],
            "id": [
                540
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
                540
            ],
            "pageLayoutTabId": [
                540
            ],
            "position": [
                418
            ],
            "title": [
                1
            ],
            "type": [
                671
            ],
            "universalIdentifier": [
                540
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                413
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
                413
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
                416
            ],
            "on_PageLayoutWidgetGridPosition": [
                417
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                420
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                419
            ],
            "index": [
                11
            ],
            "layoutMode": [
                413
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
                540
            ],
            "createdAt": [
                214
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                540
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
                540
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                540
            ],
            "aggregateOperation": [
                28
            ],
            "color": [
                1
            ],
            "configurationType": [
                670
            ],
            "dateGranularity": [
                405
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
                329
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "groupByFieldMetadataId": [
                540
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
                144
            ],
            "orderBy": [
                307
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
                427
            ],
            "formattedToRawLookup": [
                329
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
                329
            ],
            "objectMetadataId": [
                540
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
                341
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
                214
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                138
            ],
            "blockers": [
                360
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                540
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
                241
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
                540
            ],
            "createdAt": [
                214
            ],
            "domain": [
                1
            ],
            "id": [
                540
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
                268
            ],
            "metadata": [
                436
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
                433
            ],
            "IMAP": [
                433
            ],
            "SMTP": [
                433
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
                540
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                694
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
                540
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
                        540,
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
                        540,
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
                        295,
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
                        338
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
                361,
                {
                    "filter": [
                        339
                    ]
                }
            ],
            "appMessageFolders": [
                368,
                {
                    "filter": [
                        340
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                52,
                {
                    "applicationId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                53,
                {
                    "applicationId": [
                        540,
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
                481,
                {
                    "applicationId": [
                        540,
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
            "billingPlans": [
                110
            ],
            "billingPortalSession": [
                120,
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
                540,
                {
                    "calendarEventId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                22,
                {
                    "agentUniversalIdentifier": [
                        540
                    ],
                    "threadId": [
                        540
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                146,
                {
                    "agentUniversalIdentifier": [
                        540
                    ],
                    "threadId": [
                        540
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
                        540,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                149,
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
                684,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                510,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                157,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                157
            ],
            "currentUser": [
                640
            ],
            "currentUserApplicationAuthorizations": [
                50
            ],
            "currentUserSessions": [
                643
            ],
            "currentWorkspace": [
                676
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
                255
            ],
            "eventLogs": [
                262,
                {
                    "input": [
                        261,
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
                        540,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                269,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                271,
                {
                    "filter": [
                        274,
                        "FieldFilter!"
                    ],
                    "paging": [
                        212,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                432,
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
                        214
                    ],
                    "periodStart": [
                        214
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
                        214
                    ],
                    "periodStart": [
                        214
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
                150,
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
                332,
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
                342
            ],
            "findManyMarketplaceApps": [
                350,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                434
            ],
            "findMarketplaceAppDetail": [
                351,
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
                        540
                    ],
                    "universalIdentifier": [
                        540
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
                342,
                {
                    "input": [
                        346,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                332,
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
                332,
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
                678
            ],
            "findWorkspaceFromInviteHash": [
                676,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                683
            ],
            "frontComponent": [
                289,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                289
            ],
            "getAddressDetails": [
                428,
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
                463
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
                329,
                {
                    "input": [
                        346,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                163,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                244
            ],
            "getInviteSuggestions": [
                328
            ],
            "getJobs": [
                332,
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
                        346,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                411,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                412,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                412,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                415,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                415,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                411,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        414
                    ]
                }
            ],
            "getPermissionFlags": [
                422
            ],
            "getPublicWorkspaceDataByDomain": [
                438,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                439,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                119
            ],
            "getRole": [
                463,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                463
            ],
            "getSSOIdentityProviders": [
                286
            ],
            "getToolIndex": [
                522
            ],
            "getToolInputSchema": [
                329,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                624,
                {
                    "input": [
                        625
                    ]
                }
            ],
            "getView": [
                652,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                655,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                656,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                656,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                655,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                657,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                658,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                658,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                657,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                661,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                661,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                664,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                664,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                652,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        666,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                681
            ],
            "gettingStartedProgress": [
                298
            ],
            "gettingStartedWorkflowPreviews": [
                303
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
                334,
                {
                    "input": [
                        335,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                110
            ],
            "mcpServer": [
                356,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                356
            ],
            "messageSuppressions": [
                373,
                {
                    "input": [
                        287,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                378,
                {
                    "input": [
                        381,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                382
            ],
            "mostlyEmptyFieldMetadataIds": [
                540,
                {
                    "objectMetadataId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                74
            ],
            "myCalendarChannels": [
                130,
                {
                    "connectedAccountId": [
                        540
                    ]
                }
            ],
            "myConnectedAccounts": [
                161
            ],
            "myMessageChannels": [
                361,
                {
                    "connectedAccountId": [
                        540
                    ]
                }
            ],
            "myMessageFolders": [
                368,
                {
                    "messageChannelId": [
                        540
                    ]
                }
            ],
            "myUserApplicationVariables": [
                686
            ],
            "navigationMenuItem": [
                388,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                388
            ],
            "object": [
                391,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                401
            ],
            "objects": [
                392,
                {
                    "filter": [
                        395,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        212,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                425,
                {
                    "input": [
                        426,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                138,
                {
                    "input": [
                        429,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                431,
                {
                    "input": [
                        430,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                351,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                350
            ],
            "recordPermissions": [
                445,
                {
                    "targets": [
                        454,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                450,
                {
                    "target": [
                        454,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                455
            ],
            "skill": [
                506,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                506
            ],
            "timelineActivityTypes": [
                518
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                539,
                {
                    "userId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                543
            ],
            "usageLimits": [
                627
            ],
            "usageQuotaDefinitions": [
                631
            ],
            "usageQuotaScopeConsumption": [
                633,
                {
                    "input": [
                        634,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                635
            ],
            "validatePasswordResetToken": [
                646,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                647,
                {
                    "objectMetadataId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                647,
                {
                    "fieldMetadataId": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                668,
                {
                    "id": [
                        540,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                540
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
                540
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
                540
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
                540
            ],
            "permissions": [
                444
            ],
            "recordId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                540
            ],
            "workspaceMemberId": [
                540
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
                444
            ],
            "roles": [
                452
            ],
            "shares": [
                451
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                446
            ],
            "id": [
                19
            ],
            "principalId": [
                540
            ],
            "principalRoleId": [
                540
            ],
            "principalType": [
                448
            ],
            "rowCause": [
                449
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
                540
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
                670
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
                540
            ],
            "recordId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                540
            ],
            "id": [
                540
            ],
            "isInherent": [
                5
            ],
            "objectMetadataId": [
                540
            ],
            "secondFieldMetadataId": [
                540
            ],
            "thirdFieldMetadataId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                269
            ],
            "sourceObjectMetadata": [
                391
            ],
            "targetFieldMetadata": [
                269
            ],
            "targetObjectMetadata": [
                391
            ],
            "type": [
                457
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
                540
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
                540
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
                276
            ],
            "icon": [
                1
            ],
            "id": [
                540
            ],
            "isEditable": [
                5
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                399
            ],
            "permissionFlags": [
                464
            ],
            "rowLevelPermissionPredicateGroups": [
                467
            ],
            "rowLevelPermissionPredicates": [
                466
            ],
            "universalIdentifier": [
                540
            ],
            "workspaceMembers": [
                685
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
                540
            ],
            "roleId": [
                540
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
                471
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
                329
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
                469
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
                540
            ],
            "logicalOperator": [
                469
            ],
            "objectMetadataId": [
                540
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                540
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
                540
            ],
            "id": [
                540
            ],
            "operand": [
                471
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                7
            ],
            "relationFieldMetadataId": [
                540
            ],
            "rowLevelPermissionPredicateGroupId": [
                540
            ],
            "subFieldName": [
                1
            ],
            "value": [
                329
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
        "RunAgentInput": {
            "additionalInstructions": [
                1
            ],
            "agentUniversalIdentifier": [
                1
            ],
            "input": [
                474
            ],
            "messages": [
                474
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                329
            ],
            "runAsWorkspaceMemberId": [
                540
            ],
            "thread": [
                477
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
                540
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
                473
            ],
            "content": [
                1
            ],
            "role": [
                475
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
                329
            ],
            "runId": [
                540
            ],
            "status": [
                1
            ],
            "success": [
                5
            ],
            "threadId": [
                540
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
                540
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                480
            ],
            "type": [
                309
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                540
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                480
            ],
            "type": [
                309
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
                214
            ],
            "fieldMetadataId": [
                540
            ],
            "id": [
                540
            ],
            "position": [
                7
            ],
            "tsVectorFieldMetadataId": [
                540
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                540
            ],
            "messageChannelId": [
                540
            ],
            "messageThreadId": [
                540
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
                540
            ],
            "messageThreadId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                540
            ],
            "messageId": [
                1
            ],
            "queued": [
                5
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
                486
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
                489
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
                540
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
                329
            ],
            "workspaceMemberIds": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                540
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
                683
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
                214
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                138
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
                329
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                540
            ],
            "createdAt": [
                214
            ],
            "frontComponentId": [
                540
            ],
            "icon": [
                1
            ],
            "id": [
                540
            ],
            "position": [
                7
            ],
            "scope": [
                500
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                540
            ],
            "updatedAt": [
                214
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
                540
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
                540
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                480
            ],
            "type": [
                309
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
                695
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
                540
            ],
            "content": [
                1
            ],
            "createdAt": [
                214
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                540
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
                214
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                462
            ],
            "configurationType": [
                670
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                693
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
                263,
                {
                    "fieldFilters": [
                        257,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        264,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                442,
                {
                    "input": [
                        196,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                347,
                {
                    "input": [
                        348,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                15,
                {
                    "agentUniversalIdentifier": [
                        540
                    ],
                    "runId": [
                        540
                    ],
                    "threadId": [
                        540
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "onEventSubscription": [
                265,
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
                515
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                670
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
                540
            ],
            "createdAt": [
                214
            ],
            "emit": [
                519
            ],
            "frontComponentUniversalIdentifier": [
                540
            ],
            "icon": [
                1
            ],
            "id": [
                540
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
                540
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                540
            ],
            "universalIdentifier": [
                540
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                540
            ],
            "on": [
                1
            ],
            "through": [
                520
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                540
            ],
            "relationFieldUniversalIdentifier": [
                540
            ],
            "triggerFieldUniversalIdentifiers": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                670
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
                329
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
                540
            ],
            "personFilter": [
                329
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                214
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
                214
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                540
            ],
            "gt": [
                540
            ],
            "gte": [
                540
            ],
            "iLike": [
                540
            ],
            "in": [
                540
            ],
            "is": [
                5
            ],
            "isNot": [
                5
            ],
            "like": [
                540
            ],
            "lt": [
                540
            ],
            "lte": [
                540
            ],
            "neq": [
                540
            ],
            "notILike": [
                540
            ],
            "notIn": [
                540
            ],
            "notLike": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                214
            ],
            "description": [
                1
            ],
            "id": [
                540
            ],
            "name": [
                1
            ],
            "updatedAt": [
                214
            ],
            "visibility": [
                544
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
                540
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
                540
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                329
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
                329
            ],
            "roleId": [
                540
            ],
            "triggers": [
                329
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
                540
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
                540
            ],
            "isSyncEnabled": [
                5
            ],
            "messagingProviderUniversalIdentifier": [
                540
            ],
            "visibility": [
                367
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
                551
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
                553
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
                540
            ],
            "update": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                131
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
                134
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                540
            ],
            "availabilityType": [
                158
            ],
            "engineComponentKey": [
                248
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                540
            ],
            "isPinned": [
                5
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                540
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                329
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
                329
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                540
            ],
            "options": [
                329
            ],
            "settings": [
                329
            ],
            "translations": [
                379
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
                540
            ],
            "update": [
                560
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
                299
            ],
            "isHidden": [
                5
            ],
            "selectedStepActionKey": [
                299
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
                540
            ],
            "update": [
                564
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                329
            ],
            "databaseEventTriggerSettings": [
                329
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                329
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
                329
            ],
            "workflowActionTriggerSettings": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                540
            ],
            "update": [
                566
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                540
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
                540
            ],
            "update": [
                568
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                362
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
                369
            ],
            "visibility": [
                367
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                540
            ],
            "update": [
                570
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
                540
            ],
            "update": [
                570
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
                540
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
                540
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
                540
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
                540
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
                398
            ],
            "shortcut": [
                1
            ],
            "translations": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                540
            ],
            "update": [
                558
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                540
            ],
            "update": [
                572
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                540
            ],
            "update": [
                573
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
                540
            ],
            "type": [
                414
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
                413
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
                540
            ],
            "layoutMode": [
                413
            ],
            "position": [
                7
            ],
            "title": [
                1
            ],
            "widgets": [
                581
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
                329
            ],
            "configuration": [
                329
            ],
            "isActive": [
                5
            ],
            "objectMetadataId": [
                540
            ],
            "pageLayoutTabId": [
                540
            ],
            "position": [
                329
            ],
            "title": [
                1
            ],
            "type": [
                671
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
                329
            ],
            "configuration": [
                329
            ],
            "id": [
                540
            ],
            "objectMetadataId": [
                540
            ],
            "pageLayoutTabId": [
                540
            ],
            "position": [
                329
            ],
            "title": [
                1
            ],
            "type": [
                671
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
                540
            ],
            "tabs": [
                579
            ],
            "type": [
                414
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                540
            ],
            "update": [
                584
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
                540
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
                540
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "translations": [
                379
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
                544
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                540
            ],
            "payload": [
                201
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                540
            ],
            "update": [
                590
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
                540
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
                540
            ],
            "update": [
                592
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
                540
            ],
            "update": [
                594
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                540
            ],
            "logicalOperator": [
                659
            ],
            "parentViewFilterGroupId": [
                540
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "viewId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                540
            ],
            "update": [
                597
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                540
            ],
            "operand": [
                660
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                540
            ],
            "subFieldName": [
                1
            ],
            "value": [
                329
            ],
            "viewFilterGroupId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                540
            ],
            "update": [
                599
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                540
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
                540
            ],
            "calendarFieldMetadataId": [
                540
            ],
            "calendarLayout": [
                653
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                540
            ],
            "isCompact": [
                5
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                540
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                540
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                663
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "translations": [
                379
            ],
            "type": [
                666
            ],
            "visibility": [
                667
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                540
            ],
            "update": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                665
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
                540
            ],
            "update": [
                604
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
                540
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
                329
            ],
            "allowImpersonation": [
                5
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                540
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
                682
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                329
            ],
            "workspaceMemberId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                277
            ],
            "roleId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                540
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "viewFieldId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                611
            ],
            "id": [
                540
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
                611
            ],
            "groups": [
                612
            ],
            "widgetId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                400
            ],
            "roleId": [
                540
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                540
            ],
            "predicateGroups": [
                468
            ],
            "predicates": [
                470
            ],
            "roleId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                467
            ],
            "predicates": [
                466
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                622
            ],
            "viewFields": [
                619
            ],
            "viewFilterGroups": [
                620
            ],
            "viewFilters": [
                621
            ],
            "viewSorts": [
                623
            ],
            "widgetId": [
                540
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
                540
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
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                540
            ],
            "logicalOperator": [
                659
            ],
            "parentViewFilterGroupId": [
                540
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
                540
            ],
            "id": [
                540
            ],
            "operand": [
                660
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                540
            ],
            "subFieldName": [
                1
            ],
            "value": [
                329
            ],
            "viewFilterGroupId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                540
            ],
            "calendarFieldMetadataId": [
                540
            ],
            "calendarLayout": [
                653
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                540
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                540
            ],
            "openRecordIn": [
                663
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                666
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                665
            ],
            "fieldMetadataId": [
                540
            ],
            "id": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                214
            ],
            "periodStart": [
                214
            ],
            "timeSeries": [
                637
            ],
            "usageByApplication": [
                626
            ],
            "usageByModel": [
                626
            ],
            "usageByOperationType": [
                626
            ],
            "usageByUser": [
                626
            ],
            "userDailyUsage": [
                639
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                629
            ],
            "periodEnd": [
                214
            ],
            "periodStart": [
                214
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
                214
            ],
            "id": [
                540
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                101
            ],
            "operationType": [
                629
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                636
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                638
            ],
            "updatedAt": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                638
            ],
            "operationType": [
                629
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                628
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                632
            ],
            "resourceType": [
                636
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                630
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
                629
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                638
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
                214
            ],
            "periodStart": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                629
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                636
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                638
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
                540
            ],
            "isEnforced": [
                5
            ],
            "limitValue": [
                101
            ],
            "operationType": [
                629
            ],
            "periodEnd": [
                214
            ],
            "periodStart": [
                214
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                101
            ],
            "resourceType": [
                636
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
                638
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
                637
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
                214
            ],
            "currentUserWorkspace": [
                644
            ],
            "currentWorkspace": [
                676
            ],
            "deletedAt": [
                214
            ],
            "deletedWorkspaceMembers": [
                227
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
                540
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
                406
            ],
            "previousOnboardingStatus": [
                406
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                214
            ],
            "userVars": [
                330
            ],
            "userWorkspaces": [
                644
            ],
            "workspaceMember": [
                685
            ],
            "workspaceMembers": [
                685
            ],
            "workspaces": [
                644
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
                329
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
                214
            ],
            "expiresAt": [
                214
            ],
            "id": [
                540
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
                214
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "id": [
                540
            ],
            "isImpersonating": [
                5
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                399
            ],
            "objectsPermissions": [
                399
            ],
            "permissionFlags": [
                423
            ],
            "twoFactorAuthenticationMethodSummary": [
                536
            ],
            "updatedAt": [
                214
            ],
            "user": [
                640
            ],
            "userId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                540
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
                540
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
                540
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                540
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
                540
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
                694
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
                540
            ],
            "calendarEndFieldMetadataId": [
                540
            ],
            "calendarFieldMetadataId": [
                540
            ],
            "calendarLayout": [
                653
            ],
            "createdAt": [
                214
            ],
            "createdByUserWorkspaceId": [
                540
            ],
            "deletedAt": [
                214
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                540
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
                540
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                662
            ],
            "mainGroupByFieldMetadataId": [
                540
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                540
            ],
            "openRecordIn": [
                663
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                666
            ],
            "universalIdentifier": [
                540
            ],
            "updatedAt": [
                214
            ],
            "viewFieldGroups": [
                656
            ],
            "viewFields": [
                655
            ],
            "viewFilterGroups": [
                658
            ],
            "viewFilters": [
                657
            ],
            "viewGroups": [
                661
            ],
            "viewSorts": [
                664
            ],
            "visibility": [
                667
            ],
            "workspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                670
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
                540
            ],
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "fieldMetadataId": [
                540
            ],
            "id": [
                540
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
                540
            ],
            "updatedAt": [
                214
            ],
            "viewFieldGroupId": [
                540
            ],
            "viewId": [
                540
            ],
            "workspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "id": [
                540
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
                214
            ],
            "viewFields": [
                655
            ],
            "viewId": [
                540
            ],
            "workspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "fieldMetadataId": [
                540
            ],
            "id": [
                540
            ],
            "operand": [
                660
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                540
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                214
            ],
            "value": [
                329
            ],
            "viewFilterGroupId": [
                540
            ],
            "viewId": [
                540
            ],
            "workspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "id": [
                540
            ],
            "logicalOperator": [
                659
            ],
            "parentViewFilterGroupId": [
                540
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "updatedAt": [
                214
            ],
            "viewId": [
                540
            ],
            "workspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "fieldValue": [
                1
            ],
            "id": [
                540
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "updatedAt": [
                214
            ],
            "viewId": [
                540
            ],
            "workspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "direction": [
                665
            ],
            "fieldMetadataId": [
                540
            ],
            "id": [
                540
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                214
            ],
            "viewId": [
                540
            ],
            "workspaceId": [
                540
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
                540
            ],
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "description": [
                1
            ],
            "id": [
                540
            ],
            "operations": [
                1
            ],
            "role": [
                463
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                214
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
                135
            ],
            "on_CallRecordingSummaryConfiguration": [
                136
            ],
            "on_CallRecordingTranscriptConfiguration": [
                137
            ],
            "on_ChatConfiguration": [
                145
            ],
            "on_ChatThreadsConfiguration": [
                148
            ],
            "on_EmailThreadConfiguration": [
                243
            ],
            "on_EmailsConfiguration": [
                247
            ],
            "on_FieldConfiguration": [
                270
            ],
            "on_FieldRichTextConfiguration": [
                278
            ],
            "on_FieldsConfiguration": [
                279
            ],
            "on_FilesConfiguration": [
                285
            ],
            "on_FormFieldConfiguration": [
                288
            ],
            "on_FrontComponentConfiguration": [
                290
            ],
            "on_IframeConfiguration": [
                310
            ],
            "on_LineChartConfiguration": [
                333
            ],
            "on_MessageCampaignBodyConfiguration": [
                358
            ],
            "on_MessageCampaignDetailsConfiguration": [
                359
            ],
            "on_NotesConfiguration": [
                390
            ],
            "on_PieChartConfiguration": [
                424
            ],
            "on_RecordTableConfiguration": [
                453
            ],
            "on_StandaloneRichTextConfiguration": [
                507
            ],
            "on_TasksConfiguration": [
                517
            ],
            "on_TimelineConfiguration": [
                521
            ],
            "on_ViewConfiguration": [
                654
            ],
            "on_WorkflowConfiguration": [
                673
            ],
            "on_WorkflowRunConfiguration": [
                674
            ],
            "on_WorkflowVersionConfiguration": [
                675
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
                670
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                670
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                670
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                677
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
                329
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
                121
            ],
            "createdAt": [
                214
            ],
            "currentBillingSubscription": [
                121
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                463
            ],
            "deletedAt": [
                214
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
                267
            ],
            "hasValidEnterpriseValidityToken": [
                5
            ],
            "hasValidSignedEnterpriseKey": [
                5
            ],
            "id": [
                540
            ],
            "iframeMediaPermissions": [
                311
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
                540
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
                214
            ],
            "viewFields": [
                655
            ],
            "viewFilterGroups": [
                658
            ],
            "viewFilters": [
                657
            ],
            "viewGroups": [
                661
            ],
            "viewSorts": [
                664
            ],
            "views": [
                652
            ],
            "workspaceCustomApplication": [
                49
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                682
            ],
            "workspaceMembersCount": [
                7
            ],
            "workspaceUrls": [
                694
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
                329
            ],
            "isBookCallOnboardingStepPending": [
                5
            ],
            "outcome": [
                679
            ],
            "personEnrichment": [
                329
            ],
            "personOutcome": [
                692
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
                214
            ],
            "id": [
                540
            ],
            "roleId": [
                540
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
                687
            ],
            "id": [
                540
            ],
            "locale": [
                1
            ],
            "name": [
                292
            ],
            "numberFormat": [
                688
            ],
            "openRecordIn": [
                409
            ],
            "roles": [
                463
            ],
            "timeFormat": [
                689
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
                540
            ],
            "userWorkspaceId": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                540
            ],
            "variables": [
                641
            ],
            "workspaceMemberId": [
                540
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
                329
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
                540
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
                540
            ],
            "workspaceUrls": [
                694
            ],
            "__typename": [
                1
            ]
        }
    }
}