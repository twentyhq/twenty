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
        30,
        33,
        35,
        42,
        55,
        63,
        73,
        79,
        91,
        95,
        96,
        98,
        103,
        108,
        114,
        119,
        125,
        128,
        129,
        130,
        131,
        139,
        141,
        155,
        159,
        161,
        163,
        210,
        211,
        238,
        242,
        243,
        245,
        255,
        261,
        265,
        269,
        272,
        279,
        294,
        296,
        307,
        314,
        315,
        316,
        328,
        330,
        346,
        347,
        348,
        349,
        350,
        351,
        353,
        354,
        355,
        358,
        359,
        361,
        362,
        365,
        367,
        371,
        375,
        384,
        391,
        392,
        393,
        396,
        400,
        401,
        406,
        410,
        433,
        435,
        436,
        439,
        445,
        457,
        459,
        463,
        468,
        488,
        500,
        501,
        503,
        528,
        530,
        532,
        595,
        615,
        622,
        624,
        628,
        639,
        645,
        646,
        648,
        649,
        651,
        652,
        653,
        656,
        657,
        662,
        664,
        667,
        672,
        673,
        674,
        677,
        678
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
                528
            ],
            "createdAt": [
                211
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                528
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
                528
            ],
            "triggers": [
                314
            ],
            "updatedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "applicationId": [
                528
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                528
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
                528
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
                528
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
                528
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
                528
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
                211
            ],
            "deletedAt": [
                211
            ],
            "id": [
                18
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
                211
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                211
            ],
            "id": [
                528
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                211
            ],
            "lastReadAt": [
                211
            ],
            "mentionsResolvedAt": [
                211
            ],
            "snoozedUntil": [
                211
            ],
            "threadId": [
                528
            ],
            "updatedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                528
            ],
            "createdAt": [
                211
            ],
            "id": [
                528
            ],
            "parts": [
                22
            ],
            "processedAt": [
                211
            ],
            "reactions": [
                23
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                528
            ],
            "senderWorkspaceMemberId": [
                528
            ],
            "status": [
                1
            ],
            "threadId": [
                528
            ],
            "turnId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                211
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                528
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                528
            ],
            "messageId": [
                528
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
                528
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                211
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
                211
            ],
            "errorMessage": [
                1
            ],
            "id": [
                528
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
                211
            ],
            "status": [
                25
            ],
            "threadId": [
                528
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
                528
            ],
            "aggregateOperation": [
                27
            ],
            "configurationType": [
                656
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
                141
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                428
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
                98
            ],
            "kind": [
                1
            ],
            "limitValue": [
                98
            ],
            "periodEnd": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                98
            ],
            "limitValue": [
                98
            ],
            "periodEnd": [
                211
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
                32
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
                211
            ],
            "expiresAt": [
                211
            ],
            "id": [
                528
            ],
            "name": [
                1
            ],
            "revokedAt": [
                211
            ],
            "role": [
                451
            ],
            "updatedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                211
            ],
            "id": [
                528
            ],
            "name": [
                1
            ],
            "revokedAt": [
                211
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
                159
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
                42
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
                45
            ],
            "receivedAt": [
                211
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
                528
            ],
            "role": [
                355
            ],
            "workspaceMemberId": [
                528
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
                75
            ],
            "applicationRegistrationId": [
                528
            ],
            "applicationVariables": [
                78
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
                154
            ],
            "createdAt": [
                211
            ],
            "defaultLogicFunctionRole": [
                451
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                286
            ],
            "healthCheckLogicFunctionId": [
                528
            ],
            "id": [
                528
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                327
            ],
            "logoFileId": [
                528
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                377
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                528
            ],
            "settingsCustomTabFrontComponentId": [
                528
            ],
            "settingsMenuItems": [
                487
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                528
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                211
            ],
            "id": [
                528
            ],
            "lastAuthorizedAt": [
                211
            ],
            "lastUsedAt": [
                211
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                528
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                528
            ],
            "archivedAt": [
                211
            ],
            "authFailedAt": [
                211
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                424
            ],
            "connectionProviderId": [
                528
            ],
            "createdAt": [
                211
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                528
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                211
            ],
            "lastSignedInAt": [
                211
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                159
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                211
            ],
            "userWorkspaceId": [
                528
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
                528
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                51
            ],
            "scope": [
                163
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
                53
            ],
            "coverage": [
                54
            ],
            "files": [
                56
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
                73
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
                55
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
                528
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
                279
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
                279
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
                211
            ],
            "fileFolder": [
                279
            ],
            "fileId": [
                528
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
                61
            ],
            "description": [
                1
            ],
            "status": [
                63
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
                65
            ],
            "bucketSizeInSeconds": [
                10
            ],
            "creditUsage": [
                66
            ],
            "creditsUsed": [
                6
            ],
            "failedRunCount": [
                10
            ],
            "functions": [
                67
            ],
            "issues": [
                68
            ],
            "lifecycle": [
                69
            ],
            "lifecycleFailureCount": [
                10
            ],
            "lookbackInHours": [
                10
            ],
            "periodEnd": [
                211
            ],
            "periodStart": [
                211
            ],
            "rateLimitEventCount": [
                10
            ],
            "runCount": [
                10
            ],
            "versions": [
                70
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                211
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
                211
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
                211
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
                211
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
                528
            ],
            "connectionProviders": [
                50
            ],
            "settingsMenuItems": [
                487
            ],
            "variables": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                211
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                528
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
                528
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                73
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                211
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
                208
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
                637
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                528
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                73
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                211
            ],
            "description": [
                1
            ],
            "id": [
                528
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
                211
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
                83
            ],
            "applicationRefreshToken": [
                83
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
                528
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
                79
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
                211
            ],
            "domain": [
                1
            ],
            "id": [
                528
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
                467
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                211
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
                83
            ],
            "refreshToken": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                84
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
                528
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
                466
            ],
            "workspaceUrls": [
                679
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                88
            ],
            "availableWorkspacesForSignUp": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                89
            ],
            "tokens": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                528
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                91
            ],
            "color": [
                1
            ],
            "configurationType": [
                656
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
                95
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                96
            ],
            "numberFormat": [
                141
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                391
            ],
            "primaryAxisGroupByFieldMetadataId": [
                528
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                294
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                391
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                528
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                294
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
                95
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
                96
            ],
            "series": [
                97
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
                528
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
                123
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
                528
            ],
            "userCreditsFallback": [
                628
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
                118
            ],
            "currentBillingSubscription": [
                118
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                103
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
                115
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
        "BillingMeteredProduct": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                115
            ],
            "name": [
                1
            ],
            "prices": [
                110
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
                104
            ],
            "downgradePlanKeys": [
                108
            ],
            "isCheckoutDefault": [
                4
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                105
            ],
            "planKey": [
                108
            ],
            "resourceCreditProducts": [
                104
            ],
            "upgradePlanKeys": [
                108
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
                125
            ],
            "recurringInterval": [
                500
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
                125
            ],
            "recurringInterval": [
                500
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                111
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
                115
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
                115
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                104
            ],
            "on_BillingMeteredProduct": [
                105
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
                108
            ],
            "priceUsageBased": [
                125
            ],
            "productKey": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                211
            ],
            "periodStart": [
                211
            ],
            "productKey": [
                114
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
                120
            ],
            "cancelAt": [
                211
            ],
            "collectionMethod": [
                119
            ],
            "currentPeriodEnd": [
                211
            ],
            "hasUserCredits": [
                4
            ],
            "id": [
                528
            ],
            "interval": [
                500
            ],
            "metadata": [
                314
            ],
            "phases": [
                121
            ],
            "status": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                113
            ],
            "creditAmount": [
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                528
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
                122
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
                118
            ],
            "currentBillingSubscription": [
                118
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
                528
            ],
            "contactAutoCreationPolicy": [
                128
            ],
            "createdAt": [
                211
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                528
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                129
            ],
            "syncStageStartedAt": [
                211
            ],
            "syncStatus": [
                130
            ],
            "syncedAt": [
                211
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                211
            ],
            "visibility": [
                131
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
                656
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                656
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
                139
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
                656
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
                144
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
                656
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
                371
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                373
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
                30
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                148
            ],
            "aiModelTiers": [
                150
            ],
            "aiModels": [
                149
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                36
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                82
            ],
            "billing": [
                99
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                138
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
                152
            ],
            "publicFeatureFlags": [
                422
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                485
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                211
            ],
            "link": [
                1
            ],
            "startAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                33
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
                528
            ],
            "availabilityObjectMetadataId": [
                528
            ],
            "availabilityType": [
                155
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                528
            ],
            "createdAt": [
                211
            ],
            "engineComponentKey": [
                245
            ],
            "frontComponent": [
                286
            ],
            "frontComponentId": [
                528
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                528
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
                528
            ],
            "pageLayoutId": [
                528
            ],
            "payload": [
                156
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                528
            ],
            "updatedAt": [
                211
            ],
            "workflowVersionId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                383
            ],
            "on_PathCommandMenuItemPayload": [
                408
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                57
            ],
            "files": [
                277
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                528
            ],
            "archivedAt": [
                211
            ],
            "authFailedAt": [
                211
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                424
            ],
            "connectionProviderId": [
                528
            ],
            "createdAt": [
                211
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                528
            ],
            "lastCredentialsRefreshedAt": [
                211
            ],
            "lastSignedInAt": [
                211
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                159
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                211
            ],
            "userWorkspaceId": [
                528
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
                299
            ],
            "handle": [
                1
            ],
            "id": [
                528
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                238
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
                528
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
                528
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                528
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                528
            ],
            "participantHandleFieldUniversalIdentifier": [
                528
            ],
            "visibility": [
                351
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                58
            ],
            "targets": [
                60
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                72
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
                528
            ],
            "availabilityType": [
                155
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                528
            ],
            "engineComponentKey": [
                245
            ],
            "frontComponentId": [
                528
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
                528
            ],
            "pageLayoutId": [
                528
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
                528
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
                345
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
                528
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
                272
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
                528
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
                528
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
                180
            ],
            "indexType": [
                307
            ],
            "objectMetadataId": [
                528
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
                528
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
                528
            ],
            "workflowActionTriggerSettings": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                528
            ],
            "id": [
                528
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                528
            ],
            "color": [
                1
            ],
            "folderId": [
                528
            ],
            "icon": [
                1
            ],
            "id": [
                528
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                528
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                528
            ],
            "targetRecordId": [
                528
            ],
            "type": [
                375
            ],
            "userWorkspaceId": [
                528
            ],
            "viewId": [
                528
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
                178
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                181
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
                528
            ],
            "type": [
                401
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                400
            ],
            "pageLayoutId": [
                528
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
                528
            ],
            "pageLayoutTabId": [
                528
            ],
            "position": [
                314
            ],
            "title": [
                1
            ],
            "type": [
                657
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                528
            ],
            "filter": [
                314
            ],
            "objectMetadataId": [
                528
            ],
            "orderBy": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                528
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                528
            ],
            "secondFieldMetadataId": [
                528
            ],
            "thirdFieldMetadataId": [
                528
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
                528
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                98
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                98
            ],
            "operationType": [
                615
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                622
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                624
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
                528
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                528
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
                528
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
                528
            ],
            "id": [
                528
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
                528
            ],
            "viewId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                528
            ],
            "logicalOperator": [
                645
            ],
            "parentViewFilterGroupId": [
                528
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                528
            ],
            "id": [
                528
            ],
            "operand": [
                646
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                528
            ],
            "subFieldName": [
                1
            ],
            "value": [
                314
            ],
            "viewFilterGroupId": [
                528
            ],
            "viewId": [
                528
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
                528
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                528
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
                528
            ],
            "calendarFieldMetadataId": [
                528
            ],
            "calendarLayout": [
                639
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                528
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                528
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                648
            ],
            "mainGroupByFieldMetadataId": [
                528
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                528
            ],
            "openRecordIn": [
                649
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                652
            ],
            "visibility": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                651
            ],
            "fieldMetadataId": [
                528
            ],
            "id": [
                528
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                528
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
                528
            ],
            "operations": [
                1
            ],
            "roleId": [
                528
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
                615
            ],
            "resource": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                161
            ],
            "before": [
                161
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                528
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                528
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
                528
            ],
            "name": [
                289
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                528
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
                528
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                231
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
                528
            ],
            "pageLayoutId": [
                528
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
                528
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
                528
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                468
            ],
            "type": [
                296
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                528
            ],
            "status": [
                468
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                162
            ],
            "IMAP": [
                162
            ],
            "SMTP": [
                162
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
                656
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                211
            ],
            "domain": [
                1
            ],
            "id": [
                528
            ],
            "status": [
                242
            ],
            "tenantStatus": [
                243
            ],
            "unsubscribeHostnameStatus": [
                530
            ],
            "updatedAt": [
                211
            ],
            "verificationRecords": [
                634
            ],
            "verifiedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                656
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
                247
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
                211
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
                211
            ],
            "currentPeriodEnd": [
                211
            ],
            "expiresAt": [
                211
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
                211
            ],
            "start": [
                211
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
                255
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
                253
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                254
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
                256
            ],
            "first": [
                10
            ],
            "table": [
                261
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                257
            ],
            "records": [
                260
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
                211
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
                360
            ],
            "objectRecordEventsWithQueryIds": [
                390
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
                528
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
                265
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
                528
            ],
            "createdAt": [
                211
            ],
            "defaultValue": [
                314
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
                528
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
                528
            ],
            "morphRelations": [
                444
            ],
            "name": [
                1
            ],
            "object": [
                377
            ],
            "objectMetadataId": [
                528
            ],
            "options": [
                314
            ],
            "relation": [
                444
            ],
            "settings": [
                314
            ],
            "type": [
                272
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                211
            ],
            "writability": [
                367
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                656
            ],
            "fieldDisplayMode": [
                269
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
                270
            ],
            "pageInfo": [
                397
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                161
            ],
            "node": [
                266
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                271
            ],
            "id": [
                529
            ],
            "isActive": [
                126
            ],
            "isSystem": [
                126
            ],
            "isUIEditable": [
                126
            ],
            "isUIReadOnly": [
                126
            ],
            "objectMetadataId": [
                529
            ],
            "or": [
                271
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
                528
            ],
            "id": [
                528
            ],
            "objectMetadataId": [
                528
            ],
            "roleId": [
                528
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
                528
            ],
            "objectMetadataId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                656
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
                211
            ],
            "id": [
                528
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
                528
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
                211
            ],
            "fileId": [
                528
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
                211
            ],
            "id": [
                528
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
                656
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                528
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                468
            ],
            "type": [
                296
            ],
            "workspace": [
                676
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
                358
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                656
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
                528
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                77
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
                211
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                528
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
                528
            ],
            "updatedAt": [
                211
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                288
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                656
            ],
            "frontComponentId": [
                528
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                528
            ],
            "pageLayoutType": [
                401
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
                528
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
                528
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
                528
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
                528
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
                656
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
                300
            ],
            "IMAP": [
                300
            ],
            "SMTP": [
                300
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
                238
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
                83
            ],
            "workspace": [
                680
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
                528
            ],
            "threadId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                528
            ],
            "createdAt": [
                211
            ],
            "id": [
                528
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
                211
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                161
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
                211
            ],
            "fieldMetadataId": [
                528
            ],
            "id": [
                528
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                211
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
                529
            ],
            "isCustom": [
                126
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
                528
            ],
            "messages": [
                44
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
                528
            ],
            "messageThreadId": [
                528
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
                528
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                91
            ],
            "color": [
                1
            ],
            "configurationType": [
                656
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
                141
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                391
            ],
            "primaryAxisGroupByFieldMetadataId": [
                528
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                294
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                391
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                528
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                294
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
                528
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
                159
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                528
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
                528
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                211
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
                528
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
                528
            ],
            "updatedAt": [
                211
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                528
            ],
            "applicationUniversalIdentifier": [
                528
            ],
            "id": [
                528
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                83
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
                73
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
        "McpServer": {
            "applicationId": [
                528
            ],
            "connectionProviderId": [
                528
            ],
            "createdAt": [
                211
            ],
            "id": [
                528
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
                211
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
                656
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                656
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
                158
            ],
            "connectedAccountId": [
                528
            ],
            "contactAutoCreationPolicy": [
                346
            ],
            "createdAt": [
                211
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
                528
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
                353
            ],
            "messagingProviderUniversalIdentifier": [
                528
            ],
            "participantHandleFieldUniversalIdentifier": [
                528
            ],
            "pendingGroupEmailsAction": [
                347
            ],
            "syncStage": [
                348
            ],
            "syncStageStartedAt": [
                211
            ],
            "syncStatus": [
                349
            ],
            "syncedAt": [
                211
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                211
            ],
            "type": [
                350
            ],
            "updatedAt": [
                211
            ],
            "visibility": [
                351
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
                211
            ],
            "externalId": [
                1
            ],
            "id": [
                528
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                528
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                354
            ],
            "updatedAt": [
                211
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
                211
            ],
            "emailAddress": [
                1
            ],
            "id": [
                528
            ],
            "reason": [
                358
            ],
            "source": [
                359
            ],
            "unsubscribeTopicId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                356
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
                389
            ],
            "recordId": [
                1
            ],
            "type": [
                361
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
                528
            ],
            "property": [
                1
            ],
            "provenance": [
                365
            ],
            "recordId": [
                528
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
                528
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                153
            ],
            "objectMetadataItems": [
                369
            ],
            "views": [
                370
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
                528
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
                528
            ],
            "key": [
                648
            ],
            "objectMetadataId": [
                528
            ],
            "type": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                494,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                661,
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
                        528,
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
                        528
                    ],
                    "threadId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        528,
                        "UUID!"
                    ],
                    "roleId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        528,
                        "UUID!"
                    ],
                    "roleId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        302,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                86,
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
                137,
                {
                    "input": [
                        136,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                124
            ],
            "cancelSwitchBillingPlan": [
                124
            ],
            "cancelSwitchResourceCreditPrice": [
                124
            ],
            "checkCustomDomainValidRecords": [
                232
            ],
            "checkPublicDomainValidRecords": [
                232,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                117,
                {
                    "plan": [
                        108,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        500,
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
                72,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                72,
                {
                    "fileId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                157,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        528,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                395,
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
                281,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                281,
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
                281,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                281,
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
                        164,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                37,
                {
                    "input": [
                        166,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                345,
                {
                    "input": [
                        167,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                168,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        59,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                169,
                {
                    "input": [
                        170,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                80,
                {
                    "input": [
                        171,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                106
            ],
            "createCalendarEvent": [
                173,
                {
                    "input": [
                        172,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                17,
                {
                    "channelId": [
                        528
                    ]
                }
            ],
            "createCommandMenuItem": [
                154,
                {
                    "input": [
                        174,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                230,
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
                176,
                {
                    "input": [
                        175,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                241,
                {
                    "input": [
                        177,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                280,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        279,
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
                286,
                {
                    "input": [
                        179,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                374,
                {
                    "inputs": [
                        185,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                642,
                {
                    "inputs": [
                        200,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                641,
                {
                    "inputs": [
                        201,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                647,
                {
                    "inputs": [
                        204,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                341,
                {
                    "input": [
                        183,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                356,
                {
                    "input": [
                        184,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                374,
                {
                    "input": [
                        185,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                280,
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
                491,
                {
                    "input": [
                        489,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                34,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        528,
                        "UUID!"
                    ],
                    "properties": [
                        314
                    ],
                    "recordId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        165,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                266,
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
                        182,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                377,
                {
                    "input": [
                        189,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                451,
                {
                    "createRoleInput": [
                        195,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                398,
                {
                    "input": [
                        190,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                399,
                {
                    "input": [
                        191,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                402,
                {
                    "input": [
                        192,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                421,
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
                443,
                {
                    "input": [
                        194,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                491,
                {
                    "input": [
                        490,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                494,
                {
                    "input": [
                        196,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                106,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        108,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        500,
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
                531,
                {
                    "input": [
                        197,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                613,
                {
                    "input": [
                        198,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                633,
                {
                    "input": [
                        199,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                638,
                {
                    "input": [
                        205,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                641,
                {
                    "input": [
                        201,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                642,
                {
                    "input": [
                        200,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                643,
                {
                    "input": [
                        203,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                644,
                {
                    "input": [
                        202,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                647,
                {
                    "input": [
                        204,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                650,
                {
                    "input": [
                        206,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                654,
                {
                    "input": [
                        207,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                494,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        528,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        528
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
                        42
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                345,
                {
                    "id": [
                        528,
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
                        212,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                154,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                158,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                661
            ],
            "deleteEmailGroupChannel": [
                345,
                {
                    "id": [
                        528,
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
                286,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                374,
                {
                    "ids": [
                        528,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                341,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                374,
                {
                    "id": [
                        528,
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
                266,
                {
                    "input": [
                        213,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                303,
                {
                    "input": [
                        214,
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
                377,
                {
                    "input": [
                        215,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        528,
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
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                443,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                216,
                {
                    "input": [
                        217,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                494,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                218,
                {
                    "twoFactorAuthenticationMethodId": [
                        528,
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
                        528,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                626
            ],
            "deleteUserFromWorkspace": [
                630,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                633,
                {
                    "id": [
                        528,
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
                641,
                {
                    "input": [
                        220,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                642,
                {
                    "input": [
                        219,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                643,
                {
                    "input": [
                        221,
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
                647,
                {
                    "input": [
                        222,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        223,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                654,
                {
                    "id": [
                        528,
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
                641,
                {
                    "input": [
                        226,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                642,
                {
                    "input": [
                        225,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                643,
                {
                    "input": [
                        227,
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
                647,
                {
                    "input": [
                        228,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        229,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
                {
                    "input": [
                        302,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                158,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                233,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                234,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                235,
                {
                    "input": [
                        236,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                239,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        528
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                101
            ],
            "enqueueJob": [
                248,
                {
                    "input": [
                        246,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                250,
                {
                    "input": [
                        249,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                665
            ],
            "executeOneLogicFunction": [
                329,
                {
                    "input": [
                        263,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                39,
                {
                    "apiKeyId": [
                        528,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                77,
                {
                    "applicationId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                83
            ],
            "generateTransientToken": [
                511
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                525,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                85,
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
                85,
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
                85,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                526,
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
                291,
                {
                    "input": [
                        292,
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
                394
            ],
            "grantApplicationCapabilities": [
                48,
                {
                    "input": [
                        293,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                301,
                {
                    "userId": [
                        528,
                        "UUID!"
                    ],
                    "workspaceId": [
                        528,
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
                46,
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
                        528,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        528
                    ],
                    "threadId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                251
            ],
            "removeAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        446,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                437,
                {
                    "principal": [
                        434,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        442,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                77,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                85,
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
                        528,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        447,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                448,
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
                481,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                154,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                399,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                398,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                402,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                506,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                473,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                10
            ],
            "revokeApiKey": [
                37,
                {
                    "input": [
                        449,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                453,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                464,
                {
                    "input": [
                        460,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                62,
                {
                    "applicationId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                298,
                {
                    "connectionParameters": [
                        237,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        528
                    ]
                }
            ],
            "sendAppChannelMessage": [
                472,
                {
                    "input": [
                        471,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                473,
                {
                    "browsingContext": [
                        314
                    ],
                    "channelId": [
                        528
                    ],
                    "fileAttachments": [
                        278,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        528,
                        "[UUID!]"
                    ],
                    "messageId": [
                        528,
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
                        528,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                476,
                {
                    "input": [
                        475,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                480,
                {
                    "input": [
                        479,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                481,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        528
                    ]
                }
            ],
            "sendMessageCampaign": [
                483,
                {
                    "input": [
                        482,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                478,
                {
                    "input": [
                        484,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                41,
                {
                    "input": [
                        486,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                251,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                437,
                {
                    "accessLevel": [
                        433,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        442,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                437,
                {
                    "accessLevel": [
                        433,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        434,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        442,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                124,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                90,
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
                90,
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
                492,
                {
                    "input": [
                        493
                    ]
                }
            ],
            "signUpInWorkspace": [
                492,
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
                        528
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
                395,
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
                        211,
                        "DateTime!"
                    ],
                    "threadId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                140,
                {
                    "connectedAccountId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                496,
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
                        528,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                497
            ],
            "switchBillingPlan": [
                124,
                {
                    "plan": [
                        108
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                124
            ],
            "syncAppMessageFolders": [
                352,
                {
                    "input": [
                        504,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                675,
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
                34,
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
                        35,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                72,
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
                513,
                {
                    "input": [
                        512,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                517,
                {
                    "input": [
                        514,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                516,
                {
                    "input": [
                        515,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                521,
                {
                    "input": [
                        518,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                520,
                {
                    "input": [
                        519,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                523,
                {
                    "input": [
                        522,
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
                        528,
                        "UUID!"
                    ],
                    "input": [
                        533,
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
                        211
                    ],
                    "threadIds": [
                        528,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                37,
                {
                    "input": [
                        535,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                345,
                {
                    "input": [
                        536,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                46,
                {
                    "id": [
                        528,
                        "UUID!"
                    ],
                    "input": [
                        537,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                72,
                {
                    "input": [
                        538,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                76,
                {
                    "input": [
                        540,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                127,
                {
                    "input": [
                        542,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                154,
                {
                    "input": [
                        544,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                345,
                {
                    "input": [
                        545,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                286,
                {
                    "input": [
                        547,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                264,
                {
                    "input": [
                        549,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                374,
                {
                    "inputs": [
                        562,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                377,
                {
                    "inputs": [
                        563,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                647,
                {
                    "inputs": [
                        585,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                341,
                {
                    "input": [
                        552,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                345,
                {
                    "input": [
                        554,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                352,
                {
                    "input": [
                        556,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                352,
                {
                    "input": [
                        558,
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
                374,
                {
                    "input": [
                        562,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        534,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        528
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
                266,
                {
                    "input": [
                        561,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        550,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                377,
                {
                    "input": [
                        563,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                451,
                {
                    "updateRoleInput": [
                        570,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                398,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        564,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                399,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        565,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                402,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        567,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                398,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        569,
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
                494,
                {
                    "input": [
                        572,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                506,
                {
                    "input": [
                        573,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                531,
                {
                    "input": [
                        574,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                613,
                {
                    "input": [
                        575,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                100,
                {
                    "userCreditsFallback": [
                        628,
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
                633,
                {
                    "input": [
                        576,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                638,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        587,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                641,
                {
                    "input": [
                        580,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                642,
                {
                    "input": [
                        578,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                643,
                {
                    "input": [
                        583,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                644,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        582,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                647,
                {
                    "input": [
                        585,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                650,
                {
                    "input": [
                        588,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                654,
                {
                    "input": [
                        590,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                661,
                {
                    "data": [
                        593,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                661,
                {
                    "data": [
                        592,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                670,
                {
                    "roleId": [
                        528,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        594,
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
                72,
                {
                    "file": [
                        595,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                277,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        595,
                        "Upload!"
                    ],
                    "fileFolder": [
                        279,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                281,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        595,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                281,
                {
                    "file": [
                        595,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                281,
                {
                    "file": [
                        595,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                281,
                {
                    "file": [
                        595,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                273,
                {
                    "upsertFieldPermissionsInput": [
                        596,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                638,
                {
                    "input": [
                        599,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                385,
                {
                    "upsertObjectPermissionsInput": [
                        600,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                452,
                {
                    "upsertPermissionFlagsInput": [
                        601,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                603,
                {
                    "input": [
                        602,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                638,
                {
                    "input": [
                        604,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                80,
                {
                    "input": [
                        631,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                635,
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
                90,
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
                241,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                636,
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
                528
            ],
            "applicationId": [
                528
            ],
            "color": [
                1
            ],
            "createdAt": [
                211
            ],
            "folderId": [
                528
            ],
            "icon": [
                1
            ],
            "id": [
                528
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                528
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                528
            ],
            "targetRecordId": [
                528
            ],
            "targetRecordIdentifier": [
                430
            ],
            "type": [
                375
            ],
            "updatedAt": [
                211
            ],
            "userWorkspaceId": [
                528
            ],
            "viewId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                528
            ],
            "color": [
                1
            ],
            "createdAt": [
                211
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
                380,
                {
                    "filter": [
                        271,
                        "FieldFilter!"
                    ],
                    "paging": [
                        209,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                266
            ],
            "icon": [
                1
            ],
            "id": [
                528
            ],
            "imageIdentifierFieldMetadataId": [
                528
            ],
            "indexMetadataList": [
                303
            ],
            "indexMetadatas": [
                382,
                {
                    "filter": [
                        306,
                        "IndexFilter!"
                    ],
                    "paging": [
                        209,
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
                528
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
                384
            ],
            "readability": [
                362
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                528
            ],
            "searchFieldMetadataList": [
                470
            ],
            "sharingReach": [
                392
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                211
            ],
            "writability": [
                367
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                379
            ],
            "pageInfo": [
                397
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                161
            ],
            "node": [
                377
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                270
            ],
            "pageInfo": [
                397
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                381
            ],
            "id": [
                529
            ],
            "isActive": [
                126
            ],
            "isRemote": [
                126
            ],
            "isSearchable": [
                126
            ],
            "isSystem": [
                126
            ],
            "isUICreatable": [
                126
            ],
            "isUIEditable": [
                126
            ],
            "isUIReadOnly": [
                126
            ],
            "or": [
                381
            ],
            "universalIdentifier": [
                529
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
                397
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                528
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
                528
            ],
            "restrictedFields": [
                314
            ],
            "rowLevelPermissionPredicateGroups": [
                455
            ],
            "rowLevelPermissionPredicates": [
                454
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
                528
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
                210
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                389
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
                388
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
                393
            ],
            "previousOnboardingStatus": [
                393
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
                161
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                161
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                528
            ],
            "createdAt": [
                211
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                528
            ],
            "deletedAt": [
                211
            ],
            "id": [
                528
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
                528
            ],
            "tabs": [
                399
            ],
            "type": [
                401
            ],
            "universalIdentifier": [
                528
            ],
            "updatedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                528
            ],
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "icon": [
                1
            ],
            "id": [
                528
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
                400
            ],
            "pageLayoutId": [
                528
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                528
            ],
            "updatedAt": [
                211
            ],
            "widgets": [
                402
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                528
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                314
            ],
            "configuration": [
                655
            ],
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "gridPosition": [
                295
            ],
            "id": [
                528
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
                528
            ],
            "pageLayoutTabId": [
                528
            ],
            "position": [
                405
            ],
            "title": [
                1
            ],
            "type": [
                657
            ],
            "universalIdentifier": [
                528
            ],
            "updatedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                400
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
                400
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
                403
            ],
            "on_PageLayoutWidgetGridPosition": [
                404
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                407
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                406
            ],
            "index": [
                10
            ],
            "layoutMode": [
                400
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
                528
            ],
            "createdAt": [
                211
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                528
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
                528
            ],
            "updatedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                528
            ],
            "aggregateOperation": [
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                656
            ],
            "dateGranularity": [
                391
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
                528
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
                141
            ],
            "orderBy": [
                294
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
                414
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
                528
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
                211
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                135
            ],
            "blockers": [
                344
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                528
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
                238
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
                528
            ],
            "createdAt": [
                211
            ],
            "domain": [
                1
            ],
            "id": [
                528
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
                265
            ],
            "metadata": [
                423
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
                420
            ],
            "IMAP": [
                420
            ],
            "SMTP": [
                420
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                81
            ],
            "authProviders": [
                82
            ],
            "displayName": [
                1
            ],
            "id": [
                528
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                679
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
                528
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
                        528,
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
                        528,
                        "UUID!"
                    ],
                    "limit": [
                        10,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                28
            ],
            "aiChatUserCreditsUsage": [
                29
            ],
            "apiKey": [
                37,
                {
                    "input": [
                        290,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                37
            ],
            "appConnection": [
                40,
                {
                    "id": [
                        18,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                40,
                {
                    "filter": [
                        323
                    ]
                }
            ],
            "appKeyValue": [
                41,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        42
                    ]
                }
            ],
            "appMessageChannels": [
                345,
                {
                    "filter": [
                        324
                    ]
                }
            ],
            "appMessageFolders": [
                352,
                {
                    "filter": [
                        325
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                49,
                {
                    "applicationId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                50,
                {
                    "applicationId": [
                        528,
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
                469,
                {
                    "applicationId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                93,
                {
                    "input": [
                        94,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPlans": [
                107
            ],
            "billingPortalSession": [
                117,
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
                528,
                {
                    "calendarEventId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "threadId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                143,
                {
                    "threadId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                17,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                146,
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
                669,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                498,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                154,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                154
            ],
            "currentUser": [
                626
            ],
            "currentUserApplicationAuthorizations": [
                47
            ],
            "currentUserSessions": [
                629
            ],
            "currentWorkspace": [
                661
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
                252
            ],
            "eventLogs": [
                259,
                {
                    "input": [
                        258,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                52,
                {
                    "shouldIncludeDependencies": [
                        4
                    ],
                    "universalIdentifier": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                266,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                268,
                {
                    "filter": [
                        271,
                        "FieldFilter!"
                    ],
                    "paging": [
                        209,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                419,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                72,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                64,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        211
                    ],
                    "periodStart": [
                        211
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                74,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        211
                    ],
                    "periodStart": [
                        211
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                76,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                147,
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
                72
            ],
            "findManyApplications": [
                46
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
                421
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
                        20,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                46,
                {
                    "id": [
                        528
                    ],
                    "universalIdentifier": [
                        528
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                72,
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
                663
            ],
            "findWorkspaceFromInviteHash": [
                661,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                668
            ],
            "frontComponent": [
                286,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                286
            ],
            "getAddressDetails": [
                415,
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
                31
            ],
            "getApiKeyRoles": [
                451
            ],
            "getApprovedAccessDomains": [
                80
            ],
            "getAutoCompleteAddress": [
                87,
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
                160,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                241
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
                398,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                399,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                399,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                402,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                402,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                398,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        401
                    ]
                }
            ],
            "getPermissionFlags": [
                409
            ],
            "getPublicWorkspaceDataByDomain": [
                425,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                426,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                116
            ],
            "getRole": [
                451,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                451
            ],
            "getSSOIdentityProviders": [
                283
            ],
            "getToolIndex": [
                510
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
                610,
                {
                    "input": [
                        611
                    ]
                }
            ],
            "getView": [
                638,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                641,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                642,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                642,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                641,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                643,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                644,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                644,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                643,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                647,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                647,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                650,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                650,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                638,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        652,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                666
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
                107
            ],
            "mcpServer": [
                341,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                341
            ],
            "messageSuppressions": [
                357,
                {
                    "input": [
                        284,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                363,
                {
                    "input": [
                        366,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                368
            ],
            "mostlyEmptyFieldMetadataIds": [
                528,
                {
                    "objectMetadataId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                71
            ],
            "myCalendarChannels": [
                127,
                {
                    "connectedAccountId": [
                        528
                    ]
                }
            ],
            "myConnectedAccounts": [
                158
            ],
            "myMessageChannels": [
                345,
                {
                    "connectedAccountId": [
                        528
                    ]
                }
            ],
            "myMessageFolders": [
                352,
                {
                    "messageChannelId": [
                        528
                    ]
                }
            ],
            "myUserApplicationVariables": [
                671
            ],
            "navigationMenuItem": [
                374,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                374
            ],
            "object": [
                377,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                387
            ],
            "objects": [
                378,
                {
                    "filter": [
                        381,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        209,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                412,
                {
                    "input": [
                        413,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                135,
                {
                    "input": [
                        416,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                418,
                {
                    "input": [
                        417,
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
                335
            ],
            "recordPermissions": [
                432,
                {
                    "targets": [
                        442,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                437,
                {
                    "target": [
                        442,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                443
            ],
            "skill": [
                494,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                494
            ],
            "timelineActivityTypes": [
                506
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                527,
                {
                    "userId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                531
            ],
            "usageLimits": [
                613
            ],
            "usageQuotaDefinitions": [
                617
            ],
            "usageQuotaScopeConsumption": [
                619,
                {
                    "input": [
                        620,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                621
            ],
            "validatePasswordResetToken": [
                632,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                633,
                {
                    "objectMetadataId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                654,
                {
                    "id": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                654
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                528
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
                528
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
                528
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
                528
            ],
            "permissions": [
                431
            ],
            "recordId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                528
            ],
            "workspaceMemberId": [
                528
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
                433
            ],
            "generalAccessLevel": [
                433
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                431
            ],
            "roles": [
                440
            ],
            "shares": [
                438
            ],
            "sharingMode": [
                439
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                433
            ],
            "id": [
                18
            ],
            "principalId": [
                528
            ],
            "principalRoleId": [
                528
            ],
            "principalType": [
                435
            ],
            "rowCause": [
                436
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
                528
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
                656
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
                528
            ],
            "recordId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                528
            ],
            "id": [
                528
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                528
            ],
            "secondFieldMetadataId": [
                528
            ],
            "thirdFieldMetadataId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                266
            ],
            "sourceObjectMetadata": [
                377
            ],
            "targetFieldMetadata": [
                266
            ],
            "targetObjectMetadata": [
                377
            ],
            "type": [
                445
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
                528
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
                38
            ],
            "applicationId": [
                528
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
                273
            ],
            "icon": [
                1
            ],
            "id": [
                528
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                385
            ],
            "permissionFlags": [
                452
            ],
            "rowLevelPermissionPredicateGroups": [
                455
            ],
            "rowLevelPermissionPredicates": [
                454
            ],
            "universalIdentifier": [
                528
            ],
            "workspaceMembers": [
                670
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
                528
            ],
            "roleId": [
                528
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
                459
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
                457
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
                528
            ],
            "logicalOperator": [
                457
            ],
            "objectMetadataId": [
                528
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                528
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
                528
            ],
            "id": [
                528
            ],
            "operand": [
                459
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "rowLevelPermissionPredicateGroupId": [
                528
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
                462
            ],
            "messages": [
                462
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                314
            ],
            "runAsWorkspaceMemberId": [
                528
            ],
            "thread": [
                465
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
                528
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
                461
            ],
            "content": [
                1
            ],
            "role": [
                463
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
                528
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
                528
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                468
            ],
            "type": [
                296
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                528
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                468
            ],
            "type": [
                296
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
                211
            ],
            "fieldMetadataId": [
                528
            ],
            "id": [
                528
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                528
            ],
            "updatedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                528
            ],
            "messageChannelId": [
                528
            ],
            "messageThreadId": [
                528
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
                528
            ],
            "messageThreadId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                528
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
                474
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
                477
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
                528
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                528
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
                668
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
                211
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                135
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
                42
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
                528
            ],
            "createdAt": [
                211
            ],
            "frontComponentId": [
                528
            ],
            "icon": [
                1
            ],
            "id": [
                528
            ],
            "position": [
                6
            ],
            "scope": [
                488
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                528
            ],
            "updatedAt": [
                211
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
                528
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
                528
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                468
            ],
            "type": [
                296
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                83
            ],
            "workspace": [
                680
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
                528
            ],
            "content": [
                1
            ],
            "createdAt": [
                211
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                528
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
                211
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                450
            ],
            "configurationType": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                678
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
                260,
                {
                    "fieldFilters": [
                        254,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        261,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                429,
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
                14,
                {
                    "threadId": [
                        528,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                262,
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
                503
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
                43
            ],
            "messageChannelId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                656
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
                528
            ],
            "createdAt": [
                211
            ],
            "emit": [
                507
            ],
            "frontComponentUniversalIdentifier": [
                528
            ],
            "icon": [
                1
            ],
            "id": [
                528
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
                528
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                528
            ],
            "universalIdentifier": [
                528
            ],
            "updatedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                528
            ],
            "on": [
                1
            ],
            "through": [
                508
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                528
            ],
            "relationFieldUniversalIdentifier": [
                528
            ],
            "triggerFieldUniversalIdentifiers": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                656
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
                83
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                528
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                211
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
                84
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
                211
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                528
            ],
            "gt": [
                528
            ],
            "gte": [
                528
            ],
            "iLike": [
                528
            ],
            "in": [
                528
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                528
            ],
            "lt": [
                528
            ],
            "lte": [
                528
            ],
            "neq": [
                528
            ],
            "notILike": [
                528
            ],
            "notIn": [
                528
            ],
            "notLike": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                211
            ],
            "description": [
                1
            ],
            "id": [
                528
            ],
            "name": [
                1
            ],
            "updatedAt": [
                211
            ],
            "visibility": [
                532
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
                528
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
                528
            ],
            "isActive": [
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
                528
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
                528
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
                528
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                528
            ],
            "visibility": [
                351
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
                539
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
                541
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
                528
            ],
            "update": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                128
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
                131
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                528
            ],
            "availabilityType": [
                155
            ],
            "engineComponentKey": [
                245
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                528
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                528
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
                528
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
                528
            ],
            "options": [
                314
            ],
            "settings": [
                314
            ],
            "translations": [
                364
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
                528
            ],
            "update": [
                548
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
                528
            ],
            "update": [
                551
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
        "UpdateMcpServerInput": {
            "id": [
                528
            ],
            "update": [
                553
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                528
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
                528
            ],
            "update": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                346
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
                353
            ],
            "visibility": [
                351
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                528
            ],
            "update": [
                557
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
                528
            ],
            "update": [
                557
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
                528
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
                528
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
                528
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
                528
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
                384
            ],
            "readability": [
                362
            ],
            "sharingReach": [
                392
            ],
            "shortcut": [
                1
            ],
            "translations": [
                364
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                528
            ],
            "update": [
                546
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                528
            ],
            "update": [
                559
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                528
            ],
            "update": [
                560
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
                528
            ],
            "type": [
                401
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
                400
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
                528
            ],
            "layoutMode": [
                400
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                568
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
                528
            ],
            "pageLayoutTabId": [
                528
            ],
            "position": [
                314
            ],
            "title": [
                1
            ],
            "type": [
                657
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
                528
            ],
            "objectMetadataId": [
                528
            ],
            "pageLayoutTabId": [
                528
            ],
            "position": [
                314
            ],
            "title": [
                1
            ],
            "type": [
                657
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
                528
            ],
            "tabs": [
                566
            ],
            "type": [
                401
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                528
            ],
            "update": [
                571
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
                528
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
                528
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                364
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                528
            ],
            "payload": [
                198
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                528
            ],
            "update": [
                577
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
                528
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
                528
            ],
            "update": [
                579
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
                528
            ],
            "update": [
                581
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                528
            ],
            "logicalOperator": [
                645
            ],
            "parentViewFilterGroupId": [
                528
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                528
            ],
            "update": [
                584
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                528
            ],
            "operand": [
                646
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                528
            ],
            "subFieldName": [
                1
            ],
            "value": [
                314
            ],
            "viewFilterGroupId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                528
            ],
            "update": [
                586
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                528
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
                528
            ],
            "calendarFieldMetadataId": [
                528
            ],
            "calendarLayout": [
                639
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                528
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                528
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                528
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                649
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "translations": [
                364
            ],
            "type": [
                652
            ],
            "visibility": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                528
            ],
            "update": [
                589
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                651
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
                528
            ],
            "update": [
                591
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
                528
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
                30
            ],
            "aiChatModelTier": [
                30
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
                528
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
                667
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                274
            ],
            "roleId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                528
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                597
            ],
            "id": [
                528
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
                597
            ],
            "groups": [
                598
            ],
            "widgetId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                386
            ],
            "roleId": [
                528
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                528
            ],
            "predicateGroups": [
                456
            ],
            "predicates": [
                458
            ],
            "roleId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                455
            ],
            "predicates": [
                454
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                608
            ],
            "viewFields": [
                605
            ],
            "viewFilterGroups": [
                606
            ],
            "viewFilters": [
                607
            ],
            "viewSorts": [
                609
            ],
            "widgetId": [
                528
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
                528
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
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                528
            ],
            "logicalOperator": [
                645
            ],
            "parentViewFilterGroupId": [
                528
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
                528
            ],
            "id": [
                528
            ],
            "operand": [
                646
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                528
            ],
            "subFieldName": [
                1
            ],
            "value": [
                314
            ],
            "viewFilterGroupId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                528
            ],
            "calendarFieldMetadataId": [
                528
            ],
            "calendarLayout": [
                639
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                528
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                528
            ],
            "openRecordIn": [
                649
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                651
            ],
            "fieldMetadataId": [
                528
            ],
            "id": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                211
            ],
            "periodStart": [
                211
            ],
            "timeSeries": [
                623
            ],
            "usageByApplication": [
                612
            ],
            "usageByModel": [
                612
            ],
            "usageByOperationType": [
                612
            ],
            "usageByUser": [
                612
            ],
            "userDailyUsage": [
                625
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                615
            ],
            "periodEnd": [
                211
            ],
            "periodStart": [
                211
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
                98
            ],
            "createdAt": [
                211
            ],
            "id": [
                528
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                98
            ],
            "operationType": [
                615
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                622
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                624
            ],
            "updatedAt": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                624
            ],
            "operationType": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                614
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                618
            ],
            "resourceType": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                616
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
                615
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                98
            ],
            "periodEnd": [
                211
            ],
            "periodStart": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                615
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                622
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                98
            ],
            "id": [
                528
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                98
            ],
            "operationType": [
                615
            ],
            "periodEnd": [
                211
            ],
            "periodStart": [
                211
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                98
            ],
            "resourceType": [
                622
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
                624
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
                623
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
                89
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                211
            ],
            "currentUserWorkspace": [
                630
            ],
            "currentWorkspace": [
                661
            ],
            "deletedAt": [
                211
            ],
            "deletedWorkspaceMembers": [
                224
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
                528
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
                393
            ],
            "previousOnboardingStatus": [
                393
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                211
            ],
            "userVars": [
                315
            ],
            "userWorkspaces": [
                630
            ],
            "workspaceMember": [
                670
            ],
            "workspaceMembers": [
                670
            ],
            "workspaces": [
                630
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
            "city": [
                1
            ],
            "country": [
                1
            ],
            "createdAt": [
                211
            ],
            "expiresAt": [
                211
            ],
            "id": [
                528
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
                211
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "id": [
                528
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                385
            ],
            "objectsPermissions": [
                385
            ],
            "permissionFlags": [
                410
            ],
            "twoFactorAuthenticationMethodSummary": [
                524
            ],
            "updatedAt": [
                211
            ],
            "user": [
                626
            ],
            "userId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                528
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
                528
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
                528
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                528
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
                528
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
                83
            ],
            "workspaceUrls": [
                679
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
                528
            ],
            "calendarEndFieldMetadataId": [
                528
            ],
            "calendarFieldMetadataId": [
                528
            ],
            "calendarLayout": [
                639
            ],
            "createdAt": [
                211
            ],
            "createdByUserWorkspaceId": [
                528
            ],
            "deletedAt": [
                211
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                528
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
                528
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                648
            ],
            "mainGroupByFieldMetadataId": [
                528
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                528
            ],
            "openRecordIn": [
                649
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                652
            ],
            "universalIdentifier": [
                528
            ],
            "updatedAt": [
                211
            ],
            "viewFieldGroups": [
                642
            ],
            "viewFields": [
                641
            ],
            "viewFilterGroups": [
                644
            ],
            "viewFilters": [
                643
            ],
            "viewGroups": [
                647
            ],
            "viewSorts": [
                650
            ],
            "visibility": [
                653
            ],
            "workspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                656
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
                528
            ],
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "fieldMetadataId": [
                528
            ],
            "id": [
                528
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
                528
            ],
            "updatedAt": [
                211
            ],
            "viewFieldGroupId": [
                528
            ],
            "viewId": [
                528
            ],
            "workspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "id": [
                528
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
                211
            ],
            "viewFields": [
                641
            ],
            "viewId": [
                528
            ],
            "workspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "fieldMetadataId": [
                528
            ],
            "id": [
                528
            ],
            "operand": [
                646
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                528
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                211
            ],
            "value": [
                314
            ],
            "viewFilterGroupId": [
                528
            ],
            "viewId": [
                528
            ],
            "workspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "id": [
                528
            ],
            "logicalOperator": [
                645
            ],
            "parentViewFilterGroupId": [
                528
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                211
            ],
            "viewId": [
                528
            ],
            "workspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "fieldValue": [
                1
            ],
            "id": [
                528
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                211
            ],
            "viewId": [
                528
            ],
            "workspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "direction": [
                651
            ],
            "fieldMetadataId": [
                528
            ],
            "id": [
                528
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                211
            ],
            "viewId": [
                528
            ],
            "workspaceId": [
                528
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
                528
            ],
            "createdAt": [
                211
            ],
            "deletedAt": [
                211
            ],
            "description": [
                1
            ],
            "id": [
                528
            ],
            "operations": [
                1
            ],
            "role": [
                451
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                211
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
                92
            ],
            "on_CalendarConfiguration": [
                132
            ],
            "on_CallRecordingSummaryConfiguration": [
                133
            ],
            "on_CallRecordingTranscriptConfiguration": [
                134
            ],
            "on_ChatConfiguration": [
                142
            ],
            "on_ChatThreadsConfiguration": [
                145
            ],
            "on_EmailThreadConfiguration": [
                240
            ],
            "on_EmailsConfiguration": [
                244
            ],
            "on_FieldConfiguration": [
                267
            ],
            "on_FieldRichTextConfiguration": [
                275
            ],
            "on_FieldsConfiguration": [
                276
            ],
            "on_FilesConfiguration": [
                282
            ],
            "on_FormFieldConfiguration": [
                285
            ],
            "on_FrontComponentConfiguration": [
                287
            ],
            "on_IframeConfiguration": [
                297
            ],
            "on_LineChartConfiguration": [
                318
            ],
            "on_MessageCampaignBodyConfiguration": [
                342
            ],
            "on_MessageCampaignDetailsConfiguration": [
                343
            ],
            "on_NotesConfiguration": [
                376
            ],
            "on_PieChartConfiguration": [
                411
            ],
            "on_RecordTableConfiguration": [
                441
            ],
            "on_StandaloneRichTextConfiguration": [
                495
            ],
            "on_TasksConfiguration": [
                505
            ],
            "on_TimelineConfiguration": [
                509
            ],
            "on_ViewConfiguration": [
                640
            ],
            "on_WorkflowConfiguration": [
                658
            ],
            "on_WorkflowRunConfiguration": [
                659
            ],
            "on_WorkflowVersionConfiguration": [
                660
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                662
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                30
            ],
            "aiChatModelTier": [
                30
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
                100
            ],
            "billingEntitlements": [
                102
            ],
            "billingSubscriptions": [
                118
            ],
            "createdAt": [
                211
            ],
            "currentBillingSubscription": [
                118
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                451
            ],
            "deletedAt": [
                211
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
                264
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                528
            ],
            "installedApplications": [
                46
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
                528
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
                211
            ],
            "viewFields": [
                641
            ],
            "viewFilterGroups": [
                644
            ],
            "viewFilters": [
                643
            ],
            "viewGroups": [
                647
            ],
            "viewSorts": [
                650
            ],
            "views": [
                638
            ],
            "workspaceCustomApplication": [
                46
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                667
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                679
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
                664
            ],
            "personEnrichment": [
                314
            ],
            "personOutcome": [
                677
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
                211
            ],
            "id": [
                528
            ],
            "roleId": [
                528
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
                672
            ],
            "id": [
                528
            ],
            "locale": [
                1
            ],
            "name": [
                289
            ],
            "numberFormat": [
                673
            ],
            "openRecordIn": [
                396
            ],
            "roles": [
                451
            ],
            "timeFormat": [
                674
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
                528
            ],
            "userWorkspaceId": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                528
            ],
            "variables": [
                627
            ],
            "workspaceMemberId": [
                528
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
                528
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
                528
            ],
            "workspaceUrls": [
                679
            ],
            "__typename": [
                1
            ]
        }
    }
}