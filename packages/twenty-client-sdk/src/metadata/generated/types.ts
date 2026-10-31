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
        34,
        36,
        43,
        56,
        64,
        74,
        80,
        92,
        96,
        97,
        99,
        104,
        109,
        115,
        120,
        126,
        129,
        130,
        131,
        132,
        140,
        142,
        156,
        160,
        162,
        164,
        211,
        212,
        239,
        243,
        244,
        246,
        256,
        262,
        266,
        270,
        273,
        280,
        297,
        299,
        311,
        318,
        319,
        320,
        332,
        334,
        350,
        351,
        352,
        353,
        354,
        355,
        357,
        358,
        359,
        362,
        363,
        365,
        366,
        369,
        371,
        375,
        379,
        388,
        395,
        396,
        397,
        400,
        404,
        405,
        410,
        414,
        437,
        439,
        440,
        443,
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
        667,
        669,
        672,
        677,
        678,
        679,
        682,
        683
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
                318
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
                212
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
                318
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
                318
            ],
            "roleId": [
                532
            ],
            "triggers": [
                318
            ],
            "updatedAt": [
                212
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
            "assignedCount": [
                10
            ],
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
                532
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                318
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
                212
            ],
            "deletedAt": [
                212
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
                212
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                212
            ],
            "id": [
                532
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                212
            ],
            "lastReadAt": [
                212
            ],
            "mentionsResolvedAt": [
                212
            ],
            "snoozedUntil": [
                212
            ],
            "threadId": [
                532
            ],
            "updatedAt": [
                212
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
                212
            ],
            "id": [
                532
            ],
            "parts": [
                22
            ],
            "processedAt": [
                212
            ],
            "reactions": [
                23
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
                212
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
                318
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
                318
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                318
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
                212
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
                212
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
                212
            ],
            "status": [
                25
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
                27
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
                318
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "label": [
                1
            ],
            "numberFormat": [
                142
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                432
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
                99
            ],
            "kind": [
                1
            ],
            "limitValue": [
                99
            ],
            "periodEnd": [
                212
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                99
            ],
            "limitValue": [
                99
            ],
            "periodEnd": [
                212
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
                33
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
                212
            ],
            "expiresAt": [
                212
            ],
            "id": [
                532
            ],
            "name": [
                1
            ],
            "revokedAt": [
                212
            ],
            "role": [
                455
            ],
            "updatedAt": [
                212
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                212
            ],
            "id": [
                532
            ],
            "name": [
                1
            ],
            "revokedAt": [
                212
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
                160
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
                43
            ],
            "value": [
                318
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
                46
            ],
            "receivedAt": [
                212
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
                359
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
                76
            ],
            "applicationRegistrationId": [
                532
            ],
            "applicationVariables": [
                79
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                318
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                155
            ],
            "createdAt": [
                212
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
                287
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
                331
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
                381
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
                212
            ],
            "id": [
                532
            ],
            "lastAuthorizedAt": [
                212
            ],
            "lastUsedAt": [
                212
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
                212
            ],
            "authFailedAt": [
                212
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                428
            ],
            "connectionProviderId": [
                532
            ],
            "createdAt": [
                212
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
                212
            ],
            "lastSignedInAt": [
                212
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                160
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                212
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
                52
            ],
            "scope": [
                164
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
                54
            ],
            "coverage": [
                55
            ],
            "files": [
                57
            ],
            "manifest": [
                318
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
                74
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
                56
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
                212
            ],
            "fileFolder": [
                280
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
                62
            ],
            "description": [
                1
            ],
            "status": [
                64
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
                66
            ],
            "bucketSizeInSeconds": [
                10
            ],
            "creditUsage": [
                67
            ],
            "creditsUsed": [
                6
            ],
            "failedRunCount": [
                10
            ],
            "functions": [
                68
            ],
            "issues": [
                69
            ],
            "lifecycle": [
                70
            ],
            "lifecycleFailureCount": [
                10
            ],
            "lookbackInHours": [
                10
            ],
            "periodEnd": [
                212
            ],
            "periodStart": [
                212
            ],
            "rateLimitEventCount": [
                10
            ],
            "runCount": [
                10
            ],
            "versions": [
                71
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                212
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
                212
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
                212
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
                212
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
                51
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
                212
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
                74
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                212
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
                209
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
                74
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                212
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
                318
            ],
            "type": [
                1
            ],
            "updatedAt": [
                212
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
                84
            ],
            "applicationRefreshToken": [
                84
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
                318
            ],
            "scope": [
                80
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
                212
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
                212
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
                84
            ],
            "refreshToken": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                85
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
                684
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                89
            ],
            "availableWorkspacesForSignUp": [
                89
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                90
            ],
            "tokens": [
                85
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
                27
            ],
            "axisNameDisplay": [
                92
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
                318
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupMode": [
                96
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                97
            ],
            "numberFormat": [
                142
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                395
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
                297
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                395
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
                297
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
                318
            ],
            "formattedToRawLookup": [
                318
            ],
            "groupMode": [
                96
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
                97
            ],
            "series": [
                98
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
                318
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
                124
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
                119
            ],
            "currentBillingSubscription": [
                119
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
                104
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
                116
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
        "BillingMeteredProduct": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                116
            ],
            "name": [
                1
            ],
            "prices": [
                111
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
                105
            ],
            "downgradePlanKeys": [
                109
            ],
            "isCheckoutDefault": [
                4
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                106
            ],
            "planKey": [
                109
            ],
            "resourceCreditProducts": [
                105
            ],
            "upgradePlanKeys": [
                109
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
                126
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
                126
            ],
            "recurringInterval": [
                504
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                112
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
                116
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
                116
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                105
            ],
            "on_BillingMeteredProduct": [
                106
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
                109
            ],
            "priceUsageBased": [
                126
            ],
            "productKey": [
                115
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                212
            ],
            "periodStart": [
                212
            ],
            "productKey": [
                115
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
                121
            ],
            "cancelAt": [
                212
            ],
            "collectionMethod": [
                120
            ],
            "currentPeriodEnd": [
                212
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
                318
            ],
            "phases": [
                122
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
                114
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
                123
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
                119
            ],
            "currentBillingSubscription": [
                119
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
                129
            ],
            "createdAt": [
                212
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
                130
            ],
            "syncStageStartedAt": [
                212
            ],
            "syncStatus": [
                131
            ],
            "syncedAt": [
                212
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                212
            ],
            "visibility": [
                132
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
                140
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
                318
            ],
            "error": [
                145
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
                375
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                377
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
                149
            ],
            "aiModelTiers": [
                151
            ],
            "aiModels": [
                150
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                37
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                83
            ],
            "billing": [
                100
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                139
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
                153
            ],
            "publicFeatureFlags": [
                426
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
                212
            ],
            "link": [
                1
            ],
            "startAt": [
                212
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                34
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
                156
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
                212
            ],
            "engineComponentKey": [
                246
            ],
            "frontComponent": [
                287
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
                157
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
                212
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
                387
            ],
            "on_PathCommandMenuItemPayload": [
                412
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                58
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
                532
            ],
            "archivedAt": [
                212
            ],
            "authFailedAt": [
                212
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                428
            ],
            "connectionProviderId": [
                532
            ],
            "createdAt": [
                212
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
                212
            ],
            "lastSignedInAt": [
                212
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                160
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                212
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
                303
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
                239
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
                318
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
                318
            ],
            "roleId": [
                532
            ],
            "triggers": [
                318
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
                355
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                59
            ],
            "targets": [
                61
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                73
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
                156
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
                246
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
                318
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
                349
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
                318
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
                318
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                532
            ],
            "options": [
                318
            ],
            "relationCreationPayload": [
                318
            ],
            "settings": [
                318
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
                181
            ],
            "indexType": [
                311
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
                318
            ],
            "databaseEventTriggerSettings": [
                318
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                318
            ],
            "id": [
                532
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                318
            ],
            "source": [
                318
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                318
            ],
            "universalIdentifier": [
                532
            ],
            "workflowActionTriggerSettings": [
                318
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
                379
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
                318
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
                187
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
                405
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                404
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
                318
            ],
            "objectMetadataId": [
                532
            ],
            "pageLayoutTabId": [
                532
            ],
            "position": [
                318
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
                318
            ],
            "objectMetadataId": [
                532
            ],
            "orderBy": [
                318
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                532
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                532
            ],
            "secondFieldMetadataId": [
                532
            ],
            "thirdFieldMetadataId": [
                532
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
                99
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                99
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
                27
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
                318
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
                27
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
            "roleId": [
                532
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
                162
            ],
            "before": [
                162
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
                290
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
                232
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
                299
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
                163
            ],
            "IMAP": [
                163
            ],
            "SMTP": [
                163
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
                212
            ],
            "domain": [
                1
            ],
            "id": [
                532
            ],
            "status": [
                243
            ],
            "tenantStatus": [
                244
            ],
            "unsubscribeHostnameStatus": [
                534
            ],
            "updatedAt": [
                212
            ],
            "verificationRecords": [
                639
            ],
            "verifiedAt": [
                212
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
                318
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
                318
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
                318
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
                212
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
                212
            ],
            "currentPeriodEnd": [
                212
            ],
            "expiresAt": [
                212
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
                212
            ],
            "start": [
                212
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
                318
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                212
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
                364
            ],
            "objectRecordEventsWithQueryIds": [
                394
            ],
            "queueJobEvents": [
                321
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
                318
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
                532
            ],
            "createdAt": [
                212
            ],
            "defaultValue": [
                318
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
                381
            ],
            "objectMetadataId": [
                532
            ],
            "options": [
                318
            ],
            "relation": [
                448
            ],
            "settings": [
                318
            ],
            "type": [
                273
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                212
            ],
            "writability": [
                371
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
                401
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                162
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
                533
            ],
            "isActive": [
                127
            ],
            "isSystem": [
                127
            ],
            "isUIEditable": [
                127
            ],
            "isUIReadOnly": [
                127
            ],
            "objectMetadataId": [
                533
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
                212
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
                212
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
                212
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
                299
            ],
            "workspace": [
                681
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
                362
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
                78
            ],
            "applicationVariables": [
                318
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
                212
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
                212
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
                405
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
                466
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                318
            ],
            "scope": [
                318
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
                318
            ],
            "runId": [
                532
            ],
            "success": [
                4
            ],
            "text": [
                1
            ],
            "usage": [
                31
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
                304
            ],
            "IMAP": [
                304
            ],
            "SMTP": [
                304
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
                239
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
                84
            ],
            "workspace": [
                685
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
                212
            ],
            "id": [
                532
            ],
            "indexFieldMetadataList": [
                309
            ],
            "indexType": [
                311
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
                212
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                162
            ],
            "node": [
                307
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                212
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
                212
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                310
            ],
            "id": [
                533
            ],
            "isCustom": [
                127
            ],
            "or": [
                310
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
                45
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                314
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
                320
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
                27
            ],
            "axisNameDisplay": [
                92
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
                318
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
                142
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                395
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
                297
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                395
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
                297
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
                318
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                326
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
                318
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
                325
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
                160
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
                212
            ],
            "cronTriggerSettings": [
                318
            ],
            "databaseEventTriggerSettings": [
                318
            ],
            "description": [
                1
            ],
            "executionMode": [
                332
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                318
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
                318
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                212
            ],
            "workflowActionTriggerSettings": [
                318
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                318
            ],
            "duration": [
                6
            ],
            "error": [
                318
            ],
            "logs": [
                1
            ],
            "status": [
                334
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
                84
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
                318
            ],
            "name": [
                1
            ],
            "objects": [
                341
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                342
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                74
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
                343
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                344
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
                212
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
                212
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
                159
            ],
            "connectedAccountId": [
                532
            ],
            "contactAutoCreationPolicy": [
                350
            ],
            "createdAt": [
                212
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
                357
            ],
            "messagingProviderUniversalIdentifier": [
                532
            ],
            "participantHandleFieldUniversalIdentifier": [
                532
            ],
            "pendingGroupEmailsAction": [
                351
            ],
            "syncStage": [
                352
            ],
            "syncStageStartedAt": [
                212
            ],
            "syncStatus": [
                353
            ],
            "syncedAt": [
                212
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                212
            ],
            "type": [
                354
            ],
            "updatedAt": [
                212
            ],
            "visibility": [
                355
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
                212
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
                358
            ],
            "updatedAt": [
                212
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
                212
            ],
            "emailAddress": [
                1
            ],
            "id": [
                532
            ],
            "reason": [
                362
            ],
            "source": [
                363
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
                360
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
                393
            ],
            "recordId": [
                1
            ],
            "type": [
                365
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
                369
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
                154
            ],
            "objectMetadataItems": [
                373
            ],
            "views": [
                374
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
                666,
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
                        306,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                87,
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
                138,
                {
                    "input": [
                        137,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                125
            ],
            "cancelSwitchBillingPlan": [
                125
            ],
            "cancelSwitchResourceCreditPrice": [
                125
            ],
            "checkCustomDomainValidRecords": [
                233
            ],
            "checkPublicDomainValidRecords": [
                233,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                118,
                {
                    "plan": [
                        109,
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
                73,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                73,
                {
                    "fileId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                158,
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
                399,
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
                        165,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                38,
                {
                    "input": [
                        167,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                349,
                {
                    "input": [
                        168,
                        "CreateAppMessageChannelInput!"
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
                        60,
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
                81,
                {
                    "input": [
                        172,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                107
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
                17,
                {
                    "channelId": [
                        532
                    ]
                }
            ],
            "createCommandMenuItem": [
                155,
                {
                    "input": [
                        175,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                231,
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
                242,
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
                378,
                {
                    "inputs": [
                        186,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                647,
                {
                    "inputs": [
                        201,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                646,
                {
                    "inputs": [
                        202,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                652,
                {
                    "inputs": [
                        205,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                345,
                {
                    "input": [
                        184,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                360,
                {
                    "input": [
                        185,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                378,
                {
                    "input": [
                        186,
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
                495,
                {
                    "input": [
                        493,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                35,
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
                        318
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
                        166,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                267,
                {
                    "input": [
                        188,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                307,
                {
                    "input": [
                        189,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                331,
                {
                    "input": [
                        183,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                381,
                {
                    "input": [
                        190,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                455,
                {
                    "createRoleInput": [
                        196,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                402,
                {
                    "input": [
                        191,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                403,
                {
                    "input": [
                        192,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                406,
                {
                    "input": [
                        193,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                425,
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
                447,
                {
                    "input": [
                        195,
                        "CreateRelatedRecordPathInput!"
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
                        197,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                107,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        109,
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
                        198,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                618,
                {
                    "input": [
                        199,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                638,
                {
                    "input": [
                        200,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                643,
                {
                    "input": [
                        206,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                646,
                {
                    "input": [
                        202,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                647,
                {
                    "input": [
                        201,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                648,
                {
                    "input": [
                        204,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                649,
                {
                    "input": [
                        203,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                652,
                {
                    "input": [
                        205,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                655,
                {
                    "input": [
                        207,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                659,
                {
                    "input": [
                        208,
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
                        43
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                349,
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
                        213,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                155,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                159,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                666
            ],
            "deleteEmailGroupChannel": [
                349,
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
                287,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                378,
                {
                    "ids": [
                        532,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                345,
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
                378,
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
                        20,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                267,
                {
                    "input": [
                        214,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                307,
                {
                    "input": [
                        215,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                331,
                {
                    "input": [
                        335,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                381,
                {
                    "input": [
                        216,
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
            "deleteRelatedRecordPath": [
                447,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                217,
                {
                    "input": [
                        218,
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
                219,
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
                        221,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                647,
                {
                    "input": [
                        220,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                648,
                {
                    "input": [
                        222,
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
                        223,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        224,
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
                        227,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                647,
                {
                    "input": [
                        226,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                648,
                {
                    "input": [
                        228,
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
                        229,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        230,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
                {
                    "input": [
                        306,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                159,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                234,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                235,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                236,
                {
                    "input": [
                        237,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                240,
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
                102
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
                670
            ],
            "executeOneLogicFunction": [
                333,
                {
                    "input": [
                        264,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                292,
                {
                    "input": [
                        291,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                40,
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
                78,
                {
                    "applicationId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                84
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
                86,
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
                86,
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
                86,
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
                294,
                {
                    "input": [
                        295,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                338,
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
                398
            ],
            "grantApplicationCapabilities": [
                49,
                {
                    "input": [
                        296,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                305,
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
                313,
                {
                    "input": [
                        312,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                315,
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
                315
            ],
            "installApplication": [
                47,
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
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                252
            ],
            "removeAgentChatMessageReaction": [
                23,
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
                441,
                {
                    "principal": [
                        438,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        446,
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
                78,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                86,
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
                155,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                403,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                402,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                406,
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
                38,
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
                63,
                {
                    "applicationId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                302,
                {
                    "connectionParameters": [
                        238,
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
                        318
                    ],
                    "channelId": [
                        532
                    ],
                    "fileAttachments": [
                        279,
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
                42,
                {
                    "input": [
                        490,
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
                441,
                {
                    "accessLevel": [
                        437,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        446,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                441,
                {
                    "accessLevel": [
                        437,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        438,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        446,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                125,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                91,
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
                91,
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
                399,
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
                        212,
                        "DateTime!"
                    ],
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                141,
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
                        318
                    ],
                    "personContext": [
                        318
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
                125,
                {
                    "plan": [
                        109
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                125
            ],
            "syncAppMessageFolders": [
                356,
                {
                    "input": [
                        508,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                680,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        318,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "trackAnalytics": [
                35,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        318
                    ],
                    "type": [
                        36,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                73,
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
                19,
                {
                    "action": [
                        15,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        212
                    ],
                    "threadIds": [
                        532,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                38,
                {
                    "input": [
                        539,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                349,
                {
                    "input": [
                        540,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                47,
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
                73,
                {
                    "input": [
                        542,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                77,
                {
                    "input": [
                        544,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                128,
                {
                    "input": [
                        546,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                155,
                {
                    "input": [
                        548,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                349,
                {
                    "input": [
                        549,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                287,
                {
                    "input": [
                        551,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                265,
                {
                    "input": [
                        553,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                378,
                {
                    "inputs": [
                        566,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                381,
                {
                    "inputs": [
                        567,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                652,
                {
                    "inputs": [
                        589,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                345,
                {
                    "input": [
                        556,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                349,
                {
                    "input": [
                        558,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                356,
                {
                    "input": [
                        560,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                356,
                {
                    "input": [
                        562,
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
                378,
                {
                    "input": [
                        566,
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
                267,
                {
                    "input": [
                        565,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        554,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                381,
                {
                    "input": [
                        567,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                455,
                {
                    "updateRoleInput": [
                        574,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                402,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        568,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                403,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        569,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                406,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        571,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                402,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        573,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                316,
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
                        576,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                510,
                {
                    "input": [
                        577,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                535,
                {
                    "input": [
                        578,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                618,
                {
                    "input": [
                        579,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                101,
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
                        580,
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
                        591,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                646,
                {
                    "input": [
                        584,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                647,
                {
                    "input": [
                        582,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                648,
                {
                    "input": [
                        587,
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
                        586,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                652,
                {
                    "input": [
                        589,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                655,
                {
                    "input": [
                        592,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                659,
                {
                    "input": [
                        594,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                666,
                {
                    "data": [
                        598,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                666,
                {
                    "data": [
                        596,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                666,
                {
                    "data": [
                        597,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                675,
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
                73,
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
                278,
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
                        600,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                282,
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
                282,
                {
                    "file": [
                        600,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                282,
                {
                    "file": [
                        600,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                274,
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
                389,
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
                81,
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
                91,
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
                242,
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
                212
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
                434
            ],
            "type": [
                379
            ],
            "updatedAt": [
                212
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
                212
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
                384,
                {
                    "filter": [
                        272,
                        "FieldFilter!"
                    ],
                    "paging": [
                        210,
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
                532
            ],
            "imageIdentifierFieldMetadataId": [
                532
            ],
            "indexMetadataList": [
                307
            ],
            "indexMetadatas": [
                386,
                {
                    "filter": [
                        310,
                        "IndexFilter!"
                    ],
                    "paging": [
                        210,
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
                388
            ],
            "readability": [
                366
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                532
            ],
            "searchFieldMetadataList": [
                474
            ],
            "sharingReach": [
                396
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                212
            ],
            "writability": [
                371
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                383
            ],
            "pageInfo": [
                401
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                162
            ],
            "node": [
                381
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
                401
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                385
            ],
            "id": [
                533
            ],
            "isActive": [
                127
            ],
            "isRemote": [
                127
            ],
            "isSearchable": [
                127
            ],
            "isSystem": [
                127
            ],
            "isUICreatable": [
                127
            ],
            "isUIEditable": [
                127
            ],
            "isUIReadOnly": [
                127
            ],
            "or": [
                385
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
                308
            ],
            "pageInfo": [
                401
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
                318
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
                211
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                393
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
                318
            ],
            "before": [
                318
            ],
            "diff": [
                318
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
                392
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
                397
            ],
            "previousOnboardingStatus": [
                397
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
                162
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                162
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
                212
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                532
            ],
            "deletedAt": [
                212
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
                403
            ],
            "type": [
                405
            ],
            "universalIdentifier": [
                532
            ],
            "updatedAt": [
                212
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
                212
            ],
            "deletedAt": [
                212
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
                404
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
                212
            ],
            "widgets": [
                406
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
                318
            ],
            "configuration": [
                660
            ],
            "createdAt": [
                212
            ],
            "deletedAt": [
                212
            ],
            "gridPosition": [
                298
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
                409
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
                212
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                404
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
                404
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
                407
            ],
            "on_PageLayoutWidgetGridPosition": [
                408
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                411
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                410
            ],
            "index": [
                10
            ],
            "layoutMode": [
                404
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
                212
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
                212
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
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                661
            ],
            "dateGranularity": [
                395
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
                318
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
                142
            ],
            "orderBy": [
                297
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
                418
            ],
            "formattedToRawLookup": [
                318
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
                318
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
                330
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
                212
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                136
            ],
            "blockers": [
                348
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
                239
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
                212
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
                266
            ],
            "metadata": [
                427
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
                424
            ],
            "IMAP": [
                424
            ],
            "SMTP": [
                424
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                82
            ],
            "authProviders": [
                83
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
                684
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
                12,
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
                28
            ],
            "aiChatUserCreditsUsage": [
                29
            ],
            "apiKey": [
                38,
                {
                    "input": [
                        293,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                38
            ],
            "appConnection": [
                41,
                {
                    "id": [
                        18,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                41,
                {
                    "filter": [
                        327
                    ]
                }
            ],
            "appKeyValue": [
                42,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        43
                    ]
                }
            ],
            "appMessageChannels": [
                349,
                {
                    "filter": [
                        328
                    ]
                }
            ],
            "appMessageFolders": [
                356,
                {
                    "filter": [
                        329
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                50,
                {
                    "applicationId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                51,
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
                94,
                {
                    "input": [
                        95,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPlans": [
                108
            ],
            "billingPortalSession": [
                118,
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
                21,
                {
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                144,
                {
                    "threadId": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                17,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                147,
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
                674,
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
                155,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                155
            ],
            "currentUser": [
                631
            ],
            "currentUserApplicationAuthorizations": [
                48
            ],
            "currentUserSessions": [
                634
            ],
            "currentWorkspace": [
                666
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
                53,
                {
                    "shouldIncludeDependencies": [
                        4
                    ],
                    "universalIdentifier": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                267,
                {
                    "id": [
                        532,
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
                        210,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                423,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                73,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                65,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        212
                    ],
                    "periodStart": [
                        212
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                75,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        212
                    ],
                    "periodStart": [
                        212
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                77,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                148,
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
                321,
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
                73
            ],
            "findManyApplications": [
                47
            ],
            "findManyLogicFunctions": [
                331
            ],
            "findManyMarketplaceApps": [
                339,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                425
            ],
            "findMarketplaceAppDetail": [
                340,
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
                47,
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
                73,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                331,
                {
                    "input": [
                        335,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                321,
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
                321,
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
                668
            ],
            "findWorkspaceFromInviteHash": [
                666,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                673
            ],
            "frontComponent": [
                287,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                287
            ],
            "getAddressDetails": [
                419,
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
                32
            ],
            "getApiKeyRoles": [
                455
            ],
            "getApprovedAccessDomains": [
                81
            ],
            "getAutoCompleteAddress": [
                88,
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
                318,
                {
                    "input": [
                        335,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                161,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                242
            ],
            "getInviteSuggestions": [
                317
            ],
            "getJobs": [
                321,
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
                        335,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                402,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                403,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                403,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                406,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                406,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                402,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        405
                    ]
                }
            ],
            "getPermissionFlags": [
                413
            ],
            "getPublicWorkspaceDataByDomain": [
                429,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                430,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                117
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
                284
            ],
            "getToolIndex": [
                514
            ],
            "getToolInputSchema": [
                318,
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
                671
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
                323,
                {
                    "input": [
                        324,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                108
            ],
            "mcpServer": [
                345,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                345
            ],
            "messageSuppressions": [
                361,
                {
                    "input": [
                        285,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                367,
                {
                    "input": [
                        370,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                372
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
                72
            ],
            "myCalendarChannels": [
                128,
                {
                    "connectedAccountId": [
                        532
                    ]
                }
            ],
            "myConnectedAccounts": [
                159
            ],
            "myMessageChannels": [
                349,
                {
                    "connectedAccountId": [
                        532
                    ]
                }
            ],
            "myMessageFolders": [
                356,
                {
                    "messageChannelId": [
                        532
                    ]
                }
            ],
            "myUserApplicationVariables": [
                676
            ],
            "navigationMenuItem": [
                378,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                378
            ],
            "object": [
                381,
                {
                    "id": [
                        532,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                391
            ],
            "objects": [
                382,
                {
                    "filter": [
                        385,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        210,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                416,
                {
                    "input": [
                        417,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                136,
                {
                    "input": [
                        420,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                422,
                {
                    "input": [
                        421,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                340,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                339
            ],
            "recordPermissions": [
                436,
                {
                    "targets": [
                        446,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                441,
                {
                    "target": [
                        446,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                447
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
                435
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
                437
            ],
            "generalAccessLevel": [
                437
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                435
            ],
            "roles": [
                444
            ],
            "shares": [
                442
            ],
            "sharingMode": [
                443
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                437
            ],
            "id": [
                18
            ],
            "principalId": [
                532
            ],
            "principalRoleId": [
                532
            ],
            "principalType": [
                439
            ],
            "rowCause": [
                440
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
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                532
            ],
            "id": [
                532
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                532
            ],
            "secondFieldMetadataId": [
                532
            ],
            "thirdFieldMetadataId": [
                532
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
                381
            ],
            "targetFieldMetadata": [
                267
            ],
            "targetObjectMetadata": [
                381
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
                39
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
                274
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
                389
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
                675
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
                318
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
            "relationFieldMetadataId": [
                532
            ],
            "rowLevelPermissionPredicateGroupId": [
                532
            ],
            "subFieldName": [
                1
            ],
            "value": [
                318
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
                318
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
                318
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
                299
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
                299
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
                212
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
                212
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
                318
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
                673
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
                212
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                136
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
                43
            ],
            "value": [
                318
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
                212
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
                212
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
                299
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                84
            ],
            "workspace": [
                685
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
                212
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
                212
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
                683
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
                433,
                {
                    "input": [
                        194,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                336,
                {
                    "input": [
                        337,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                14,
                {
                    "threadId": [
                        532,
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
                44
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
                212
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
                212
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
                318
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
                84
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
                318
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
                212
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
                85
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
                212
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
                212
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
                212
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
                318
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
                318
            ],
            "roleId": [
                532
            ],
            "triggers": [
                318
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
                355
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
                129
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
                132
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
                156
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
                318
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
                318
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                532
            ],
            "options": [
                318
            ],
            "settings": [
                318
            ],
            "translations": [
                368
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                318
            ],
            "databaseEventTriggerSettings": [
                318
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                318
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
                318
            ],
            "workflowActionTriggerSettings": [
                318
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
                557
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
                559
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                350
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
                357
            ],
            "visibility": [
                355
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
                561
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
                561
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
                388
            ],
            "readability": [
                366
            ],
            "sharingReach": [
                396
            ],
            "shortcut": [
                1
            ],
            "translations": [
                368
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
                563
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
                564
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
                405
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
                404
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
                404
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                572
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
                318
            ],
            "configuration": [
                318
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
                318
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
                318
            ],
            "configuration": [
                318
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
                318
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
                570
            ],
            "type": [
                405
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
                575
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
                368
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
                199
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
                581
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
                583
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
                585
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
                588
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
                318
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
                590
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
                27
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
            "translations": [
                368
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
                593
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
                595
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
                532
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
                30
            ],
            "aiChatModelTier": [
                30
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                318
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
                672
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                318
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
                275
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
                390
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
                27
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
                318
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
                27
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
                212
            ],
            "periodStart": [
                212
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
                212
            ],
            "periodStart": [
                212
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
                99
            ],
            "createdAt": [
                212
            ],
            "id": [
                532
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                99
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
                212
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
                99
            ],
            "periodEnd": [
                212
            ],
            "periodStart": [
                212
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
                99
            ],
            "id": [
                532
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                99
            ],
            "operationType": [
                620
            ],
            "periodEnd": [
                212
            ],
            "periodStart": [
                212
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                99
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
                90
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                212
            ],
            "currentUserWorkspace": [
                635
            ],
            "currentWorkspace": [
                666
            ],
            "deletedAt": [
                212
            ],
            "deletedWorkspaceMembers": [
                225
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
                397
            ],
            "previousOnboardingStatus": [
                397
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                212
            ],
            "userVars": [
                319
            ],
            "userWorkspaces": [
                635
            ],
            "workspaceMember": [
                675
            ],
            "workspaceMembers": [
                675
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
                318
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
                212
            ],
            "expiresAt": [
                212
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
                212
            ],
            "region": [
                1
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
                212
            ],
            "deletedAt": [
                212
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
                389
            ],
            "objectsPermissions": [
                389
            ],
            "permissionFlags": [
                414
            ],
            "twoFactorAuthenticationMethodSummary": [
                528
            ],
            "updatedAt": [
                212
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
                84
            ],
            "workspaceUrls": [
                684
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
                212
            ],
            "createdByUserWorkspaceId": [
                532
            ],
            "deletedAt": [
                212
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
                27
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
                212
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
                27
            ],
            "applicationId": [
                532
            ],
            "createdAt": [
                212
            ],
            "deletedAt": [
                212
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
                212
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
                212
            ],
            "deletedAt": [
                212
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
                212
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
                212
            ],
            "deletedAt": [
                212
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
                212
            ],
            "value": [
                318
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
                212
            ],
            "deletedAt": [
                212
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
                212
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
                212
            ],
            "deletedAt": [
                212
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
                212
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
                212
            ],
            "deletedAt": [
                212
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
                212
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
                212
            ],
            "deletedAt": [
                212
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
            "role": [
                455
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                212
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
                93
            ],
            "on_CalendarConfiguration": [
                133
            ],
            "on_CallRecordingSummaryConfiguration": [
                134
            ],
            "on_CallRecordingTranscriptConfiguration": [
                135
            ],
            "on_ChatConfiguration": [
                143
            ],
            "on_ChatThreadsConfiguration": [
                146
            ],
            "on_EmailThreadConfiguration": [
                241
            ],
            "on_EmailsConfiguration": [
                245
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
                300
            ],
            "on_LineChartConfiguration": [
                322
            ],
            "on_MessageCampaignBodyConfiguration": [
                346
            ],
            "on_MessageCampaignDetailsConfiguration": [
                347
            ],
            "on_NotesConfiguration": [
                380
            ],
            "on_PieChartConfiguration": [
                415
            ],
            "on_RecordTableConfiguration": [
                445
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
                663
            ],
            "on_WorkflowRunConfiguration": [
                664
            ],
            "on_WorkflowVersionConfiguration": [
                665
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
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
                667
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
                318
            ],
            "allowImpersonation": [
                4
            ],
            "allowedEmbeddingOrigins": [
                1
            ],
            "billingCustomer": [
                101
            ],
            "billingEntitlements": [
                103
            ],
            "billingSubscriptions": [
                119
            ],
            "createdAt": [
                212
            ],
            "currentBillingSubscription": [
                119
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
                212
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
                532
            ],
            "iframeMediaPermissions": [
                301
            ],
            "installedApplications": [
                47
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
                212
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
                47
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                672
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                684
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
                318
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                669
            ],
            "personEnrichment": [
                318
            ],
            "personOutcome": [
                682
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
                212
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
                677
            ],
            "id": [
                532
            ],
            "locale": [
                1
            ],
            "name": [
                290
            ],
            "numberFormat": [
                678
            ],
            "openRecordIn": [
                400
            ],
            "roles": [
                455
            ],
            "timeFormat": [
                679
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
                318
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
                684
            ],
            "__typename": [
                1
            ]
        }
    }
}