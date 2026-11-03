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
        321,
        328,
        329,
        330,
        342,
        344,
        360,
        361,
        362,
        363,
        364,
        365,
        367,
        368,
        369,
        372,
        373,
        375,
        378,
        383,
        387,
        396,
        403,
        404,
        407,
        411,
        412,
        417,
        421,
        444,
        446,
        447,
        455,
        467,
        469,
        473,
        478,
        498,
        510,
        511,
        513,
        538,
        540,
        542,
        607,
        627,
        634,
        636,
        640,
        651,
        657,
        658,
        660,
        661,
        663,
        664,
        665,
        668,
        669,
        670,
        675,
        677,
        680,
        685,
        686,
        687,
        690,
        691
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
                328
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
                538
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
                538
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
                328
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
                328
            ],
            "roleId": [
                538
            ],
            "triggers": [
                328
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
                538
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                538
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
                538
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
                538
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
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                328
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
                538
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
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                538
            ],
            "createdAt": [
                214
            ],
            "id": [
                538
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
                538
            ],
            "senderWorkspaceMemberId": [
                538
            ],
            "status": [
                1
            ],
            "threadId": [
                538
            ],
            "turnId": [
                538
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
                538
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                538
            ],
            "messageId": [
                538
            ],
            "orderIndex": [
                11
            ],
            "providerExecuted": [
                5
            ],
            "providerMetadata": [
                328
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
                328
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                328
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
                538
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                5
            ],
            "workspaceMemberIds": [
                538
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
                538
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
                538
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
                538
            ],
            "aggregateOperation": [
                28
            ],
            "configurationType": [
                668
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                5
            ],
            "filter": [
                328
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
                439
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
                538
            ],
            "name": [
                1
            ],
            "revokedAt": [
                214
            ],
            "role": [
                461
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
                538
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
                328
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
                538
            ],
            "role": [
                369
            ],
            "workspaceMemberId": [
                538
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
                538
            ],
            "applicationVariables": [
                81
            ],
            "autoUpgrade": [
                5
            ],
            "availablePackages": [
                328
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
                461
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
            "healthCheckLogicFunctionId": [
                538
            ],
            "id": [
                538
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                5
            ],
            "logicFunctions": [
                341
            ],
            "logoFileId": [
                538
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                389
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                538
            ],
            "runOnUserPreferences": [
                5
            ],
            "settingsCustomTabFrontComponentId": [
                538
            ],
            "settingsMenuItems": [
                497
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                538
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
                538
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
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                538
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
                435
            ],
            "connectionProviderId": [
                538
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
                538
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
                538
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
                538
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
                328
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
                538
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
                538
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
                538
            ],
            "connectionProviders": [
                53
            ],
            "hasUserHealthCheck": [
                5
            ],
            "settingsMenuItems": [
                497
            ],
            "variables": [
                639
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
                538
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
                538
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
                649
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                538
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
                538
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
                328
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
                538
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
                328
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
                538
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
                477
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
                538
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
                476
            ],
            "workspaceUrls": [
                692
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
                538
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
                668
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
                328
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
                403
            ],
            "primaryAxisGroupByFieldMetadataId": [
                538
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
                403
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                538
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
                328
            ],
            "formattedToRawLookup": [
                328
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
                328
            ],
            "objectMetadataId": [
                538
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
                538
            ],
            "userCreditsFallback": [
                640
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
                511
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
                510
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
                510
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
                538
            ],
            "interval": [
                510
            ],
            "metadata": [
                328
            ],
            "phases": [
                124
            ],
            "status": [
                511
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
                538
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
                538
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
                538
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
                668
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                668
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
                668
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                328
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
                668
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
                383
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                385
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
                433
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                495
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                5
            ],
            "support": [
                512
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
                538
            ],
            "availabilityObjectMetadataId": [
                538
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
                538
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
                538
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                538
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
                538
            ],
            "pageLayoutId": [
                538
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
                538
            ],
            "updatedAt": [
                214
            ],
            "workflowVersionId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                395
            ],
            "on_PathCommandMenuItemPayload": [
                419
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
                538
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
                435
            ],
            "connectionProviderId": [
                538
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
                538
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
                538
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
                313
            ],
            "handle": [
                1
            ],
            "id": [
                538
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                538
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
                538
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
                328
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
                328
            ],
            "roleId": [
                538
            ],
            "triggers": [
                328
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                538
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                538
            ],
            "participantHandleFieldUniversalIdentifier": [
                538
            ],
            "visibility": [
                365
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
                538
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
                538
            ],
            "engineComponentKey": [
                248
            ],
            "frontComponentId": [
                538
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
                538
            ],
            "pageLayoutId": [
                538
            ],
            "payload": [
                328
            ],
            "position": [
                7
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                538
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
                359
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
                328
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
                328
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                538
            ],
            "options": [
                328
            ],
            "relationCreationPayload": [
                328
            ],
            "settings": [
                328
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
                538
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
                538
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
                321
            ],
            "objectMetadataId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                328
            ],
            "databaseEventTriggerSettings": [
                328
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                328
            ],
            "id": [
                538
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                328
            ],
            "source": [
                328
            ],
            "timeoutSeconds": [
                7
            ],
            "toolTriggerSettings": [
                328
            ],
            "universalIdentifier": [
                538
            ],
            "workflowActionTriggerSettings": [
                328
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                538
            ],
            "id": [
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                538
            ],
            "color": [
                1
            ],
            "folderId": [
                538
            ],
            "icon": [
                1
            ],
            "id": [
                538
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                538
            ],
            "position": [
                7
            ],
            "targetObjectMetadataId": [
                538
            ],
            "targetRecordId": [
                538
            ],
            "type": [
                387
            ],
            "userWorkspaceId": [
                538
            ],
            "viewId": [
                538
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
                328
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
                538
            ],
            "type": [
                412
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                411
            ],
            "pageLayoutId": [
                538
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
                328
            ],
            "objectMetadataId": [
                538
            ],
            "pageLayoutTabId": [
                538
            ],
            "position": [
                328
            ],
            "title": [
                1
            ],
            "type": [
                669
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                538
            ],
            "filter": [
                328
            ],
            "objectMetadataId": [
                538
            ],
            "orderBy": [
                328
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                538
            ],
            "isInherent": [
                5
            ],
            "objectMetadataId": [
                538
            ],
            "secondFieldMetadataId": [
                538
            ],
            "thirdFieldMetadataId": [
                538
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
                538
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
                542
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
                627
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                634
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                636
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
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                538
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
                538
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
                538
            ],
            "id": [
                538
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
                538
            ],
            "viewId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                538
            ],
            "logicalOperator": [
                657
            ],
            "parentViewFilterGroupId": [
                538
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "viewId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                538
            ],
            "id": [
                538
            ],
            "operand": [
                658
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                538
            ],
            "subFieldName": [
                1
            ],
            "value": [
                328
            ],
            "viewFilterGroupId": [
                538
            ],
            "viewId": [
                538
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
                538
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "viewId": [
                538
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
                538
            ],
            "calendarFieldMetadataId": [
                538
            ],
            "calendarLayout": [
                651
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                538
            ],
            "isCompact": [
                5
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                538
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                660
            ],
            "mainGroupByFieldMetadataId": [
                538
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                538
            ],
            "openRecordIn": [
                661
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                664
            ],
            "visibility": [
                665
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                663
            ],
            "fieldMetadataId": [
                538
            ],
            "id": [
                538
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                538
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
                538
            ],
            "operations": [
                1
            ],
            "roleId": [
                538
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
                627
            ],
            "resource": [
                634
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                538
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
                538
            ],
            "name": [
                292
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                538
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
                538
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
                538
            ],
            "pageLayoutId": [
                538
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
                538
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
                538
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                478
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
                538
            ],
            "status": [
                478
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
                668
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
                538
            ],
            "status": [
                245
            ],
            "tenantStatus": [
                246
            ],
            "unsubscribeHostnameStatus": [
                540
            ],
            "updatedAt": [
                214
            ],
            "verificationRecords": [
                646
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
                668
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
                328
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
                328
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
                328
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
                328
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
                374
            ],
            "objectRecordEventsWithQueryIds": [
                402
            ],
            "queueJobEvents": [
                331
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                538
            ],
            "payload": [
                328
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
                538
            ],
            "createdAt": [
                214
            ],
            "defaultValue": [
                328
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
                538
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
            "morphId": [
                538
            ],
            "morphRelations": [
                454
            ],
            "name": [
                1
            ],
            "object": [
                389
            ],
            "objectMetadataId": [
                538
            ],
            "options": [
                328
            ],
            "relation": [
                454
            ],
            "settings": [
                328
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
                668
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
                408
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
                539
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
                539
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
                538
            ],
            "id": [
                538
            ],
            "objectMetadataId": [
                538
            ],
            "roleId": [
                538
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
                538
            ],
            "objectMetadataId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                668
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
                538
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
                538
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
                538
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
                538
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
                668
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                538
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                478
            ],
            "type": [
                309
            ],
            "workspace": [
                689
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
                372
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                668
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
            "applicationId": [
                538
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                80
            ],
            "applicationVariables": [
                328
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
                538
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
                538
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
                668
            ],
            "frontComponentId": [
                538
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                538
            ],
            "pageLayoutType": [
                412
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
                472
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                328
            ],
            "runId": [
                538
            ],
            "scope": [
                328
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
                328
            ],
            "runId": [
                538
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
                538
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
                538
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
                538
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
                670
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
                538
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
                668
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
                314
            ],
            "IMAP": [
                314
            ],
            "SMTP": [
                314
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
                693
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
                538
            ],
            "threadId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                538
            ],
            "createdAt": [
                214
            ],
            "id": [
                538
            ],
            "indexFieldMetadataList": [
                319
            ],
            "indexType": [
                321
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
                317
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
                538
            ],
            "id": [
                538
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
                320
            ],
            "id": [
                539
            ],
            "isCustom": [
                129
            ],
            "or": [
                320
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                538
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
                324
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
                538
            ],
            "messageThreadId": [
                538
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
                330
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                538
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
                668
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
                328
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
                403
            ],
            "primaryAxisGroupByFieldMetadataId": [
                538
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
                403
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                538
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
                328
            ],
            "hasTooManyGroups": [
                5
            ],
            "series": [
                336
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
                328
            ],
            "objectMetadataId": [
                538
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
                335
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                538
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
                538
            ],
            "canRunOnDemand": [
                5
            ],
            "createdAt": [
                214
            ],
            "cronTriggerSettings": [
                328
            ],
            "databaseEventTriggerSettings": [
                328
            ],
            "description": [
                1
            ],
            "executionMode": [
                342
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                328
            ],
            "id": [
                538
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
                328
            ],
            "universalIdentifier": [
                538
            ],
            "updatedAt": [
                214
            ],
            "workflowActionTriggerSettings": [
                328
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                328
            ],
            "duration": [
                7
            ],
            "error": [
                328
            ],
            "logs": [
                1
            ],
            "status": [
                344
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                538
            ],
            "applicationUniversalIdentifier": [
                538
            ],
            "id": [
                538
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                538
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
                328
            ],
            "name": [
                1
            ],
            "objects": [
                351
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                352
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
                353
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                354
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
                538
            ],
            "connectionProviderId": [
                538
            ],
            "createdAt": [
                214
            ],
            "id": [
                538
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
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                668
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
                538
            ],
            "contactAutoCreationPolicy": [
                360
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
                538
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
                367
            ],
            "messagingProviderUniversalIdentifier": [
                538
            ],
            "participantHandleFieldUniversalIdentifier": [
                538
            ],
            "pendingGroupEmailsAction": [
                361
            ],
            "syncStage": [
                362
            ],
            "syncStageStartedAt": [
                214
            ],
            "syncStatus": [
                363
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
                364
            ],
            "updatedAt": [
                214
            ],
            "visibility": [
                365
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
                538
            ],
            "isSentFolder": [
                5
            ],
            "isSynced": [
                5
            ],
            "messageChannelId": [
                538
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                368
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
                538
            ],
            "reason": [
                372
            ],
            "source": [
                373
            ],
            "unsubscribeTopicId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                370
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
                401
            ],
            "recordId": [
                1
            ],
            "type": [
                375
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
                538
            ],
            "property": [
                1
            ],
            "provenance": [
                378
            ],
            "recordId": [
                538
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
                538
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                538
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
                381
            ],
            "views": [
                382
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
                538
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
                538
            ],
            "key": [
                660
            ],
            "objectMetadataId": [
                538
            ],
            "type": [
                664
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                504,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                674,
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
                        538,
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
            "assignAgentChatThread": [
                5,
                {
                    "assigneeWorkspaceMemberId": [
                        538
                    ],
                    "threadId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                5,
                {
                    "agentId": [
                        538,
                        "UUID!"
                    ],
                    "roleId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                5,
                {
                    "apiKeyId": [
                        538,
                        "UUID!"
                    ],
                    "roleId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                5,
                {
                    "input": [
                        316,
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
                        510,
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
                        538,
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
                        538,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                406,
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
                359,
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
                        538
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
                386,
                {
                    "inputs": [
                        188,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                654,
                {
                    "inputs": [
                        203,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                653,
                {
                    "inputs": [
                        204,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                659,
                {
                    "inputs": [
                        207,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                355,
                {
                    "input": [
                        186,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                370,
                {
                    "input": [
                        187,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                386,
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
                501,
                {
                    "input": [
                        499,
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
                        538,
                        "UUID!"
                    ],
                    "properties": [
                        328
                    ],
                    "recordId": [
                        538,
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
                317,
                {
                    "input": [
                        191,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                341,
                {
                    "input": [
                        185,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                389,
                {
                    "input": [
                        192,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                461,
                {
                    "createRoleInput": [
                        198,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                409,
                {
                    "input": [
                        193,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                410,
                {
                    "input": [
                        194,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                413,
                {
                    "input": [
                        195,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                432,
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
                453,
                {
                    "input": [
                        197,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                501,
                {
                    "input": [
                        500,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                504,
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
                        510,
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
                541,
                {
                    "input": [
                        200,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                625,
                {
                    "input": [
                        201,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                645,
                {
                    "input": [
                        202,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                650,
                {
                    "input": [
                        208,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                653,
                {
                    "input": [
                        204,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                654,
                {
                    "input": [
                        203,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                655,
                {
                    "input": [
                        206,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                656,
                {
                    "input": [
                        205,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                659,
                {
                    "input": [
                        207,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                662,
                {
                    "input": [
                        209,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                666,
                {
                    "input": [
                        210,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                504,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                5,
                {
                    "channelId": [
                        538,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        538
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
                359,
                {
                    "id": [
                        538,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                161,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                674
            ],
            "deleteEmailGroupChannel": [
                359,
                {
                    "id": [
                        538,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                386,
                {
                    "ids": [
                        538,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                355,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                5,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                386,
                {
                    "id": [
                        538,
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
                317,
                {
                    "input": [
                        217,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                341,
                {
                    "input": [
                        345,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                389,
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
                        538,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                453,
                {
                    "id": [
                        538,
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
                504,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                221,
                {
                    "twoFactorAuthenticationMethodId": [
                        538,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                638
            ],
            "deleteUserFromWorkspace": [
                642,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                645,
                {
                    "id": [
                        538,
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
                653,
                {
                    "input": [
                        223,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                654,
                {
                    "input": [
                        222,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                655,
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
                659,
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
                666,
                {
                    "id": [
                        538,
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
                653,
                {
                    "input": [
                        229,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                654,
                {
                    "input": [
                        228,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                655,
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
                659,
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
                        316,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                161,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                236,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                237,
                {
                    "id": [
                        538,
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
                        538
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
                678
            ],
            "executeOneLogicFunction": [
                343,
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
                        538,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                86
            ],
            "generateTransientToken": [
                521
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                535,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        538,
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
                536,
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
                348,
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
                405
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
                315,
                {
                    "userId": [
                        538,
                        "UUID!"
                    ],
                    "workspaceId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                323,
                {
                    "input": [
                        322,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                325,
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
                325
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                5,
                {
                    "channelId": [
                        538
                    ],
                    "threadId": [
                        538,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                5,
                {
                    "input": [
                        456,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                448,
                {
                    "principal": [
                        445,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        452,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                5,
                {
                    "agentId": [
                        538,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                5,
                {
                    "input": [
                        457,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                458,
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
                491,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                410,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                409,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                516,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                483,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        538,
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
                        459,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                5,
                {
                    "applicationAuthorizationId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                5,
                {
                    "userId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                5,
                {
                    "userSessionId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                463,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                474,
                {
                    "input": [
                        470,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                65,
                {
                    "applicationId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                65,
                {
                    "applicationId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                312,
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
                        538
                    ]
                }
            ],
            "sendAppChannelMessage": [
                482,
                {
                    "input": [
                        481,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                483,
                {
                    "browsingContext": [
                        328
                    ],
                    "channelId": [
                        538
                    ],
                    "fileAttachments": [
                        281,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        538,
                        "[UUID!]"
                    ],
                    "messageId": [
                        538,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                486,
                {
                    "input": [
                        485,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                490,
                {
                    "input": [
                        489,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                491,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        538
                    ]
                }
            ],
            "sendMessageCampaign": [
                493,
                {
                    "input": [
                        492,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                488,
                {
                    "input": [
                        494,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                44,
                {
                    "input": [
                        496,
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
                448,
                {
                    "isPrivate": [
                        5,
                        "Boolean!"
                    ],
                    "target": [
                        452,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                448,
                {
                    "accessLevel": [
                        444,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        445,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        452,
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
                502,
                {
                    "input": [
                        503
                    ]
                }
            ],
            "signUpInWorkspace": [
                502,
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
                        538
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
                406,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                143,
                {
                    "connectedAccountId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                506,
                {
                    "companyContext": [
                        328
                    ],
                    "personContext": [
                        328
                    ]
                }
            ],
            "stopAgentChatStream": [
                5,
                {
                    "threadId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                507
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
                366,
                {
                    "input": [
                        514,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                688,
                {
                    "dryRun": [
                        5
                    ],
                    "inferDeletionFromMissingEntities": [
                        5
                    ],
                    "manifest": [
                        328,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                5
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
                        328
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
                523,
                {
                    "input": [
                        522,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                527,
                {
                    "input": [
                        524,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                526,
                {
                    "input": [
                        525,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                531,
                {
                    "input": [
                        528,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                530,
                {
                    "input": [
                        529,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                533,
                {
                    "input": [
                        532,
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
                        538,
                        "UUID!"
                    ],
                    "input": [
                        543,
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
                        538,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                40,
                {
                    "input": [
                        545,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                359,
                {
                    "input": [
                        546,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                49,
                {
                    "id": [
                        538,
                        "UUID!"
                    ],
                    "input": [
                        547,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                75,
                {
                    "input": [
                        548,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                79,
                {
                    "input": [
                        550,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                130,
                {
                    "input": [
                        552,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                157,
                {
                    "input": [
                        554,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                359,
                {
                    "input": [
                        555,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                289,
                {
                    "input": [
                        557,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                298,
                {
                    "input": [
                        559,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                267,
                {
                    "input": [
                        560,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                386,
                {
                    "inputs": [
                        573,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                389,
                {
                    "inputs": [
                        574,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                659,
                {
                    "inputs": [
                        596,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                355,
                {
                    "input": [
                        563,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                359,
                {
                    "input": [
                        565,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                366,
                {
                    "input": [
                        567,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                366,
                {
                    "input": [
                        569,
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
                386,
                {
                    "input": [
                        573,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                4,
                {
                    "input": [
                        544,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                5,
                {
                    "applicationId": [
                        538
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
                        572,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                5,
                {
                    "input": [
                        561,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                389,
                {
                    "input": [
                        574,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                461,
                {
                    "updateRoleInput": [
                        581,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                409,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        575,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                410,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        576,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        578,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                409,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        580,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                326,
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
                504,
                {
                    "input": [
                        583,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                516,
                {
                    "input": [
                        584,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                541,
                {
                    "input": [
                        585,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                625,
                {
                    "input": [
                        586,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                103,
                {
                    "userCreditsFallback": [
                        640,
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
                645,
                {
                    "input": [
                        587,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                650,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        598,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                653,
                {
                    "input": [
                        591,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                654,
                {
                    "input": [
                        589,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                655,
                {
                    "input": [
                        594,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                656,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        593,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                659,
                {
                    "input": [
                        596,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                662,
                {
                    "input": [
                        599,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                666,
                {
                    "input": [
                        601,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                674,
                {
                    "data": [
                        605,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                674,
                {
                    "data": [
                        603,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                674,
                {
                    "data": [
                        604,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                683,
                {
                    "roleId": [
                        538,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                5,
                {
                    "input": [
                        606,
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
                        607,
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
                        607,
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
                        607,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                284,
                {
                    "file": [
                        607,
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
                        607,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                284,
                {
                    "file": [
                        607,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                276,
                {
                    "upsertFieldPermissionsInput": [
                        608,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                650,
                {
                    "input": [
                        611,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                397,
                {
                    "upsertObjectPermissionsInput": [
                        612,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                462,
                {
                    "upsertPermissionFlagsInput": [
                        613,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                615,
                {
                    "input": [
                        614,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                650,
                {
                    "input": [
                        616,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                83,
                {
                    "input": [
                        643,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                647,
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
                648,
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
                538
            ],
            "applicationId": [
                538
            ],
            "color": [
                1
            ],
            "createdAt": [
                214
            ],
            "folderId": [
                538
            ],
            "icon": [
                1
            ],
            "id": [
                538
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                538
            ],
            "position": [
                7
            ],
            "targetObjectMetadataId": [
                538
            ],
            "targetRecordId": [
                538
            ],
            "targetRecordIdentifier": [
                441
            ],
            "type": [
                387
            ],
            "updatedAt": [
                214
            ],
            "userWorkspaceId": [
                538
            ],
            "viewId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                538
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
                392,
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
                538
            ],
            "imageIdentifierFieldMetadataId": [
                538
            ],
            "indexMetadataList": [
                317
            ],
            "indexMetadatas": [
                394,
                {
                    "filter": [
                        320,
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
                538
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
                396
            ],
            "searchFieldMetadataList": [
                480
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
                391
            ],
            "pageInfo": [
                408
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
                389
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
                408
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                393
            ],
            "id": [
                539
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
                393
            ],
            "universalIdentifier": [
                539
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                318
            ],
            "pageInfo": [
                408
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                538
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
                538
            ],
            "restrictedFields": [
                328
            ],
            "rowLevelPermissionPredicateGroups": [
                465
            ],
            "rowLevelPermissionPredicates": [
                464
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
                538
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
                401
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
                328
            ],
            "before": [
                328
            ],
            "diff": [
                328
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
                400
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
                404
            ],
            "previousOnboardingStatus": [
                404
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
                538
            ],
            "createdAt": [
                214
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                538
            ],
            "deletedAt": [
                214
            ],
            "id": [
                538
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
                538
            ],
            "tabs": [
                410
            ],
            "type": [
                412
            ],
            "universalIdentifier": [
                538
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
                538
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
                538
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
                411
            ],
            "pageLayoutId": [
                538
            ],
            "position": [
                7
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                538
            ],
            "updatedAt": [
                214
            ],
            "widgets": [
                413
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                538
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                328
            ],
            "configuration": [
                667
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
                538
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
                538
            ],
            "pageLayoutTabId": [
                538
            ],
            "position": [
                416
            ],
            "title": [
                1
            ],
            "type": [
                669
            ],
            "universalIdentifier": [
                538
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
                411
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
                411
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
                414
            ],
            "on_PageLayoutWidgetGridPosition": [
                415
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                417
            ],
            "index": [
                11
            ],
            "layoutMode": [
                411
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
                538
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
                538
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
                538
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
                538
            ],
            "aggregateOperation": [
                28
            ],
            "color": [
                1
            ],
            "configurationType": [
                668
            ],
            "dateGranularity": [
                403
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
                328
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "groupByFieldMetadataId": [
                538
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
                425
            ],
            "formattedToRawLookup": [
                328
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
                328
            ],
            "objectMetadataId": [
                538
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
                340
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
                358
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                538
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
                538
            ],
            "createdAt": [
                214
            ],
            "domain": [
                1
            ],
            "id": [
                538
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
                434
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
                431
            ],
            "IMAP": [
                431
            ],
            "SMTP": [
                431
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
                538
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                692
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
                538
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
                        538,
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
                        538,
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
                        337
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
                359,
                {
                    "filter": [
                        338
                    ]
                }
            ],
            "appMessageFolders": [
                366,
                {
                    "filter": [
                        339
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                52,
                {
                    "applicationId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                53,
                {
                    "applicationId": [
                        538,
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
                479,
                {
                    "applicationId": [
                        538,
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
                538,
                {
                    "calendarEventId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                22,
                {
                    "agentUniversalIdentifier": [
                        538
                    ],
                    "threadId": [
                        538
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
                        538
                    ],
                    "threadId": [
                        538
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
                        538,
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
                682,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                508,
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                157
            ],
            "currentUser": [
                638
            ],
            "currentUserApplicationAuthorizations": [
                50
            ],
            "currentUserSessions": [
                641
            ],
            "currentWorkspace": [
                674
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
                        538,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                269,
                {
                    "id": [
                        538,
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
                430,
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
                331,
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
                341
            ],
            "findManyMarketplaceApps": [
                349,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                432
            ],
            "findMarketplaceAppDetail": [
                350,
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
                        538
                    ],
                    "universalIdentifier": [
                        538
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
                341,
                {
                    "input": [
                        345,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                331,
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
                331,
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
                676
            ],
            "findWorkspaceFromInviteHash": [
                674,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                681
            ],
            "frontComponent": [
                289,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                289
            ],
            "getAddressDetails": [
                426,
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
                461
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
                328,
                {
                    "input": [
                        345,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                163,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                244
            ],
            "getInviteSuggestions": [
                327
            ],
            "getJobs": [
                331,
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
                        345,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                409,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                410,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                410,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                413,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                413,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                409,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        412
                    ]
                }
            ],
            "getPermissionFlags": [
                420
            ],
            "getPublicWorkspaceDataByDomain": [
                436,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                437,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                119
            ],
            "getRole": [
                461,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                461
            ],
            "getSSOIdentityProviders": [
                286
            ],
            "getToolIndex": [
                520
            ],
            "getToolInputSchema": [
                328,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                622,
                {
                    "input": [
                        623
                    ]
                }
            ],
            "getView": [
                650,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                653,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                654,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                654,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                653,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                655,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                656,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                656,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                655,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                659,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                659,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                662,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                662,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                650,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        664,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                679
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
                333,
                {
                    "input": [
                        334,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                110
            ],
            "mcpServer": [
                355,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                355
            ],
            "messageSuppressions": [
                371,
                {
                    "input": [
                        287,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                376,
                {
                    "input": [
                        379,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                380
            ],
            "mostlyEmptyFieldMetadataIds": [
                538,
                {
                    "objectMetadataId": [
                        538,
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
                        538
                    ]
                }
            ],
            "myConnectedAccounts": [
                161
            ],
            "myMessageChannels": [
                359,
                {
                    "connectedAccountId": [
                        538
                    ]
                }
            ],
            "myMessageFolders": [
                366,
                {
                    "messageChannelId": [
                        538
                    ]
                }
            ],
            "myUserApplicationVariables": [
                684
            ],
            "navigationMenuItem": [
                386,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                386
            ],
            "object": [
                389,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                399
            ],
            "objects": [
                390,
                {
                    "filter": [
                        393,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        212,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                423,
                {
                    "input": [
                        424,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                138,
                {
                    "input": [
                        427,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                429,
                {
                    "input": [
                        428,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                350,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                349
            ],
            "recordPermissions": [
                443,
                {
                    "targets": [
                        452,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                448,
                {
                    "target": [
                        452,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                453
            ],
            "skill": [
                504,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                504
            ],
            "timelineActivityTypes": [
                516
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                537,
                {
                    "userId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                541
            ],
            "usageLimits": [
                625
            ],
            "usageQuotaDefinitions": [
                629
            ],
            "usageQuotaScopeConsumption": [
                631,
                {
                    "input": [
                        632,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                633
            ],
            "validatePasswordResetToken": [
                644,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                645,
                {
                    "objectMetadataId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                645,
                {
                    "fieldMetadataId": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                666,
                {
                    "id": [
                        538,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                666
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                538
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
                538
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
                538
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
                538
            ],
            "permissions": [
                442
            ],
            "recordId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                538
            ],
            "workspaceMemberId": [
                538
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
                442
            ],
            "roles": [
                450
            ],
            "shares": [
                449
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                444
            ],
            "id": [
                19
            ],
            "principalId": [
                538
            ],
            "principalRoleId": [
                538
            ],
            "principalType": [
                446
            ],
            "rowCause": [
                447
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
                538
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
                668
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
                538
            ],
            "recordId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                538
            ],
            "id": [
                538
            ],
            "isInherent": [
                5
            ],
            "objectMetadataId": [
                538
            ],
            "secondFieldMetadataId": [
                538
            ],
            "thirdFieldMetadataId": [
                538
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
                389
            ],
            "targetFieldMetadata": [
                269
            ],
            "targetObjectMetadata": [
                389
            ],
            "type": [
                455
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
                538
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
                538
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
                538
            ],
            "isEditable": [
                5
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                397
            ],
            "permissionFlags": [
                462
            ],
            "rowLevelPermissionPredicateGroups": [
                465
            ],
            "rowLevelPermissionPredicates": [
                464
            ],
            "universalIdentifier": [
                538
            ],
            "workspaceMembers": [
                683
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
                538
            ],
            "roleId": [
                538
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
                469
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
                328
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
            "id": [
                1
            ],
            "logicalOperator": [
                467
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
            "id": [
                538
            ],
            "logicalOperator": [
                467
            ],
            "objectMetadataId": [
                538
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                538
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
                538
            ],
            "id": [
                538
            ],
            "operand": [
                469
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                7
            ],
            "relationFieldMetadataId": [
                538
            ],
            "rowLevelPermissionPredicateGroupId": [
                538
            ],
            "subFieldName": [
                1
            ],
            "value": [
                328
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
                472
            ],
            "messages": [
                472
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                328
            ],
            "runAsWorkspaceMemberId": [
                538
            ],
            "thread": [
                475
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
                538
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
                471
            ],
            "content": [
                1
            ],
            "role": [
                473
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
                328
            ],
            "runId": [
                538
            ],
            "status": [
                1
            ],
            "success": [
                5
            ],
            "threadId": [
                538
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
                538
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                478
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
                538
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                478
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
                538
            ],
            "id": [
                538
            ],
            "position": [
                7
            ],
            "tsVectorFieldMetadataId": [
                538
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
                538
            ],
            "messageChannelId": [
                538
            ],
            "messageThreadId": [
                538
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
                538
            ],
            "messageThreadId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                538
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
                484
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
                487
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
                538
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
                328
            ],
            "workspaceMemberIds": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                538
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
                681
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
                328
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                538
            ],
            "createdAt": [
                214
            ],
            "frontComponentId": [
                538
            ],
            "icon": [
                1
            ],
            "id": [
                538
            ],
            "position": [
                7
            ],
            "scope": [
                498
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                538
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
                538
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
                538
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                478
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
                693
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
                538
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
                538
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
                460
            ],
            "configurationType": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                691
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
                440,
                {
                    "input": [
                        196,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                346,
                {
                    "input": [
                        347,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                15,
                {
                    "agentUniversalIdentifier": [
                        538
                    ],
                    "runId": [
                        538
                    ],
                    "threadId": [
                        538
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
                513
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                668
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
                538
            ],
            "createdAt": [
                214
            ],
            "emit": [
                517
            ],
            "frontComponentUniversalIdentifier": [
                538
            ],
            "icon": [
                1
            ],
            "id": [
                538
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
                538
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                538
            ],
            "universalIdentifier": [
                538
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
                538
            ],
            "on": [
                1
            ],
            "through": [
                518
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                538
            ],
            "relationFieldUniversalIdentifier": [
                538
            ],
            "triggerFieldUniversalIdentifiers": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                668
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
                328
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
                538
            ],
            "personFilter": [
                328
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
                538
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
                538
            ],
            "gt": [
                538
            ],
            "gte": [
                538
            ],
            "iLike": [
                538
            ],
            "in": [
                538
            ],
            "is": [
                5
            ],
            "isNot": [
                5
            ],
            "like": [
                538
            ],
            "lt": [
                538
            ],
            "lte": [
                538
            ],
            "neq": [
                538
            ],
            "notILike": [
                538
            ],
            "notIn": [
                538
            ],
            "notLike": [
                538
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
                538
            ],
            "name": [
                1
            ],
            "updatedAt": [
                214
            ],
            "visibility": [
                542
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
                538
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
                538
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                328
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
                328
            ],
            "roleId": [
                538
            ],
            "triggers": [
                328
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
                538
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
                538
            ],
            "isSyncEnabled": [
                5
            ],
            "messagingProviderUniversalIdentifier": [
                538
            ],
            "visibility": [
                365
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
                549
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
                551
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
                538
            ],
            "update": [
                553
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
                538
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
                538
            ],
            "isPinned": [
                5
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                328
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
                328
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                538
            ],
            "options": [
                328
            ],
            "settings": [
                328
            ],
            "translations": [
                377
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
                538
            ],
            "update": [
                558
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
                538
            ],
            "update": [
                562
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                328
            ],
            "databaseEventTriggerSettings": [
                328
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                328
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
                328
            ],
            "workflowActionTriggerSettings": [
                328
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                538
            ],
            "update": [
                564
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                538
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
                538
            ],
            "update": [
                566
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                360
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
                367
            ],
            "visibility": [
                365
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                538
            ],
            "update": [
                568
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
                538
            ],
            "update": [
                568
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
                538
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
                538
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
                538
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
                538
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
                396
            ],
            "shortcut": [
                1
            ],
            "translations": [
                377
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                538
            ],
            "update": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                538
            ],
            "update": [
                570
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                538
            ],
            "update": [
                571
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
                538
            ],
            "type": [
                412
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
                411
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
                538
            ],
            "layoutMode": [
                411
            ],
            "position": [
                7
            ],
            "title": [
                1
            ],
            "widgets": [
                579
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
                328
            ],
            "configuration": [
                328
            ],
            "isActive": [
                5
            ],
            "objectMetadataId": [
                538
            ],
            "pageLayoutTabId": [
                538
            ],
            "position": [
                328
            ],
            "title": [
                1
            ],
            "type": [
                669
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
                328
            ],
            "configuration": [
                328
            ],
            "id": [
                538
            ],
            "objectMetadataId": [
                538
            ],
            "pageLayoutTabId": [
                538
            ],
            "position": [
                328
            ],
            "title": [
                1
            ],
            "type": [
                669
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
                538
            ],
            "tabs": [
                577
            ],
            "type": [
                412
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                538
            ],
            "update": [
                582
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
                538
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
                538
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "translations": [
                377
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                538
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
                538
            ],
            "update": [
                588
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
                538
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
                538
            ],
            "update": [
                590
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
                538
            ],
            "update": [
                592
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                538
            ],
            "logicalOperator": [
                657
            ],
            "parentViewFilterGroupId": [
                538
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "viewId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                538
            ],
            "update": [
                595
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                538
            ],
            "operand": [
                658
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                538
            ],
            "subFieldName": [
                1
            ],
            "value": [
                328
            ],
            "viewFilterGroupId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                538
            ],
            "update": [
                597
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                538
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
                538
            ],
            "calendarFieldMetadataId": [
                538
            ],
            "calendarLayout": [
                651
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                538
            ],
            "isCompact": [
                5
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                538
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                538
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                661
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "translations": [
                377
            ],
            "type": [
                664
            ],
            "visibility": [
                665
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                538
            ],
            "update": [
                600
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                663
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
                538
            ],
            "update": [
                602
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
                538
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
                328
            ],
            "allowImpersonation": [
                5
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                538
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
                680
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                328
            ],
            "workspaceMemberId": [
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                538
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "viewFieldId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                609
            ],
            "id": [
                538
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
                609
            ],
            "groups": [
                610
            ],
            "widgetId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                398
            ],
            "roleId": [
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                538
            ],
            "predicateGroups": [
                466
            ],
            "predicates": [
                468
            ],
            "roleId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                465
            ],
            "predicates": [
                464
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                620
            ],
            "viewFields": [
                617
            ],
            "viewFilterGroups": [
                618
            ],
            "viewFilters": [
                619
            ],
            "viewSorts": [
                621
            ],
            "widgetId": [
                538
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
                538
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                538
            ],
            "logicalOperator": [
                657
            ],
            "parentViewFilterGroupId": [
                538
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
                538
            ],
            "id": [
                538
            ],
            "operand": [
                658
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                538
            ],
            "subFieldName": [
                1
            ],
            "value": [
                328
            ],
            "viewFilterGroupId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                538
            ],
            "calendarFieldMetadataId": [
                538
            ],
            "calendarLayout": [
                651
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                538
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                538
            ],
            "openRecordIn": [
                661
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                664
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                663
            ],
            "fieldMetadataId": [
                538
            ],
            "id": [
                538
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
                635
            ],
            "usageByApplication": [
                624
            ],
            "usageByModel": [
                624
            ],
            "usageByOperationType": [
                624
            ],
            "usageByUser": [
                624
            ],
            "userDailyUsage": [
                637
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                627
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
                538
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                101
            ],
            "operationType": [
                627
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                634
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                636
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
                636
            ],
            "operationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                626
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                630
            ],
            "resourceType": [
                634
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                628
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
                627
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                636
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
                627
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                634
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                636
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
                538
            ],
            "isEnforced": [
                5
            ],
            "limitValue": [
                101
            ],
            "operationType": [
                627
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
                634
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
                636
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
                635
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
                642
            ],
            "currentWorkspace": [
                674
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
                538
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
                404
            ],
            "previousOnboardingStatus": [
                404
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                214
            ],
            "userVars": [
                329
            ],
            "userWorkspaces": [
                642
            ],
            "workspaceMember": [
                683
            ],
            "workspaceMembers": [
                683
            ],
            "workspaces": [
                642
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
                328
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
                538
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
                538
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
                538
            ],
            "isImpersonating": [
                5
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                397
            ],
            "objectsPermissions": [
                397
            ],
            "permissionFlags": [
                421
            ],
            "twoFactorAuthenticationMethodSummary": [
                534
            ],
            "updatedAt": [
                214
            ],
            "user": [
                638
            ],
            "userId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                538
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
                538
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
                538
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                538
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
                538
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
                692
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
                538
            ],
            "calendarEndFieldMetadataId": [
                538
            ],
            "calendarFieldMetadataId": [
                538
            ],
            "calendarLayout": [
                651
            ],
            "createdAt": [
                214
            ],
            "createdByUserWorkspaceId": [
                538
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
                538
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
                538
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                660
            ],
            "mainGroupByFieldMetadataId": [
                538
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                538
            ],
            "openRecordIn": [
                661
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                664
            ],
            "universalIdentifier": [
                538
            ],
            "updatedAt": [
                214
            ],
            "viewFieldGroups": [
                654
            ],
            "viewFields": [
                653
            ],
            "viewFilterGroups": [
                656
            ],
            "viewFilters": [
                655
            ],
            "viewGroups": [
                659
            ],
            "viewSorts": [
                662
            ],
            "visibility": [
                665
            ],
            "workspaceId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                668
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
                538
            ],
            "createdAt": [
                214
            ],
            "deletedAt": [
                214
            ],
            "fieldMetadataId": [
                538
            ],
            "id": [
                538
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
                538
            ],
            "updatedAt": [
                214
            ],
            "viewFieldGroupId": [
                538
            ],
            "viewId": [
                538
            ],
            "workspaceId": [
                538
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
                538
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
                653
            ],
            "viewId": [
                538
            ],
            "workspaceId": [
                538
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
                538
            ],
            "id": [
                538
            ],
            "operand": [
                658
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                538
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                214
            ],
            "value": [
                328
            ],
            "viewFilterGroupId": [
                538
            ],
            "viewId": [
                538
            ],
            "workspaceId": [
                538
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
                538
            ],
            "logicalOperator": [
                657
            ],
            "parentViewFilterGroupId": [
                538
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "updatedAt": [
                214
            ],
            "viewId": [
                538
            ],
            "workspaceId": [
                538
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
                538
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
                538
            ],
            "workspaceId": [
                538
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
                663
            ],
            "fieldMetadataId": [
                538
            ],
            "id": [
                538
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                214
            ],
            "viewId": [
                538
            ],
            "workspaceId": [
                538
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
                538
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
                538
            ],
            "operations": [
                1
            ],
            "role": [
                461
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
                332
            ],
            "on_MessageCampaignBodyConfiguration": [
                356
            ],
            "on_MessageCampaignDetailsConfiguration": [
                357
            ],
            "on_NotesConfiguration": [
                388
            ],
            "on_PieChartConfiguration": [
                422
            ],
            "on_RecordTableConfiguration": [
                451
            ],
            "on_StandaloneRichTextConfiguration": [
                505
            ],
            "on_TasksConfiguration": [
                515
            ],
            "on_TimelineConfiguration": [
                519
            ],
            "on_ViewConfiguration": [
                652
            ],
            "on_WorkflowConfiguration": [
                671
            ],
            "on_WorkflowRunConfiguration": [
                672
            ],
            "on_WorkflowVersionConfiguration": [
                673
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
                668
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                668
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                675
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
                328
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
                461
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
                538
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
                538
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
                653
            ],
            "viewFilterGroups": [
                656
            ],
            "viewFilters": [
                655
            ],
            "viewGroups": [
                659
            ],
            "viewSorts": [
                662
            ],
            "views": [
                650
            ],
            "workspaceCustomApplication": [
                49
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                680
            ],
            "workspaceMembersCount": [
                7
            ],
            "workspaceUrls": [
                692
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
                328
            ],
            "isBookCallOnboardingStepPending": [
                5
            ],
            "outcome": [
                677
            ],
            "personEnrichment": [
                328
            ],
            "personOutcome": [
                690
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
                538
            ],
            "roleId": [
                538
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
                685
            ],
            "id": [
                538
            ],
            "locale": [
                1
            ],
            "name": [
                292
            ],
            "numberFormat": [
                686
            ],
            "openRecordIn": [
                407
            ],
            "roles": [
                461
            ],
            "timeFormat": [
                687
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
                538
            ],
            "userWorkspaceId": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                538
            ],
            "variables": [
                639
            ],
            "workspaceMemberId": [
                538
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
                328
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
                538
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
                538
            ],
            "workspaceUrls": [
                692
            ],
            "__typename": [
                1
            ]
        }
    }
}