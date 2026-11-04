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
        31,
        35,
        37,
        44,
        57,
        65,
        75,
        81,
        93,
        97,
        98,
        100,
        105,
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
        407,
        410,
        414,
        415,
        420,
        424,
        447,
        449,
        450,
        458,
        470,
        472,
        477,
        482,
        502,
        514,
        515,
        517,
        542,
        544,
        546,
        611,
        631,
        638,
        640,
        644,
        655,
        661,
        662,
        664,
        665,
        667,
        668,
        669,
        672,
        673,
        674,
        679,
        681,
        684,
        689,
        690,
        691,
        694,
        695
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
        "Agent": {
            "applicationId": [
                542
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
                542
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
                542
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
                542
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                542
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
                542
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
                542
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
                542
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
                542
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
                214
            ],
            "deletedAt": [
                214
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
                542
            ],
            "isSubscribed": [
                4
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
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                542
            ],
            "createdAt": [
                214
            ],
            "id": [
                542
            ],
            "parts": [
                22
            ],
            "processedAt": [
                214
            ],
            "reactions": [
                23
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                542
            ],
            "senderWorkspaceMemberId": [
                542
            ],
            "status": [
                1
            ],
            "threadId": [
                542
            ],
            "turnId": [
                542
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
                542
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                542
            ],
            "messageId": [
                542
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
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
                542
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                542
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
                6
            ],
            "endedAt": [
                214
            ],
            "errorMessage": [
                1
            ],
            "id": [
                542
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
                214
            ],
            "status": [
                25
            ],
            "threadId": [
                542
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
                542
            ],
            "aggregateOperation": [
                27
            ],
            "configurationType": [
                672
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                329
            ],
            "firstDayOfTheWeek": [
                10
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
                442
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
                100
            ],
            "kind": [
                1
            ],
            "limitValue": [
                100
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
                100
            ],
            "limitValue": [
                100
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
                34
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
                214
            ],
            "expiresAt": [
                214
            ],
            "id": [
                542
            ],
            "name": [
                1
            ],
            "revokedAt": [
                214
            ],
            "role": [
                464
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
                542
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
                44
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
            "externalId": [
                1
            ],
            "folderExternalIds": [
                1
            ],
            "participants": [
                47
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
                542
            ],
            "role": [
                371
            ],
            "workspaceMemberId": [
                542
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
                77
            ],
            "applicationRegistrationId": [
                542
            ],
            "applicationVariables": [
                80
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                329
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                157
            ],
            "createdAt": [
                214
            ],
            "defaultLogicFunctionRole": [
                464
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
                542
            ],
            "id": [
                542
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                342
            ],
            "logoFileId": [
                542
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
                542
            ],
            "requestedIframeMediaPermissions": [
                311
            ],
            "runOnUserPreferences": [
                4
            ],
            "settingsCustomTabFrontComponentId": [
                542
            ],
            "settingsMenuItems": [
                501
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                542
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
                542
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
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                542
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
                438
            ],
            "connectionProviderId": [
                542
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
                542
            ],
            "isOwnedByCurrentUser": [
                4
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
                542
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
                542
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                53
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
                55
            ],
            "coverage": [
                56
            ],
            "files": [
                58
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
                75
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
                57
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
                542
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
                214
            ],
            "fileFolder": [
                282
            ],
            "fileId": [
                542
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
                63
            ],
            "description": [
                1
            ],
            "status": [
                65
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
                67
            ],
            "bucketSizeInSeconds": [
                10
            ],
            "creditUsage": [
                68
            ],
            "creditsUsed": [
                6
            ],
            "failedRunCount": [
                10
            ],
            "functions": [
                69
            ],
            "issues": [
                70
            ],
            "lifecycle": [
                71
            ],
            "lifecycleFailureCount": [
                10
            ],
            "lookbackInHours": [
                10
            ],
            "periodEnd": [
                214
            ],
            "periodStart": [
                214
            ],
            "rateLimitEventCount": [
                10
            ],
            "runCount": [
                10
            ],
            "versions": [
                72
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
                214
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
                542
            ],
            "connectionProviders": [
                52
            ],
            "hasUserHealthCheck": [
                4
            ],
            "settingsMenuItems": [
                501
            ],
            "variables": [
                643
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
                542
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
                542
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                75
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
                10
            ],
            "autoUpdateEnabled": [
                10
            ],
            "creditsUsedBreakdown": [
                211
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
                653
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                542
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                75
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
                542
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
                85
            ],
            "applicationRefreshToken": [
                85
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
                542
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
                329
            ],
            "scope": [
                81
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
                542
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
                481
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
                85
            ],
            "refreshToken": [
                85
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                86
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
                542
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
                480
            ],
            "workspaceUrls": [
                696
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                90
            ],
            "availableWorkspacesForSignUp": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                91
            ],
            "tokens": [
                86
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                542
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                93
            ],
            "color": [
                1
            ],
            "configurationType": [
                672
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
                329
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupMode": [
                97
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                98
            ],
            "numberFormat": [
                144
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                405
            ],
            "primaryAxisGroupByFieldMetadataId": [
                542
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
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                405
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                542
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
                329
            ],
            "formattedToRawLookup": [
                329
            ],
            "groupMode": [
                97
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
                98
            ],
            "series": [
                99
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
                329
            ],
            "objectMetadataId": [
                542
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
                126
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
                542
            ],
            "userCreditsFallback": [
                644
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
                4
            ],
            "status": [
                515
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                105
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
                106
            ],
            "downgradePlanKeys": [
                111
            ],
            "isCheckoutDefault": [
                4
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                107
            ],
            "planKey": [
                111
            ],
            "resourceCreditProducts": [
                106
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
                6
            ],
            "isSellable": [
                4
            ],
            "priceUsageType": [
                128
            ],
            "recurringInterval": [
                514
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
                128
            ],
            "recurringInterval": [
                514
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
                106
            ],
            "on_BillingMeteredProduct": [
                107
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
                4
            ],
            "id": [
                542
            ],
            "interval": [
                514
            ],
            "metadata": [
                329
            ],
            "phases": [
                124
            ],
            "status": [
                515
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
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                542
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
                125
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
                542
            ],
            "contactAutoCreationPolicy": [
                131
            ],
            "createdAt": [
                214
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                542
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
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
                6
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
                672
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                672
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                672
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "ChartNumberFormat": {},
        "ChatConfiguration": {
            "configurationType": [
                672
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
                672
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
                31
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
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
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                38
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                84
            ],
            "billing": [
                101
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
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
                155
            ],
            "publicFeatureFlags": [
                436
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                499
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                516
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
                35
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
                542
            ],
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                542
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
                542
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
                542
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                542
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
                542
            ],
            "pageLayoutId": [
                542
            ],
            "payload": [
                159
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                542
            ],
            "updatedAt": [
                214
            ],
            "workflowVersionId": [
                542
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
                422
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                59
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
                542
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
                438
            ],
            "connectionProviderId": [
                542
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
                542
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
                542
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
                542
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                542
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
                542
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
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                542
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                542
            ],
            "participantHandleFieldUniversalIdentifier": [
                542
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
                60
            ],
            "targets": [
                62
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                74
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
                542
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
                542
            ],
            "engineComponentKey": [
                248
            ],
            "frontComponentId": [
                542
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
                542
            ],
            "pageLayoutId": [
                542
            ],
            "payload": [
                329
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                542
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
                329
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                542
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
                542
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
                542
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
                542
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
                542
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
                6
            ],
            "toolTriggerSettings": [
                329
            ],
            "universalIdentifier": [
                542
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
                542
            ],
            "id": [
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                542
            ],
            "color": [
                1
            ],
            "folderId": [
                542
            ],
            "icon": [
                1
            ],
            "id": [
                542
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
                542
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                542
            ],
            "targetRecordId": [
                542
            ],
            "type": [
                389
            ],
            "userWorkspaceId": [
                542
            ],
            "viewId": [
                542
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
                329
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
                542
            ],
            "type": [
                415
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                414
            ],
            "pageLayoutId": [
                542
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
                329
            ],
            "objectMetadataId": [
                542
            ],
            "pageLayoutTabId": [
                542
            ],
            "position": [
                329
            ],
            "title": [
                1
            ],
            "type": [
                673
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                542
            ],
            "filter": [
                329
            ],
            "objectMetadataId": [
                542
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
                542
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                542
            ],
            "secondFieldMetadataId": [
                542
            ],
            "thirdFieldMetadataId": [
                542
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
                542
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
                546
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                100
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                100
            ],
            "operationType": [
                631
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                638
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                640
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
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                542
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
                542
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
                542
            ],
            "id": [
                542
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
                542
            ],
            "viewId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                542
            ],
            "logicalOperator": [
                661
            ],
            "parentViewFilterGroupId": [
                542
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                542
            ],
            "id": [
                542
            ],
            "operand": [
                662
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                542
            ],
            "subFieldName": [
                1
            ],
            "value": [
                329
            ],
            "viewFilterGroupId": [
                542
            ],
            "viewId": [
                542
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
                542
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                542
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
                542
            ],
            "calendarFieldMetadataId": [
                542
            ],
            "calendarLayout": [
                655
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                542
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                542
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                664
            ],
            "mainGroupByFieldMetadataId": [
                542
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                542
            ],
            "openRecordIn": [
                665
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                668
            ],
            "visibility": [
                669
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                667
            ],
            "fieldMetadataId": [
                542
            ],
            "id": [
                542
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                542
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
                542
            ],
            "operations": [
                1
            ],
            "roleId": [
                542
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
                631
            ],
            "resource": [
                638
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                542
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
                542
            ],
            "name": [
                292
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                542
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
                542
            ],
            "isCustomDomainEnabled": [
                4
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
                542
            ],
            "pageLayoutId": [
                542
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
                542
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
                542
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                482
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
                542
            ],
            "status": [
                482
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                672
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
                542
            ],
            "status": [
                245
            ],
            "tenantStatus": [
                246
            ],
            "unsubscribeHostnameStatus": [
                544
            ],
            "updatedAt": [
                214
            ],
            "verificationRecords": [
                650
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
                672
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
                329
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
                329
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
                250
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                329
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
                214
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
                214
            ],
            "currentPeriodEnd": [
                214
            ],
            "expiresAt": [
                214
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
                259
            ],
            "first": [
                10
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
                542
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagKey": {},
        "Field": {
            "applicationId": [
                542
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
                542
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
                542
            ],
            "morphRelations": [
                457
            ],
            "name": [
                1
            ],
            "object": [
                391
            ],
            "objectMetadataId": [
                542
            ],
            "options": [
                329
            ],
            "relation": [
                457
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
                672
            ],
            "fieldDisplayMode": [
                272
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
                273
            ],
            "pageInfo": [
                411
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
                543
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
                543
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
                4
            ],
            "canUpdateFieldValue": [
                4
            ],
            "fieldMetadataId": [
                542
            ],
            "id": [
                542
            ],
            "objectMetadataId": [
                542
            ],
            "roleId": [
                542
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
                542
            ],
            "objectMetadataId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                672
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                672
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
                214
            ],
            "id": [
                542
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
                542
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
                542
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
                542
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
                672
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                542
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                482
            ],
            "type": [
                309
            ],
            "workspace": [
                693
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
                374
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                672
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
                542
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                79
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
                542
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
                542
            ],
            "updatedAt": [
                214
            ],
            "usesSdkClient": [
                4
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
                672
            ],
            "frontComponentId": [
                542
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                542
            ],
            "pageLayoutType": [
                415
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
                476
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
                542
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
                542
            ],
            "success": [
                4
            ],
            "text": [
                1
            ],
            "usage": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "GetApiKeyInput": {
            "id": [
                542
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
                542
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
                542
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
                4
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
                674
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
                542
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
                672
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
                85
            ],
            "workspace": [
                697
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
                542
            ],
            "threadId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                542
            ],
            "createdAt": [
                214
            ],
            "id": [
                542
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
                542
            ],
            "id": [
                542
            ],
            "order": [
                6
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
                543
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
                542
            ],
            "messages": [
                46
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
                542
            ],
            "messageThreadId": [
                542
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
                331
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                542
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                93
            ],
            "color": [
                1
            ],
            "configurationType": [
                672
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
                329
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
                144
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                405
            ],
            "primaryAxisGroupByFieldMetadataId": [
                542
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
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                405
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                542
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
                329
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                337
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
                329
            ],
            "objectMetadataId": [
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                542
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
                542
            ],
            "canRunOnDemand": [
                4
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
                542
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
                329
            ],
            "universalIdentifier": [
                542
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
                6
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                542
            ],
            "applicationUniversalIdentifier": [
                542
            ],
            "id": [
                542
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                85
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
                75
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
                542
            ],
            "connectionProviderId": [
                542
            ],
            "createdAt": [
                214
            ],
            "id": [
                542
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
                672
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                672
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
                542
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
                4
            ],
            "excludeNonProfessionalEmails": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                542
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
                369
            ],
            "messagingProviderUniversalIdentifier": [
                542
            ],
            "participantHandleFieldUniversalIdentifier": [
                542
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
                6
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
                542
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                542
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
                542
            ],
            "reason": [
                374
            ],
            "source": [
                375
            ],
            "unsubscribeTopicId": [
                542
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
                542
            ],
            "property": [
                1
            ],
            "provenance": [
                380
            ],
            "recordId": [
                542
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
                542
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                542
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
                542
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
                542
            ],
            "key": [
                664
            ],
            "objectMetadataId": [
                542
            ],
            "type": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                508,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                678,
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
                        542,
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
                48,
                {
                    "applicationId": [
                        542,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        312,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        542
                    ],
                    "threadId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        542,
                        "UUID!"
                    ],
                    "roleId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        542,
                        "UUID!"
                    ],
                    "roleId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        317,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                88,
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
                        514,
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
                74,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                74,
                {
                    "fileId": [
                        542,
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
                        542,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                409,
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
            "createAgentChatChannel": [
                5,
                {
                    "input": [
                        167,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                39,
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
                        61,
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
                82,
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
                17,
                {
                    "channelId": [
                        542
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
                        6,
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
                658,
                {
                    "inputs": [
                        203,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                657,
                {
                    "inputs": [
                        204,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                663,
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
                505,
                {
                    "input": [
                        503,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                36,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        542,
                        "UUID!"
                    ],
                    "properties": [
                        329
                    ],
                    "recordId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
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
                464,
                {
                    "createRoleInput": [
                        198,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                412,
                {
                    "input": [
                        193,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                413,
                {
                    "input": [
                        194,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                416,
                {
                    "input": [
                        195,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                435,
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
                456,
                {
                    "input": [
                        197,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                505,
                {
                    "input": [
                        504,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                508,
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
                        514,
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
                545,
                {
                    "input": [
                        200,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                629,
                {
                    "input": [
                        201,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                649,
                {
                    "input": [
                        202,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                654,
                {
                    "input": [
                        208,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                657,
                {
                    "input": [
                        204,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                658,
                {
                    "input": [
                        203,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                659,
                {
                    "input": [
                        206,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                660,
                {
                    "input": [
                        205,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                663,
                {
                    "input": [
                        207,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                666,
                {
                    "input": [
                        209,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                670,
                {
                    "input": [
                        210,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                508,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        542,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        542
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
                        44
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                361,
                {
                    "id": [
                        542,
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
                        215,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                157,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                161,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                678
            ],
            "deleteEmailGroupChannel": [
                361,
                {
                    "id": [
                        542,
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
                289,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                388,
                {
                    "ids": [
                        542,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                356,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                388,
                {
                    "id": [
                        542,
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
                        542,
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
                        542,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                456,
                {
                    "id": [
                        542,
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
                508,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                221,
                {
                    "twoFactorAuthenticationMethodId": [
                        542,
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
                        542,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                642
            ],
            "deleteUserFromWorkspace": [
                646,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                649,
                {
                    "id": [
                        542,
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
                657,
                {
                    "input": [
                        223,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                658,
                {
                    "input": [
                        222,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                659,
                {
                    "input": [
                        224,
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
                663,
                {
                    "input": [
                        225,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        226,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                670,
                {
                    "id": [
                        542,
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
                657,
                {
                    "input": [
                        229,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                658,
                {
                    "input": [
                        228,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                659,
                {
                    "input": [
                        230,
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
                663,
                {
                    "input": [
                        231,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        232,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
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
                        542,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                236,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                237,
                {
                    "id": [
                        542,
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
                        542
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                103
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
                682
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
                41,
                {
                    "apiKeyId": [
                        542,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                79,
                {
                    "applicationId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                85
            ],
            "generateTransientToken": [
                525
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                539,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                87,
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
                87,
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
                87,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                540,
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
                408
            ],
            "grantApplicationCapabilities": [
                50,
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
                        542,
                        "UUID!"
                    ],
                    "workspaceId": [
                        542,
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
                48,
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
                        542,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        542
                    ],
                    "threadId": [
                        542,
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
                4
            ],
            "releaseEnterpriseServerBinding": [
                254
            ],
            "removeAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        459,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                451,
                {
                    "principal": [
                        448,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        455,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                79,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                87,
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
                        542,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        460,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                461,
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
                495,
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
                        542,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                412,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                416,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                520,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                487,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                10
            ],
            "revokeApiKey": [
                39,
                {
                    "input": [
                        462,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                466,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                478,
                {
                    "input": [
                        474,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                64,
                {
                    "applicationId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                64,
                {
                    "applicationId": [
                        542,
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
                        542
                    ]
                }
            ],
            "sendAppChannelMessage": [
                486,
                {
                    "input": [
                        485,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                487,
                {
                    "browsingContext": [
                        329
                    ],
                    "channelId": [
                        542
                    ],
                    "fileAttachments": [
                        281,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        4
                    ],
                    "isAssistantParticipant": [
                        4
                    ],
                    "mentionedWorkspaceMemberIds": [
                        542,
                        "[UUID!]"
                    ],
                    "messageId": [
                        542,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "recipientWorkspaceMemberIds": [
                        542,
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
                        542,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                490,
                {
                    "input": [
                        489,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                494,
                {
                    "input": [
                        493,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                495,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        542
                    ]
                }
            ],
            "sendMessageCampaign": [
                497,
                {
                    "input": [
                        496,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                492,
                {
                    "input": [
                        498,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                43,
                {
                    "input": [
                        500,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                108,
                {
                    "partnerCode": [
                        1,
                        "String!"
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
                451,
                {
                    "isPrivate": [
                        4,
                        "Boolean!"
                    ],
                    "target": [
                        455,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                451,
                {
                    "accessLevel": [
                        447,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        448,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        455,
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
                92,
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
                92,
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
                506,
                {
                    "input": [
                        507
                    ]
                }
            ],
            "signUpInWorkspace": [
                506,
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
                        542
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
                409,
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
                        214,
                        "DateTime!"
                    ],
                    "threadId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                143,
                {
                    "connectedAccountId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                510,
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
                4,
                {
                    "threadId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                511
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
                        518,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                692,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        329,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "syncMcpServerTools": [
                356,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "trackAnalytics": [
                36,
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
                        37,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                74,
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
                527,
                {
                    "input": [
                        526,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                531,
                {
                    "input": [
                        528,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                530,
                {
                    "input": [
                        529,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                535,
                {
                    "input": [
                        532,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                534,
                {
                    "input": [
                        533,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                537,
                {
                    "input": [
                        536,
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
                        542,
                        "UUID!"
                    ],
                    "input": [
                        547,
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
                        214
                    ],
                    "threadIds": [
                        542,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                39,
                {
                    "input": [
                        549,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                361,
                {
                    "input": [
                        550,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                48,
                {
                    "id": [
                        542,
                        "UUID!"
                    ],
                    "input": [
                        551,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                74,
                {
                    "input": [
                        552,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                78,
                {
                    "input": [
                        554,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                130,
                {
                    "input": [
                        556,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                157,
                {
                    "input": [
                        558,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                361,
                {
                    "input": [
                        559,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                289,
                {
                    "input": [
                        561,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                298,
                {
                    "input": [
                        563,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                267,
                {
                    "input": [
                        564,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                388,
                {
                    "inputs": [
                        577,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                391,
                {
                    "inputs": [
                        578,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                663,
                {
                    "inputs": [
                        600,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                356,
                {
                    "input": [
                        567,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                361,
                {
                    "input": [
                        569,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                368,
                {
                    "input": [
                        571,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                368,
                {
                    "input": [
                        573,
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
                388,
                {
                    "input": [
                        577,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        548,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        542
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
                        576,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        565,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                391,
                {
                    "input": [
                        578,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                464,
                {
                    "updateRoleInput": [
                        585,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                412,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        579,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        580,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                416,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        582,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                412,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        584,
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
                508,
                {
                    "input": [
                        587,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                520,
                {
                    "input": [
                        588,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                545,
                {
                    "input": [
                        589,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                629,
                {
                    "input": [
                        590,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                102,
                {
                    "userCreditsFallback": [
                        644,
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
                649,
                {
                    "input": [
                        591,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                654,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        602,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                657,
                {
                    "input": [
                        595,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                658,
                {
                    "input": [
                        593,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                659,
                {
                    "input": [
                        598,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                660,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        597,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                663,
                {
                    "input": [
                        600,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                666,
                {
                    "input": [
                        603,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                670,
                {
                    "input": [
                        605,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                678,
                {
                    "data": [
                        609,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                678,
                {
                    "data": [
                        607,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                678,
                {
                    "data": [
                        608,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                687,
                {
                    "roleId": [
                        542,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        610,
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
                74,
                {
                    "file": [
                        611,
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
                        611,
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
                        611,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                284,
                {
                    "file": [
                        611,
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
                        611,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                284,
                {
                    "file": [
                        611,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                276,
                {
                    "upsertFieldPermissionsInput": [
                        612,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                654,
                {
                    "input": [
                        615,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                399,
                {
                    "upsertObjectPermissionsInput": [
                        616,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                465,
                {
                    "upsertPermissionFlagsInput": [
                        617,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                619,
                {
                    "input": [
                        618,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                654,
                {
                    "input": [
                        620,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                82,
                {
                    "input": [
                        647,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                651,
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
                92,
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
                652,
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
                542
            ],
            "applicationId": [
                542
            ],
            "color": [
                1
            ],
            "createdAt": [
                214
            ],
            "folderId": [
                542
            ],
            "icon": [
                1
            ],
            "id": [
                542
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
                542
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                542
            ],
            "targetRecordId": [
                542
            ],
            "targetRecordIdentifier": [
                444
            ],
            "type": [
                389
            ],
            "updatedAt": [
                214
            ],
            "userWorkspaceId": [
                542
            ],
            "viewId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                672
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                542
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
                542
            ],
            "imageIdentifierFieldMetadataId": [
                542
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
                542
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
                484
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
                411
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
                411
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
                543
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
                543
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
                411
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                542
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
                542
            ],
            "restrictedFields": [
                329
            ],
            "rowLevelPermissionPredicateGroups": [
                468
            ],
            "rowLevelPermissionPredicates": [
                467
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
                542
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
                542
            ],
            "restrictedFields": [
                329
            ],
            "rowLevelRecordsPermissions": [
                473
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                407
            ],
            "previousOnboardingStatus": [
                407
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
                164
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
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
                542
            ],
            "createdAt": [
                214
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                542
            ],
            "deletedAt": [
                214
            ],
            "id": [
                542
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
                542
            ],
            "tabs": [
                413
            ],
            "type": [
                415
            ],
            "universalIdentifier": [
                542
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
                542
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
                542
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
                414
            ],
            "pageLayoutId": [
                542
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                542
            ],
            "updatedAt": [
                214
            ],
            "widgets": [
                416
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
                542
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
                671
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
                542
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
                542
            ],
            "pageLayoutTabId": [
                542
            ],
            "position": [
                419
            ],
            "title": [
                1
            ],
            "type": [
                673
            ],
            "universalIdentifier": [
                542
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
                414
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
                414
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
                417
            ],
            "on_PageLayoutWidgetGridPosition": [
                418
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                421
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                420
            ],
            "index": [
                10
            ],
            "layoutMode": [
                414
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
                542
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
                542
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
                542
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
                542
            ],
            "aggregateOperation": [
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                672
            ],
            "dateGranularity": [
                405
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
                329
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                542
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
                144
            ],
            "orderBy": [
                307
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
                428
            ],
            "formattedToRawLookup": [
                329
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
                329
            ],
            "objectMetadataId": [
                542
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
                542
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
                542
            ],
            "createdAt": [
                214
            ],
            "domain": [
                1
            ],
            "id": [
                542
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
                268
            ],
            "metadata": [
                437
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
                434
            ],
            "IMAP": [
                434
            ],
            "SMTP": [
                434
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                83
            ],
            "authProviders": [
                84
            ],
            "displayName": [
                1
            ],
            "id": [
                542
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                696
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
                542
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
                        542,
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
                        542,
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
                39,
                {
                    "input": [
                        295,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                39
            ],
            "appConnection": [
                42,
                {
                    "id": [
                        18,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                42,
                {
                    "filter": [
                        338
                    ]
                }
            ],
            "appKeyValue": [
                43,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        44
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
                51,
                {
                    "applicationId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                52,
                {
                    "applicationId": [
                        542,
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
                483,
                {
                    "applicationId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                95,
                {
                    "input": [
                        96,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                108
            ],
            "billingPlans": [
                110
            ],
            "billingPortalSession": [
                120,
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
                542,
                {
                    "calendarEventId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "agentUniversalIdentifier": [
                        542
                    ],
                    "threadId": [
                        542
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
                        542
                    ],
                    "threadId": [
                        542
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
                        542,
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
                686,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                512,
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
                        542,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                157
            ],
            "currentUser": [
                642
            ],
            "currentUserApplicationAuthorizations": [
                49
            ],
            "currentUserSessions": [
                645
            ],
            "currentWorkspace": [
                678
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
                54,
                {
                    "shouldIncludeDependencies": [
                        4
                    ],
                    "universalIdentifier": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                269,
                {
                    "id": [
                        542,
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
                433,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                74,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                66,
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
                76,
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
                78,
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
                3
            ],
            "findManyApplicationRegistrations": [
                74
            ],
            "findManyApplications": [
                48
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
                435
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
                3,
                {
                    "input": [
                        20,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                48,
                {
                    "id": [
                        542
                    ],
                    "universalIdentifier": [
                        542
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                74,
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
                680
            ],
            "findWorkspaceFromInviteHash": [
                678,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                685
            ],
            "frontComponent": [
                289,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                289
            ],
            "getAddressDetails": [
                429,
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
                33
            ],
            "getApiKeyRoles": [
                464
            ],
            "getApprovedAccessDomains": [
                82
            ],
            "getAutoCompleteAddress": [
                89,
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
                        542,
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
                412,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                413,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                416,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                416,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                412,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        415
                    ]
                }
            ],
            "getPermissionFlags": [
                423
            ],
            "getPublicWorkspaceDataByDomain": [
                439,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                440,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                119
            ],
            "getRole": [
                464,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                464
            ],
            "getSSOIdentityProviders": [
                286
            ],
            "getToolIndex": [
                524
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
                626,
                {
                    "input": [
                        627
                    ]
                }
            ],
            "getView": [
                654,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                657,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                658,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                658,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                657,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                659,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                660,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                660,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                659,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                663,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                663,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                666,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                666,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                654,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        668,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                683
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
                4,
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
                        542,
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
                542,
                {
                    "objectMetadataId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                73
            ],
            "myCalendarChannels": [
                130,
                {
                    "connectedAccountId": [
                        542
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
                        542
                    ]
                }
            ],
            "myMessageFolders": [
                368,
                {
                    "messageChannelId": [
                        542
                    ]
                }
            ],
            "myUserApplicationVariables": [
                688
            ],
            "navigationMenuItem": [
                388,
                {
                    "id": [
                        542,
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
                        542,
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
                426,
                {
                    "input": [
                        427,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                138,
                {
                    "input": [
                        430,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                432,
                {
                    "input": [
                        431,
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
                446,
                {
                    "targets": [
                        455,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                451,
                {
                    "target": [
                        455,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                456
            ],
            "skill": [
                508,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                508
            ],
            "timelineActivityTypes": [
                520
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                541,
                {
                    "userId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                545
            ],
            "usageLimits": [
                629
            ],
            "usageQuotaDefinitions": [
                633
            ],
            "usageQuotaScopeConsumption": [
                635,
                {
                    "input": [
                        636,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                637
            ],
            "validatePasswordResetToken": [
                648,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                649,
                {
                    "objectMetadataId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                649,
                {
                    "fieldMetadataId": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                670,
                {
                    "id": [
                        542,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                670
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                542
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
                542
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
                542
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
                542
            ],
            "permissions": [
                445
            ],
            "recordId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                542
            ],
            "workspaceMemberId": [
                542
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
                445
            ],
            "roles": [
                453
            ],
            "shares": [
                452
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                447
            ],
            "id": [
                18
            ],
            "principalId": [
                542
            ],
            "principalRoleId": [
                542
            ],
            "principalType": [
                449
            ],
            "rowCause": [
                450
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
                542
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
                672
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
                542
            ],
            "recordId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                542
            ],
            "id": [
                542
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                542
            ],
            "secondFieldMetadataId": [
                542
            ],
            "thirdFieldMetadataId": [
                542
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
                458
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
                542
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
                40
            ],
            "applicationId": [
                542
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
                276
            ],
            "icon": [
                1
            ],
            "id": [
                542
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                399
            ],
            "permissionFlags": [
                465
            ],
            "rowLevelPermissionPredicateGroups": [
                468
            ],
            "rowLevelPermissionPredicates": [
                467
            ],
            "universalIdentifier": [
                542
            ],
            "workspaceMembers": [
                687
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
                542
            ],
            "roleId": [
                542
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
                472
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
                470
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
                542
            ],
            "logicalOperator": [
                470
            ],
            "objectMetadataId": [
                542
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                542
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
                542
            ],
            "id": [
                542
            ],
            "operand": [
                472
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "relationFieldMetadataId": [
                542
            ],
            "rowLevelPermissionPredicateGroupId": [
                542
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
                468
            ],
            "predicates": [
                467
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
                476
            ],
            "messages": [
                476
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                329
            ],
            "runAsWorkspaceMemberId": [
                542
            ],
            "thread": [
                479
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
                542
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
                475
            ],
            "content": [
                1
            ],
            "role": [
                477
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
                542
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                542
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
                542
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                482
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
                542
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                482
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
                542
            ],
            "id": [
                542
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                542
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
                542
            ],
            "messageChannelId": [
                542
            ],
            "messageThreadId": [
                542
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
                542
            ],
            "messageThreadId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                542
            ],
            "messageId": [
                1
            ],
            "queued": [
                4
            ],
            "recipientParticipantWorkspaceMemberIds": [
                542
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
                488
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
                491
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
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                542
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
                685
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
                44
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
                542
            ],
            "createdAt": [
                214
            ],
            "frontComponentId": [
                542
            ],
            "icon": [
                1
            ],
            "id": [
                542
            ],
            "position": [
                6
            ],
            "scope": [
                502
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                542
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
                542
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
                542
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                482
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
                85
            ],
            "workspace": [
                697
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
                542
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
                542
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
                214
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                463
            ],
            "configurationType": [
                672
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                695
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
                443,
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
                14,
                {
                    "agentUniversalIdentifier": [
                        542
                    ],
                    "runId": [
                        542
                    ],
                    "threadId": [
                        542
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
                517
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
                45
            ],
            "messageChannelId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                672
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
                542
            ],
            "createdAt": [
                214
            ],
            "emit": [
                521
            ],
            "frontComponentUniversalIdentifier": [
                542
            ],
            "icon": [
                1
            ],
            "id": [
                542
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
                542
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                542
            ],
            "universalIdentifier": [
                542
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
                542
            ],
            "on": [
                1
            ],
            "through": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                542
            ],
            "relationFieldUniversalIdentifier": [
                542
            ],
            "triggerFieldUniversalIdentifiers": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                672
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
                85
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                542
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
                542
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
                86
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
                214
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                542
            ],
            "gt": [
                542
            ],
            "gte": [
                542
            ],
            "iLike": [
                542
            ],
            "in": [
                542
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                542
            ],
            "lt": [
                542
            ],
            "lte": [
                542
            ],
            "neq": [
                542
            ],
            "notILike": [
                542
            ],
            "notIn": [
                542
            ],
            "notLike": [
                542
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
                542
            ],
            "name": [
                1
            ],
            "updatedAt": [
                214
            ],
            "visibility": [
                546
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
                542
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
                542
            ],
            "isActive": [
                4
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
                542
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
                542
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
                542
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                542
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
                553
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
                555
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
                542
            ],
            "update": [
                557
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
                4
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                134
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
                542
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
                542
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                542
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
                542
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
                329
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                542
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
                542
            ],
            "update": [
                562
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
                4
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInput": {
            "id": [
                542
            ],
            "update": [
                566
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
                6
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
                542
            ],
            "update": [
                568
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                542
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
                542
            ],
            "update": [
                570
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
                542
            ],
            "update": [
                572
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
                542
            ],
            "update": [
                572
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
                542
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
                542
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
                542
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
                542
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
                542
            ],
            "update": [
                560
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                542
            ],
            "update": [
                574
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                542
            ],
            "update": [
                575
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
                542
            ],
            "type": [
                415
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
                414
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
                542
            ],
            "layoutMode": [
                414
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                583
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
                4
            ],
            "objectMetadataId": [
                542
            ],
            "pageLayoutTabId": [
                542
            ],
            "position": [
                329
            ],
            "title": [
                1
            ],
            "type": [
                673
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
                542
            ],
            "objectMetadataId": [
                542
            ],
            "pageLayoutTabId": [
                542
            ],
            "position": [
                329
            ],
            "title": [
                1
            ],
            "type": [
                673
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
                542
            ],
            "tabs": [
                581
            ],
            "type": [
                415
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                542
            ],
            "update": [
                586
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
                542
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
                542
            ],
            "isActive": [
                4
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
                546
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                542
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
                542
            ],
            "update": [
                592
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
                542
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
                542
            ],
            "update": [
                594
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
                542
            ],
            "update": [
                596
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                542
            ],
            "logicalOperator": [
                661
            ],
            "parentViewFilterGroupId": [
                542
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                542
            ],
            "update": [
                599
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                542
            ],
            "operand": [
                662
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                542
            ],
            "subFieldName": [
                1
            ],
            "value": [
                329
            ],
            "viewFilterGroupId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                542
            ],
            "update": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                542
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
                542
            ],
            "calendarFieldMetadataId": [
                542
            ],
            "calendarLayout": [
                655
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                542
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                542
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                542
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                665
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "translations": [
                379
            ],
            "type": [
                668
            ],
            "visibility": [
                669
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                542
            ],
            "update": [
                604
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                667
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
                542
            ],
            "update": [
                606
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
                542
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
                31
            ],
            "aiChatDirectMessageAssistantMode": [
                28
            ],
            "aiChatInboxAssistantMode": [
                28
            ],
            "aiChatModelTier": [
                31
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                329
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                542
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
                684
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
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                542
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                613
            ],
            "id": [
                542
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
                613
            ],
            "groups": [
                614
            ],
            "widgetId": [
                542
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
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                542
            ],
            "predicateGroups": [
                469
            ],
            "predicates": [
                471
            ],
            "roleId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                468
            ],
            "predicates": [
                467
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                624
            ],
            "viewFields": [
                621
            ],
            "viewFilterGroups": [
                622
            ],
            "viewFilters": [
                623
            ],
            "viewSorts": [
                625
            ],
            "widgetId": [
                542
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
                542
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                542
            ],
            "logicalOperator": [
                661
            ],
            "parentViewFilterGroupId": [
                542
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
                542
            ],
            "id": [
                542
            ],
            "operand": [
                662
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                542
            ],
            "subFieldName": [
                1
            ],
            "value": [
                329
            ],
            "viewFilterGroupId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                542
            ],
            "calendarFieldMetadataId": [
                542
            ],
            "calendarLayout": [
                655
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                542
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                542
            ],
            "openRecordIn": [
                665
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                667
            ],
            "fieldMetadataId": [
                542
            ],
            "id": [
                542
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
                639
            ],
            "usageByApplication": [
                628
            ],
            "usageByModel": [
                628
            ],
            "usageByOperationType": [
                628
            ],
            "usageByUser": [
                628
            ],
            "userDailyUsage": [
                641
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                631
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
                100
            ],
            "createdAt": [
                214
            ],
            "id": [
                542
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                100
            ],
            "operationType": [
                631
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                638
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                640
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
                640
            ],
            "operationType": [
                631
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                630
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                634
            ],
            "resourceType": [
                638
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                632
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
                631
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                640
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                100
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
                631
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                638
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                640
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                100
            ],
            "id": [
                542
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                100
            ],
            "operationType": [
                631
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
                100
            ],
            "resourceType": [
                638
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
                640
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
                639
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
                91
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                214
            ],
            "currentUserWorkspace": [
                646
            ],
            "currentWorkspace": [
                678
            ],
            "deletedAt": [
                214
            ],
            "deletedWorkspaceMembers": [
                227
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
                542
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
                407
            ],
            "previousOnboardingStatus": [
                407
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
                646
            ],
            "workspaceMember": [
                687
            ],
            "workspaceMembers": [
                687
            ],
            "workspaces": [
                646
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
                542
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
                214
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                542
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
                542
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectRecordsPermissions": [
                406
            ],
            "permissionFlags": [
                424
            ],
            "twoFactorAuthenticationMethodSummary": [
                538
            ],
            "updatedAt": [
                214
            ],
            "user": [
                642
            ],
            "userId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                542
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
                542
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
                542
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                542
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
                542
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
                85
            ],
            "workspaceUrls": [
                696
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
                542
            ],
            "calendarEndFieldMetadataId": [
                542
            ],
            "calendarFieldMetadataId": [
                542
            ],
            "calendarLayout": [
                655
            ],
            "createdAt": [
                214
            ],
            "createdByUserWorkspaceId": [
                542
            ],
            "deletedAt": [
                214
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                542
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
                542
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                664
            ],
            "mainGroupByFieldMetadataId": [
                542
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                542
            ],
            "openRecordIn": [
                665
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                668
            ],
            "universalIdentifier": [
                542
            ],
            "updatedAt": [
                214
            ],
            "viewFieldGroups": [
                658
            ],
            "viewFields": [
                657
            ],
            "viewFilterGroups": [
                660
            ],
            "viewFilters": [
                659
            ],
            "viewGroups": [
                663
            ],
            "viewSorts": [
                666
            ],
            "visibility": [
                669
            ],
            "workspaceId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                672
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
                542
            ],
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "fieldMetadataId": [
                542
            ],
            "id": [
                542
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
                542
            ],
            "updatedAt": [
                214
            ],
            "viewFieldGroupId": [
                542
            ],
            "viewId": [
                542
            ],
            "workspaceId": [
                542
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
                542
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
                214
            ],
            "viewFields": [
                657
            ],
            "viewId": [
                542
            ],
            "workspaceId": [
                542
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
                542
            ],
            "id": [
                542
            ],
            "operand": [
                662
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                542
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
                542
            ],
            "viewId": [
                542
            ],
            "workspaceId": [
                542
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
                542
            ],
            "logicalOperator": [
                661
            ],
            "parentViewFilterGroupId": [
                542
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                214
            ],
            "viewId": [
                542
            ],
            "workspaceId": [
                542
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
                542
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                214
            ],
            "viewId": [
                542
            ],
            "workspaceId": [
                542
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
                667
            ],
            "fieldMetadataId": [
                542
            ],
            "id": [
                542
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                214
            ],
            "viewId": [
                542
            ],
            "workspaceId": [
                542
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
                542
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
                542
            ],
            "operations": [
                1
            ],
            "role": [
                464
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
                26
            ],
            "on_BarChartConfiguration": [
                94
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
                425
            ],
            "on_RecordTableConfiguration": [
                454
            ],
            "on_StandaloneRichTextConfiguration": [
                509
            ],
            "on_TasksConfiguration": [
                519
            ],
            "on_TimelineConfiguration": [
                523
            ],
            "on_ViewConfiguration": [
                656
            ],
            "on_WorkflowConfiguration": [
                675
            ],
            "on_WorkflowRunConfiguration": [
                676
            ],
            "on_WorkflowVersionConfiguration": [
                677
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
                672
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                672
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                672
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                679
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                31
            ],
            "aiChatDirectMessageAssistantMode": [
                28
            ],
            "aiChatInboxAssistantMode": [
                28
            ],
            "aiChatModelTier": [
                31
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                329
            ],
            "allowImpersonation": [
                4
            ],
            "allowedEmbeddingOrigins": [
                1
            ],
            "billingCustomer": [
                102
            ],
            "billingEntitlements": [
                104
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
                464
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
                6
            ],
            "featureFlags": [
                267
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                542
            ],
            "iframeMediaPermissions": [
                311
            ],
            "installedApplications": [
                48
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
                542
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
                214
            ],
            "viewFields": [
                657
            ],
            "viewFilterGroups": [
                660
            ],
            "viewFilters": [
                659
            ],
            "viewGroups": [
                663
            ],
            "viewSorts": [
                666
            ],
            "views": [
                654
            ],
            "workspaceCustomApplication": [
                48
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                684
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                696
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
                329
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                681
            ],
            "personEnrichment": [
                329
            ],
            "personOutcome": [
                694
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
                542
            ],
            "roleId": [
                542
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
                689
            ],
            "id": [
                542
            ],
            "locale": [
                1
            ],
            "name": [
                292
            ],
            "numberFormat": [
                690
            ],
            "openRecordIn": [
                410
            ],
            "roles": [
                464
            ],
            "timeFormat": [
                691
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
                542
            ],
            "userWorkspaceId": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                542
            ],
            "variables": [
                643
            ],
            "workspaceMemberId": [
                542
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
                542
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
                542
            ],
            "workspaceUrls": [
                696
            ],
            "__typename": [
                1
            ]
        }
    }
}