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
        294,
        305,
        312,
        313,
        314,
        326,
        328,
        344,
        345,
        346,
        347,
        348,
        349,
        351,
        352,
        353,
        356,
        357,
        359,
        360,
        363,
        365,
        369,
        373,
        382,
        389,
        390,
        391,
        394,
        398,
        399,
        404,
        408,
        431,
        433,
        434,
        437,
        442,
        454,
        456,
        460,
        465,
        485,
        497,
        498,
        500,
        525,
        527,
        529,
        592,
        612,
        619,
        621,
        625,
        636,
        642,
        643,
        645,
        646,
        648,
        649,
        650,
        653,
        654,
        659,
        661,
        664,
        669,
        670,
        671,
        674,
        675
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
                312
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
                525
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
                525
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
                312
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
                312
            ],
            "roleId": [
                525
            ],
            "triggers": [
                312
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
                525
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                525
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
                525
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
                525
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
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                312
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
                525
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
            "lastResolvedMentionAt": [
                209
            ],
            "snoozedUntil": [
                209
            ],
            "threadId": [
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                525
            ],
            "createdAt": [
                209
            ],
            "id": [
                525
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
                525
            ],
            "senderWorkspaceMemberId": [
                525
            ],
            "status": [
                1
            ],
            "threadId": [
                525
            ],
            "turnId": [
                525
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
                525
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                525
            ],
            "messageId": [
                525
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                312
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
                312
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                312
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
                525
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                525
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
                525
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
                525
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
                525
            ],
            "aggregateOperation": [
                26
            ],
            "configurationType": [
                653
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                312
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
                426
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
                525
            ],
            "name": [
                1
            ],
            "revokedAt": [
                209
            ],
            "role": [
                448
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
                525
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
                312
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
                525
            ],
            "role": [
                353
            ],
            "workspaceMemberId": [
                525
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
                525
            ],
            "applicationVariables": [
                77
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                312
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
                448
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
                525
            ],
            "id": [
                525
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                325
            ],
            "logoFileId": [
                525
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                375
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                525
            ],
            "settingsCustomTabFrontComponentId": [
                525
            ],
            "settingsMenuItems": [
                484
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                525
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
                525
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
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                525
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
                422
            ],
            "connectionProviderId": [
                525
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
                525
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
                525
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
                525
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
                312
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
                525
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
                525
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
                525
            ],
            "connectionProviders": [
                49
            ],
            "settingsMenuItems": [
                484
            ],
            "variables": [
                624
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
                525
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
                525
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
                634
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                525
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
                525
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
                312
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
                525
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
                312
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
                525
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
                464
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
                525
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
                463
            ],
            "workspaceUrls": [
                676
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
                525
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
                653
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
                312
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
                389
            ],
            "primaryAxisGroupByFieldMetadataId": [
                525
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                292
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                389
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                525
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                292
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
                312
            ],
            "formattedToRawLookup": [
                312
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
                312
            ],
            "objectMetadataId": [
                525
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
                525
            ],
            "userCreditsFallback": [
                625
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
                498
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
                497
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
                497
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
                525
            ],
            "interval": [
                497
            ],
            "metadata": [
                312
            ],
            "phases": [
                120
            ],
            "status": [
                498
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
                525
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
                525
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
                525
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
                653
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                653
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
                653
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                312
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
                653
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
                369
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                371
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
                420
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                482
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                499
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
                525
            ],
            "availabilityObjectMetadataId": [
                525
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
                525
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
                525
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                525
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
                525
            ],
            "pageLayoutId": [
                525
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
                525
            ],
            "updatedAt": [
                209
            ],
            "workflowVersionId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                381
            ],
            "on_PathCommandMenuItemPayload": [
                406
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
                525
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
                422
            ],
            "connectionProviderId": [
                525
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
                525
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
                525
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
                297
            ],
            "handle": [
                1
            ],
            "id": [
                525
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                525
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
                525
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
                312
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
                312
            ],
            "roleId": [
                525
            ],
            "triggers": [
                312
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                525
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                525
            ],
            "participantHandleFieldUniversalIdentifier": [
                525
            ],
            "visibility": [
                349
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
                525
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
                525
            ],
            "engineComponentKey": [
                243
            ],
            "frontComponentId": [
                525
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
                525
            ],
            "pageLayoutId": [
                525
            ],
            "payload": [
                312
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                525
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
                343
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
                312
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
                312
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                525
            ],
            "options": [
                312
            ],
            "relationCreationPayload": [
                312
            ],
            "settings": [
                312
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
                525
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
                525
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
                305
            ],
            "objectMetadataId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                312
            ],
            "databaseEventTriggerSettings": [
                312
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                312
            ],
            "id": [
                525
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                312
            ],
            "source": [
                312
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                312
            ],
            "universalIdentifier": [
                525
            ],
            "workflowActionTriggerSettings": [
                312
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                525
            ],
            "id": [
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                525
            ],
            "color": [
                1
            ],
            "folderId": [
                525
            ],
            "icon": [
                1
            ],
            "id": [
                525
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                525
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                525
            ],
            "targetRecordId": [
                525
            ],
            "type": [
                373
            ],
            "userWorkspaceId": [
                525
            ],
            "viewId": [
                525
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
                312
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
                525
            ],
            "type": [
                399
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                398
            ],
            "pageLayoutId": [
                525
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
                312
            ],
            "objectMetadataId": [
                525
            ],
            "pageLayoutTabId": [
                525
            ],
            "position": [
                312
            ],
            "title": [
                1
            ],
            "type": [
                654
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                525
            ],
            "filter": [
                312
            ],
            "objectMetadataId": [
                525
            ],
            "orderBy": [
                312
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
                525
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
                529
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
                612
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                619
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                621
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
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                525
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
                525
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
                525
            ],
            "id": [
                525
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
                525
            ],
            "viewId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                525
            ],
            "logicalOperator": [
                642
            ],
            "parentViewFilterGroupId": [
                525
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                525
            ],
            "id": [
                525
            ],
            "operand": [
                643
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                525
            ],
            "subFieldName": [
                1
            ],
            "value": [
                312
            ],
            "viewFilterGroupId": [
                525
            ],
            "viewId": [
                525
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
                525
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                525
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
                525
            ],
            "calendarFieldMetadataId": [
                525
            ],
            "calendarLayout": [
                636
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                525
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                525
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                645
            ],
            "mainGroupByFieldMetadataId": [
                525
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                525
            ],
            "openRecordIn": [
                646
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                649
            ],
            "visibility": [
                650
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                648
            ],
            "fieldMetadataId": [
                525
            ],
            "id": [
                525
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                525
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
                525
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
                612
            ],
            "resource": [
                619
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                525
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
                525
            ],
            "name": [
                287
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                525
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
                525
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
                525
            ],
            "pageLayoutId": [
                525
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
                525
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
                525
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                465
            ],
            "type": [
                294
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                525
            ],
            "status": [
                465
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
                653
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
                525
            ],
            "status": [
                240
            ],
            "tenantStatus": [
                241
            ],
            "unsubscribeHostnameStatus": [
                527
            ],
            "updatedAt": [
                209
            ],
            "verificationRecords": [
                631
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
                653
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
                312
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
                312
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
                312
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
                312
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
                358
            ],
            "objectRecordEventsWithQueryIds": [
                388
            ],
            "queueJobEvents": [
                315
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                525
            ],
            "payload": [
                312
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
                525
            ],
            "createdAt": [
                209
            ],
            "defaultValue": [
                312
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
                525
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
                525
            ],
            "morphRelations": [
                441
            ],
            "name": [
                1
            ],
            "object": [
                375
            ],
            "objectMetadataId": [
                525
            ],
            "options": [
                312
            ],
            "relation": [
                441
            ],
            "settings": [
                312
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
                365
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                653
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
                395
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
                526
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
                526
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
                525
            ],
            "id": [
                525
            ],
            "objectMetadataId": [
                525
            ],
            "roleId": [
                525
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
                525
            ],
            "objectMetadataId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                653
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
                525
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
                525
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
                525
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
                525
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
                653
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                525
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                465
            ],
            "type": [
                294
            ],
            "workspace": [
                673
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
                356
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                653
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
                525
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                76
            ],
            "applicationVariables": [
                312
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
                525
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
                525
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
                653
            ],
            "frontComponentId": [
                525
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                525
            ],
            "pageLayoutType": [
                399
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
                525
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
                525
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
                525
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
                525
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
                653
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
                298
            ],
            "IMAP": [
                298
            ],
            "SMTP": [
                298
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
                677
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
                525
            ],
            "threadId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                525
            ],
            "createdAt": [
                209
            ],
            "id": [
                525
            ],
            "indexFieldMetadataList": [
                303
            ],
            "indexType": [
                305
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
                301
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
                525
            ],
            "id": [
                525
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
                304
            ],
            "id": [
                526
            ],
            "isCustom": [
                125
            ],
            "or": [
                304
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                525
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
                308
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
                525
            ],
            "messageThreadId": [
                525
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
                314
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                525
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
                653
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
                312
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
                389
            ],
            "primaryAxisGroupByFieldMetadataId": [
                525
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                292
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                389
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                525
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                292
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
                312
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                320
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
                312
            ],
            "objectMetadataId": [
                525
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
                319
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                525
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
                525
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                209
            ],
            "cronTriggerSettings": [
                312
            ],
            "databaseEventTriggerSettings": [
                312
            ],
            "description": [
                1
            ],
            "executionMode": [
                326
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                312
            ],
            "id": [
                525
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
                312
            ],
            "universalIdentifier": [
                525
            ],
            "updatedAt": [
                209
            ],
            "workflowActionTriggerSettings": [
                312
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                312
            ],
            "duration": [
                6
            ],
            "error": [
                312
            ],
            "logs": [
                1
            ],
            "status": [
                328
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                525
            ],
            "applicationUniversalIdentifier": [
                525
            ],
            "id": [
                525
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                525
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
                312
            ],
            "name": [
                1
            ],
            "objects": [
                335
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                336
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
                337
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                338
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
                525
            ],
            "connectionProviderId": [
                525
            ],
            "createdAt": [
                209
            ],
            "id": [
                525
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
                653
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                653
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
                525
            ],
            "contactAutoCreationPolicy": [
                344
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
                525
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
                351
            ],
            "messagingProviderUniversalIdentifier": [
                525
            ],
            "participantHandleFieldUniversalIdentifier": [
                525
            ],
            "pendingGroupEmailsAction": [
                345
            ],
            "syncStage": [
                346
            ],
            "syncStageStartedAt": [
                209
            ],
            "syncStatus": [
                347
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
                348
            ],
            "updatedAt": [
                209
            ],
            "visibility": [
                349
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
                525
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                525
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                352
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
                525
            ],
            "reason": [
                356
            ],
            "source": [
                357
            ],
            "unsubscribeTopicId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                354
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
                387
            ],
            "recordId": [
                1
            ],
            "type": [
                359
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
                525
            ],
            "property": [
                1
            ],
            "provenance": [
                363
            ],
            "recordId": [
                525
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
                525
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                525
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
                367
            ],
            "views": [
                368
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
                525
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
                525
            ],
            "key": [
                645
            ],
            "objectMetadataId": [
                525
            ],
            "type": [
                649
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                491,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                658,
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
                        525,
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
                        525
                    ],
                    "threadId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        525,
                        "UUID!"
                    ],
                    "roleId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        525,
                        "UUID!"
                    ],
                    "roleId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        300,
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
                        497,
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
                        525,
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
                        525,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                393,
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
                343,
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
                        525
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
                372,
                {
                    "inputs": [
                        184,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                639,
                {
                    "inputs": [
                        198,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                638,
                {
                    "inputs": [
                        199,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                644,
                {
                    "inputs": [
                        202,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                339,
                {
                    "input": [
                        182,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                354,
                {
                    "input": [
                        183,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                372,
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
                488,
                {
                    "input": [
                        486,
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
                        525,
                        "UUID!"
                    ],
                    "properties": [
                        312
                    ],
                    "recordId": [
                        525,
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
                301,
                {
                    "input": [
                        187,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                325,
                {
                    "input": [
                        181,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                375,
                {
                    "input": [
                        188,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                448,
                {
                    "createRoleInput": [
                        193,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                396,
                {
                    "input": [
                        189,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                397,
                {
                    "input": [
                        190,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                400,
                {
                    "input": [
                        191,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                419,
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
                488,
                {
                    "input": [
                        487,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                491,
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
                        497,
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
                528,
                {
                    "input": [
                        195,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                610,
                {
                    "input": [
                        196,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                630,
                {
                    "input": [
                        197,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                635,
                {
                    "input": [
                        203,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                638,
                {
                    "input": [
                        199,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                639,
                {
                    "input": [
                        198,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                640,
                {
                    "input": [
                        201,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                641,
                {
                    "input": [
                        200,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                644,
                {
                    "input": [
                        202,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                647,
                {
                    "input": [
                        204,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                651,
                {
                    "input": [
                        205,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                491,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        525,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        525
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
                343,
                {
                    "id": [
                        525,
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                157,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                658
            ],
            "deleteEmailGroupChannel": [
                343,
                {
                    "id": [
                        525,
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                372,
                {
                    "ids": [
                        525,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                339,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                372,
                {
                    "id": [
                        525,
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
                301,
                {
                    "input": [
                        212,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                325,
                {
                    "input": [
                        329,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                375,
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
                        525,
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
                        525,
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
                491,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                216,
                {
                    "twoFactorAuthenticationMethodId": [
                        525,
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                623
            ],
            "deleteUserFromWorkspace": [
                627,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                630,
                {
                    "id": [
                        525,
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
                638,
                {
                    "input": [
                        218,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                639,
                {
                    "input": [
                        217,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                640,
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
                644,
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
                651,
                {
                    "id": [
                        525,
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
                638,
                {
                    "input": [
                        224,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                639,
                {
                    "input": [
                        223,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                640,
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
                644,
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
                        300,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                157,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                231,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                232,
                {
                    "id": [
                        525,
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
                        525
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
                662
            ],
            "executeOneLogicFunction": [
                327,
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
                        525,
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                82
            ],
            "generateTransientToken": [
                508
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                522,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        525,
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
                523,
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
                332,
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
                392
            ],
            "grantApplicationCapabilities": [
                47,
                {
                    "input": [
                        291,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                299,
                {
                    "userId": [
                        525,
                        "UUID!"
                    ],
                    "workspaceId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                307,
                {
                    "input": [
                        306,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                309,
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
                309
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        525
                    ],
                    "threadId": [
                        525,
                        "UUID!"
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        443,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                435,
                {
                    "principal": [
                        432,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        440,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        525,
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        444,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                445,
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
                478,
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                396,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                400,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                503,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                470,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        525,
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
                        446,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                450,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                461,
                {
                    "input": [
                        457,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                61,
                {
                    "applicationId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                296,
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
                        525
                    ]
                }
            ],
            "sendAppChannelMessage": [
                469,
                {
                    "input": [
                        468,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                470,
                {
                    "browsingContext": [
                        312
                    ],
                    "channelId": [
                        525
                    ],
                    "fileAttachments": [
                        276,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        525,
                        "[UUID!]"
                    ],
                    "messageId": [
                        525,
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                473,
                {
                    "input": [
                        472,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                477,
                {
                    "input": [
                        476,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                478,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        525
                    ]
                }
            ],
            "sendMessageCampaign": [
                480,
                {
                    "input": [
                        479,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                475,
                {
                    "input": [
                        481,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                40,
                {
                    "input": [
                        483,
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
                435,
                {
                    "accessLevel": [
                        431,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        440,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                435,
                {
                    "accessLevel": [
                        431,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        432,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        440,
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
                489,
                {
                    "input": [
                        490
                    ]
                }
            ],
            "signUpInWorkspace": [
                489,
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
                        525
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
                393,
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                139,
                {
                    "connectedAccountId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                493,
                {
                    "companyContext": [
                        312
                    ],
                    "personContext": [
                        312
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                494
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
                350,
                {
                    "input": [
                        501,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                672,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        312,
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
                        312
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
                510,
                {
                    "input": [
                        509,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                514,
                {
                    "input": [
                        511,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                513,
                {
                    "input": [
                        512,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                518,
                {
                    "input": [
                        515,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                517,
                {
                    "input": [
                        516,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                520,
                {
                    "input": [
                        519,
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
                        525,
                        "UUID!"
                    ],
                    "input": [
                        530,
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
                        525,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                36,
                {
                    "input": [
                        532,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                343,
                {
                    "input": [
                        533,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                45,
                {
                    "id": [
                        525,
                        "UUID!"
                    ],
                    "input": [
                        534,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                71,
                {
                    "input": [
                        535,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                75,
                {
                    "input": [
                        537,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                126,
                {
                    "input": [
                        539,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                153,
                {
                    "input": [
                        541,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                343,
                {
                    "input": [
                        542,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                284,
                {
                    "input": [
                        544,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                262,
                {
                    "input": [
                        546,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                372,
                {
                    "inputs": [
                        559,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                375,
                {
                    "inputs": [
                        560,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                644,
                {
                    "inputs": [
                        582,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                339,
                {
                    "input": [
                        549,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                343,
                {
                    "input": [
                        551,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                350,
                {
                    "input": [
                        553,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                350,
                {
                    "input": [
                        555,
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
                372,
                {
                    "input": [
                        559,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        531,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        525
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
                        558,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        547,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                375,
                {
                    "input": [
                        560,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                448,
                {
                    "updateRoleInput": [
                        567,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                396,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        561,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        562,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                400,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        564,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                396,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        566,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                310,
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
                491,
                {
                    "input": [
                        569,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                503,
                {
                    "input": [
                        570,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                528,
                {
                    "input": [
                        571,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                610,
                {
                    "input": [
                        572,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                99,
                {
                    "userCreditsFallback": [
                        625,
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
                630,
                {
                    "input": [
                        573,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                635,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        584,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                638,
                {
                    "input": [
                        577,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                639,
                {
                    "input": [
                        575,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                640,
                {
                    "input": [
                        580,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                641,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        579,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                644,
                {
                    "input": [
                        582,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                647,
                {
                    "input": [
                        585,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                651,
                {
                    "input": [
                        587,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                658,
                {
                    "data": [
                        590,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                658,
                {
                    "data": [
                        589,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                667,
                {
                    "roleId": [
                        525,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        591,
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
                        592,
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
                        592,
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
                        592,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                279,
                {
                    "file": [
                        592,
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
                        592,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                279,
                {
                    "file": [
                        592,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                271,
                {
                    "upsertFieldPermissionsInput": [
                        593,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                635,
                {
                    "input": [
                        596,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                383,
                {
                    "upsertObjectPermissionsInput": [
                        597,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                449,
                {
                    "upsertPermissionFlagsInput": [
                        598,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                600,
                {
                    "input": [
                        599,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                635,
                {
                    "input": [
                        601,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                79,
                {
                    "input": [
                        628,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                632,
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
                633,
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
                525
            ],
            "applicationId": [
                525
            ],
            "color": [
                1
            ],
            "createdAt": [
                209
            ],
            "folderId": [
                525
            ],
            "icon": [
                1
            ],
            "id": [
                525
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                525
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                525
            ],
            "targetRecordId": [
                525
            ],
            "targetRecordIdentifier": [
                428
            ],
            "type": [
                373
            ],
            "updatedAt": [
                209
            ],
            "userWorkspaceId": [
                525
            ],
            "viewId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                525
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
                378,
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
                525
            ],
            "imageIdentifierFieldMetadataId": [
                525
            ],
            "indexMetadataList": [
                301
            ],
            "indexMetadatas": [
                380,
                {
                    "filter": [
                        304,
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
                525
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
                382
            ],
            "readability": [
                360
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                525
            ],
            "searchFieldMetadataList": [
                467
            ],
            "sharingReach": [
                390
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
                365
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                377
            ],
            "pageInfo": [
                395
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
                375
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
                395
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                379
            ],
            "id": [
                526
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
                379
            ],
            "universalIdentifier": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                302
            ],
            "pageInfo": [
                395
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                525
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
                525
            ],
            "restrictedFields": [
                312
            ],
            "rowLevelPermissionPredicateGroups": [
                452
            ],
            "rowLevelPermissionPredicates": [
                451
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
                525
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
                387
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
                312
            ],
            "before": [
                312
            ],
            "diff": [
                312
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
                386
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
                391
            ],
            "previousOnboardingStatus": [
                391
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
                525
            ],
            "createdAt": [
                209
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                525
            ],
            "deletedAt": [
                209
            ],
            "id": [
                525
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
                525
            ],
            "tabs": [
                397
            ],
            "type": [
                399
            ],
            "universalIdentifier": [
                525
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
                525
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
                525
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
                398
            ],
            "pageLayoutId": [
                525
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                525
            ],
            "updatedAt": [
                209
            ],
            "widgets": [
                400
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                525
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                312
            ],
            "configuration": [
                652
            ],
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "gridPosition": [
                293
            ],
            "id": [
                525
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
                525
            ],
            "pageLayoutTabId": [
                525
            ],
            "position": [
                403
            ],
            "title": [
                1
            ],
            "type": [
                654
            ],
            "universalIdentifier": [
                525
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
                398
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
                398
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
                401
            ],
            "on_PageLayoutWidgetGridPosition": [
                402
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                405
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                404
            ],
            "index": [
                10
            ],
            "layoutMode": [
                398
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
                525
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
                525
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
                525
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
                525
            ],
            "aggregateOperation": [
                26
            ],
            "color": [
                1
            ],
            "configurationType": [
                653
            ],
            "dateGranularity": [
                389
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
                312
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                525
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
                292
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
                412
            ],
            "formattedToRawLookup": [
                312
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
                312
            ],
            "objectMetadataId": [
                525
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
                324
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
                342
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                525
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
                525
            ],
            "createdAt": [
                209
            ],
            "domain": [
                1
            ],
            "id": [
                525
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
                421
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
                418
            ],
            "IMAP": [
                418
            ],
            "SMTP": [
                418
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
                525
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                676
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
                525
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
                        525,
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
                        525,
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
                        321
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
                343,
                {
                    "filter": [
                        322
                    ]
                }
            ],
            "appMessageFolders": [
                350,
                {
                    "filter": [
                        323
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                48,
                {
                    "applicationId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                49,
                {
                    "applicationId": [
                        525,
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
                466,
                {
                    "applicationId": [
                        525,
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
                525,
                {
                    "calendarEventId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                20,
                {
                    "threadId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                142,
                {
                    "threadId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                16,
                {
                    "id": [
                        525,
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
                666,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                495,
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
                        525,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                153
            ],
            "currentUser": [
                623
            ],
            "currentUserApplicationAuthorizations": [
                46
            ],
            "currentUserSessions": [
                626
            ],
            "currentWorkspace": [
                658
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
                    "shouldIncludeDependencies": [
                        4
                    ],
                    "universalIdentifier": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                264,
                {
                    "id": [
                        525,
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
                417,
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
                315,
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
                325
            ],
            "findManyMarketplaceApps": [
                333,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                419
            ],
            "findMarketplaceAppDetail": [
                334,
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
                        525
                    ],
                    "universalIdentifier": [
                        525
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
                325,
                {
                    "input": [
                        329,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                315,
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
                315,
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
                660
            ],
            "findWorkspaceFromInviteHash": [
                658,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                665
            ],
            "frontComponent": [
                284,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                284
            ],
            "getAddressDetails": [
                413,
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
                448
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
                312,
                {
                    "input": [
                        329,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                159,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                239
            ],
            "getInviteSuggestions": [
                311
            ],
            "getJobs": [
                315,
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
                        329,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                396,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                397,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                400,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                400,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                396,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        399
                    ]
                }
            ],
            "getPermissionFlags": [
                407
            ],
            "getPublicWorkspaceDataByDomain": [
                423,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                424,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                115
            ],
            "getRole": [
                448,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                448
            ],
            "getSSOIdentityProviders": [
                281
            ],
            "getToolIndex": [
                507
            ],
            "getToolInputSchema": [
                312,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                607,
                {
                    "input": [
                        608
                    ]
                }
            ],
            "getView": [
                635,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                638,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                639,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                639,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                638,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                640,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                641,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                641,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                640,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                644,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                644,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                647,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                647,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                635,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        649,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                663
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
                317,
                {
                    "input": [
                        318,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                106
            ],
            "mcpServer": [
                339,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                339
            ],
            "messageSuppressions": [
                355,
                {
                    "input": [
                        282,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                361,
                {
                    "input": [
                        364,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                366
            ],
            "mostlyEmptyFieldMetadataIds": [
                525,
                {
                    "objectMetadataId": [
                        525,
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
                        525
                    ]
                }
            ],
            "myConnectedAccounts": [
                157
            ],
            "myMessageChannels": [
                343,
                {
                    "connectedAccountId": [
                        525
                    ]
                }
            ],
            "myMessageFolders": [
                350,
                {
                    "messageChannelId": [
                        525
                    ]
                }
            ],
            "myUserApplicationVariables": [
                668
            ],
            "navigationMenuItem": [
                372,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                372
            ],
            "object": [
                375,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                385
            ],
            "objects": [
                376,
                {
                    "filter": [
                        379,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        207,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                410,
                {
                    "input": [
                        411,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                134,
                {
                    "input": [
                        414,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                416,
                {
                    "input": [
                        415,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                334,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                333
            ],
            "recordPermissions": [
                430,
                {
                    "targets": [
                        440,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                435,
                {
                    "target": [
                        440,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                491,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                491
            ],
            "timelineActivityTypes": [
                503
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                524,
                {
                    "userId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                528
            ],
            "usageLimits": [
                610
            ],
            "usageQuotaDefinitions": [
                614
            ],
            "usageQuotaScopeConsumption": [
                616,
                {
                    "input": [
                        617,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                618
            ],
            "validatePasswordResetToken": [
                629,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                630,
                {
                    "objectMetadataId": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                651,
                {
                    "id": [
                        525,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                651
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                525
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
                525
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
                525
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
                525
            ],
            "permissions": [
                429
            ],
            "recordId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                525
            ],
            "workspaceMemberId": [
                525
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
                431
            ],
            "generalAccessLevel": [
                431
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                429
            ],
            "roles": [
                438
            ],
            "shares": [
                436
            ],
            "sharingMode": [
                437
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                431
            ],
            "id": [
                17
            ],
            "principalId": [
                525
            ],
            "principalRoleId": [
                525
            ],
            "principalType": [
                433
            ],
            "rowCause": [
                434
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
                525
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
                653
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
                525
            ],
            "recordId": [
                525
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
                375
            ],
            "targetFieldMetadata": [
                264
            ],
            "targetObjectMetadata": [
                375
            ],
            "type": [
                442
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
                525
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
                525
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
                525
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                383
            ],
            "permissionFlags": [
                449
            ],
            "rowLevelPermissionPredicateGroups": [
                452
            ],
            "rowLevelPermissionPredicates": [
                451
            ],
            "universalIdentifier": [
                525
            ],
            "workspaceMembers": [
                667
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
                525
            ],
            "roleId": [
                525
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
                456
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
                312
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
                454
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
                525
            ],
            "logicalOperator": [
                454
            ],
            "objectMetadataId": [
                525
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                525
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
                525
            ],
            "id": [
                525
            ],
            "operand": [
                456
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "rowLevelPermissionPredicateGroupId": [
                525
            ],
            "subFieldName": [
                1
            ],
            "value": [
                312
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
                459
            ],
            "messages": [
                459
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                312
            ],
            "runAsWorkspaceMemberId": [
                525
            ],
            "thread": [
                462
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
                525
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
                458
            ],
            "content": [
                1
            ],
            "role": [
                460
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
                312
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                525
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
                525
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                465
            ],
            "type": [
                294
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                525
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                465
            ],
            "type": [
                294
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
                525
            ],
            "id": [
                525
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                525
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
                525
            ],
            "messageChannelId": [
                525
            ],
            "messageThreadId": [
                525
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
                525
            ],
            "messageThreadId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                525
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
                471
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
                474
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
                525
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
                312
            ],
            "workspaceMemberIds": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                525
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
                665
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
                312
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                525
            ],
            "createdAt": [
                209
            ],
            "frontComponentId": [
                525
            ],
            "icon": [
                1
            ],
            "id": [
                525
            ],
            "position": [
                6
            ],
            "scope": [
                485
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                525
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
                525
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
                525
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                465
            ],
            "type": [
                294
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
                677
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
                525
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
                525
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
                447
            ],
            "configurationType": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                675
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
                427,
                {
                    "input": [
                        192,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                330,
                {
                    "input": [
                        331,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                13,
                {
                    "threadId": [
                        525,
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
                500
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                653
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
                525
            ],
            "createdAt": [
                209
            ],
            "emit": [
                504
            ],
            "frontComponentUniversalIdentifier": [
                525
            ],
            "icon": [
                1
            ],
            "id": [
                525
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
                525
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                525
            ],
            "universalIdentifier": [
                525
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
                525
            ],
            "on": [
                1
            ],
            "through": [
                505
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                525
            ],
            "relationFieldUniversalIdentifier": [
                525
            ],
            "triggerFieldUniversalIdentifiers": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                653
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
                312
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
                525
            ],
            "personFilter": [
                312
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
                525
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
                525
            ],
            "gt": [
                525
            ],
            "gte": [
                525
            ],
            "iLike": [
                525
            ],
            "in": [
                525
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                525
            ],
            "lt": [
                525
            ],
            "lte": [
                525
            ],
            "neq": [
                525
            ],
            "notILike": [
                525
            ],
            "notIn": [
                525
            ],
            "notLike": [
                525
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
                525
            ],
            "name": [
                1
            ],
            "updatedAt": [
                209
            ],
            "visibility": [
                529
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
                525
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
                525
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                312
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
                312
            ],
            "roleId": [
                525
            ],
            "triggers": [
                312
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
                525
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
                525
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                525
            ],
            "visibility": [
                349
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
                536
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
                538
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
                525
            ],
            "update": [
                540
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
                525
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
                525
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                312
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
                312
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                525
            ],
            "options": [
                312
            ],
            "settings": [
                312
            ],
            "translations": [
                362
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
                525
            ],
            "update": [
                545
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
                525
            ],
            "update": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                312
            ],
            "databaseEventTriggerSettings": [
                312
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                312
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
                312
            ],
            "workflowActionTriggerSettings": [
                312
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                525
            ],
            "update": [
                550
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                525
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
                525
            ],
            "update": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                344
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
                351
            ],
            "visibility": [
                349
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                525
            ],
            "update": [
                554
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
                525
            ],
            "update": [
                554
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
                525
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
                525
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
                525
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
                525
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
                382
            ],
            "readability": [
                360
            ],
            "sharingReach": [
                390
            ],
            "shortcut": [
                1
            ],
            "translations": [
                362
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                525
            ],
            "update": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                525
            ],
            "update": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                525
            ],
            "update": [
                557
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
                525
            ],
            "type": [
                399
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
                398
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
                525
            ],
            "layoutMode": [
                398
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                565
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
                312
            ],
            "configuration": [
                312
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                525
            ],
            "pageLayoutTabId": [
                525
            ],
            "position": [
                312
            ],
            "title": [
                1
            ],
            "type": [
                654
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
                312
            ],
            "configuration": [
                312
            ],
            "id": [
                525
            ],
            "objectMetadataId": [
                525
            ],
            "pageLayoutTabId": [
                525
            ],
            "position": [
                312
            ],
            "title": [
                1
            ],
            "type": [
                654
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
                525
            ],
            "tabs": [
                563
            ],
            "type": [
                399
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                525
            ],
            "update": [
                568
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
                525
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
                525
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                362
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
                529
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                525
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
                525
            ],
            "update": [
                574
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
                525
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
                525
            ],
            "update": [
                576
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
                525
            ],
            "update": [
                578
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                525
            ],
            "logicalOperator": [
                642
            ],
            "parentViewFilterGroupId": [
                525
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                525
            ],
            "update": [
                581
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                525
            ],
            "operand": [
                643
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                525
            ],
            "subFieldName": [
                1
            ],
            "value": [
                312
            ],
            "viewFilterGroupId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                525
            ],
            "update": [
                583
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                525
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
                525
            ],
            "calendarFieldMetadataId": [
                525
            ],
            "calendarLayout": [
                636
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                525
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                525
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                525
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                646
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                649
            ],
            "visibility": [
                650
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                525
            ],
            "update": [
                586
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                648
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
                525
            ],
            "update": [
                588
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
                312
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                525
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
                664
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                312
            ],
            "workspaceMemberId": [
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                525
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                594
            ],
            "id": [
                525
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
                594
            ],
            "groups": [
                595
            ],
            "widgetId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                384
            ],
            "roleId": [
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                525
            ],
            "predicateGroups": [
                453
            ],
            "predicates": [
                455
            ],
            "roleId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                452
            ],
            "predicates": [
                451
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                605
            ],
            "viewFields": [
                602
            ],
            "viewFilterGroups": [
                603
            ],
            "viewFilters": [
                604
            ],
            "viewSorts": [
                606
            ],
            "widgetId": [
                525
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
                525
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
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                525
            ],
            "logicalOperator": [
                642
            ],
            "parentViewFilterGroupId": [
                525
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
                525
            ],
            "id": [
                525
            ],
            "operand": [
                643
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                525
            ],
            "subFieldName": [
                1
            ],
            "value": [
                312
            ],
            "viewFilterGroupId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                525
            ],
            "calendarFieldMetadataId": [
                525
            ],
            "calendarLayout": [
                636
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                525
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                525
            ],
            "openRecordIn": [
                646
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                649
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                648
            ],
            "fieldMetadataId": [
                525
            ],
            "id": [
                525
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
                620
            ],
            "usageByApplication": [
                609
            ],
            "usageByModel": [
                609
            ],
            "usageByOperationType": [
                609
            ],
            "usageByUser": [
                609
            ],
            "userDailyUsage": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                612
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
                525
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                97
            ],
            "operationType": [
                612
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                619
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                621
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
                621
            ],
            "operationType": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                611
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                615
            ],
            "resourceType": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                613
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
                612
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                621
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
                612
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                619
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                621
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
                525
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                97
            ],
            "operationType": [
                612
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
                619
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
                621
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
                620
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
                627
            ],
            "currentWorkspace": [
                658
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
                525
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
                391
            ],
            "previousOnboardingStatus": [
                391
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                209
            ],
            "userVars": [
                313
            ],
            "userWorkspaces": [
                627
            ],
            "workspaceMember": [
                667
            ],
            "workspaceMembers": [
                667
            ],
            "workspaces": [
                627
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
                312
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
                209
            ],
            "expiresAt": [
                209
            ],
            "id": [
                525
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
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                525
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
                525
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                383
            ],
            "objectsPermissions": [
                383
            ],
            "permissionFlags": [
                408
            ],
            "twoFactorAuthenticationMethodSummary": [
                521
            ],
            "updatedAt": [
                209
            ],
            "user": [
                623
            ],
            "userId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                525
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
                525
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
                525
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                525
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
                525
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
                676
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
                525
            ],
            "calendarEndFieldMetadataId": [
                525
            ],
            "calendarFieldMetadataId": [
                525
            ],
            "calendarLayout": [
                636
            ],
            "createdAt": [
                209
            ],
            "createdByUserWorkspaceId": [
                525
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
                525
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
                525
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                645
            ],
            "mainGroupByFieldMetadataId": [
                525
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                525
            ],
            "openRecordIn": [
                646
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                649
            ],
            "universalIdentifier": [
                525
            ],
            "updatedAt": [
                209
            ],
            "viewFieldGroups": [
                639
            ],
            "viewFields": [
                638
            ],
            "viewFilterGroups": [
                641
            ],
            "viewFilters": [
                640
            ],
            "viewGroups": [
                644
            ],
            "viewSorts": [
                647
            ],
            "visibility": [
                650
            ],
            "workspaceId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                653
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
                525
            ],
            "createdAt": [
                209
            ],
            "deletedAt": [
                209
            ],
            "fieldMetadataId": [
                525
            ],
            "id": [
                525
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
                525
            ],
            "updatedAt": [
                209
            ],
            "viewFieldGroupId": [
                525
            ],
            "viewId": [
                525
            ],
            "workspaceId": [
                525
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
                525
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
                638
            ],
            "viewId": [
                525
            ],
            "workspaceId": [
                525
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
                525
            ],
            "id": [
                525
            ],
            "operand": [
                643
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                525
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                209
            ],
            "value": [
                312
            ],
            "viewFilterGroupId": [
                525
            ],
            "viewId": [
                525
            ],
            "workspaceId": [
                525
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
                525
            ],
            "logicalOperator": [
                642
            ],
            "parentViewFilterGroupId": [
                525
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                209
            ],
            "viewId": [
                525
            ],
            "workspaceId": [
                525
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
                525
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
                525
            ],
            "workspaceId": [
                525
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
                648
            ],
            "fieldMetadataId": [
                525
            ],
            "id": [
                525
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                209
            ],
            "viewId": [
                525
            ],
            "workspaceId": [
                525
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
                525
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
                525
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
                295
            ],
            "on_LineChartConfiguration": [
                316
            ],
            "on_MessageCampaignBodyConfiguration": [
                340
            ],
            "on_MessageCampaignDetailsConfiguration": [
                341
            ],
            "on_NotesConfiguration": [
                374
            ],
            "on_PieChartConfiguration": [
                409
            ],
            "on_RecordTableConfiguration": [
                439
            ],
            "on_StandaloneRichTextConfiguration": [
                492
            ],
            "on_TasksConfiguration": [
                502
            ],
            "on_TimelineConfiguration": [
                506
            ],
            "on_ViewConfiguration": [
                637
            ],
            "on_WorkflowConfiguration": [
                655
            ],
            "on_WorkflowRunConfiguration": [
                656
            ],
            "on_WorkflowVersionConfiguration": [
                657
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                659
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
                312
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
                448
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
                525
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
                525
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
                638
            ],
            "viewFilterGroups": [
                641
            ],
            "viewFilters": [
                640
            ],
            "viewGroups": [
                644
            ],
            "viewSorts": [
                647
            ],
            "views": [
                635
            ],
            "workspaceCustomApplication": [
                45
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                664
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                676
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
                312
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                661
            ],
            "personEnrichment": [
                312
            ],
            "personOutcome": [
                674
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
                525
            ],
            "roleId": [
                525
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
                669
            ],
            "id": [
                525
            ],
            "locale": [
                1
            ],
            "name": [
                287
            ],
            "numberFormat": [
                670
            ],
            "openRecordIn": [
                394
            ],
            "roles": [
                448
            ],
            "timeFormat": [
                671
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
                525
            ],
            "userWorkspaceId": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                525
            ],
            "variables": [
                624
            ],
            "workspaceMemberId": [
                525
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
                312
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
                525
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
                525
            ],
            "workspaceUrls": [
                676
            ],
            "__typename": [
                1
            ]
        }
    }
}