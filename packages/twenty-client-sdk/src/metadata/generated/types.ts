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
        209,
        210,
        237,
        241,
        242,
        246,
        256,
        262,
        266,
        270,
        273,
        280,
        295,
        297,
        307,
        314,
        315,
        316,
        328,
        330,
        345,
        346,
        347,
        348,
        349,
        350,
        352,
        353,
        354,
        357,
        358,
        360,
        361,
        364,
        366,
        370,
        374,
        383,
        390,
        391,
        392,
        395,
        399,
        400,
        405,
        409,
        432,
        434,
        435,
        438,
        443,
        455,
        457,
        461,
        466,
        486,
        498,
        499,
        501,
        526,
        528,
        530,
        591,
        611,
        618,
        620,
        624,
        635,
        641,
        642,
        644,
        645,
        647,
        648,
        649,
        652,
        653,
        658,
        660,
        663,
        668,
        669,
        670,
        673,
        674
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
                314
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
                526
            ],
            "createdAt": [
                210
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                314
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
                314
            ],
            "roleId": [
                526
            ],
            "triggers": [
                314
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                526
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
                526
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelSummary": {
            "channelId": [
                526
            ],
            "hasUnreadOpen": [
                4
            ],
            "openCount": [
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                314
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
                210
            ],
            "deletedAt": [
                210
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
                210
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                210
            ],
            "id": [
                526
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                210
            ],
            "lastReadAt": [
                210
            ],
            "snoozedUntil": [
                210
            ],
            "threadId": [
                526
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                526
            ],
            "createdAt": [
                210
            ],
            "id": [
                526
            ],
            "parts": [
                21
            ],
            "processedAt": [
                210
            ],
            "reactions": [
                22
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                526
            ],
            "senderWorkspaceMemberId": [
                526
            ],
            "status": [
                1
            ],
            "threadId": [
                526
            ],
            "turnId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                210
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                526
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                526
            ],
            "messageId": [
                526
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                314
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
                314
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                314
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
                526
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                210
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
                210
            ],
            "errorMessage": [
                1
            ],
            "id": [
                526
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
                210
            ],
            "status": [
                24
            ],
            "threadId": [
                526
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
                526
            ],
            "aggregateOperation": [
                26
            ],
            "configurationType": [
                652
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                314
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
                427
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
                210
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
                210
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
                210
            ],
            "expiresAt": [
                210
            ],
            "id": [
                526
            ],
            "name": [
                1
            ],
            "revokedAt": [
                210
            ],
            "role": [
                449
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                210
            ],
            "id": [
                526
            ],
            "name": [
                1
            ],
            "revokedAt": [
                210
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
                314
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
                210
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
                526
            ],
            "role": [
                354
            ],
            "workspaceMemberId": [
                526
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
                526
            ],
            "applicationVariables": [
                77
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                314
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                153
            ],
            "createdAt": [
                210
            ],
            "defaultLogicFunctionRole": [
                449
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                287
            ],
            "healthCheckLogicFunctionId": [
                526
            ],
            "id": [
                526
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                327
            ],
            "logoFileId": [
                526
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                376
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                526
            ],
            "settingsCustomTabFrontComponentId": [
                526
            ],
            "settingsMenuItems": [
                485
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                526
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                210
            ],
            "id": [
                526
            ],
            "lastAuthorizedAt": [
                210
            ],
            "lastUsedAt": [
                210
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                526
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                526
            ],
            "archivedAt": [
                210
            ],
            "authFailedAt": [
                210
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                423
            ],
            "connectionProviderId": [
                526
            ],
            "createdAt": [
                210
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                526
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                210
            ],
            "lastSignedInAt": [
                210
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
                210
            ],
            "userWorkspaceId": [
                526
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
                526
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
                314
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
                526
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
                280
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
                280
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
                210
            ],
            "fileFolder": [
                280
            ],
            "fileId": [
                526
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
                210
            ],
            "periodStart": [
                210
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
                210
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
                210
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
                210
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
                210
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
                526
            ],
            "connectionProviders": [
                49
            ],
            "settingsMenuItems": [
                485
            ],
            "variables": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                210
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                526
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
                526
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
                210
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
                207
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
                633
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                526
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
                210
            ],
            "description": [
                1
            ],
            "id": [
                526
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
                314
            ],
            "type": [
                1
            ],
            "updatedAt": [
                210
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
                526
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
                314
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
                210
            ],
            "domain": [
                1
            ],
            "id": [
                526
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
                465
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                210
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
                526
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
                464
            ],
            "workspaceUrls": [
                675
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
                526
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
                652
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
                314
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
                390
            ],
            "primaryAxisGroupByFieldMetadataId": [
                526
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                295
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                390
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                526
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                295
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
                314
            ],
            "formattedToRawLookup": [
                314
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
                314
            ],
            "objectMetadataId": [
                526
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
                526
            ],
            "userCreditsFallback": [
                624
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
                499
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
                498
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
                498
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
                210
            ],
            "periodStart": [
                210
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
                210
            ],
            "collectionMethod": [
                118
            ],
            "currentPeriodEnd": [
                210
            ],
            "hasUserCredits": [
                4
            ],
            "id": [
                526
            ],
            "interval": [
                498
            ],
            "metadata": [
                314
            ],
            "phases": [
                120
            ],
            "status": [
                499
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
                526
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
                526
            ],
            "contactAutoCreationPolicy": [
                127
            ],
            "createdAt": [
                210
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                526
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
                210
            ],
            "syncStatus": [
                129
            ],
            "syncedAt": [
                210
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                210
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
                652
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                652
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
                652
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                314
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
                652
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
                370
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                372
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
                421
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                483
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                500
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                210
            ],
            "link": [
                1
            ],
            "startAt": [
                210
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
                526
            ],
            "availabilityObjectMetadataId": [
                526
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
                526
            ],
            "createdAt": [
                210
            ],
            "engineComponentKey": [
                246
            ],
            "frontComponent": [
                287
            ],
            "frontComponentId": [
                526
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                526
            ],
            "pageLayoutId": [
                526
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
                526
            ],
            "updatedAt": [
                210
            ],
            "workflowVersionId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                382
            ],
            "on_PathCommandMenuItemPayload": [
                407
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
                278
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                526
            ],
            "archivedAt": [
                210
            ],
            "authFailedAt": [
                210
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                423
            ],
            "connectionProviderId": [
                526
            ],
            "createdAt": [
                210
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                526
            ],
            "lastCredentialsRefreshedAt": [
                210
            ],
            "lastSignedInAt": [
                210
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
                210
            ],
            "userWorkspaceId": [
                526
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
                300
            ],
            "handle": [
                1
            ],
            "id": [
                526
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                237
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
                526
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
                314
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
                314
            ],
            "roleId": [
                526
            ],
            "triggers": [
                314
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                526
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                526
            ],
            "participantHandleFieldUniversalIdentifier": [
                526
            ],
            "visibility": [
                350
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppVisitorEventTokenInput": {
            "anonymousId": [
                1
            ],
            "events": [
                1
            ],
            "expiresInSeconds": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppVisitorEventTokenOutput": {
            "expiresAt": [
                1
            ],
            "token": [
                1
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
                526
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
                526
            ],
            "engineComponentKey": [
                246
            ],
            "frontComponentId": [
                526
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
                526
            ],
            "pageLayoutId": [
                526
            ],
            "payload": [
                314
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                526
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
                344
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
                314
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
                314
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                526
            ],
            "options": [
                314
            ],
            "relationCreationPayload": [
                314
            ],
            "settings": [
                314
            ],
            "type": [
                273
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
                526
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
                526
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
                181
            ],
            "indexType": [
                307
            ],
            "objectMetadataId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                314
            ],
            "databaseEventTriggerSettings": [
                314
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                314
            ],
            "id": [
                526
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                314
            ],
            "source": [
                314
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                314
            ],
            "universalIdentifier": [
                526
            ],
            "workflowActionTriggerSettings": [
                314
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                526
            ],
            "color": [
                1
            ],
            "folderId": [
                526
            ],
            "icon": [
                1
            ],
            "id": [
                526
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                526
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                526
            ],
            "targetRecordId": [
                526
            ],
            "type": [
                374
            ],
            "userWorkspaceId": [
                526
            ],
            "viewId": [
                526
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
                314
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
                179
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                182
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                186
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
                526
            ],
            "type": [
                400
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                399
            ],
            "pageLayoutId": [
                526
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
                314
            ],
            "objectMetadataId": [
                526
            ],
            "pageLayoutTabId": [
                526
            ],
            "position": [
                314
            ],
            "title": [
                1
            ],
            "type": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                526
            ],
            "filter": [
                314
            ],
            "objectMetadataId": [
                526
            ],
            "orderBy": [
                314
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
                526
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
                530
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
                611
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                618
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                620
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
                526
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                526
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
                526
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
                526
            ],
            "id": [
                526
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
                526
            ],
            "viewId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                526
            ],
            "logicalOperator": [
                641
            ],
            "parentViewFilterGroupId": [
                526
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                526
            ],
            "id": [
                526
            ],
            "operand": [
                642
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                526
            ],
            "subFieldName": [
                1
            ],
            "value": [
                314
            ],
            "viewFilterGroupId": [
                526
            ],
            "viewId": [
                526
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
                526
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                526
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
                526
            ],
            "calendarFieldMetadataId": [
                526
            ],
            "calendarLayout": [
                635
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                526
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                526
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                644
            ],
            "mainGroupByFieldMetadataId": [
                526
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                526
            ],
            "openRecordIn": [
                645
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                648
            ],
            "visibility": [
                649
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                647
            ],
            "fieldMetadataId": [
                526
            ],
            "id": [
                526
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                526
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
                526
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
                611
            ],
            "resource": [
                618
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                526
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                526
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
                526
            ],
            "name": [
                290
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                526
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
                526
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                230
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
                526
            ],
            "pageLayoutId": [
                526
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
                526
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
                526
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                466
            ],
            "type": [
                297
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                526
            ],
            "status": [
                466
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
                652
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                210
            ],
            "domain": [
                1
            ],
            "id": [
                526
            ],
            "status": [
                241
            ],
            "tenantStatus": [
                242
            ],
            "unsubscribeHostnameStatus": [
                528
            ],
            "updatedAt": [
                210
            ],
            "verificationRecords": [
                630
            ],
            "verifiedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "EmitAppEventInput": {
            "anonymousId": [
                1
            ],
            "event": [
                1
            ],
            "properties": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "EmitAppEventOutput": {
            "id": [
                526
            ],
            "occurredAt": [
                1
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
                314
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
                314
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
                248
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                314
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
                210
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
                210
            ],
            "currentPeriodEnd": [
                210
            ],
            "expiresAt": [
                210
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
                210
            ],
            "start": [
                210
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
                256
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
                254
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                255
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
                257
            ],
            "first": [
                10
            ],
            "table": [
                262
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                258
            ],
            "records": [
                261
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
                314
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                210
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
                359
            ],
            "objectRecordEventsWithQueryIds": [
                389
            ],
            "queueJobEvents": [
                317
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                526
            ],
            "payload": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                266
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
                526
            ],
            "createdAt": [
                210
            ],
            "defaultValue": [
                314
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                526
            ],
            "morphRelations": [
                442
            ],
            "name": [
                1
            ],
            "object": [
                376
            ],
            "objectMetadataId": [
                526
            ],
            "options": [
                314
            ],
            "relation": [
                442
            ],
            "settings": [
                314
            ],
            "type": [
                273
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                210
            ],
            "writability": [
                366
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                652
            ],
            "fieldDisplayMode": [
                270
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
                271
            ],
            "pageInfo": [
                396
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
                267
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                272
            ],
            "id": [
                527
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
                527
            ],
            "or": [
                272
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
                526
            ],
            "id": [
                526
            ],
            "objectMetadataId": [
                526
            ],
            "roleId": [
                526
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
                526
            ],
            "objectMetadataId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                652
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
                210
            ],
            "id": [
                526
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
                526
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
                210
            ],
            "fileId": [
                526
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
                210
            ],
            "id": [
                526
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
                652
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                526
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                466
            ],
            "type": [
                297
            ],
            "workspace": [
                672
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
                357
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                652
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
                526
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                76
            ],
            "applicationVariables": [
                314
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
                210
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                526
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
                526
            ],
            "updatedAt": [
                210
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                289
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                652
            ],
            "frontComponentId": [
                526
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                526
            ],
            "pageLayoutType": [
                400
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
                526
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
                526
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
                526
            ],
            "workspaceInviteHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GrantApplicationCapabilitiesInput": {
            "applicationId": [
                526
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
                652
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
                301
            ],
            "IMAP": [
                301
            ],
            "SMTP": [
                301
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
                237
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
                676
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                210
            ],
            "id": [
                526
            ],
            "indexFieldMetadataList": [
                305
            ],
            "indexType": [
                307
            ],
            "indexWhereClause": [
                1
            ],
            "isCustom": [
                4
            ],
            "isUnique": [
                4
            ],
            "name": [
                1
            ],
            "updatedAt": [
                210
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
                303
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                210
            ],
            "fieldMetadataId": [
                526
            ],
            "id": [
                526
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                306
            ],
            "id": [
                527
            ],
            "isCustom": [
                125
            ],
            "or": [
                306
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                526
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
                310
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
                526
            ],
            "messageThreadId": [
                526
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
                316
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                526
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
                652
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
                314
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
                390
            ],
            "primaryAxisGroupByFieldMetadataId": [
                526
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                295
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                390
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                526
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                295
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
                314
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                322
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
                314
            ],
            "objectMetadataId": [
                526
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
                321
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                526
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
                526
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                210
            ],
            "cronTriggerSettings": [
                314
            ],
            "databaseEventTriggerSettings": [
                314
            ],
            "description": [
                1
            ],
            "executionMode": [
                328
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                314
            ],
            "id": [
                526
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
                314
            ],
            "universalIdentifier": [
                526
            ],
            "updatedAt": [
                210
            ],
            "workflowActionTriggerSettings": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                314
            ],
            "duration": [
                6
            ],
            "error": [
                314
            ],
            "logs": [
                1
            ],
            "status": [
                330
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                526
            ],
            "applicationUniversalIdentifier": [
                526
            ],
            "id": [
                526
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                526
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
                314
            ],
            "name": [
                1
            ],
            "objects": [
                337
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                338
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
                339
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                340
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
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                652
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
                526
            ],
            "contactAutoCreationPolicy": [
                345
            ],
            "createdAt": [
                210
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
                526
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
                352
            ],
            "messagingProviderUniversalIdentifier": [
                526
            ],
            "participantHandleFieldUniversalIdentifier": [
                526
            ],
            "pendingGroupEmailsAction": [
                346
            ],
            "syncStage": [
                347
            ],
            "syncStageStartedAt": [
                210
            ],
            "syncStatus": [
                348
            ],
            "syncedAt": [
                210
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                210
            ],
            "type": [
                349
            ],
            "updatedAt": [
                210
            ],
            "visibility": [
                350
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
                210
            ],
            "externalId": [
                1
            ],
            "id": [
                526
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                526
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                353
            ],
            "updatedAt": [
                210
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
                210
            ],
            "emailAddress": [
                1
            ],
            "id": [
                526
            ],
            "reason": [
                357
            ],
            "source": [
                358
            ],
            "unsubscribeTopicId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                355
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
                388
            ],
            "recordId": [
                1
            ],
            "type": [
                360
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
                526
            ],
            "property": [
                1
            ],
            "provenance": [
                364
            ],
            "recordId": [
                526
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
                526
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                526
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
                368
            ],
            "views": [
                369
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
                526
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
                526
            ],
            "key": [
                644
            ],
            "objectMetadataId": [
                526
            ],
            "type": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                492,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                657,
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
                        526,
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
                        526
                    ],
                    "threadId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        526,
                        "UUID!"
                    ],
                    "roleId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        526,
                        "UUID!"
                    ],
                    "roleId": [
                        526,
                        "UUID!"
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
                231
            ],
            "checkPublicDomainValidRecords": [
                231,
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
                        498,
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
                        526,
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
                        526,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                394,
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
                282,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                282,
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
                282,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                282,
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
                344,
                {
                    "input": [
                        166,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createAppVisitorEventToken": [
                168,
                {
                    "input": [
                        167,
                        "CreateAppVisitorEventTokenInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                169,
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
                170,
                {
                    "input": [
                        171,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                79,
                {
                    "input": [
                        172,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                105
            ],
            "createCalendarEvent": [
                174,
                {
                    "input": [
                        173,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                16,
                {
                    "channelId": [
                        526
                    ]
                }
            ],
            "createCommandMenuItem": [
                153,
                {
                    "input": [
                        175,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                229,
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
                177,
                {
                    "input": [
                        176,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                240,
                {
                    "input": [
                        178,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                281,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        280,
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
                287,
                {
                    "input": [
                        180,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                373,
                {
                    "inputs": [
                        185,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                638,
                {
                    "inputs": [
                        199,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                637,
                {
                    "inputs": [
                        200,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                643,
                {
                    "inputs": [
                        203,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                355,
                {
                    "input": [
                        184,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                373,
                {
                    "input": [
                        185,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                281,
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
                489,
                {
                    "input": [
                        487,
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
                        526,
                        "UUID!"
                    ],
                    "properties": [
                        314
                    ],
                    "recordId": [
                        526,
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
                267,
                {
                    "input": [
                        187,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                303,
                {
                    "input": [
                        188,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                327,
                {
                    "input": [
                        183,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                376,
                {
                    "input": [
                        189,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                449,
                {
                    "createRoleInput": [
                        194,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                397,
                {
                    "input": [
                        190,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                398,
                {
                    "input": [
                        191,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                401,
                {
                    "input": [
                        192,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                420,
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
                489,
                {
                    "input": [
                        488,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                492,
                {
                    "input": [
                        195,
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
                        498,
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
                529,
                {
                    "input": [
                        196,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                609,
                {
                    "input": [
                        197,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                629,
                {
                    "input": [
                        198,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                634,
                {
                    "input": [
                        204,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                637,
                {
                    "input": [
                        200,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                638,
                {
                    "input": [
                        199,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                639,
                {
                    "input": [
                        202,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                640,
                {
                    "input": [
                        201,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                643,
                {
                    "input": [
                        203,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                646,
                {
                    "input": [
                        205,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                650,
                {
                    "input": [
                        206,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                492,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        526,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        526
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
                344,
                {
                    "id": [
                        526,
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
                        211,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                153,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                157,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                657
            ],
            "deleteEmailGroupChannel": [
                344,
                {
                    "id": [
                        526,
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
                287,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                373,
                {
                    "ids": [
                        526,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                373,
                {
                    "id": [
                        526,
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
                267,
                {
                    "input": [
                        212,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                303,
                {
                    "input": [
                        213,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                327,
                {
                    "input": [
                        331,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                376,
                {
                    "input": [
                        214,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        526,
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
                        526,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                215,
                {
                    "input": [
                        216,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                492,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                217,
                {
                    "twoFactorAuthenticationMethodId": [
                        526,
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
                        526,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                622
            ],
            "deleteUserFromWorkspace": [
                626,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                629,
                {
                    "id": [
                        526,
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
                637,
                {
                    "input": [
                        219,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                638,
                {
                    "input": [
                        218,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                639,
                {
                    "input": [
                        220,
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
                643,
                {
                    "input": [
                        221,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        222,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                650,
                {
                    "id": [
                        526,
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
                637,
                {
                    "input": [
                        225,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                638,
                {
                    "input": [
                        224,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                639,
                {
                    "input": [
                        226,
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
                643,
                {
                    "input": [
                        227,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        228,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                157,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                232,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                233,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                234,
                {
                    "input": [
                        235,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                238,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        526
                    ]
                }
            ],
            "emitAppEvent": [
                245,
                {
                    "input": [
                        244,
                        "EmitAppEventInput!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                100
            ],
            "enqueueJob": [
                249,
                {
                    "input": [
                        247,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                251,
                {
                    "input": [
                        250,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                661
            ],
            "executeOneLogicFunction": [
                329,
                {
                    "input": [
                        264,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                38,
                {
                    "apiKeyId": [
                        526,
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
                        526,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                82
            ],
            "generateTransientToken": [
                509
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                523,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        526,
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
                524,
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
                292,
                {
                    "input": [
                        293,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                334,
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
                393
            ],
            "grantApplicationCapabilities": [
                47,
                {
                    "input": [
                        294,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                302,
                {
                    "userId": [
                        526,
                        "UUID!"
                    ],
                    "workspaceId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                309,
                {
                    "input": [
                        308,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                311,
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
                311
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
                        526,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        526
                    ],
                    "threadId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                252
            ],
            "removeAgentChatMessageReaction": [
                22,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        444,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                436,
                {
                    "principal": [
                        433,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        441,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        526,
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
                        526,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        445,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                446,
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
                479,
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
                        526,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                398,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                401,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                504,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                471,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        526,
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
                        447,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                451,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                462,
                {
                    "input": [
                        458,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                61,
                {
                    "applicationId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                299,
                {
                    "connectionParameters": [
                        236,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        526
                    ]
                }
            ],
            "sendAppChannelMessage": [
                470,
                {
                    "input": [
                        469,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                471,
                {
                    "browsingContext": [
                        314
                    ],
                    "channelId": [
                        526
                    ],
                    "fileAttachments": [
                        279,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        526,
                        "[UUID!]"
                    ],
                    "messageId": [
                        526,
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
                        526,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                474,
                {
                    "input": [
                        473,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                478,
                {
                    "input": [
                        477,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                479,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        526
                    ]
                }
            ],
            "sendMessageCampaign": [
                481,
                {
                    "input": [
                        480,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                476,
                {
                    "input": [
                        482,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                40,
                {
                    "input": [
                        484,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                252,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                436,
                {
                    "accessLevel": [
                        432,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        441,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                436,
                {
                    "accessLevel": [
                        432,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        433,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        441,
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
                490,
                {
                    "input": [
                        491
                    ]
                }
            ],
            "signUpInWorkspace": [
                490,
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
                        526
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
                394,
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
                        210,
                        "DateTime!"
                    ],
                    "threadId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                139,
                {
                    "connectedAccountId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                494,
                {
                    "companyContext": [
                        314
                    ],
                    "personContext": [
                        314
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                495
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
                351,
                {
                    "input": [
                        502,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                671,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        314,
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
                        314
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
                511,
                {
                    "input": [
                        510,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                515,
                {
                    "input": [
                        512,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                514,
                {
                    "input": [
                        513,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                519,
                {
                    "input": [
                        516,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                518,
                {
                    "input": [
                        517,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                521,
                {
                    "input": [
                        520,
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
                        526,
                        "UUID!"
                    ],
                    "input": [
                        531,
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
                        210
                    ],
                    "threadIds": [
                        526,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                36,
                {
                    "input": [
                        533,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                344,
                {
                    "input": [
                        534,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                45,
                {
                    "id": [
                        526,
                        "UUID!"
                    ],
                    "input": [
                        535,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                71,
                {
                    "input": [
                        536,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                75,
                {
                    "input": [
                        538,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                126,
                {
                    "input": [
                        540,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                153,
                {
                    "input": [
                        542,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                344,
                {
                    "input": [
                        543,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                287,
                {
                    "input": [
                        545,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                265,
                {
                    "input": [
                        547,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                373,
                {
                    "inputs": [
                        558,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                376,
                {
                    "inputs": [
                        559,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                643,
                {
                    "inputs": [
                        581,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                344,
                {
                    "input": [
                        550,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                351,
                {
                    "input": [
                        552,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                351,
                {
                    "input": [
                        554,
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
                373,
                {
                    "input": [
                        558,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        532,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        526
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
                267,
                {
                    "input": [
                        557,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        548,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                376,
                {
                    "input": [
                        559,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                449,
                {
                    "updateRoleInput": [
                        566,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        560,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                398,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        561,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                401,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        563,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        565,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                312,
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
                492,
                {
                    "input": [
                        568,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                504,
                {
                    "input": [
                        569,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                529,
                {
                    "input": [
                        570,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                609,
                {
                    "input": [
                        571,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                99,
                {
                    "userCreditsFallback": [
                        624,
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
                629,
                {
                    "input": [
                        572,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                634,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        583,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                637,
                {
                    "input": [
                        576,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                638,
                {
                    "input": [
                        574,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                639,
                {
                    "input": [
                        579,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                640,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        578,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                643,
                {
                    "input": [
                        581,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                646,
                {
                    "input": [
                        584,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                650,
                {
                    "input": [
                        586,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                657,
                {
                    "data": [
                        589,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                657,
                {
                    "data": [
                        588,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                666,
                {
                    "roleId": [
                        526,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        590,
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
                        591,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                278,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        591,
                        "Upload!"
                    ],
                    "fileFolder": [
                        280,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                282,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        591,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                282,
                {
                    "file": [
                        591,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                282,
                {
                    "file": [
                        591,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                282,
                {
                    "file": [
                        591,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                274,
                {
                    "upsertFieldPermissionsInput": [
                        592,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                634,
                {
                    "input": [
                        595,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                384,
                {
                    "upsertObjectPermissionsInput": [
                        596,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                450,
                {
                    "upsertPermissionFlagsInput": [
                        597,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                599,
                {
                    "input": [
                        598,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                634,
                {
                    "input": [
                        600,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                79,
                {
                    "input": [
                        627,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                631,
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
                240,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                632,
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
                526
            ],
            "applicationId": [
                526
            ],
            "color": [
                1
            ],
            "createdAt": [
                210
            ],
            "folderId": [
                526
            ],
            "icon": [
                1
            ],
            "id": [
                526
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                526
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                526
            ],
            "targetRecordId": [
                526
            ],
            "targetRecordIdentifier": [
                429
            ],
            "type": [
                374
            ],
            "updatedAt": [
                210
            ],
            "userWorkspaceId": [
                526
            ],
            "viewId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                526
            ],
            "color": [
                1
            ],
            "createdAt": [
                210
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
                379,
                {
                    "filter": [
                        272,
                        "FieldFilter!"
                    ],
                    "paging": [
                        208,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                267
            ],
            "icon": [
                1
            ],
            "id": [
                526
            ],
            "imageIdentifierFieldMetadataId": [
                526
            ],
            "indexMetadataList": [
                303
            ],
            "indexMetadatas": [
                381,
                {
                    "filter": [
                        306,
                        "IndexFilter!"
                    ],
                    "paging": [
                        208,
                        "CursorPaging!"
                    ]
                }
            ],
            "isActive": [
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
                526
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
                383
            ],
            "readability": [
                361
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                526
            ],
            "searchFieldMetadataList": [
                468
            ],
            "sharingReach": [
                391
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                210
            ],
            "writability": [
                366
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                378
            ],
            "pageInfo": [
                396
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
                376
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                271
            ],
            "pageInfo": [
                396
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                380
            ],
            "id": [
                527
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
                380
            ],
            "universalIdentifier": [
                527
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                304
            ],
            "pageInfo": [
                396
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                526
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
                526
            ],
            "restrictedFields": [
                314
            ],
            "rowLevelPermissionPredicateGroups": [
                453
            ],
            "rowLevelPermissionPredicates": [
                452
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
                526
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
                209
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                388
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
                314
            ],
            "before": [
                314
            ],
            "diff": [
                314
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
                387
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
                392
            ],
            "previousOnboardingStatus": [
                392
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
                526
            ],
            "createdAt": [
                210
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                526
            ],
            "deletedAt": [
                210
            ],
            "id": [
                526
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
                526
            ],
            "tabs": [
                398
            ],
            "type": [
                400
            ],
            "universalIdentifier": [
                526
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                526
            ],
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                399
            ],
            "pageLayoutId": [
                526
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                526
            ],
            "updatedAt": [
                210
            ],
            "widgets": [
                401
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                526
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                314
            ],
            "configuration": [
                651
            ],
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "gridPosition": [
                296
            ],
            "id": [
                526
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
                526
            ],
            "pageLayoutTabId": [
                526
            ],
            "position": [
                404
            ],
            "title": [
                1
            ],
            "type": [
                653
            ],
            "universalIdentifier": [
                526
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                399
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
                399
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
                402
            ],
            "on_PageLayoutWidgetGridPosition": [
                403
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                406
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                405
            ],
            "index": [
                10
            ],
            "layoutMode": [
                399
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
                526
            ],
            "createdAt": [
                210
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                526
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                526
            ],
            "aggregateOperation": [
                26
            ],
            "color": [
                1
            ],
            "configurationType": [
                652
            ],
            "dateGranularity": [
                390
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
                314
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                526
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
                295
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
                413
            ],
            "formattedToRawLookup": [
                314
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
                314
            ],
            "objectMetadataId": [
                526
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
                326
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
                210
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
                343
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                526
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
                237
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
                526
            ],
            "createdAt": [
                210
            ],
            "domain": [
                1
            ],
            "id": [
                526
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
                266
            ],
            "metadata": [
                422
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
                419
            ],
            "IMAP": [
                419
            ],
            "SMTP": [
                419
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
                526
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                675
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
                526
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
                        526,
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
                        526,
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
                        291,
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
                        323
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
                344,
                {
                    "filter": [
                        324
                    ]
                }
            ],
            "appMessageFolders": [
                351,
                {
                    "filter": [
                        325
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                48,
                {
                    "applicationId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                49,
                {
                    "applicationId": [
                        526,
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
                467,
                {
                    "applicationId": [
                        526,
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
                526,
                {
                    "calendarEventId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                20,
                {
                    "threadId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                142,
                {
                    "threadId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                16,
                {
                    "id": [
                        526,
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
                665,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                496,
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
                        526,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                153
            ],
            "currentUser": [
                622
            ],
            "currentUserApplicationAuthorizations": [
                46
            ],
            "currentUserSessions": [
                625
            ],
            "currentWorkspace": [
                657
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
                253
            ],
            "eventLogs": [
                260,
                {
                    "input": [
                        259,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                51,
                {
                    "universalIdentifier": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                267,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                269,
                {
                    "filter": [
                        272,
                        "FieldFilter!"
                    ],
                    "paging": [
                        208,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                418,
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
                        210
                    ],
                    "periodStart": [
                        210
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
                        210
                    ],
                    "periodStart": [
                        210
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
                317,
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
                327
            ],
            "findManyMarketplaceApps": [
                335,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                420
            ],
            "findMarketplaceAppDetail": [
                336,
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
                        526
                    ],
                    "universalIdentifier": [
                        526
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
                327,
                {
                    "input": [
                        331,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                317,
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
                317,
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
                659
            ],
            "findWorkspaceFromInviteHash": [
                657,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                664
            ],
            "frontComponent": [
                287,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                287
            ],
            "getAddressDetails": [
                414,
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
                449
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
                314,
                {
                    "input": [
                        331,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                159,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                240
            ],
            "getInviteSuggestions": [
                313
            ],
            "getJobs": [
                317,
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
                        331,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                398,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                398,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                401,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                401,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                397,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        400
                    ]
                }
            ],
            "getPermissionFlags": [
                408
            ],
            "getPublicWorkspaceDataByDomain": [
                424,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                425,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                115
            ],
            "getRole": [
                449,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                449
            ],
            "getSSOIdentityProviders": [
                284
            ],
            "getToolIndex": [
                508
            ],
            "getToolInputSchema": [
                314,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                606,
                {
                    "input": [
                        607
                    ]
                }
            ],
            "getView": [
                634,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                637,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                638,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                638,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                637,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                639,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                640,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                640,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                639,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                643,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                643,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                646,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                646,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                634,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        648,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                662
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
                319,
                {
                    "input": [
                        320,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                106
            ],
            "messageSuppressions": [
                356,
                {
                    "input": [
                        285,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                362,
                {
                    "input": [
                        365,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                367
            ],
            "mostlyEmptyFieldMetadataIds": [
                526,
                {
                    "objectMetadataId": [
                        526,
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
                        526
                    ]
                }
            ],
            "myConnectedAccounts": [
                157
            ],
            "myMessageChannels": [
                344,
                {
                    "connectedAccountId": [
                        526
                    ]
                }
            ],
            "myMessageFolders": [
                351,
                {
                    "messageChannelId": [
                        526
                    ]
                }
            ],
            "myUserApplicationVariables": [
                667
            ],
            "navigationMenuItem": [
                373,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                373
            ],
            "object": [
                376,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                386
            ],
            "objects": [
                377,
                {
                    "filter": [
                        380,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        208,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                411,
                {
                    "input": [
                        412,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                134,
                {
                    "input": [
                        415,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                417,
                {
                    "input": [
                        416,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                336,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                335,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                431,
                {
                    "targets": [
                        441,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                436,
                {
                    "target": [
                        441,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                492,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                492
            ],
            "timelineActivityTypes": [
                504
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                525,
                {
                    "userId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                529
            ],
            "usageLimits": [
                609
            ],
            "usageQuotaDefinitions": [
                613
            ],
            "usageQuotaScopeConsumption": [
                615,
                {
                    "input": [
                        616,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                617
            ],
            "validatePasswordResetToken": [
                628,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                629,
                {
                    "objectMetadataId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                650,
                {
                    "id": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                650
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                526
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
                526
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
                526
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
                526
            ],
            "permissions": [
                430
            ],
            "recordId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                526
            ],
            "workspaceMemberId": [
                526
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
                432
            ],
            "generalAccessLevel": [
                432
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                430
            ],
            "roles": [
                439
            ],
            "shares": [
                437
            ],
            "sharingMode": [
                438
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                432
            ],
            "id": [
                17
            ],
            "principalId": [
                526
            ],
            "principalRoleId": [
                526
            ],
            "principalType": [
                434
            ],
            "rowCause": [
                435
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
                526
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
                652
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
                526
            ],
            "recordId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                267
            ],
            "sourceObjectMetadata": [
                376
            ],
            "targetFieldMetadata": [
                267
            ],
            "targetObjectMetadata": [
                376
            ],
            "type": [
                443
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
                526
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
                526
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
                274
            ],
            "icon": [
                1
            ],
            "id": [
                526
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                384
            ],
            "permissionFlags": [
                450
            ],
            "rowLevelPermissionPredicateGroups": [
                453
            ],
            "rowLevelPermissionPredicates": [
                452
            ],
            "universalIdentifier": [
                526
            ],
            "workspaceMembers": [
                666
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
                526
            ],
            "roleId": [
                526
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
                457
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
                314
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
                455
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
                526
            ],
            "logicalOperator": [
                455
            ],
            "objectMetadataId": [
                526
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                526
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
                526
            ],
            "id": [
                526
            ],
            "operand": [
                457
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "rowLevelPermissionPredicateGroupId": [
                526
            ],
            "subFieldName": [
                1
            ],
            "value": [
                314
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
                460
            ],
            "messages": [
                460
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                314
            ],
            "runAsWorkspaceMemberId": [
                526
            ],
            "thread": [
                463
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
                526
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
                459
            ],
            "content": [
                1
            ],
            "role": [
                461
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
                314
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                526
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
                526
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                466
            ],
            "type": [
                297
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                526
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                466
            ],
            "type": [
                297
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
                210
            ],
            "fieldMetadataId": [
                526
            ],
            "id": [
                526
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                526
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                526
            ],
            "messageChannelId": [
                526
            ],
            "messageThreadId": [
                526
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
                526
            ],
            "messageThreadId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                526
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
                472
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
                475
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
                526
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
                314
            ],
            "workspaceMemberIds": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                526
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
                664
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
                210
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
                314
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                526
            ],
            "createdAt": [
                210
            ],
            "frontComponentId": [
                526
            ],
            "icon": [
                1
            ],
            "id": [
                526
            ],
            "position": [
                6
            ],
            "scope": [
                486
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                526
            ],
            "updatedAt": [
                210
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
                526
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
                526
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                466
            ],
            "type": [
                297
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
                676
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
                526
            ],
            "content": [
                1
            ],
            "createdAt": [
                210
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                210
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                448
            ],
            "configurationType": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                674
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
                261,
                {
                    "fieldFilters": [
                        255,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        262,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                428,
                {
                    "input": [
                        193,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                332,
                {
                    "input": [
                        333,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                13,
                {
                    "threadId": [
                        526,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                263,
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
                501
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                652
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
                526
            ],
            "createdAt": [
                210
            ],
            "emit": [
                505
            ],
            "frontComponentUniversalIdentifier": [
                526
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                526
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                526
            ],
            "universalIdentifier": [
                526
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                526
            ],
            "on": [
                1
            ],
            "through": [
                506
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                526
            ],
            "relationFieldUniversalIdentifier": [
                526
            ],
            "triggerFieldUniversalIdentifiers": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                652
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
                314
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
                526
            ],
            "personFilter": [
                314
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                210
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
                210
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                526
            ],
            "gt": [
                526
            ],
            "gte": [
                526
            ],
            "iLike": [
                526
            ],
            "in": [
                526
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                526
            ],
            "lt": [
                526
            ],
            "lte": [
                526
            ],
            "neq": [
                526
            ],
            "notILike": [
                526
            ],
            "notIn": [
                526
            ],
            "notLike": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                210
            ],
            "description": [
                1
            ],
            "id": [
                526
            ],
            "name": [
                1
            ],
            "updatedAt": [
                210
            ],
            "visibility": [
                530
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
                526
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
                526
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                314
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
                314
            ],
            "roleId": [
                526
            ],
            "triggers": [
                314
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
                526
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
                526
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                526
            ],
            "visibility": [
                350
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
                537
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
                539
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
                526
            ],
            "update": [
                541
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
                526
            ],
            "availabilityType": [
                154
            ],
            "engineComponentKey": [
                246
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                526
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                526
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                314
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
                314
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                526
            ],
            "options": [
                314
            ],
            "settings": [
                314
            ],
            "translations": [
                363
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
                526
            ],
            "update": [
                546
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
                526
            ],
            "update": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                314
            ],
            "databaseEventTriggerSettings": [
                314
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                314
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
                314
            ],
            "workflowActionTriggerSettings": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                526
            ],
            "update": [
                551
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                345
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
                352
            ],
            "visibility": [
                350
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                526
            ],
            "update": [
                553
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
                526
            ],
            "update": [
                553
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
                526
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
                526
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
                526
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
                526
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
                383
            ],
            "readability": [
                361
            ],
            "sharingReach": [
                391
            ],
            "shortcut": [
                1
            ],
            "translations": [
                363
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                526
            ],
            "update": [
                544
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                526
            ],
            "update": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                526
            ],
            "update": [
                556
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
                526
            ],
            "type": [
                400
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
                399
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
                526
            ],
            "layoutMode": [
                399
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                564
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
                314
            ],
            "configuration": [
                314
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                526
            ],
            "pageLayoutTabId": [
                526
            ],
            "position": [
                314
            ],
            "title": [
                1
            ],
            "type": [
                653
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
                314
            ],
            "configuration": [
                314
            ],
            "id": [
                526
            ],
            "objectMetadataId": [
                526
            ],
            "pageLayoutTabId": [
                526
            ],
            "position": [
                314
            ],
            "title": [
                1
            ],
            "type": [
                653
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
                526
            ],
            "tabs": [
                562
            ],
            "type": [
                400
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                526
            ],
            "update": [
                567
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
                526
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
                526
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                363
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
                530
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                526
            ],
            "payload": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                526
            ],
            "update": [
                573
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
                526
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
                526
            ],
            "update": [
                575
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
                526
            ],
            "update": [
                577
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                526
            ],
            "logicalOperator": [
                641
            ],
            "parentViewFilterGroupId": [
                526
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                526
            ],
            "update": [
                580
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                526
            ],
            "operand": [
                642
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                526
            ],
            "subFieldName": [
                1
            ],
            "value": [
                314
            ],
            "viewFilterGroupId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                526
            ],
            "update": [
                582
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                526
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
                526
            ],
            "calendarFieldMetadataId": [
                526
            ],
            "calendarLayout": [
                635
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                526
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                526
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                526
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                645
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                648
            ],
            "visibility": [
                649
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                526
            ],
            "update": [
                585
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                647
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
                526
            ],
            "update": [
                587
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
                314
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                526
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
                663
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                314
            ],
            "workspaceMemberId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                275
            ],
            "roleId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                526
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                593
            ],
            "id": [
                526
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
                593
            ],
            "groups": [
                594
            ],
            "widgetId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                385
            ],
            "roleId": [
                526
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                526
            ],
            "predicateGroups": [
                454
            ],
            "predicates": [
                456
            ],
            "roleId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                453
            ],
            "predicates": [
                452
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                604
            ],
            "viewFields": [
                601
            ],
            "viewFilterGroups": [
                602
            ],
            "viewFilters": [
                603
            ],
            "viewSorts": [
                605
            ],
            "widgetId": [
                526
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
                526
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                526
            ],
            "logicalOperator": [
                641
            ],
            "parentViewFilterGroupId": [
                526
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
                526
            ],
            "id": [
                526
            ],
            "operand": [
                642
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                526
            ],
            "subFieldName": [
                1
            ],
            "value": [
                314
            ],
            "viewFilterGroupId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                526
            ],
            "calendarFieldMetadataId": [
                526
            ],
            "calendarLayout": [
                635
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                526
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                526
            ],
            "openRecordIn": [
                645
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                647
            ],
            "fieldMetadataId": [
                526
            ],
            "id": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                210
            ],
            "periodStart": [
                210
            ],
            "timeSeries": [
                619
            ],
            "usageByApplication": [
                608
            ],
            "usageByModel": [
                608
            ],
            "usageByOperationType": [
                608
            ],
            "usageByUser": [
                608
            ],
            "userDailyUsage": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                611
            ],
            "periodEnd": [
                210
            ],
            "periodStart": [
                210
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
                210
            ],
            "id": [
                526
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                97
            ],
            "operationType": [
                611
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                618
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                620
            ],
            "updatedAt": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                620
            ],
            "operationType": [
                611
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                610
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                614
            ],
            "resourceType": [
                618
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                612
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
                611
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                620
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
                210
            ],
            "periodStart": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                611
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                618
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                620
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
                526
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                97
            ],
            "operationType": [
                611
            ],
            "periodEnd": [
                210
            ],
            "periodStart": [
                210
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                97
            ],
            "resourceType": [
                618
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
                620
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
                619
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
                210
            ],
            "currentUserWorkspace": [
                626
            ],
            "currentWorkspace": [
                657
            ],
            "deletedAt": [
                210
            ],
            "deletedWorkspaceMembers": [
                223
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
                526
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
                392
            ],
            "previousOnboardingStatus": [
                392
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                210
            ],
            "userVars": [
                315
            ],
            "userWorkspaces": [
                626
            ],
            "workspaceMember": [
                666
            ],
            "workspaceMembers": [
                666
            ],
            "workspaces": [
                626
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
                314
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
                210
            ],
            "expiresAt": [
                210
            ],
            "id": [
                526
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
                210
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "id": [
                526
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                384
            ],
            "objectsPermissions": [
                384
            ],
            "permissionFlags": [
                409
            ],
            "twoFactorAuthenticationMethodSummary": [
                522
            ],
            "updatedAt": [
                210
            ],
            "user": [
                622
            ],
            "userId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                526
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
                526
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
                526
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                526
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
                675
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
                526
            ],
            "calendarEndFieldMetadataId": [
                526
            ],
            "calendarFieldMetadataId": [
                526
            ],
            "calendarLayout": [
                635
            ],
            "createdAt": [
                210
            ],
            "createdByUserWorkspaceId": [
                526
            ],
            "deletedAt": [
                210
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                526
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
                526
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                644
            ],
            "mainGroupByFieldMetadataId": [
                526
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                526
            ],
            "openRecordIn": [
                645
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                648
            ],
            "universalIdentifier": [
                526
            ],
            "updatedAt": [
                210
            ],
            "viewFieldGroups": [
                638
            ],
            "viewFields": [
                637
            ],
            "viewFilterGroups": [
                640
            ],
            "viewFilters": [
                639
            ],
            "viewGroups": [
                643
            ],
            "viewSorts": [
                646
            ],
            "visibility": [
                649
            ],
            "workspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                652
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
                526
            ],
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "fieldMetadataId": [
                526
            ],
            "id": [
                526
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
                526
            ],
            "updatedAt": [
                210
            ],
            "viewFieldGroupId": [
                526
            ],
            "viewId": [
                526
            ],
            "workspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "id": [
                526
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
                210
            ],
            "viewFields": [
                637
            ],
            "viewId": [
                526
            ],
            "workspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "fieldMetadataId": [
                526
            ],
            "id": [
                526
            ],
            "operand": [
                642
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                526
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                210
            ],
            "value": [
                314
            ],
            "viewFilterGroupId": [
                526
            ],
            "viewId": [
                526
            ],
            "workspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "id": [
                526
            ],
            "logicalOperator": [
                641
            ],
            "parentViewFilterGroupId": [
                526
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                210
            ],
            "viewId": [
                526
            ],
            "workspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "fieldValue": [
                1
            ],
            "id": [
                526
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                210
            ],
            "viewId": [
                526
            ],
            "workspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "direction": [
                647
            ],
            "fieldMetadataId": [
                526
            ],
            "id": [
                526
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                210
            ],
            "viewId": [
                526
            ],
            "workspaceId": [
                526
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
                526
            ],
            "createdAt": [
                210
            ],
            "deletedAt": [
                210
            ],
            "description": [
                1
            ],
            "id": [
                526
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
                210
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
                239
            ],
            "on_EmailsConfiguration": [
                243
            ],
            "on_FieldConfiguration": [
                268
            ],
            "on_FieldRichTextConfiguration": [
                276
            ],
            "on_FieldsConfiguration": [
                277
            ],
            "on_FilesConfiguration": [
                283
            ],
            "on_FormFieldConfiguration": [
                286
            ],
            "on_FrontComponentConfiguration": [
                288
            ],
            "on_IframeConfiguration": [
                298
            ],
            "on_LineChartConfiguration": [
                318
            ],
            "on_MessageCampaignBodyConfiguration": [
                341
            ],
            "on_MessageCampaignDetailsConfiguration": [
                342
            ],
            "on_NotesConfiguration": [
                375
            ],
            "on_PieChartConfiguration": [
                410
            ],
            "on_RecordTableConfiguration": [
                440
            ],
            "on_StandaloneRichTextConfiguration": [
                493
            ],
            "on_TasksConfiguration": [
                503
            ],
            "on_TimelineConfiguration": [
                507
            ],
            "on_ViewConfiguration": [
                636
            ],
            "on_WorkflowConfiguration": [
                654
            ],
            "on_WorkflowRunConfiguration": [
                655
            ],
            "on_WorkflowVersionConfiguration": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                658
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
                314
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
                210
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
                449
            ],
            "deletedAt": [
                210
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
                265
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                526
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
                526
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
                210
            ],
            "viewFields": [
                637
            ],
            "viewFilterGroups": [
                640
            ],
            "viewFilters": [
                639
            ],
            "viewGroups": [
                643
            ],
            "viewSorts": [
                646
            ],
            "views": [
                634
            ],
            "workspaceCustomApplication": [
                45
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                663
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                675
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
                314
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                660
            ],
            "personEnrichment": [
                314
            ],
            "personOutcome": [
                673
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
                210
            ],
            "id": [
                526
            ],
            "roleId": [
                526
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
                668
            ],
            "id": [
                526
            ],
            "locale": [
                1
            ],
            "name": [
                290
            ],
            "numberFormat": [
                669
            ],
            "openRecordIn": [
                395
            ],
            "roles": [
                449
            ],
            "timeFormat": [
                670
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
                526
            ],
            "userWorkspaceId": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                526
            ],
            "variables": [
                623
            ],
            "workspaceMemberId": [
                526
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
                314
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
                526
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
                526
            ],
            "workspaceUrls": [
                675
            ],
            "__typename": [
                1
            ]
        }
    }
}