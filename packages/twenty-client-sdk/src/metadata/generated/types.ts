export default {
    "scalars": [
        1,
        4,
        6,
        7,
        10,
        12,
        14,
        17,
        24,
        26,
        29,
        32,
        34,
        41,
        54,
        62,
        72,
        78,
        90,
        94,
        95,
        97,
        102,
        107,
        113,
        118,
        124,
        127,
        128,
        129,
        130,
        138,
        140,
        154,
        158,
        160,
        162,
        208,
        209,
        236,
        240,
        241,
        243,
        253,
        259,
        263,
        267,
        270,
        277,
        292,
        299,
        301,
        312,
        319,
        320,
        321,
        333,
        335,
        351,
        352,
        353,
        354,
        355,
        356,
        358,
        359,
        360,
        363,
        364,
        366,
        367,
        370,
        372,
        376,
        380,
        389,
        396,
        397,
        398,
        401,
        405,
        406,
        411,
        415,
        438,
        440,
        441,
        444,
        449,
        461,
        463,
        467,
        472,
        492,
        504,
        505,
        507,
        532,
        534,
        536,
        600,
        620,
        627,
        629,
        633,
        644,
        650,
        651,
        653,
        654,
        656,
        657,
        658,
        661,
        662,
        663,
        668,
        670,
        673,
        678,
        679,
        680,
        683,
        684
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
                319
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
                532
            ],
            "createdAt": [
                209
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                532
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
                319
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
                319
            ],
            "roleId": [
                532
            ],
            "triggers": [
                319
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "applicationId": [
                532
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                532
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
                532
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
                532
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelSummary": {
            "assignedToMeCount": [
                10
            ],
            "channelId": [
                532
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
            "openCount": [
                10
            ],
            "snoozedCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "AgentChatChannelThreadIds": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                4
            ],
            "threadIds": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                319
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
            "hasUnreadAssignedThread": [
                4
            ],
            "hasUnreadMentionThread": [
                4
            ],
            "hasUnreadOpenThread": [
                4
            ],
            "needsInputThreadCount": [
                10
            ],
            "openThreadCount": [
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
                209
            ],
            "deletedAt": [
                209
            ],
            "id": [
                17
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
                209
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                209
            ],
            "id": [
                532
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                209
            ],
            "lastReadAt": [
                209
            ],
            "snoozedUntil": [
                209
            ],
            "threadId": [
                532
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                532
            ],
            "createdAt": [
                209
            ],
            "id": [
                532
            ],
            "parts": [
                21
            ],
            "processedAt": [
                209
            ],
            "reactions": [
                22
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                532
            ],
            "senderWorkspaceMemberId": [
                532
            ],
            "status": [
                1
            ],
            "threadId": [
                532
            ],
            "turnId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                209
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                532
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                532
            ],
            "messageId": [
                532
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                319
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
                319
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                319
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
                532
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                209
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
                209
            ],
            "errorMessage": [
                1
            ],
            "id": [
                532
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
                209
            ],
            "status": [
                24
            ],
            "threadId": [
                532
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
                532
            ],
            "aggregateOperation": [
                26
            ],
            "configurationType": [
                661
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                319
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "label": [
                1
            ],
            "numberFormat": [
                140
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                433
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
        "AiChatUsage": {
            "consumedValue": [
                97
            ],
            "kind": [
                1
            ],
            "limitValue": [
                97
            ],
            "periodEnd": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                97
            ],
            "limitValue": [
                97
            ],
            "periodEnd": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "AiModelTier": {},
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                10
            ],
            "sections": [
                31
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
                209
            ],
            "expiresAt": [
                209
            ],
            "id": [
                532
            ],
            "name": [
                1
            ],
            "revokedAt": [
                209
            ],
            "role": [
                455
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                209
            ],
            "id": [
                532
            ],
            "name": [
                1
            ],
            "revokedAt": [
                209
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
                17
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
                158
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
                41
            ],
            "value": [
                319
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
                44
            ],
            "receivedAt": [
                209
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
                532
            ],
            "role": [
                360
            ],
            "workspaceMemberId": [
                532
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
                74
            ],
            "applicationRegistrationId": [
                532
            ],
            "applicationVariables": [
                77
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                319
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                153
            ],
            "createdAt": [
                209
            ],
            "defaultLogicFunctionRole": [
                455
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                284
            ],
            "healthCheckLogicFunctionId": [
                532
            ],
            "id": [
                532
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                332
            ],
            "logoFileId": [
                532
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                382
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                532
            ],
            "settingsCustomTabFrontComponentId": [
                532
            ],
            "settingsMenuItems": [
                491
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                532
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                209
            ],
            "id": [
                532
            ],
            "lastAuthorizedAt": [
                209
            ],
            "lastUsedAt": [
                209
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                532
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                532
            ],
            "archivedAt": [
                209
            ],
            "authFailedAt": [
                209
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                429
            ],
            "connectionProviderId": [
                532
            ],
            "createdAt": [
                209
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                532
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                209
            ],
            "lastSignedInAt": [
                209
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                158
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                209
            ],
            "userWorkspaceId": [
                532
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
                532
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                50
            ],
            "scope": [
                162
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
                52
            ],
            "coverage": [
                53
            ],
            "files": [
                55
            ],
            "manifest": [
                319
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
                72
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
                54
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
                532
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
                277
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
                277
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
                209
            ],
            "fileFolder": [
                277
            ],
            "fileId": [
                532
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
                60
            ],
            "description": [
                1
            ],
            "status": [
                62
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
                64
            ],
            "bucketSizeInSeconds": [
                10
            ],
            "creditUsage": [
                65
            ],
            "creditsUsed": [
                6
            ],
            "failedRunCount": [
                10
            ],
            "functions": [
                66
            ],
            "issues": [
                67
            ],
            "lifecycle": [
                68
            ],
            "lifecycleFailureCount": [
                10
            ],
            "lookbackInHours": [
                10
            ],
            "periodEnd": [
                209
            ],
            "periodStart": [
                209
            ],
            "rateLimitEventCount": [
                10
            ],
            "runCount": [
                10
            ],
            "versions": [
                69
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                209
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
                209
            ],
            "creditsUsed": [
                6
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
                209
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
                209
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
                532
            ],
            "connectionProviders": [
                49
            ],
            "settingsMenuItems": [
                491
            ],
            "variables": [
                632
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                209
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                532
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
            "isVetted": [
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
                532
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                72
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                209
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
                206
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
                642
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                532
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                72
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                209
            ],
            "description": [
                1
            ],
            "id": [
                532
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
                319
            ],
            "type": [
                1
            ],
            "updatedAt": [
                209
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
                82
            ],
            "applicationRefreshToken": [
                82
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
                532
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
                319
            ],
            "scope": [
                78
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
                209
            ],
            "domain": [
                1
            ],
            "id": [
                532
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
                471
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                209
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
                82
            ],
            "refreshToken": [
                82
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                83
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
                532
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
                470
            ],
            "workspaceUrls": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                87
            ],
            "availableWorkspacesForSignUp": [
                87
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                88
            ],
            "tokens": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                532
            ],
            "aggregateOperation": [
                26
            ],
            "axisNameDisplay": [
                90
            ],
            "color": [
                1
            ],
            "configurationType": [
                661
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
                319
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupMode": [
                94
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                95
            ],
            "numberFormat": [
                140
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                396
            ],
            "primaryAxisGroupByFieldMetadataId": [
                532
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                299
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                396
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                532
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                299
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
                319
            ],
            "formattedToRawLookup": [
                319
            ],
            "groupMode": [
                94
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
                95
            ],
            "series": [
                96
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
                319
            ],
            "objectMetadataId": [
                532
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
                122
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
                532
            ],
            "userCreditsFallback": [
                633
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
                117
            ],
            "currentBillingSubscription": [
                117
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                505
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                102
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
                114
            ],
            "name": [
                1
            ],
            "prices": [
                108
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
                114
            ],
            "name": [
                1
            ],
            "prices": [
                109
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
                103
            ],
            "downgradePlanKeys": [
                107
            ],
            "isCheckoutDefault": [
                4
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                104
            ],
            "planKey": [
                107
            ],
            "resourceCreditProducts": [
                103
            ],
            "upgradePlanKeys": [
                107
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
                124
            ],
            "recurringInterval": [
                504
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
                124
            ],
            "recurringInterval": [
                504
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                110
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
                114
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
                114
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                103
            ],
            "on_BillingMeteredProduct": [
                104
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
                107
            ],
            "priceUsageBased": [
                124
            ],
            "productKey": [
                113
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                209
            ],
            "periodStart": [
                209
            ],
            "productKey": [
                113
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
                119
            ],
            "cancelAt": [
                209
            ],
            "collectionMethod": [
                118
            ],
            "currentPeriodEnd": [
                209
            ],
            "hasUserCredits": [
                4
            ],
            "id": [
                532
            ],
            "interval": [
                504
            ],
            "metadata": [
                319
            ],
            "phases": [
                120
            ],
            "status": [
                505
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                112
            ],
            "creditAmount": [
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                532
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
                121
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
                117
            ],
            "currentBillingSubscription": [
                117
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
                532
            ],
            "contactAutoCreationPolicy": [
                127
            ],
            "createdAt": [
                209
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                532
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                128
            ],
            "syncStageStartedAt": [
                209
            ],
            "syncStatus": [
                129
            ],
            "syncedAt": [
                209
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                209
            ],
            "visibility": [
                130
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
                661
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                661
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
                138
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
                661
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                319
            ],
            "error": [
                143
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
                661
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
                376
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                378
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
                29
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                147
            ],
            "aiModelTiers": [
                149
            ],
            "aiModels": [
                148
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                35
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                81
            ],
            "billing": [
                98
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                137
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
                151
            ],
            "publicFeatureFlags": [
                427
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                489
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                506
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                209
            ],
            "link": [
                1
            ],
            "startAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                32
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
                532
            ],
            "availabilityObjectMetadataId": [
                532
            ],
            "availabilityType": [
                154
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                532
            ],
            "createdAt": [
                209
            ],
            "engineComponentKey": [
                243
            ],
            "frontComponent": [
                284
            ],
            "frontComponentId": [
                532
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                532
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
                532
            ],
            "pageLayoutId": [
                532
            ],
            "payload": [
                155
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                209
            ],
            "workflowVersionId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                388
            ],
            "on_PathCommandMenuItemPayload": [
                413
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                56
            ],
            "files": [
                275
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                532
            ],
            "archivedAt": [
                209
            ],
            "authFailedAt": [
                209
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                429
            ],
            "connectionProviderId": [
                532
            ],
            "createdAt": [
                209
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                532
            ],
            "lastCredentialsRefreshedAt": [
                209
            ],
            "lastSignedInAt": [
                209
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                158
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                209
            ],
            "userWorkspaceId": [
                532
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
                304
            ],
            "handle": [
                1
            ],
            "id": [
                532
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                236
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
                532
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
                319
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
                319
            ],
            "roleId": [
                532
            ],
            "triggers": [
                319
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                532
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                532
            ],
            "participantHandleFieldUniversalIdentifier": [
                532
            ],
            "visibility": [
                356
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                57
            ],
            "targets": [
                59
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                71
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
            "availabilityObjectMetadataId": [
                532
            ],
            "availabilityType": [
                154
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                532
            ],
            "engineComponentKey": [
                243
            ],
            "frontComponentId": [
                532
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
                532
            ],
            "pageLayoutId": [
                532
            ],
            "payload": [
                319
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                532
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
                350
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
                319
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
                319
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                532
            ],
            "options": [
                319
            ],
            "relationCreationPayload": [
                319
            ],
            "settings": [
                319
            ],
            "type": [
                270
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
                532
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
                532
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
                179
            ],
            "indexType": [
                312
            ],
            "objectMetadataId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                319
            ],
            "databaseEventTriggerSettings": [
                319
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                319
            ],
            "id": [
                532
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                319
            ],
            "source": [
                319
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                319
            ],
            "universalIdentifier": [
                532
            ],
            "workflowActionTriggerSettings": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                532
            ],
            "id": [
                532
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                532
            ],
            "color": [
                1
            ],
            "folderId": [
                532
            ],
            "icon": [
                1
            ],
            "id": [
                532
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                532
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                532
            ],
            "targetRecordId": [
                532
            ],
            "type": [
                380
            ],
            "userWorkspaceId": [
                532
            ],
            "viewId": [
                532
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
                319
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
                177
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                180
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                185
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
                532
            ],
            "type": [
                406
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                405
            ],
            "pageLayoutId": [
                532
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
                319
            ],
            "objectMetadataId": [
                532
            ],
            "pageLayoutTabId": [
                532
            ],
            "position": [
                319
            ],
            "title": [
                1
            ],
            "type": [
                662
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                532
            ],
            "filter": [
                319
            ],
            "objectMetadataId": [
                532
            ],
            "orderBy": [
                319
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
                532
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
                536
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                97
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                97
            ],
            "operationType": [
                620
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                627
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                629
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
                532
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                532
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                26
            ],
            "fieldMetadataId": [
                532
            ],
            "id": [
                532
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
                532
            ],
            "viewId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                532
            ],
            "logicalOperator": [
                650
            ],
            "parentViewFilterGroupId": [
                532
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                532
            ],
            "id": [
                532
            ],
            "operand": [
                651
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                532
            ],
            "subFieldName": [
                1
            ],
            "value": [
                319
            ],
            "viewFilterGroupId": [
                532
            ],
            "viewId": [
                532
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
                532
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                532
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
                532
            ],
            "calendarFieldMetadataId": [
                532
            ],
            "calendarLayout": [
                644
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                532
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                532
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                653
            ],
            "mainGroupByFieldMetadataId": [
                532
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                532
            ],
            "openRecordIn": [
                654
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                657
            ],
            "visibility": [
                658
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                656
            ],
            "fieldMetadataId": [
                532
            ],
            "id": [
                532
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                532
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
                532
            ],
            "operations": [
                1
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
            "label": [
                1
            ],
            "operation": [
                620
            ],
            "resource": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                160
            ],
            "before": [
                160
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                532
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                532
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
                532
            ],
            "name": [
                287
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                532
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
                532
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                229
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
                532
            ],
            "pageLayoutId": [
                532
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
                532
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
                532
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                472
            ],
            "type": [
                301
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                532
            ],
            "status": [
                472
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                161
            ],
            "IMAP": [
                161
            ],
            "SMTP": [
                161
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
                661
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                209
            ],
            "domain": [
                1
            ],
            "id": [
                532
            ],
            "status": [
                240
            ],
            "tenantStatus": [
                241
            ],
            "unsubscribeHostnameStatus": [
                534
            ],
            "updatedAt": [
                209
            ],
            "verificationRecords": [
                639
            ],
            "verifiedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                661
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
                319
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
                319
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
                245
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                319
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
                209
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
                209
            ],
            "currentPeriodEnd": [
                209
            ],
            "expiresAt": [
                209
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
                209
            ],
            "start": [
                209
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
                253
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
                251
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                252
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
                254
            ],
            "first": [
                10
            ],
            "table": [
                259
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                255
            ],
            "records": [
                258
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
                319
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                209
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
                365
            ],
            "objectRecordEventsWithQueryIds": [
                395
            ],
            "queueJobEvents": [
                322
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                532
            ],
            "payload": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                263
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
                532
            ],
            "createdAt": [
                209
            ],
            "defaultValue": [
                319
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
                532
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
            "morphId": [
                532
            ],
            "morphRelations": [
                448
            ],
            "name": [
                1
            ],
            "object": [
                382
            ],
            "objectMetadataId": [
                532
            ],
            "options": [
                319
            ],
            "relation": [
                448
            ],
            "settings": [
                319
            ],
            "type": [
                270
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                209
            ],
            "writability": [
                372
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                661
            ],
            "fieldDisplayMode": [
                267
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
                268
            ],
            "pageInfo": [
                402
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                160
            ],
            "node": [
                264
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                269
            ],
            "id": [
                533
            ],
            "isActive": [
                125
            ],
            "isSystem": [
                125
            ],
            "isUIEditable": [
                125
            ],
            "isUIReadOnly": [
                125
            ],
            "objectMetadataId": [
                533
            ],
            "or": [
                269
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
                532
            ],
            "id": [
                532
            ],
            "objectMetadataId": [
                532
            ],
            "roleId": [
                532
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
                532
            ],
            "objectMetadataId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                661
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
                209
            ],
            "id": [
                532
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
                532
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
                209
            ],
            "fileId": [
                532
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
                209
            ],
            "id": [
                532
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
                661
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                532
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                472
            ],
            "type": [
                301
            ],
            "workspace": [
                682
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
                363
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                661
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
                532
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                76
            ],
            "applicationVariables": [
                319
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
                209
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                532
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
                532
            ],
            "updatedAt": [
                209
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                286
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                661
            ],
            "frontComponentId": [
                532
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                532
            ],
            "pageLayoutType": [
                406
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
        "GetApiKeyInput": {
            "id": [
                532
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
                532
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
                532
            ],
            "workspaceInviteHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedProgress": {
            "completedSteps": [
                292
            ],
            "creditsEarned": [
                6
            ],
            "isHidden": [
                4
            ],
            "selectedStep": [
                292
            ],
            "snoozedUntil": [
                1
            ],
            "stepRewards": [
                293
            ],
            "steps": [
                292
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStep": {},
        "GettingStartedStepReward": {
            "creditsEach": [
                6
            ],
            "remainingCount": [
                10
            ],
            "step": [
                292
            ],
            "__typename": [
                1
            ]
        },
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
                296
            ],
            "step": [
                292
            ],
            "trigger": [
                297
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
                663
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
                532
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
                661
            ],
            "url": [
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
                305
            ],
            "IMAP": [
                305
            ],
            "SMTP": [
                305
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
                236
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
                82
            ],
            "workspace": [
                686
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
                532
            ],
            "threadId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                532
            ],
            "createdAt": [
                209
            ],
            "id": [
                532
            ],
            "indexFieldMetadataList": [
                310
            ],
            "indexType": [
                312
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
                209
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                160
            ],
            "node": [
                308
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                209
            ],
            "fieldMetadataId": [
                532
            ],
            "id": [
                532
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                311
            ],
            "id": [
                533
            ],
            "isCustom": [
                125
            ],
            "or": [
                311
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                532
            ],
            "messages": [
                43
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                315
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
                532
            ],
            "messageThreadId": [
                532
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
                321
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                532
            ],
            "aggregateOperation": [
                26
            ],
            "axisNameDisplay": [
                90
            ],
            "color": [
                1
            ],
            "configurationType": [
                661
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
                319
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
                140
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                396
            ],
            "primaryAxisGroupByFieldMetadataId": [
                532
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                299
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                396
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                532
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                299
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
                319
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                327
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
                319
            ],
            "objectMetadataId": [
                532
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
                326
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
                158
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                532
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
                532
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                209
            ],
            "cronTriggerSettings": [
                319
            ],
            "databaseEventTriggerSettings": [
                319
            ],
            "description": [
                1
            ],
            "executionMode": [
                333
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                319
            ],
            "id": [
                532
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
                319
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                209
            ],
            "workflowActionTriggerSettings": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                319
            ],
            "duration": [
                6
            ],
            "error": [
                319
            ],
            "logs": [
                1
            ],
            "status": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "LogicFunctionIdInput": {
            "id": [
                17
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                532
            ],
            "applicationUniversalIdentifier": [
                532
            ],
            "id": [
                532
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                82
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
            "isVetted": [
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
            "isVetted": [
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
                319
            ],
            "name": [
                1
            ],
            "objects": [
                342
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                343
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                72
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
                344
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                345
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
                532
            ],
            "connectionProviderId": [
                532
            ],
            "createdAt": [
                209
            ],
            "id": [
                532
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
            "updatedAt": [
                209
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
                661
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                661
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
                157
            ],
            "connectedAccountId": [
                532
            ],
            "contactAutoCreationPolicy": [
                351
            ],
            "createdAt": [
                209
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
                532
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
                358
            ],
            "messagingProviderUniversalIdentifier": [
                532
            ],
            "participantHandleFieldUniversalIdentifier": [
                532
            ],
            "pendingGroupEmailsAction": [
                352
            ],
            "syncStage": [
                353
            ],
            "syncStageStartedAt": [
                209
            ],
            "syncStatus": [
                354
            ],
            "syncedAt": [
                209
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                209
            ],
            "type": [
                355
            ],
            "updatedAt": [
                209
            ],
            "visibility": [
                356
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
                209
            ],
            "externalId": [
                1
            ],
            "id": [
                532
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                532
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                359
            ],
            "updatedAt": [
                209
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
                209
            ],
            "emailAddress": [
                1
            ],
            "id": [
                532
            ],
            "reason": [
                363
            ],
            "source": [
                364
            ],
            "unsubscribeTopicId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                361
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
                394
            ],
            "recordId": [
                1
            ],
            "type": [
                366
            ],
            "updatedCollectionHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEventAction": {},
        "MetadataReadability": {},
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
                532
            ],
            "property": [
                1
            ],
            "provenance": [
                370
            ],
            "recordId": [
                532
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
                532
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                152
            ],
            "objectMetadataItems": [
                374
            ],
            "views": [
                375
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
                532
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
                532
            ],
            "key": [
                653
            ],
            "objectMetadataId": [
                532
            ],
            "type": [
                657
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                498,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                667,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                22,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        532,
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
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        532
                    ],
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        532,
                        "UUID!"
                    ],
                    "roleId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        532,
                        "UUID!"
                    ],
                    "roleId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        307,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                85,
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
                136,
                {
                    "input": [
                        135,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                123
            ],
            "cancelSwitchBillingPlan": [
                123
            ],
            "cancelSwitchResourceCreditPrice": [
                123
            ],
            "checkCustomDomainValidRecords": [
                230
            ],
            "checkPublicDomainValidRecords": [
                230,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                116,
                {
                    "plan": [
                        107,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        504,
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
                71,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                71,
                {
                    "fileId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                156,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        532,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                400,
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
                279,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                279,
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
                279,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                279,
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
                        163,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                36,
                {
                    "input": [
                        165,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                350,
                {
                    "input": [
                        166,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                167,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        58,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                168,
                {
                    "input": [
                        169,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                79,
                {
                    "input": [
                        170,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                105
            ],
            "createCalendarEvent": [
                172,
                {
                    "input": [
                        171,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                16,
                {
                    "channelId": [
                        532
                    ]
                }
            ],
            "createCommandMenuItem": [
                153,
                {
                    "input": [
                        173,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                228,
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
                175,
                {
                    "input": [
                        174,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                239,
                {
                    "input": [
                        176,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                278,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        277,
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
                284,
                {
                    "input": [
                        178,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                379,
                {
                    "inputs": [
                        184,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                647,
                {
                    "inputs": [
                        198,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                646,
                {
                    "inputs": [
                        199,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                652,
                {
                    "inputs": [
                        202,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                346,
                {
                    "input": [
                        182,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                361,
                {
                    "input": [
                        183,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                379,
                {
                    "input": [
                        184,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                278,
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
                495,
                {
                    "input": [
                        493,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                33,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        532,
                        "UUID!"
                    ],
                    "properties": [
                        319
                    ],
                    "recordId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        164,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                264,
                {
                    "input": [
                        186,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                308,
                {
                    "input": [
                        187,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                332,
                {
                    "input": [
                        181,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                382,
                {
                    "input": [
                        188,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                455,
                {
                    "createRoleInput": [
                        193,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                403,
                {
                    "input": [
                        189,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                404,
                {
                    "input": [
                        190,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                407,
                {
                    "input": [
                        191,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                426,
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
            "createSAMLIdentityProvider": [
                495,
                {
                    "input": [
                        494,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                498,
                {
                    "input": [
                        194,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                105,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        107,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        504,
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
                535,
                {
                    "input": [
                        195,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                618,
                {
                    "input": [
                        196,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                638,
                {
                    "input": [
                        197,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                643,
                {
                    "input": [
                        203,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                646,
                {
                    "input": [
                        199,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                647,
                {
                    "input": [
                        198,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                648,
                {
                    "input": [
                        201,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                649,
                {
                    "input": [
                        200,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                652,
                {
                    "input": [
                        202,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                655,
                {
                    "input": [
                        204,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                659,
                {
                    "input": [
                        205,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                498,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        532,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        532
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
                        41
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                350,
                {
                    "id": [
                        532,
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
                        210,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                153,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                157,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                667
            ],
            "deleteEmailGroupChannel": [
                350,
                {
                    "id": [
                        532,
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
                284,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                379,
                {
                    "ids": [
                        532,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                346,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                379,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                3,
                {
                    "input": [
                        19,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                264,
                {
                    "input": [
                        211,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                308,
                {
                    "input": [
                        212,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                332,
                {
                    "input": [
                        336,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                382,
                {
                    "input": [
                        213,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        532,
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
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                214,
                {
                    "input": [
                        215,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                498,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                216,
                {
                    "twoFactorAuthenticationMethodId": [
                        532,
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
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                631
            ],
            "deleteUserFromWorkspace": [
                635,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                638,
                {
                    "id": [
                        532,
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
                646,
                {
                    "input": [
                        218,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                647,
                {
                    "input": [
                        217,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                648,
                {
                    "input": [
                        219,
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
                652,
                {
                    "input": [
                        220,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        221,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                659,
                {
                    "id": [
                        532,
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
                646,
                {
                    "input": [
                        224,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                647,
                {
                    "input": [
                        223,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                648,
                {
                    "input": [
                        225,
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
                652,
                {
                    "input": [
                        226,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        227,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
                {
                    "input": [
                        307,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                157,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                231,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                232,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                233,
                {
                    "input": [
                        234,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                237,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        532
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                100
            ],
            "enqueueJob": [
                246,
                {
                    "input": [
                        244,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                248,
                {
                    "input": [
                        247,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                671
            ],
            "executeOneLogicFunction": [
                334,
                {
                    "input": [
                        261,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                38,
                {
                    "apiKeyId": [
                        532,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                76,
                {
                    "applicationId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                82
            ],
            "generateTransientToken": [
                515
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                529,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                84,
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
                84,
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
                84,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                530,
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
                289,
                {
                    "input": [
                        290,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                339,
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
                399
            ],
            "grantApplicationCapabilities": [
                47,
                {
                    "input": [
                        298,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                306,
                {
                    "userId": [
                        532,
                        "UUID!"
                    ],
                    "workspaceId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                314,
                {
                    "input": [
                        313,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                316,
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
                316
            ],
            "installApplication": [
                45,
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
                        532,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        532
                    ],
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                294,
                {
                    "step": [
                        292,
                        "GettingStartedStep!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                249
            ],
            "removeAgentChatMessageReaction": [
                22,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        450,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                442,
                {
                    "principal": [
                        439,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        447,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                76,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                84,
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
                        532,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        451,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                452,
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
                485,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                153,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                404,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                403,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                407,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                510,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                477,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                10
            ],
            "revokeApiKey": [
                36,
                {
                    "input": [
                        453,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                457,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                468,
                {
                    "input": [
                        464,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                61,
                {
                    "applicationId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                303,
                {
                    "connectionParameters": [
                        235,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        532
                    ]
                }
            ],
            "sendAppChannelMessage": [
                476,
                {
                    "input": [
                        475,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                477,
                {
                    "browsingContext": [
                        319
                    ],
                    "channelId": [
                        532
                    ],
                    "fileAttachments": [
                        276,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        532,
                        "[UUID!]"
                    ],
                    "messageId": [
                        532,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "shouldAssistantReply": [
                        4
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                480,
                {
                    "input": [
                        479,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                484,
                {
                    "input": [
                        483,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                485,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        532
                    ]
                }
            ],
            "sendMessageCampaign": [
                487,
                {
                    "input": [
                        486,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                482,
                {
                    "input": [
                        488,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                40,
                {
                    "input": [
                        490,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                249,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                442,
                {
                    "accessLevel": [
                        438,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        447,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                442,
                {
                    "accessLevel": [
                        438,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        439,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        447,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                123,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                89,
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
                89,
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
                496,
                {
                    "input": [
                        497
                    ]
                }
            ],
            "signUpInWorkspace": [
                496,
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
                        532
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
                400,
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
                        209,
                        "DateTime!"
                    ],
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                139,
                {
                    "connectedAccountId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                500,
                {
                    "companyContext": [
                        319
                    ],
                    "personContext": [
                        319
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                501
            ],
            "switchBillingPlan": [
                123,
                {
                    "plan": [
                        107
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                123
            ],
            "syncAppMessageFolders": [
                357,
                {
                    "input": [
                        508,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                681,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        319,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "trackAnalytics": [
                33,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        319
                    ],
                    "type": [
                        34,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                71,
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
                517,
                {
                    "input": [
                        516,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                521,
                {
                    "input": [
                        518,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                520,
                {
                    "input": [
                        519,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                525,
                {
                    "input": [
                        522,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                524,
                {
                    "input": [
                        523,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                527,
                {
                    "input": [
                        526,
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
                        532,
                        "UUID!"
                    ],
                    "input": [
                        537,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateAgentChatThreadInboxState": [
                18,
                {
                    "action": [
                        14,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        209
                    ],
                    "threadIds": [
                        532,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                36,
                {
                    "input": [
                        539,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                350,
                {
                    "input": [
                        540,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                45,
                {
                    "id": [
                        532,
                        "UUID!"
                    ],
                    "input": [
                        541,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                71,
                {
                    "input": [
                        542,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                75,
                {
                    "input": [
                        544,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                126,
                {
                    "input": [
                        546,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                153,
                {
                    "input": [
                        548,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                350,
                {
                    "input": [
                        549,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                284,
                {
                    "input": [
                        551,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                291,
                {
                    "input": [
                        553,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                262,
                {
                    "input": [
                        554,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                379,
                {
                    "inputs": [
                        567,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                382,
                {
                    "inputs": [
                        568,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                652,
                {
                    "inputs": [
                        590,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                346,
                {
                    "input": [
                        557,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                350,
                {
                    "input": [
                        559,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                357,
                {
                    "input": [
                        561,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                357,
                {
                    "input": [
                        563,
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
                379,
                {
                    "input": [
                        567,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        538,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        532
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
                264,
                {
                    "input": [
                        566,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        555,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                382,
                {
                    "input": [
                        568,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                455,
                {
                    "updateRoleInput": [
                        575,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                403,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        569,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                404,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        570,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                407,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        572,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                403,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        574,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                317,
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
                498,
                {
                    "input": [
                        577,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                510,
                {
                    "input": [
                        578,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                535,
                {
                    "input": [
                        579,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                618,
                {
                    "input": [
                        580,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                99,
                {
                    "userCreditsFallback": [
                        633,
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
                638,
                {
                    "input": [
                        581,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                643,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        592,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                646,
                {
                    "input": [
                        585,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                647,
                {
                    "input": [
                        583,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                648,
                {
                    "input": [
                        588,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                649,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        587,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                652,
                {
                    "input": [
                        590,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                655,
                {
                    "input": [
                        593,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                659,
                {
                    "input": [
                        595,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                667,
                {
                    "data": [
                        598,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                667,
                {
                    "data": [
                        597,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                676,
                {
                    "roleId": [
                        532,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        599,
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
                71,
                {
                    "file": [
                        600,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                275,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        600,
                        "Upload!"
                    ],
                    "fileFolder": [
                        277,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                279,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        600,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                279,
                {
                    "file": [
                        600,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                279,
                {
                    "file": [
                        600,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                279,
                {
                    "file": [
                        600,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                271,
                {
                    "upsertFieldPermissionsInput": [
                        601,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                643,
                {
                    "input": [
                        604,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                390,
                {
                    "upsertObjectPermissionsInput": [
                        605,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                456,
                {
                    "upsertPermissionFlagsInput": [
                        606,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                608,
                {
                    "input": [
                        607,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                643,
                {
                    "input": [
                        609,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                79,
                {
                    "input": [
                        636,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                640,
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
                89,
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
                239,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                641,
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
                532
            ],
            "applicationId": [
                532
            ],
            "color": [
                1
            ],
            "createdAt": [
                209
            ],
            "folderId": [
                532
            ],
            "icon": [
                1
            ],
            "id": [
                532
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                532
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                532
            ],
            "targetRecordId": [
                532
            ],
            "targetRecordIdentifier": [
                435
            ],
            "type": [
                380
            ],
            "updatedAt": [
                209
            ],
            "userWorkspaceId": [
                532
            ],
            "viewId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                532
            ],
            "color": [
                1
            ],
            "createdAt": [
                209
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
                385,
                {
                    "filter": [
                        269,
                        "FieldFilter!"
                    ],
                    "paging": [
                        207,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                264
            ],
            "icon": [
                1
            ],
            "id": [
                532
            ],
            "imageIdentifierFieldMetadataId": [
                532
            ],
            "indexMetadataList": [
                308
            ],
            "indexMetadatas": [
                387,
                {
                    "filter": [
                        311,
                        "IndexFilter!"
                    ],
                    "paging": [
                        207,
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
                532
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
                389
            ],
            "readability": [
                367
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                532
            ],
            "searchFieldMetadataList": [
                474
            ],
            "sharingReach": [
                397
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                209
            ],
            "writability": [
                372
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                384
            ],
            "pageInfo": [
                402
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                160
            ],
            "node": [
                382
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                268
            ],
            "pageInfo": [
                402
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                386
            ],
            "id": [
                533
            ],
            "isActive": [
                125
            ],
            "isRemote": [
                125
            ],
            "isSearchable": [
                125
            ],
            "isSystem": [
                125
            ],
            "isUICreatable": [
                125
            ],
            "isUIEditable": [
                125
            ],
            "isUIReadOnly": [
                125
            ],
            "or": [
                386
            ],
            "universalIdentifier": [
                533
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                309
            ],
            "pageInfo": [
                402
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                532
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
                532
            ],
            "restrictedFields": [
                319
            ],
            "rowLevelPermissionPredicateGroups": [
                459
            ],
            "rowLevelPermissionPredicates": [
                458
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
                532
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
                208
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                394
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
                319
            ],
            "before": [
                319
            ],
            "diff": [
                319
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
                393
            ],
            "queryIds": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "ObjectSharingReach": {},
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                398
            ],
            "previousOnboardingStatus": [
                398
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
                160
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                160
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                532
            ],
            "createdAt": [
                209
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                532
            ],
            "deletedAt": [
                209
            ],
            "id": [
                532
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
                532
            ],
            "tabs": [
                404
            ],
            "type": [
                406
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                532
            ],
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "icon": [
                1
            ],
            "id": [
                532
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
                405
            ],
            "pageLayoutId": [
                532
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                209
            ],
            "widgets": [
                407
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                532
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                319
            ],
            "configuration": [
                660
            ],
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "gridPosition": [
                300
            ],
            "id": [
                532
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
                532
            ],
            "pageLayoutTabId": [
                532
            ],
            "position": [
                410
            ],
            "title": [
                1
            ],
            "type": [
                662
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                405
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
                405
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
                408
            ],
            "on_PageLayoutWidgetGridPosition": [
                409
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                412
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                411
            ],
            "index": [
                10
            ],
            "layoutMode": [
                405
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
                532
            ],
            "createdAt": [
                209
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                532
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
                532
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                532
            ],
            "aggregateOperation": [
                26
            ],
            "color": [
                1
            ],
            "configurationType": [
                661
            ],
            "dateGranularity": [
                396
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
                319
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                532
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
                140
            ],
            "orderBy": [
                299
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
                419
            ],
            "formattedToRawLookup": [
                319
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
                319
            ],
            "objectMetadataId": [
                532
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
                331
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
                209
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                134
            ],
            "blockers": [
                349
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                532
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
                236
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
                532
            ],
            "createdAt": [
                209
            ],
            "domain": [
                1
            ],
            "id": [
                532
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
                263
            ],
            "metadata": [
                428
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
                425
            ],
            "IMAP": [
                425
            ],
            "SMTP": [
                425
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                80
            ],
            "authProviders": [
                81
            ],
            "displayName": [
                1
            ],
            "id": [
                532
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                685
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
                532
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
                11,
                {
                    "after": [
                        1
                    ],
                    "assignment": [
                        7
                    ],
                    "channelId": [
                        532,
                        "UUID!"
                    ],
                    "first": [
                        10
                    ],
                    "status": [
                        12
                    ]
                }
            ],
            "agentChatChannels": [
                5
            ],
            "agentChatOpenThreadsSummary": [
                15
            ],
            "agentRuns": [
                23,
                {
                    "agentId": [
                        532,
                        "UUID!"
                    ],
                    "limit": [
                        10,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                27
            ],
            "aiChatUserCreditsUsage": [
                28
            ],
            "apiKey": [
                36,
                {
                    "input": [
                        288,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                36
            ],
            "appConnection": [
                39,
                {
                    "id": [
                        17,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                39,
                {
                    "filter": [
                        328
                    ]
                }
            ],
            "appKeyValue": [
                40,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        41
                    ]
                }
            ],
            "appMessageChannels": [
                350,
                {
                    "filter": [
                        329
                    ]
                }
            ],
            "appMessageFolders": [
                357,
                {
                    "filter": [
                        330
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                48,
                {
                    "applicationId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                49,
                {
                    "applicationId": [
                        532,
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
                473,
                {
                    "applicationId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                92,
                {
                    "input": [
                        93,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPlans": [
                106
            ],
            "billingPortalSession": [
                116,
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
                532,
                {
                    "calendarEventId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                20,
                {
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                142,
                {
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                16,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                145,
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
                675,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                502,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                153,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                153
            ],
            "currentUser": [
                631
            ],
            "currentUserApplicationAuthorizations": [
                46
            ],
            "currentUserSessions": [
                634
            ],
            "currentWorkspace": [
                667
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
                250
            ],
            "eventLogs": [
                257,
                {
                    "input": [
                        256,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                51,
                {
                    "universalIdentifier": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                264,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                266,
                {
                    "filter": [
                        269,
                        "FieldFilter!"
                    ],
                    "paging": [
                        207,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                424,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                71,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                63,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        209
                    ],
                    "periodStart": [
                        209
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                73,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        209
                    ],
                    "periodStart": [
                        209
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                75,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                146,
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
                322,
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
                71
            ],
            "findManyApplications": [
                45
            ],
            "findManyLogicFunctions": [
                332
            ],
            "findManyMarketplaceApps": [
                340,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                426
            ],
            "findMarketplaceAppDetail": [
                341,
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
                        19,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                45,
                {
                    "id": [
                        532
                    ],
                    "universalIdentifier": [
                        532
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                71,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                332,
                {
                    "input": [
                        336,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                322,
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
                322,
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
                669
            ],
            "findWorkspaceFromInviteHash": [
                667,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                674
            ],
            "frontComponent": [
                284,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                284
            ],
            "getAddressDetails": [
                420,
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
                30
            ],
            "getApiKeyRoles": [
                455
            ],
            "getApprovedAccessDomains": [
                79
            ],
            "getAutoCompleteAddress": [
                86,
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
                319,
                {
                    "input": [
                        336,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                159,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                239
            ],
            "getInviteSuggestions": [
                318
            ],
            "getJobs": [
                322,
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
                        336,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                403,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                404,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                404,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                407,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                407,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                403,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        406
                    ]
                }
            ],
            "getPermissionFlags": [
                414
            ],
            "getPublicWorkspaceDataByDomain": [
                430,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                431,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                115
            ],
            "getRole": [
                455,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                455
            ],
            "getSSOIdentityProviders": [
                281
            ],
            "getToolIndex": [
                514
            ],
            "getToolInputSchema": [
                319,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                615,
                {
                    "input": [
                        616
                    ]
                }
            ],
            "getView": [
                643,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                646,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                647,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                647,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                646,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                648,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                649,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                649,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                648,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                652,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                652,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                655,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                655,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                643,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        657,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                672
            ],
            "gettingStartedProgress": [
                291
            ],
            "gettingStartedWorkflowPreviews": [
                295
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
                324,
                {
                    "input": [
                        325,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                106
            ],
            "mcpServer": [
                346,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                346
            ],
            "messageSuppressions": [
                362,
                {
                    "input": [
                        282,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                368,
                {
                    "input": [
                        371,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                373
            ],
            "mostlyEmptyFieldMetadataIds": [
                532,
                {
                    "objectMetadataId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                70
            ],
            "myCalendarChannels": [
                126,
                {
                    "connectedAccountId": [
                        532
                    ]
                }
            ],
            "myConnectedAccounts": [
                157
            ],
            "myMessageChannels": [
                350,
                {
                    "connectedAccountId": [
                        532
                    ]
                }
            ],
            "myMessageFolders": [
                357,
                {
                    "messageChannelId": [
                        532
                    ]
                }
            ],
            "myUserApplicationVariables": [
                677
            ],
            "navigationMenuItem": [
                379,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                379
            ],
            "object": [
                382,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                392
            ],
            "objects": [
                383,
                {
                    "filter": [
                        386,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        207,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                417,
                {
                    "input": [
                        418,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                134,
                {
                    "input": [
                        421,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                423,
                {
                    "input": [
                        422,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                341,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                340,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                437,
                {
                    "targets": [
                        447,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                442,
                {
                    "target": [
                        447,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                498,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                498
            ],
            "timelineActivityTypes": [
                510
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                531,
                {
                    "userId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                535
            ],
            "usageLimits": [
                618
            ],
            "usageQuotaDefinitions": [
                622
            ],
            "usageQuotaScopeConsumption": [
                624,
                {
                    "input": [
                        625,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                626
            ],
            "validatePasswordResetToken": [
                637,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                638,
                {
                    "objectMetadataId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                659,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                659
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                532
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
                532
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
                532
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
                532
            ],
            "permissions": [
                436
            ],
            "recordId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                532
            ],
            "workspaceMemberId": [
                532
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
            "defaultGeneralAccessLevel": [
                438
            ],
            "generalAccessLevel": [
                438
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                436
            ],
            "roles": [
                445
            ],
            "shares": [
                443
            ],
            "sharingMode": [
                444
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                438
            ],
            "id": [
                17
            ],
            "principalId": [
                532
            ],
            "principalRoleId": [
                532
            ],
            "principalType": [
                440
            ],
            "rowCause": [
                441
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingMode": {},
        "RecordSharingRoleDTO": {
            "canRead": [
                4
            ],
            "canUpdate": [
                4
            ],
            "id": [
                532
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
                661
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
                532
            ],
            "recordId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                264
            ],
            "sourceObjectMetadata": [
                382
            ],
            "targetFieldMetadata": [
                264
            ],
            "targetObjectMetadata": [
                382
            ],
            "type": [
                449
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
                17
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
                532
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
                37
            ],
            "applicationId": [
                532
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
                271
            ],
            "icon": [
                1
            ],
            "id": [
                532
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                390
            ],
            "permissionFlags": [
                456
            ],
            "rowLevelPermissionPredicateGroups": [
                459
            ],
            "rowLevelPermissionPredicates": [
                458
            ],
            "universalIdentifier": [
                532
            ],
            "workspaceMembers": [
                676
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
                532
            ],
            "roleId": [
                532
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
                463
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
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
                319
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
                461
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
            "id": [
                532
            ],
            "logicalOperator": [
                461
            ],
            "objectMetadataId": [
                532
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                532
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
                532
            ],
            "id": [
                532
            ],
            "operand": [
                463
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "rowLevelPermissionPredicateGroupId": [
                532
            ],
            "subFieldName": [
                1
            ],
            "value": [
                319
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
                466
            ],
            "messages": [
                466
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                319
            ],
            "runAsWorkspaceMemberId": [
                532
            ],
            "thread": [
                469
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
                532
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
                465
            ],
            "content": [
                1
            ],
            "role": [
                467
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
                319
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                532
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
                532
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                472
            ],
            "type": [
                301
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                532
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                472
            ],
            "type": [
                301
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
                209
            ],
            "fieldMetadataId": [
                532
            ],
            "id": [
                532
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                532
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                532
            ],
            "messageChannelId": [
                532
            ],
            "messageThreadId": [
                532
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
                532
            ],
            "messageThreadId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                532
            ],
            "messageId": [
                1
            ],
            "queued": [
                4
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
                478
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
                481
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
                532
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
                319
            ],
            "workspaceMemberIds": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                532
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
                674
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
                209
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                134
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
                41
            ],
            "value": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                532
            ],
            "createdAt": [
                209
            ],
            "frontComponentId": [
                532
            ],
            "icon": [
                1
            ],
            "id": [
                532
            ],
            "position": [
                6
            ],
            "scope": [
                492
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                209
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
                532
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
                532
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                472
            ],
            "type": [
                301
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                82
            ],
            "workspace": [
                686
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
                532
            ],
            "content": [
                1
            ],
            "createdAt": [
                209
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                532
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
                209
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                454
            ],
            "configurationType": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                684
            ],
            "thread": [
                16
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
                258,
                {
                    "fieldFilters": [
                        252,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        259,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                434,
                {
                    "input": [
                        192,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                337,
                {
                    "input": [
                        338,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                13,
                {
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                260,
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
                507
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
                42
            ],
            "messageChannelId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                661
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
                532
            ],
            "createdAt": [
                209
            ],
            "emit": [
                511
            ],
            "frontComponentUniversalIdentifier": [
                532
            ],
            "icon": [
                1
            ],
            "id": [
                532
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
                532
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                532
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                532
            ],
            "on": [
                1
            ],
            "through": [
                512
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                532
            ],
            "relationFieldUniversalIdentifier": [
                532
            ],
            "triggerFieldUniversalIdentifiers": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                661
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
                319
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
                82
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                532
            ],
            "personFilter": [
                319
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                209
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
                83
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
                209
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                532
            ],
            "gt": [
                532
            ],
            "gte": [
                532
            ],
            "iLike": [
                532
            ],
            "in": [
                532
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                532
            ],
            "lt": [
                532
            ],
            "lte": [
                532
            ],
            "neq": [
                532
            ],
            "notILike": [
                532
            ],
            "notIn": [
                532
            ],
            "notLike": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                209
            ],
            "description": [
                1
            ],
            "id": [
                532
            ],
            "name": [
                1
            ],
            "updatedAt": [
                209
            ],
            "visibility": [
                536
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
                532
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
                532
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                319
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
                319
            ],
            "roleId": [
                532
            ],
            "triggers": [
                319
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
                532
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
                532
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                532
            ],
            "visibility": [
                356
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
                543
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
                545
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
                532
            ],
            "update": [
                547
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                127
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
                130
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                532
            ],
            "availabilityType": [
                154
            ],
            "engineComponentKey": [
                243
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                532
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                532
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                319
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
                319
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                532
            ],
            "options": [
                319
            ],
            "settings": [
                319
            ],
            "translations": [
                369
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
                532
            ],
            "update": [
                552
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
            "completedStep": [
                292
            ],
            "isHidden": [
                4
            ],
            "selectedStep": [
                292
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
                532
            ],
            "update": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                319
            ],
            "databaseEventTriggerSettings": [
                319
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                319
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
                319
            ],
            "workflowActionTriggerSettings": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                532
            ],
            "update": [
                558
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                532
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
                532
            ],
            "update": [
                560
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                351
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
                358
            ],
            "visibility": [
                356
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                532
            ],
            "update": [
                562
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
                532
            ],
            "update": [
                562
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
                532
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
                532
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
                532
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
                532
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
                389
            ],
            "readability": [
                367
            ],
            "sharingReach": [
                397
            ],
            "shortcut": [
                1
            ],
            "translations": [
                369
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                532
            ],
            "update": [
                550
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                532
            ],
            "update": [
                564
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                532
            ],
            "update": [
                565
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
                532
            ],
            "type": [
                406
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
                405
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
                532
            ],
            "layoutMode": [
                405
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                573
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
                319
            ],
            "configuration": [
                319
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                532
            ],
            "pageLayoutTabId": [
                532
            ],
            "position": [
                319
            ],
            "title": [
                1
            ],
            "type": [
                662
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
                319
            ],
            "configuration": [
                319
            ],
            "id": [
                532
            ],
            "objectMetadataId": [
                532
            ],
            "pageLayoutTabId": [
                532
            ],
            "position": [
                319
            ],
            "title": [
                1
            ],
            "type": [
                662
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
                532
            ],
            "tabs": [
                571
            ],
            "type": [
                406
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                532
            ],
            "update": [
                576
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
                532
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
                532
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                369
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
                536
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                532
            ],
            "payload": [
                196
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                532
            ],
            "update": [
                582
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
                532
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
                532
            ],
            "update": [
                584
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
                532
            ],
            "update": [
                586
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                26
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                532
            ],
            "logicalOperator": [
                650
            ],
            "parentViewFilterGroupId": [
                532
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                532
            ],
            "update": [
                589
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                532
            ],
            "operand": [
                651
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                532
            ],
            "subFieldName": [
                1
            ],
            "value": [
                319
            ],
            "viewFilterGroupId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                532
            ],
            "update": [
                591
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                532
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
                532
            ],
            "calendarFieldMetadataId": [
                532
            ],
            "calendarLayout": [
                644
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                532
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                532
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                532
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                654
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                657
            ],
            "visibility": [
                658
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                532
            ],
            "update": [
                594
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                656
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
                532
            ],
            "update": [
                596
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
        "UpdateWorkspaceAllowedIframeOriginsInput": {
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
        "UpdateWorkspaceInput": {
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                29
            ],
            "aiChatModelTier": [
                29
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                319
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                532
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
                673
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                319
            ],
            "workspaceMemberId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                272
            ],
            "roleId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                532
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                602
            ],
            "id": [
                532
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
                602
            ],
            "groups": [
                603
            ],
            "widgetId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                391
            ],
            "roleId": [
                532
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                532
            ],
            "predicateGroups": [
                460
            ],
            "predicates": [
                462
            ],
            "roleId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                459
            ],
            "predicates": [
                458
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                613
            ],
            "viewFields": [
                610
            ],
            "viewFilterGroups": [
                611
            ],
            "viewFilters": [
                612
            ],
            "viewSorts": [
                614
            ],
            "widgetId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                26
            ],
            "fieldMetadataId": [
                532
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                532
            ],
            "logicalOperator": [
                650
            ],
            "parentViewFilterGroupId": [
                532
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
                532
            ],
            "id": [
                532
            ],
            "operand": [
                651
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                532
            ],
            "subFieldName": [
                1
            ],
            "value": [
                319
            ],
            "viewFilterGroupId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                532
            ],
            "calendarFieldMetadataId": [
                532
            ],
            "calendarLayout": [
                644
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                532
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                532
            ],
            "openRecordIn": [
                654
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                657
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                656
            ],
            "fieldMetadataId": [
                532
            ],
            "id": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                209
            ],
            "periodStart": [
                209
            ],
            "timeSeries": [
                628
            ],
            "usageByApplication": [
                617
            ],
            "usageByModel": [
                617
            ],
            "usageByOperationType": [
                617
            ],
            "usageByUser": [
                617
            ],
            "userDailyUsage": [
                630
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                620
            ],
            "periodEnd": [
                209
            ],
            "periodStart": [
                209
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
                97
            ],
            "createdAt": [
                209
            ],
            "id": [
                532
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                97
            ],
            "operationType": [
                620
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                627
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                629
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                629
            ],
            "operationType": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                619
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                623
            ],
            "resourceType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                621
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
                620
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                629
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                97
            ],
            "periodEnd": [
                209
            ],
            "periodStart": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                620
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                627
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                629
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                97
            ],
            "id": [
                532
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                97
            ],
            "operationType": [
                620
            ],
            "periodEnd": [
                209
            ],
            "periodStart": [
                209
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                97
            ],
            "resourceType": [
                627
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
                629
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
                628
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
                88
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                209
            ],
            "currentUserWorkspace": [
                635
            ],
            "currentWorkspace": [
                667
            ],
            "deletedAt": [
                209
            ],
            "deletedWorkspaceMembers": [
                222
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
                532
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
                398
            ],
            "previousOnboardingStatus": [
                398
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                209
            ],
            "userVars": [
                320
            ],
            "userWorkspaces": [
                635
            ],
            "workspaceMember": [
                676
            ],
            "workspaceMembers": [
                676
            ],
            "workspaces": [
                635
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
                319
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
            "createdAt": [
                209
            ],
            "expiresAt": [
                209
            ],
            "id": [
                532
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
                209
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "id": [
                532
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                390
            ],
            "objectsPermissions": [
                390
            ],
            "permissionFlags": [
                415
            ],
            "twoFactorAuthenticationMethodSummary": [
                528
            ],
            "updatedAt": [
                209
            ],
            "user": [
                631
            ],
            "userId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                532
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
                532
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
                532
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                532
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
                532
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
                82
            ],
            "workspaceUrls": [
                685
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
                532
            ],
            "calendarEndFieldMetadataId": [
                532
            ],
            "calendarFieldMetadataId": [
                532
            ],
            "calendarLayout": [
                644
            ],
            "createdAt": [
                209
            ],
            "createdByUserWorkspaceId": [
                532
            ],
            "deletedAt": [
                209
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                532
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
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                532
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                653
            ],
            "mainGroupByFieldMetadataId": [
                532
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                532
            ],
            "openRecordIn": [
                654
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                657
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                209
            ],
            "viewFieldGroups": [
                647
            ],
            "viewFields": [
                646
            ],
            "viewFilterGroups": [
                649
            ],
            "viewFilters": [
                648
            ],
            "viewGroups": [
                652
            ],
            "viewSorts": [
                655
            ],
            "visibility": [
                658
            ],
            "workspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                26
            ],
            "applicationId": [
                532
            ],
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "fieldMetadataId": [
                532
            ],
            "id": [
                532
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
                532
            ],
            "updatedAt": [
                209
            ],
            "viewFieldGroupId": [
                532
            ],
            "viewId": [
                532
            ],
            "workspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "id": [
                532
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
                209
            ],
            "viewFields": [
                646
            ],
            "viewId": [
                532
            ],
            "workspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "fieldMetadataId": [
                532
            ],
            "id": [
                532
            ],
            "operand": [
                651
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                532
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                209
            ],
            "value": [
                319
            ],
            "viewFilterGroupId": [
                532
            ],
            "viewId": [
                532
            ],
            "workspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "id": [
                532
            ],
            "logicalOperator": [
                650
            ],
            "parentViewFilterGroupId": [
                532
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                209
            ],
            "viewId": [
                532
            ],
            "workspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "fieldValue": [
                1
            ],
            "id": [
                532
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                209
            ],
            "viewId": [
                532
            ],
            "workspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "direction": [
                656
            ],
            "fieldMetadataId": [
                532
            ],
            "id": [
                532
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                209
            ],
            "viewId": [
                532
            ],
            "workspaceId": [
                532
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
                532
            ],
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "description": [
                1
            ],
            "id": [
                532
            ],
            "operations": [
                1
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                25
            ],
            "on_BarChartConfiguration": [
                91
            ],
            "on_CalendarConfiguration": [
                131
            ],
            "on_CallRecordingSummaryConfiguration": [
                132
            ],
            "on_CallRecordingTranscriptConfiguration": [
                133
            ],
            "on_ChatConfiguration": [
                141
            ],
            "on_ChatThreadsConfiguration": [
                144
            ],
            "on_EmailThreadConfiguration": [
                238
            ],
            "on_EmailsConfiguration": [
                242
            ],
            "on_FieldConfiguration": [
                265
            ],
            "on_FieldRichTextConfiguration": [
                273
            ],
            "on_FieldsConfiguration": [
                274
            ],
            "on_FilesConfiguration": [
                280
            ],
            "on_FormFieldConfiguration": [
                283
            ],
            "on_FrontComponentConfiguration": [
                285
            ],
            "on_IframeConfiguration": [
                302
            ],
            "on_LineChartConfiguration": [
                323
            ],
            "on_MessageCampaignBodyConfiguration": [
                347
            ],
            "on_MessageCampaignDetailsConfiguration": [
                348
            ],
            "on_NotesConfiguration": [
                381
            ],
            "on_PieChartConfiguration": [
                416
            ],
            "on_RecordTableConfiguration": [
                446
            ],
            "on_StandaloneRichTextConfiguration": [
                499
            ],
            "on_TasksConfiguration": [
                509
            ],
            "on_TimelineConfiguration": [
                513
            ],
            "on_ViewConfiguration": [
                645
            ],
            "on_WorkflowConfiguration": [
                664
            ],
            "on_WorkflowRunConfiguration": [
                665
            ],
            "on_WorkflowVersionConfiguration": [
                666
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
                661
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                668
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                29
            ],
            "aiChatModelTier": [
                29
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                319
            ],
            "allowImpersonation": [
                4
            ],
            "allowedIframeOrigins": [
                1
            ],
            "billingCustomer": [
                99
            ],
            "billingEntitlements": [
                101
            ],
            "billingSubscriptions": [
                117
            ],
            "createdAt": [
                209
            ],
            "currentBillingSubscription": [
                117
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                455
            ],
            "deletedAt": [
                209
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
                262
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                532
            ],
            "installedApplications": [
                45
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
                532
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
                209
            ],
            "viewFields": [
                646
            ],
            "viewFilterGroups": [
                649
            ],
            "viewFilters": [
                648
            ],
            "viewGroups": [
                652
            ],
            "viewSorts": [
                655
            ],
            "views": [
                643
            ],
            "workspaceCustomApplication": [
                45
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                673
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                685
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
                319
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                670
            ],
            "personEnrichment": [
                319
            ],
            "personOutcome": [
                683
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
                209
            ],
            "id": [
                532
            ],
            "roleId": [
                532
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
                678
            ],
            "id": [
                532
            ],
            "locale": [
                1
            ],
            "name": [
                287
            ],
            "numberFormat": [
                679
            ],
            "openRecordIn": [
                401
            ],
            "roles": [
                455
            ],
            "timeFormat": [
                680
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
                532
            ],
            "userWorkspaceId": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                532
            ],
            "variables": [
                632
            ],
            "workspaceMemberId": [
                532
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
                319
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
                532
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
                532
            ],
            "workspaceUrls": [
                685
            ],
            "__typename": [
                1
            ]
        }
    }
}