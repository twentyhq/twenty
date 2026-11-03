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
        110,
        116,
        121,
        127,
        130,
        131,
        132,
        133,
        141,
        143,
        157,
        161,
        163,
        165,
        212,
        213,
        240,
        244,
        245,
        247,
        257,
        263,
        267,
        271,
        274,
        281,
        296,
        298,
        304,
        306,
        318,
        325,
        326,
        327,
        339,
        341,
        357,
        358,
        359,
        360,
        361,
        362,
        364,
        365,
        366,
        369,
        370,
        372,
        375,
        380,
        384,
        393,
        400,
        401,
        404,
        408,
        409,
        414,
        418,
        441,
        443,
        444,
        452,
        464,
        466,
        470,
        475,
        495,
        507,
        508,
        510,
        535,
        537,
        539,
        604,
        624,
        631,
        633,
        637,
        648,
        654,
        655,
        657,
        658,
        660,
        661,
        662,
        665,
        666,
        667,
        672,
        674,
        677,
        682,
        683,
        684,
        687,
        688
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
                325
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
                535
            ],
            "createdAt": [
                213
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                535
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
                325
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
                325
            ],
            "roleId": [
                535
            ],
            "triggers": [
                325
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "applicationId": [
                535
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                535
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
                535
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
                535
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
                535
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                325
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
                213
            ],
            "deletedAt": [
                213
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
                213
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                213
            ],
            "id": [
                535
            ],
            "isSubscribed": [
                5
            ],
            "lastMentionedAt": [
                213
            ],
            "lastReadAt": [
                213
            ],
            "mentionsResolvedAt": [
                213
            ],
            "snoozedUntil": [
                213
            ],
            "threadId": [
                535
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                535
            ],
            "createdAt": [
                213
            ],
            "id": [
                535
            ],
            "parts": [
                23
            ],
            "processedAt": [
                213
            ],
            "reactions": [
                24
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                535
            ],
            "senderWorkspaceMemberId": [
                535
            ],
            "status": [
                1
            ],
            "threadId": [
                535
            ],
            "turnId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                213
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                535
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                535
            ],
            "messageId": [
                535
            ],
            "orderIndex": [
                11
            ],
            "providerExecuted": [
                5
            ],
            "providerMetadata": [
                325
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
                325
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                325
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
                535
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                5
            ],
            "workspaceMemberIds": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                213
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
                213
            ],
            "errorMessage": [
                1
            ],
            "id": [
                535
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
                213
            ],
            "status": [
                26
            ],
            "threadId": [
                535
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
                535
            ],
            "aggregateOperation": [
                28
            ],
            "configurationType": [
                665
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                5
            ],
            "filter": [
                325
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "label": [
                1
            ],
            "numberFormat": [
                143
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                436
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
                213
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
                213
            ],
            "__typename": [
                1
            ]
        },
        "AiModelTier": {},
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                11
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
                213
            ],
            "expiresAt": [
                213
            ],
            "id": [
                535
            ],
            "name": [
                1
            ],
            "revokedAt": [
                213
            ],
            "role": [
                458
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                213
            ],
            "id": [
                535
            ],
            "name": [
                1
            ],
            "revokedAt": [
                213
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
                161
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
                325
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
                47
            ],
            "receivedAt": [
                213
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
                535
            ],
            "role": [
                366
            ],
            "workspaceMemberId": [
                535
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
                77
            ],
            "applicationRegistrationId": [
                535
            ],
            "applicationVariables": [
                80
            ],
            "autoUpgrade": [
                5
            ],
            "availablePackages": [
                325
            ],
            "canBeUninstalled": [
                5
            ],
            "commandMenuItems": [
                156
            ],
            "createdAt": [
                213
            ],
            "defaultLogicFunctionRole": [
                458
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                288
            ],
            "healthCheckLogicFunctionId": [
                535
            ],
            "id": [
                535
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                5
            ],
            "logicFunctions": [
                338
            ],
            "logoFileId": [
                535
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                386
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                535
            ],
            "runOnUserPreferences": [
                5
            ],
            "settingsCustomTabFrontComponentId": [
                535
            ],
            "settingsMenuItems": [
                494
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                535
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                213
            ],
            "id": [
                535
            ],
            "lastAuthorizedAt": [
                213
            ],
            "lastUsedAt": [
                213
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                535
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                535
            ],
            "archivedAt": [
                213
            ],
            "authFailedAt": [
                213
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                432
            ],
            "connectionProviderId": [
                535
            ],
            "createdAt": [
                213
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                535
            ],
            "isOwnedByCurrentUser": [
                5
            ],
            "lastCredentialsRefreshedAt": [
                213
            ],
            "lastSignedInAt": [
                213
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                161
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                213
            ],
            "userWorkspaceId": [
                535
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
                535
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
                165
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
                55
            ],
            "coverage": [
                56
            ],
            "files": [
                58
            ],
            "manifest": [
                325
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
                535
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
                281
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
                281
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
                213
            ],
            "fileFolder": [
                281
            ],
            "fileId": [
                535
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
                11
            ],
            "creditUsage": [
                68
            ],
            "creditsUsed": [
                7
            ],
            "failedRunCount": [
                11
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
                11
            ],
            "lookbackInHours": [
                11
            ],
            "periodEnd": [
                213
            ],
            "periodStart": [
                213
            ],
            "rateLimitEventCount": [
                11
            ],
            "runCount": [
                11
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
                213
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
                213
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
                213
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
                213
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
                535
            ],
            "connectionProviders": [
                52
            ],
            "hasUserHealthCheck": [
                5
            ],
            "settingsMenuItems": [
                494
            ],
            "variables": [
                636
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                213
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                535
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
                535
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
                213
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
                210
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
                646
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                535
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
                213
            ],
            "description": [
                1
            ],
            "id": [
                535
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
                325
            ],
            "type": [
                1
            ],
            "updatedAt": [
                213
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
                535
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
                325
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
                213
            ],
            "domain": [
                1
            ],
            "id": [
                535
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
                474
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                213
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
                535
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
                473
            ],
            "workspaceUrls": [
                689
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
                535
            ],
            "aggregateOperation": [
                28
            ],
            "axisNameDisplay": [
                93
            ],
            "color": [
                1
            ],
            "configurationType": [
                665
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
                325
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "groupMode": [
                97
            ],
            "isCumulative": [
                5
            ],
            "layout": [
                98
            ],
            "numberFormat": [
                143
            ],
            "omitNullValues": [
                5
            ],
            "primaryAxisDateGranularity": [
                400
            ],
            "primaryAxisGroupByFieldMetadataId": [
                535
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                304
            ],
            "rangeMax": [
                7
            ],
            "rangeMin": [
                7
            ],
            "secondaryAxisGroupByDateGranularity": [
                400
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                535
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                304
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
                325
            ],
            "formattedToRawLookup": [
                325
            ],
            "groupMode": [
                97
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
                98
            ],
            "series": [
                99
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
                325
            ],
            "objectMetadataId": [
                535
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
                125
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
                535
            ],
            "userCreditsFallback": [
                637
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
                120
            ],
            "currentBillingSubscription": [
                120
            ],
            "hasPaymentMethod": [
                5
            ],
            "status": [
                508
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
                117
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
        "BillingMeteredProduct": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                117
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
                110
            ],
            "isCheckoutDefault": [
                5
            ],
            "isSellable": [
                5
            ],
            "meteredProducts": [
                107
            ],
            "planKey": [
                110
            ],
            "resourceCreditProducts": [
                106
            ],
            "upgradePlanKeys": [
                110
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
                127
            ],
            "recurringInterval": [
                507
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
                127
            ],
            "recurringInterval": [
                507
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                113
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
                117
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
                117
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
                110
            ],
            "priceUsageBased": [
                127
            ],
            "productKey": [
                116
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                213
            ],
            "periodStart": [
                213
            ],
            "productKey": [
                116
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
                122
            ],
            "cancelAt": [
                213
            ],
            "collectionMethod": [
                121
            ],
            "currentPeriodEnd": [
                213
            ],
            "hasUserCredits": [
                5
            ],
            "id": [
                535
            ],
            "interval": [
                507
            ],
            "metadata": [
                325
            ],
            "phases": [
                123
            ],
            "status": [
                508
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                115
            ],
            "creditAmount": [
                7
            ],
            "hasReachedCurrentPeriodCap": [
                5
            ],
            "id": [
                535
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
                124
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
                120
            ],
            "currentBillingSubscription": [
                120
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
                535
            ],
            "contactAutoCreationPolicy": [
                130
            ],
            "createdAt": [
                213
            ],
            "excludePrivateEvents": [
                5
            ],
            "handle": [
                1
            ],
            "id": [
                535
            ],
            "isContactAutoCreationEnabled": [
                5
            ],
            "isSyncEnabled": [
                5
            ],
            "syncStage": [
                131
            ],
            "syncStageStartedAt": [
                213
            ],
            "syncStatus": [
                132
            ],
            "syncedAt": [
                213
            ],
            "throttleFailureCount": [
                7
            ],
            "updatedAt": [
                213
            ],
            "visibility": [
                133
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
                665
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                665
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                665
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
                141
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
                665
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                325
            ],
            "error": [
                146
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
                665
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
                380
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                382
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
                150
            ],
            "aiModelTiers": [
                152
            ],
            "aiModels": [
                151
            ],
            "allowRequestsToTwentyIcons": [
                5
            ],
            "analyticsEnabled": [
                5
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
                5
            ],
            "captcha": [
                140
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
                154
            ],
            "publicFeatureFlags": [
                430
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                492
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                5
            ],
            "support": [
                509
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                213
            ],
            "link": [
                1
            ],
            "startAt": [
                213
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
                535
            ],
            "availabilityObjectMetadataId": [
                535
            ],
            "availabilityType": [
                157
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                535
            ],
            "createdAt": [
                213
            ],
            "engineComponentKey": [
                247
            ],
            "frontComponent": [
                288
            ],
            "frontComponentId": [
                535
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                535
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
                535
            ],
            "pageLayoutId": [
                535
            ],
            "payload": [
                158
            ],
            "position": [
                7
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                535
            ],
            "updatedAt": [
                213
            ],
            "workflowVersionId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                392
            ],
            "on_PathCommandMenuItemPayload": [
                416
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
                279
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                535
            ],
            "archivedAt": [
                213
            ],
            "authFailedAt": [
                213
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                432
            ],
            "connectionProviderId": [
                535
            ],
            "createdAt": [
                213
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                535
            ],
            "lastCredentialsRefreshedAt": [
                213
            ],
            "lastSignedInAt": [
                213
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                161
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                213
            ],
            "userWorkspaceId": [
                535
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
                310
            ],
            "handle": [
                1
            ],
            "id": [
                535
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                240
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
                535
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
                325
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
                325
            ],
            "roleId": [
                535
            ],
            "triggers": [
                325
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                535
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                535
            ],
            "participantHandleFieldUniversalIdentifier": [
                535
            ],
            "visibility": [
                362
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
                535
            ],
            "availabilityType": [
                157
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                535
            ],
            "engineComponentKey": [
                247
            ],
            "frontComponentId": [
                535
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
                535
            ],
            "pageLayoutId": [
                535
            ],
            "payload": [
                325
            ],
            "position": [
                7
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                535
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
                356
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
                325
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
                325
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                535
            ],
            "options": [
                325
            ],
            "relationCreationPayload": [
                325
            ],
            "settings": [
                325
            ],
            "type": [
                274
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
                535
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
                535
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
                182
            ],
            "indexType": [
                318
            ],
            "objectMetadataId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                325
            ],
            "databaseEventTriggerSettings": [
                325
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                325
            ],
            "id": [
                535
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                325
            ],
            "source": [
                325
            ],
            "timeoutSeconds": [
                7
            ],
            "toolTriggerSettings": [
                325
            ],
            "universalIdentifier": [
                535
            ],
            "workflowActionTriggerSettings": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                535
            ],
            "id": [
                535
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                535
            ],
            "color": [
                1
            ],
            "folderId": [
                535
            ],
            "icon": [
                1
            ],
            "id": [
                535
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                535
            ],
            "position": [
                7
            ],
            "targetObjectMetadataId": [
                535
            ],
            "targetRecordId": [
                535
            ],
            "type": [
                384
            ],
            "userWorkspaceId": [
                535
            ],
            "viewId": [
                535
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
                325
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
                180
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                183
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                188
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
                535
            ],
            "type": [
                409
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                408
            ],
            "pageLayoutId": [
                535
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
                325
            ],
            "objectMetadataId": [
                535
            ],
            "pageLayoutTabId": [
                535
            ],
            "position": [
                325
            ],
            "title": [
                1
            ],
            "type": [
                666
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                535
            ],
            "filter": [
                325
            ],
            "objectMetadataId": [
                535
            ],
            "orderBy": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                535
            ],
            "isInherent": [
                5
            ],
            "objectMetadataId": [
                535
            ],
            "secondFieldMetadataId": [
                535
            ],
            "thirdFieldMetadataId": [
                535
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
                535
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
                539
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
                624
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                631
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                633
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
                535
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                535
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
                535
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
                535
            ],
            "id": [
                535
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
                535
            ],
            "viewId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                535
            ],
            "logicalOperator": [
                654
            ],
            "parentViewFilterGroupId": [
                535
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "viewId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                535
            ],
            "id": [
                535
            ],
            "operand": [
                655
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                535
            ],
            "subFieldName": [
                1
            ],
            "value": [
                325
            ],
            "viewFilterGroupId": [
                535
            ],
            "viewId": [
                535
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
                535
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "viewId": [
                535
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
                535
            ],
            "calendarFieldMetadataId": [
                535
            ],
            "calendarLayout": [
                648
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                535
            ],
            "isCompact": [
                5
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                535
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                657
            ],
            "mainGroupByFieldMetadataId": [
                535
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                535
            ],
            "openRecordIn": [
                658
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                661
            ],
            "visibility": [
                662
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                660
            ],
            "fieldMetadataId": [
                535
            ],
            "id": [
                535
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                535
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
                535
            ],
            "operations": [
                1
            ],
            "roleId": [
                535
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
                624
            ],
            "resource": [
                631
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                163
            ],
            "before": [
                163
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                535
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                535
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
                535
            ],
            "name": [
                291
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                535
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
                535
            ],
            "isCustomDomainEnabled": [
                5
            ],
            "records": [
                233
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
                535
            ],
            "pageLayoutId": [
                535
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
                535
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
                535
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                475
            ],
            "type": [
                306
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                535
            ],
            "status": [
                475
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                164
            ],
            "IMAP": [
                164
            ],
            "SMTP": [
                164
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
                665
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                213
            ],
            "domain": [
                1
            ],
            "id": [
                535
            ],
            "status": [
                244
            ],
            "tenantStatus": [
                245
            ],
            "unsubscribeHostnameStatus": [
                537
            ],
            "updatedAt": [
                213
            ],
            "verificationRecords": [
                643
            ],
            "verifiedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                665
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
                325
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
                325
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
                249
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                325
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
                213
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
                213
            ],
            "currentPeriodEnd": [
                213
            ],
            "expiresAt": [
                213
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
                213
            ],
            "start": [
                213
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
                257
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
                255
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                256
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
                258
            ],
            "first": [
                11
            ],
            "table": [
                263
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                259
            ],
            "records": [
                262
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
                325
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                213
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
                371
            ],
            "objectRecordEventsWithQueryIds": [
                399
            ],
            "queueJobEvents": [
                328
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                535
            ],
            "payload": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                267
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
                535
            ],
            "createdAt": [
                213
            ],
            "defaultValue": [
                325
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
                535
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
                535
            ],
            "morphRelations": [
                451
            ],
            "name": [
                1
            ],
            "object": [
                386
            ],
            "objectMetadataId": [
                535
            ],
            "options": [
                325
            ],
            "relation": [
                451
            ],
            "settings": [
                325
            ],
            "type": [
                274
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                665
            ],
            "fieldDisplayMode": [
                271
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
                272
            ],
            "pageInfo": [
                405
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                163
            ],
            "node": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                273
            ],
            "id": [
                536
            ],
            "isActive": [
                128
            ],
            "isSystem": [
                128
            ],
            "isUIEditable": [
                128
            ],
            "isUIReadOnly": [
                128
            ],
            "objectMetadataId": [
                536
            ],
            "or": [
                273
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
                535
            ],
            "id": [
                535
            ],
            "objectMetadataId": [
                535
            ],
            "roleId": [
                535
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
                535
            ],
            "objectMetadataId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                665
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                665
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
                213
            ],
            "id": [
                535
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
                535
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
                213
            ],
            "fileId": [
                535
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
                213
            ],
            "id": [
                535
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
                665
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                535
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                475
            ],
            "type": [
                306
            ],
            "workspace": [
                686
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
                369
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                665
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
                535
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                79
            ],
            "applicationVariables": [
                325
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
                213
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                535
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
                535
            ],
            "updatedAt": [
                213
            ],
            "usesSdkClient": [
                5
            ],
            "widgetAvailability": [
                290
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                665
            ],
            "frontComponentId": [
                535
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                535
            ],
            "pageLayoutType": [
                409
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
                535
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
                535
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
                535
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
                296
            ],
            "isHidden": [
                5
            ],
            "selectedStepActionKey": [
                296
            ],
            "snoozedUntil": [
                1
            ],
            "steps": [
                297
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                296
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
                298
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
                301
            ],
            "stepActionKey": [
                296
            ],
            "trigger": [
                302
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
                667
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
                535
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
                665
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
                311
            ],
            "IMAP": [
                311
            ],
            "SMTP": [
                311
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
                240
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
                85
            ],
            "workspace": [
                690
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
                535
            ],
            "threadId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                535
            ],
            "createdAt": [
                213
            ],
            "id": [
                535
            ],
            "indexFieldMetadataList": [
                316
            ],
            "indexType": [
                318
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
                213
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                163
            ],
            "node": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                213
            ],
            "fieldMetadataId": [
                535
            ],
            "id": [
                535
            ],
            "order": [
                7
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                317
            ],
            "id": [
                536
            ],
            "isCustom": [
                128
            ],
            "or": [
                317
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                535
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
                321
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
                535
            ],
            "messageThreadId": [
                535
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
                327
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                535
            ],
            "aggregateOperation": [
                28
            ],
            "axisNameDisplay": [
                93
            ],
            "color": [
                1
            ],
            "configurationType": [
                665
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
                325
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
                143
            ],
            "omitNullValues": [
                5
            ],
            "primaryAxisDateGranularity": [
                400
            ],
            "primaryAxisGroupByFieldMetadataId": [
                535
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                304
            ],
            "rangeMax": [
                7
            ],
            "rangeMin": [
                7
            ],
            "secondaryAxisGroupByDateGranularity": [
                400
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                535
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                304
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
                325
            ],
            "hasTooManyGroups": [
                5
            ],
            "series": [
                333
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
                325
            ],
            "objectMetadataId": [
                535
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
                332
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
                161
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                535
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
                535
            ],
            "canRunOnDemand": [
                5
            ],
            "createdAt": [
                213
            ],
            "cronTriggerSettings": [
                325
            ],
            "databaseEventTriggerSettings": [
                325
            ],
            "description": [
                1
            ],
            "executionMode": [
                339
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                325
            ],
            "id": [
                535
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
                325
            ],
            "universalIdentifier": [
                535
            ],
            "updatedAt": [
                213
            ],
            "workflowActionTriggerSettings": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                325
            ],
            "duration": [
                7
            ],
            "error": [
                325
            ],
            "logs": [
                1
            ],
            "status": [
                341
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                535
            ],
            "applicationUniversalIdentifier": [
                535
            ],
            "id": [
                535
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                535
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
                325
            ],
            "name": [
                1
            ],
            "objects": [
                348
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                349
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
                350
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                351
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
                535
            ],
            "connectionProviderId": [
                535
            ],
            "createdAt": [
                213
            ],
            "id": [
                535
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
                213
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
                665
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                665
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
                160
            ],
            "connectedAccountId": [
                535
            ],
            "contactAutoCreationPolicy": [
                357
            ],
            "createdAt": [
                213
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
                535
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
                364
            ],
            "messagingProviderUniversalIdentifier": [
                535
            ],
            "participantHandleFieldUniversalIdentifier": [
                535
            ],
            "pendingGroupEmailsAction": [
                358
            ],
            "syncStage": [
                359
            ],
            "syncStageStartedAt": [
                213
            ],
            "syncStatus": [
                360
            ],
            "syncedAt": [
                213
            ],
            "throttleFailureCount": [
                7
            ],
            "throttleRetryAfter": [
                213
            ],
            "type": [
                361
            ],
            "updatedAt": [
                213
            ],
            "visibility": [
                362
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
                213
            ],
            "externalId": [
                1
            ],
            "id": [
                535
            ],
            "isSentFolder": [
                5
            ],
            "isSynced": [
                5
            ],
            "messageChannelId": [
                535
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                365
            ],
            "updatedAt": [
                213
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
                213
            ],
            "emailAddress": [
                1
            ],
            "id": [
                535
            ],
            "reason": [
                369
            ],
            "source": [
                370
            ],
            "unsubscribeTopicId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                367
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
                398
            ],
            "recordId": [
                1
            ],
            "type": [
                372
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
                535
            ],
            "property": [
                1
            ],
            "provenance": [
                375
            ],
            "recordId": [
                535
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
                535
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                155
            ],
            "objectMetadataItems": [
                378
            ],
            "views": [
                379
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
                535
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
                535
            ],
            "key": [
                657
            ],
            "objectMetadataId": [
                535
            ],
            "type": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                501,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                671,
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
                        535,
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
                        535
                    ],
                    "threadId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                5,
                {
                    "agentId": [
                        535,
                        "UUID!"
                    ],
                    "roleId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                5,
                {
                    "apiKeyId": [
                        535,
                        "UUID!"
                    ],
                    "roleId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                5,
                {
                    "input": [
                        313,
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
                139,
                {
                    "input": [
                        138,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                126
            ],
            "cancelSwitchBillingPlan": [
                126
            ],
            "cancelSwitchResourceCreditPrice": [
                126
            ],
            "checkCustomDomainValidRecords": [
                234
            ],
            "checkPublicDomainValidRecords": [
                234,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                119,
                {
                    "plan": [
                        110,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        507,
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
                        535,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                159,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        535,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                403,
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
                283,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                283,
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
                283,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                283,
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
                        166,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                39,
                {
                    "input": [
                        168,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                356,
                {
                    "input": [
                        169,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                170,
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
                171,
                {
                    "input": [
                        172,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                82,
                {
                    "input": [
                        173,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                108
            ],
            "createCalendarEvent": [
                175,
                {
                    "input": [
                        174,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                18,
                {
                    "channelId": [
                        535
                    ]
                }
            ],
            "createCommandMenuItem": [
                156,
                {
                    "input": [
                        176,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                232,
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
                178,
                {
                    "input": [
                        177,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                243,
                {
                    "input": [
                        179,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                282,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        281,
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
                288,
                {
                    "input": [
                        181,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                383,
                {
                    "inputs": [
                        187,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                651,
                {
                    "inputs": [
                        202,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                650,
                {
                    "inputs": [
                        203,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                656,
                {
                    "inputs": [
                        206,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                352,
                {
                    "input": [
                        185,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                367,
                {
                    "input": [
                        186,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                383,
                {
                    "input": [
                        187,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                282,
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
                498,
                {
                    "input": [
                        496,
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
                        535,
                        "UUID!"
                    ],
                    "properties": [
                        325
                    ],
                    "recordId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                4,
                {
                    "input": [
                        167,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                268,
                {
                    "input": [
                        189,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                314,
                {
                    "input": [
                        190,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                338,
                {
                    "input": [
                        184,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                386,
                {
                    "input": [
                        191,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                458,
                {
                    "createRoleInput": [
                        197,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                406,
                {
                    "input": [
                        192,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                407,
                {
                    "input": [
                        193,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                410,
                {
                    "input": [
                        194,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                429,
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
                450,
                {
                    "input": [
                        196,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                498,
                {
                    "input": [
                        497,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                501,
                {
                    "input": [
                        198,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                108,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        110,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        507,
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
                538,
                {
                    "input": [
                        199,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                622,
                {
                    "input": [
                        200,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                642,
                {
                    "input": [
                        201,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                647,
                {
                    "input": [
                        207,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                650,
                {
                    "input": [
                        203,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                651,
                {
                    "input": [
                        202,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                652,
                {
                    "input": [
                        205,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                653,
                {
                    "input": [
                        204,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                656,
                {
                    "input": [
                        206,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                659,
                {
                    "input": [
                        208,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                663,
                {
                    "input": [
                        209,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                501,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                5,
                {
                    "channelId": [
                        535,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        535
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
                        44
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                356,
                {
                    "id": [
                        535,
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
                        214,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                156,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                160,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                671
            ],
            "deleteEmailGroupChannel": [
                356,
                {
                    "id": [
                        535,
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
                288,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                383,
                {
                    "ids": [
                        535,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                352,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                5,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                383,
                {
                    "id": [
                        535,
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
                268,
                {
                    "input": [
                        215,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                314,
                {
                    "input": [
                        216,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                338,
                {
                    "input": [
                        342,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                386,
                {
                    "input": [
                        217,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        535,
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
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                450,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                218,
                {
                    "input": [
                        219,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                501,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                220,
                {
                    "twoFactorAuthenticationMethodId": [
                        535,
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
                        535,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                635
            ],
            "deleteUserFromWorkspace": [
                639,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                642,
                {
                    "id": [
                        535,
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
                650,
                {
                    "input": [
                        222,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                651,
                {
                    "input": [
                        221,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                652,
                {
                    "input": [
                        223,
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
                656,
                {
                    "input": [
                        224,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                5,
                {
                    "input": [
                        225,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                663,
                {
                    "id": [
                        535,
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
                650,
                {
                    "input": [
                        228,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                651,
                {
                    "input": [
                        227,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                652,
                {
                    "input": [
                        229,
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
                656,
                {
                    "input": [
                        230,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                5,
                {
                    "input": [
                        231,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                5,
                {
                    "input": [
                        313,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                160,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                235,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                236,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                237,
                {
                    "input": [
                        238,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                241,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        535
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                103
            ],
            "enqueueJob": [
                250,
                {
                    "input": [
                        248,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                252,
                {
                    "input": [
                        251,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                675
            ],
            "executeOneLogicFunction": [
                340,
                {
                    "input": [
                        265,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                41,
                {
                    "apiKeyId": [
                        535,
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
                        535,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                85
            ],
            "generateTransientToken": [
                518
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                532,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        535,
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
                533,
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
                293,
                {
                    "input": [
                        294,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                345,
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
                402
            ],
            "grantApplicationCapabilities": [
                50,
                {
                    "input": [
                        303,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                312,
                {
                    "userId": [
                        535,
                        "UUID!"
                    ],
                    "workspaceId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                320,
                {
                    "input": [
                        319,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                322,
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
                322
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
                        535,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                5,
                {
                    "channelId": [
                        535
                    ],
                    "threadId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                299,
                {
                    "stepActionKey": [
                        296,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                5
            ],
            "releaseEnterpriseServerBinding": [
                253
            ],
            "removeAgentChatMessageReaction": [
                24,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                5,
                {
                    "input": [
                        453,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                445,
                {
                    "principal": [
                        442,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        449,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                5,
                {
                    "agentId": [
                        535,
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
                5,
                {
                    "threadId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                5,
                {
                    "input": [
                        454,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                455,
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
                488,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                156,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                407,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                406,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                410,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                513,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                480,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                11
            ],
            "revokeApiKey": [
                39,
                {
                    "input": [
                        456,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                5,
                {
                    "applicationAuthorizationId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                5,
                {
                    "userId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                5,
                {
                    "userSessionId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                460,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                471,
                {
                    "input": [
                        467,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                64,
                {
                    "applicationId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                64,
                {
                    "applicationId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                309,
                {
                    "connectionParameters": [
                        239,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        535
                    ]
                }
            ],
            "sendAppChannelMessage": [
                479,
                {
                    "input": [
                        478,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                480,
                {
                    "browsingContext": [
                        325
                    ],
                    "channelId": [
                        535
                    ],
                    "fileAttachments": [
                        280,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        535,
                        "[UUID!]"
                    ],
                    "messageId": [
                        535,
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
                        535,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                483,
                {
                    "input": [
                        482,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                487,
                {
                    "input": [
                        486,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                488,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        535
                    ]
                }
            ],
            "sendMessageCampaign": [
                490,
                {
                    "input": [
                        489,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                485,
                {
                    "input": [
                        491,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                43,
                {
                    "input": [
                        493,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                253,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                445,
                {
                    "isPrivate": [
                        5,
                        "Boolean!"
                    ],
                    "target": [
                        449,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                445,
                {
                    "accessLevel": [
                        441,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        442,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        449,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                126,
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
                5,
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
                499,
                {
                    "input": [
                        500
                    ]
                }
            ],
            "signUpInWorkspace": [
                499,
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
                        535
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
                403,
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
                        213,
                        "DateTime!"
                    ],
                    "threadId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                142,
                {
                    "connectedAccountId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                503,
                {
                    "companyContext": [
                        325
                    ],
                    "personContext": [
                        325
                    ]
                }
            ],
            "stopAgentChatStream": [
                5,
                {
                    "threadId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                504
            ],
            "switchBillingPlan": [
                126,
                {
                    "plan": [
                        110
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                126
            ],
            "syncAppMessageFolders": [
                363,
                {
                    "input": [
                        511,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                685,
                {
                    "dryRun": [
                        5
                    ],
                    "inferDeletionFromMissingEntities": [
                        5
                    ],
                    "manifest": [
                        325,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                5
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
                        325
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
                520,
                {
                    "input": [
                        519,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                524,
                {
                    "input": [
                        521,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                523,
                {
                    "input": [
                        522,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                528,
                {
                    "input": [
                        525,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                527,
                {
                    "input": [
                        526,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                530,
                {
                    "input": [
                        529,
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
                        535,
                        "UUID!"
                    ],
                    "input": [
                        540,
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
                        213
                    ],
                    "threadIds": [
                        535,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                39,
                {
                    "input": [
                        542,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                356,
                {
                    "input": [
                        543,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                48,
                {
                    "id": [
                        535,
                        "UUID!"
                    ],
                    "input": [
                        544,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                74,
                {
                    "input": [
                        545,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                78,
                {
                    "input": [
                        547,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                129,
                {
                    "input": [
                        549,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                156,
                {
                    "input": [
                        551,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                356,
                {
                    "input": [
                        552,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                288,
                {
                    "input": [
                        554,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                295,
                {
                    "input": [
                        556,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                266,
                {
                    "input": [
                        557,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                383,
                {
                    "inputs": [
                        570,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                386,
                {
                    "inputs": [
                        571,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                656,
                {
                    "inputs": [
                        593,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                352,
                {
                    "input": [
                        560,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                356,
                {
                    "input": [
                        562,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                363,
                {
                    "input": [
                        564,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                363,
                {
                    "input": [
                        566,
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
                383,
                {
                    "input": [
                        570,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                4,
                {
                    "input": [
                        541,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                5,
                {
                    "applicationId": [
                        535
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
                268,
                {
                    "input": [
                        569,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                5,
                {
                    "input": [
                        558,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                386,
                {
                    "input": [
                        571,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                458,
                {
                    "updateRoleInput": [
                        578,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                406,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        572,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                407,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        573,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                410,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        575,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                406,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        577,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                323,
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
                501,
                {
                    "input": [
                        580,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                513,
                {
                    "input": [
                        581,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                538,
                {
                    "input": [
                        582,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                622,
                {
                    "input": [
                        583,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                102,
                {
                    "userCreditsFallback": [
                        637,
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
                642,
                {
                    "input": [
                        584,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                647,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        595,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                650,
                {
                    "input": [
                        588,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                651,
                {
                    "input": [
                        586,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                652,
                {
                    "input": [
                        591,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                653,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        590,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                656,
                {
                    "input": [
                        593,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                659,
                {
                    "input": [
                        596,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                663,
                {
                    "input": [
                        598,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                671,
                {
                    "data": [
                        602,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                671,
                {
                    "data": [
                        600,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                671,
                {
                    "data": [
                        601,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                680,
                {
                    "roleId": [
                        535,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                5,
                {
                    "input": [
                        603,
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
                74,
                {
                    "file": [
                        604,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                279,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        604,
                        "Upload!"
                    ],
                    "fileFolder": [
                        281,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                283,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        604,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                283,
                {
                    "file": [
                        604,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                283,
                {
                    "file": [
                        604,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                283,
                {
                    "file": [
                        604,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                275,
                {
                    "upsertFieldPermissionsInput": [
                        605,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                647,
                {
                    "input": [
                        608,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                394,
                {
                    "upsertObjectPermissionsInput": [
                        609,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                459,
                {
                    "upsertPermissionFlagsInput": [
                        610,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                612,
                {
                    "input": [
                        611,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                647,
                {
                    "input": [
                        613,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                82,
                {
                    "input": [
                        640,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                644,
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
                243,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                645,
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
                535
            ],
            "applicationId": [
                535
            ],
            "color": [
                1
            ],
            "createdAt": [
                213
            ],
            "folderId": [
                535
            ],
            "icon": [
                1
            ],
            "id": [
                535
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                535
            ],
            "position": [
                7
            ],
            "targetObjectMetadataId": [
                535
            ],
            "targetRecordId": [
                535
            ],
            "targetRecordIdentifier": [
                438
            ],
            "type": [
                384
            ],
            "updatedAt": [
                213
            ],
            "userWorkspaceId": [
                535
            ],
            "viewId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                665
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                535
            ],
            "color": [
                1
            ],
            "createdAt": [
                213
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
                389,
                {
                    "filter": [
                        273,
                        "FieldFilter!"
                    ],
                    "paging": [
                        211,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                268
            ],
            "icon": [
                1
            ],
            "id": [
                535
            ],
            "imageIdentifierFieldMetadataId": [
                535
            ],
            "indexMetadataList": [
                314
            ],
            "indexMetadatas": [
                391,
                {
                    "filter": [
                        317,
                        "IndexFilter!"
                    ],
                    "paging": [
                        211,
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
                535
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
                393
            ],
            "searchFieldMetadataList": [
                477
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                388
            ],
            "pageInfo": [
                405
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                163
            ],
            "node": [
                386
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                272
            ],
            "pageInfo": [
                405
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                390
            ],
            "id": [
                536
            ],
            "isActive": [
                128
            ],
            "isRemote": [
                128
            ],
            "isSearchable": [
                128
            ],
            "isSystem": [
                128
            ],
            "isUICreatable": [
                128
            ],
            "isUIEditable": [
                128
            ],
            "isUIReadOnly": [
                128
            ],
            "or": [
                390
            ],
            "universalIdentifier": [
                536
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                315
            ],
            "pageInfo": [
                405
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                535
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
                535
            ],
            "restrictedFields": [
                325
            ],
            "rowLevelPermissionPredicateGroups": [
                462
            ],
            "rowLevelPermissionPredicates": [
                461
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
                535
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
                212
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                398
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
                325
            ],
            "before": [
                325
            ],
            "diff": [
                325
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
                397
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
                401
            ],
            "previousOnboardingStatus": [
                401
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
                163
            ],
            "hasNextPage": [
                5
            ],
            "hasPreviousPage": [
                5
            ],
            "startCursor": [
                163
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                535
            ],
            "createdAt": [
                213
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                535
            ],
            "deletedAt": [
                213
            ],
            "id": [
                535
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
                535
            ],
            "tabs": [
                407
            ],
            "type": [
                409
            ],
            "universalIdentifier": [
                535
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                535
            ],
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "icon": [
                1
            ],
            "id": [
                535
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
                408
            ],
            "pageLayoutId": [
                535
            ],
            "position": [
                7
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                535
            ],
            "updatedAt": [
                213
            ],
            "widgets": [
                410
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                535
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                325
            ],
            "configuration": [
                664
            ],
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "gridPosition": [
                305
            ],
            "id": [
                535
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
                535
            ],
            "pageLayoutTabId": [
                535
            ],
            "position": [
                413
            ],
            "title": [
                1
            ],
            "type": [
                666
            ],
            "universalIdentifier": [
                535
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                408
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
                408
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
                411
            ],
            "on_PageLayoutWidgetGridPosition": [
                412
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                415
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                414
            ],
            "index": [
                11
            ],
            "layoutMode": [
                408
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
                535
            ],
            "createdAt": [
                213
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                535
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
                535
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                535
            ],
            "aggregateOperation": [
                28
            ],
            "color": [
                1
            ],
            "configurationType": [
                665
            ],
            "dateGranularity": [
                400
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
                325
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "groupByFieldMetadataId": [
                535
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
                143
            ],
            "orderBy": [
                304
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
                422
            ],
            "formattedToRawLookup": [
                325
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
                325
            ],
            "objectMetadataId": [
                535
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
                337
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
                213
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                137
            ],
            "blockers": [
                355
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                535
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
                240
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
                535
            ],
            "createdAt": [
                213
            ],
            "domain": [
                1
            ],
            "id": [
                535
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
                267
            ],
            "metadata": [
                431
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
                428
            ],
            "IMAP": [
                428
            ],
            "SMTP": [
                428
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
                535
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                689
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
                535
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
                        535,
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
                        535,
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
                39,
                {
                    "input": [
                        292,
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
                        19,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                42,
                {
                    "filter": [
                        334
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
                356,
                {
                    "filter": [
                        335
                    ]
                }
            ],
            "appMessageFolders": [
                363,
                {
                    "filter": [
                        336
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                51,
                {
                    "applicationId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                52,
                {
                    "applicationId": [
                        535,
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
                476,
                {
                    "applicationId": [
                        535,
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
            "billingPlans": [
                109
            ],
            "billingPortalSession": [
                119,
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
                535,
                {
                    "calendarEventId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                22,
                {
                    "threadId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                145,
                {
                    "threadId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                18,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                148,
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
                679,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                505,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                156,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                156
            ],
            "currentUser": [
                635
            ],
            "currentUserApplicationAuthorizations": [
                49
            ],
            "currentUserSessions": [
                638
            ],
            "currentWorkspace": [
                671
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
                254
            ],
            "eventLogs": [
                261,
                {
                    "input": [
                        260,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                54,
                {
                    "shouldIncludeDependencies": [
                        5
                    ],
                    "universalIdentifier": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                268,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                270,
                {
                    "filter": [
                        273,
                        "FieldFilter!"
                    ],
                    "paging": [
                        211,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                427,
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
                        213
                    ],
                    "periodStart": [
                        213
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
                        213
                    ],
                    "periodStart": [
                        213
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
                149,
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
                328,
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
                74
            ],
            "findManyApplications": [
                48
            ],
            "findManyLogicFunctions": [
                338
            ],
            "findManyMarketplaceApps": [
                346,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                429
            ],
            "findMarketplaceAppDetail": [
                347,
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
                48,
                {
                    "id": [
                        535
                    ],
                    "universalIdentifier": [
                        535
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
                338,
                {
                    "input": [
                        342,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                328,
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
                328,
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
                673
            ],
            "findWorkspaceFromInviteHash": [
                671,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                678
            ],
            "frontComponent": [
                288,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                288
            ],
            "getAddressDetails": [
                423,
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
                458
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
                        5
                    ],
                    "token": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAvailablePackages": [
                325,
                {
                    "input": [
                        342,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                162,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                243
            ],
            "getInviteSuggestions": [
                324
            ],
            "getJobs": [
                328,
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
                        342,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                406,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                407,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                407,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                410,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                410,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                406,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        409
                    ]
                }
            ],
            "getPermissionFlags": [
                417
            ],
            "getPublicWorkspaceDataByDomain": [
                433,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                434,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                118
            ],
            "getRole": [
                458,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                458
            ],
            "getSSOIdentityProviders": [
                285
            ],
            "getToolIndex": [
                517
            ],
            "getToolInputSchema": [
                325,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                619,
                {
                    "input": [
                        620
                    ]
                }
            ],
            "getView": [
                647,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                650,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                651,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                651,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                650,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                652,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                653,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                653,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                652,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                656,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                656,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                659,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                659,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                647,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        661,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                676
            ],
            "gettingStartedProgress": [
                295
            ],
            "gettingStartedWorkflowPreviews": [
                300
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
                330,
                {
                    "input": [
                        331,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                109
            ],
            "mcpServer": [
                352,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                352
            ],
            "messageSuppressions": [
                368,
                {
                    "input": [
                        286,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                373,
                {
                    "input": [
                        376,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                377
            ],
            "mostlyEmptyFieldMetadataIds": [
                535,
                {
                    "objectMetadataId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                73
            ],
            "myCalendarChannels": [
                129,
                {
                    "connectedAccountId": [
                        535
                    ]
                }
            ],
            "myConnectedAccounts": [
                160
            ],
            "myMessageChannels": [
                356,
                {
                    "connectedAccountId": [
                        535
                    ]
                }
            ],
            "myMessageFolders": [
                363,
                {
                    "messageChannelId": [
                        535
                    ]
                }
            ],
            "myUserApplicationVariables": [
                681
            ],
            "navigationMenuItem": [
                383,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                383
            ],
            "object": [
                386,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                396
            ],
            "objects": [
                387,
                {
                    "filter": [
                        390,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        211,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                420,
                {
                    "input": [
                        421,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                137,
                {
                    "input": [
                        424,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                426,
                {
                    "input": [
                        425,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                347,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                346
            ],
            "recordPermissions": [
                440,
                {
                    "targets": [
                        449,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                445,
                {
                    "target": [
                        449,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                450
            ],
            "skill": [
                501,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                501
            ],
            "timelineActivityTypes": [
                513
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                534,
                {
                    "userId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                538
            ],
            "usageLimits": [
                622
            ],
            "usageQuotaDefinitions": [
                626
            ],
            "usageQuotaScopeConsumption": [
                628,
                {
                    "input": [
                        629,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                630
            ],
            "validatePasswordResetToken": [
                641,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                642,
                {
                    "objectMetadataId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                642,
                {
                    "fieldMetadataId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                663,
                {
                    "id": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                535
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
                535
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
                535
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
                535
            ],
            "permissions": [
                439
            ],
            "recordId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                535
            ],
            "workspaceMemberId": [
                535
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
                439
            ],
            "roles": [
                447
            ],
            "shares": [
                446
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                441
            ],
            "id": [
                19
            ],
            "principalId": [
                535
            ],
            "principalRoleId": [
                535
            ],
            "principalType": [
                443
            ],
            "rowCause": [
                444
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
                535
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
                665
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
                535
            ],
            "recordId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                535
            ],
            "id": [
                535
            ],
            "isInherent": [
                5
            ],
            "objectMetadataId": [
                535
            ],
            "secondFieldMetadataId": [
                535
            ],
            "thirdFieldMetadataId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                268
            ],
            "sourceObjectMetadata": [
                386
            ],
            "targetFieldMetadata": [
                268
            ],
            "targetObjectMetadata": [
                386
            ],
            "type": [
                452
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
                535
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
                40
            ],
            "applicationId": [
                535
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
                275
            ],
            "icon": [
                1
            ],
            "id": [
                535
            ],
            "isEditable": [
                5
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                394
            ],
            "permissionFlags": [
                459
            ],
            "rowLevelPermissionPredicateGroups": [
                462
            ],
            "rowLevelPermissionPredicates": [
                461
            ],
            "universalIdentifier": [
                535
            ],
            "workspaceMembers": [
                680
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
                535
            ],
            "roleId": [
                535
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
                466
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
                325
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
                464
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
                535
            ],
            "logicalOperator": [
                464
            ],
            "objectMetadataId": [
                535
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                535
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
                535
            ],
            "id": [
                535
            ],
            "operand": [
                466
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                7
            ],
            "relationFieldMetadataId": [
                535
            ],
            "rowLevelPermissionPredicateGroupId": [
                535
            ],
            "subFieldName": [
                1
            ],
            "value": [
                325
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
                469
            ],
            "messages": [
                469
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                325
            ],
            "runAsWorkspaceMemberId": [
                535
            ],
            "thread": [
                472
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
                535
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
                468
            ],
            "content": [
                1
            ],
            "role": [
                470
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
                325
            ],
            "status": [
                1
            ],
            "success": [
                5
            ],
            "threadId": [
                535
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
                535
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                475
            ],
            "type": [
                306
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                535
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                475
            ],
            "type": [
                306
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
                213
            ],
            "fieldMetadataId": [
                535
            ],
            "id": [
                535
            ],
            "position": [
                7
            ],
            "tsVectorFieldMetadataId": [
                535
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                535
            ],
            "messageChannelId": [
                535
            ],
            "messageThreadId": [
                535
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
                535
            ],
            "messageThreadId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                535
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
                481
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
                484
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
                535
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
                325
            ],
            "workspaceMemberIds": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                535
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
                678
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
                213
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                137
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
                44
            ],
            "value": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                535
            ],
            "createdAt": [
                213
            ],
            "frontComponentId": [
                535
            ],
            "icon": [
                1
            ],
            "id": [
                535
            ],
            "position": [
                7
            ],
            "scope": [
                495
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                535
            ],
            "updatedAt": [
                213
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
                535
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
                535
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                475
            ],
            "type": [
                306
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
                690
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
                535
            ],
            "content": [
                1
            ],
            "createdAt": [
                213
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                535
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
                213
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                457
            ],
            "configurationType": [
                665
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                688
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
                262,
                {
                    "fieldFilters": [
                        256,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        263,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                437,
                {
                    "input": [
                        195,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                343,
                {
                    "input": [
                        344,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                15,
                {
                    "threadId": [
                        535,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                264,
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
                510
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                665
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
                535
            ],
            "createdAt": [
                213
            ],
            "emit": [
                514
            ],
            "frontComponentUniversalIdentifier": [
                535
            ],
            "icon": [
                1
            ],
            "id": [
                535
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
                535
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                535
            ],
            "universalIdentifier": [
                535
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                535
            ],
            "on": [
                1
            ],
            "through": [
                515
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                535
            ],
            "relationFieldUniversalIdentifier": [
                535
            ],
            "triggerFieldUniversalIdentifiers": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                665
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
                325
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
                535
            ],
            "personFilter": [
                325
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                213
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
                5
            ],
            "isAwaitingRecoveryEnrollment": [
                5
            ],
            "pendingRecoveryCodeExpiresAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                535
            ],
            "gt": [
                535
            ],
            "gte": [
                535
            ],
            "iLike": [
                535
            ],
            "in": [
                535
            ],
            "is": [
                5
            ],
            "isNot": [
                5
            ],
            "like": [
                535
            ],
            "lt": [
                535
            ],
            "lte": [
                535
            ],
            "neq": [
                535
            ],
            "notILike": [
                535
            ],
            "notIn": [
                535
            ],
            "notLike": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                213
            ],
            "description": [
                1
            ],
            "id": [
                535
            ],
            "name": [
                1
            ],
            "updatedAt": [
                213
            ],
            "visibility": [
                539
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
                535
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
                535
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                325
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
                325
            ],
            "roleId": [
                535
            ],
            "triggers": [
                325
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
                535
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
                535
            ],
            "isSyncEnabled": [
                5
            ],
            "messagingProviderUniversalIdentifier": [
                535
            ],
            "visibility": [
                362
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
                546
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
                548
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
                535
            ],
            "update": [
                550
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                130
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
                133
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                535
            ],
            "availabilityType": [
                157
            ],
            "engineComponentKey": [
                247
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                535
            ],
            "isPinned": [
                5
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                535
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                325
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
                325
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                535
            ],
            "options": [
                325
            ],
            "settings": [
                325
            ],
            "translations": [
                374
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
                535
            ],
            "update": [
                555
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
                296
            ],
            "isHidden": [
                5
            ],
            "selectedStepActionKey": [
                296
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
                535
            ],
            "update": [
                559
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                325
            ],
            "databaseEventTriggerSettings": [
                325
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                325
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
                325
            ],
            "workflowActionTriggerSettings": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                535
            ],
            "update": [
                561
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                535
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
                535
            ],
            "update": [
                563
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                357
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
                364
            ],
            "visibility": [
                362
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                535
            ],
            "update": [
                565
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
                535
            ],
            "update": [
                565
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
                535
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
                535
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
                535
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
                535
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
                393
            ],
            "shortcut": [
                1
            ],
            "translations": [
                374
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                535
            ],
            "update": [
                553
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                535
            ],
            "update": [
                567
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                535
            ],
            "update": [
                568
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
                535
            ],
            "type": [
                409
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
                408
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
                535
            ],
            "layoutMode": [
                408
            ],
            "position": [
                7
            ],
            "title": [
                1
            ],
            "widgets": [
                576
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
                325
            ],
            "configuration": [
                325
            ],
            "isActive": [
                5
            ],
            "objectMetadataId": [
                535
            ],
            "pageLayoutTabId": [
                535
            ],
            "position": [
                325
            ],
            "title": [
                1
            ],
            "type": [
                666
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
                325
            ],
            "configuration": [
                325
            ],
            "id": [
                535
            ],
            "objectMetadataId": [
                535
            ],
            "pageLayoutTabId": [
                535
            ],
            "position": [
                325
            ],
            "title": [
                1
            ],
            "type": [
                666
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
                535
            ],
            "tabs": [
                574
            ],
            "type": [
                409
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                535
            ],
            "update": [
                579
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
                535
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
                535
            ],
            "isActive": [
                5
            ],
            "label": [
                1
            ],
            "translations": [
                374
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
                539
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                535
            ],
            "payload": [
                200
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                535
            ],
            "update": [
                585
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
                535
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
                535
            ],
            "update": [
                587
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
                535
            ],
            "update": [
                589
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                535
            ],
            "logicalOperator": [
                654
            ],
            "parentViewFilterGroupId": [
                535
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "viewId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                535
            ],
            "update": [
                592
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                535
            ],
            "operand": [
                655
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                535
            ],
            "subFieldName": [
                1
            ],
            "value": [
                325
            ],
            "viewFilterGroupId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                535
            ],
            "update": [
                594
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                535
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
                535
            ],
            "calendarFieldMetadataId": [
                535
            ],
            "calendarLayout": [
                648
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                535
            ],
            "isCompact": [
                5
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                535
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                535
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                658
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "translations": [
                374
            ],
            "type": [
                661
            ],
            "visibility": [
                662
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                535
            ],
            "update": [
                597
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                660
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
                535
            ],
            "update": [
                599
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
                535
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
                325
            ],
            "allowImpersonation": [
                5
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                535
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
                677
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                325
            ],
            "workspaceMemberId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                276
            ],
            "roleId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                535
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "viewFieldId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                606
            ],
            "id": [
                535
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
                606
            ],
            "groups": [
                607
            ],
            "widgetId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                395
            ],
            "roleId": [
                535
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                535
            ],
            "predicateGroups": [
                463
            ],
            "predicates": [
                465
            ],
            "roleId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                462
            ],
            "predicates": [
                461
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                617
            ],
            "viewFields": [
                614
            ],
            "viewFilterGroups": [
                615
            ],
            "viewFilters": [
                616
            ],
            "viewSorts": [
                618
            ],
            "widgetId": [
                535
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
                535
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
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                535
            ],
            "logicalOperator": [
                654
            ],
            "parentViewFilterGroupId": [
                535
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
                535
            ],
            "id": [
                535
            ],
            "operand": [
                655
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                535
            ],
            "subFieldName": [
                1
            ],
            "value": [
                325
            ],
            "viewFilterGroupId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                535
            ],
            "calendarFieldMetadataId": [
                535
            ],
            "calendarLayout": [
                648
            ],
            "kanbanAggregateOperation": [
                28
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                535
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                535
            ],
            "openRecordIn": [
                658
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                660
            ],
            "fieldMetadataId": [
                535
            ],
            "id": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                213
            ],
            "periodStart": [
                213
            ],
            "timeSeries": [
                632
            ],
            "usageByApplication": [
                621
            ],
            "usageByModel": [
                621
            ],
            "usageByOperationType": [
                621
            ],
            "usageByUser": [
                621
            ],
            "userDailyUsage": [
                634
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                624
            ],
            "periodEnd": [
                213
            ],
            "periodStart": [
                213
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
                100
            ],
            "createdAt": [
                213
            ],
            "id": [
                535
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                100
            ],
            "operationType": [
                624
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                631
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                633
            ],
            "updatedAt": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                633
            ],
            "operationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                623
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                627
            ],
            "resourceType": [
                631
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                625
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
                624
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                633
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
                213
            ],
            "periodStart": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                624
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                631
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                633
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
                535
            ],
            "isEnforced": [
                5
            ],
            "limitValue": [
                100
            ],
            "operationType": [
                624
            ],
            "periodEnd": [
                213
            ],
            "periodStart": [
                213
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                100
            ],
            "resourceType": [
                631
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
                633
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
                632
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
                5
            ],
            "canImpersonate": [
                5
            ],
            "createdAt": [
                213
            ],
            "currentUserWorkspace": [
                639
            ],
            "currentWorkspace": [
                671
            ],
            "deletedAt": [
                213
            ],
            "deletedWorkspaceMembers": [
                226
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
                535
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
                401
            ],
            "previousOnboardingStatus": [
                401
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                213
            ],
            "userVars": [
                326
            ],
            "userWorkspaces": [
                639
            ],
            "workspaceMember": [
                680
            ],
            "workspaceMembers": [
                680
            ],
            "workspaces": [
                639
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
                325
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
                213
            ],
            "expiresAt": [
                213
            ],
            "id": [
                535
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
                213
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "id": [
                535
            ],
            "isImpersonating": [
                5
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                394
            ],
            "objectsPermissions": [
                394
            ],
            "permissionFlags": [
                418
            ],
            "twoFactorAuthenticationMethodSummary": [
                531
            ],
            "updatedAt": [
                213
            ],
            "user": [
                635
            ],
            "userId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                535
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
                535
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
                535
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                535
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
                535
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
                85
            ],
            "workspaceUrls": [
                689
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
                535
            ],
            "calendarEndFieldMetadataId": [
                535
            ],
            "calendarFieldMetadataId": [
                535
            ],
            "calendarLayout": [
                648
            ],
            "createdAt": [
                213
            ],
            "createdByUserWorkspaceId": [
                535
            ],
            "deletedAt": [
                213
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                535
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
                535
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                657
            ],
            "mainGroupByFieldMetadataId": [
                535
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                535
            ],
            "openRecordIn": [
                658
            ],
            "position": [
                7
            ],
            "shouldHideEmptyGroups": [
                5
            ],
            "type": [
                661
            ],
            "universalIdentifier": [
                535
            ],
            "updatedAt": [
                213
            ],
            "viewFieldGroups": [
                651
            ],
            "viewFields": [
                650
            ],
            "viewFilterGroups": [
                653
            ],
            "viewFilters": [
                652
            ],
            "viewGroups": [
                656
            ],
            "viewSorts": [
                659
            ],
            "visibility": [
                662
            ],
            "workspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                665
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
                535
            ],
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "fieldMetadataId": [
                535
            ],
            "id": [
                535
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
                535
            ],
            "updatedAt": [
                213
            ],
            "viewFieldGroupId": [
                535
            ],
            "viewId": [
                535
            ],
            "workspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "id": [
                535
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
                213
            ],
            "viewFields": [
                650
            ],
            "viewId": [
                535
            ],
            "workspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "fieldMetadataId": [
                535
            ],
            "id": [
                535
            ],
            "operand": [
                655
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "relationTargetFieldMetadataId": [
                535
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                213
            ],
            "value": [
                325
            ],
            "viewFilterGroupId": [
                535
            ],
            "viewId": [
                535
            ],
            "workspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "id": [
                535
            ],
            "logicalOperator": [
                654
            ],
            "parentViewFilterGroupId": [
                535
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "updatedAt": [
                213
            ],
            "viewId": [
                535
            ],
            "workspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "fieldValue": [
                1
            ],
            "id": [
                535
            ],
            "isVisible": [
                5
            ],
            "position": [
                7
            ],
            "updatedAt": [
                213
            ],
            "viewId": [
                535
            ],
            "workspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "direction": [
                660
            ],
            "fieldMetadataId": [
                535
            ],
            "id": [
                535
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                213
            ],
            "viewId": [
                535
            ],
            "workspaceId": [
                535
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
                535
            ],
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "description": [
                1
            ],
            "id": [
                535
            ],
            "operations": [
                1
            ],
            "role": [
                458
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                213
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
                94
            ],
            "on_CalendarConfiguration": [
                134
            ],
            "on_CallRecordingSummaryConfiguration": [
                135
            ],
            "on_CallRecordingTranscriptConfiguration": [
                136
            ],
            "on_ChatConfiguration": [
                144
            ],
            "on_ChatThreadsConfiguration": [
                147
            ],
            "on_EmailThreadConfiguration": [
                242
            ],
            "on_EmailsConfiguration": [
                246
            ],
            "on_FieldConfiguration": [
                269
            ],
            "on_FieldRichTextConfiguration": [
                277
            ],
            "on_FieldsConfiguration": [
                278
            ],
            "on_FilesConfiguration": [
                284
            ],
            "on_FormFieldConfiguration": [
                287
            ],
            "on_FrontComponentConfiguration": [
                289
            ],
            "on_IframeConfiguration": [
                307
            ],
            "on_LineChartConfiguration": [
                329
            ],
            "on_MessageCampaignBodyConfiguration": [
                353
            ],
            "on_MessageCampaignDetailsConfiguration": [
                354
            ],
            "on_NotesConfiguration": [
                385
            ],
            "on_PieChartConfiguration": [
                419
            ],
            "on_RecordTableConfiguration": [
                448
            ],
            "on_StandaloneRichTextConfiguration": [
                502
            ],
            "on_TasksConfiguration": [
                512
            ],
            "on_TimelineConfiguration": [
                516
            ],
            "on_ViewConfiguration": [
                649
            ],
            "on_WorkflowConfiguration": [
                668
            ],
            "on_WorkflowRunConfiguration": [
                669
            ],
            "on_WorkflowVersionConfiguration": [
                670
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
                665
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                665
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                665
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                672
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
                325
            ],
            "allowImpersonation": [
                5
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
                120
            ],
            "createdAt": [
                213
            ],
            "currentBillingSubscription": [
                120
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                458
            ],
            "deletedAt": [
                213
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
                266
            ],
            "hasValidEnterpriseValidityToken": [
                5
            ],
            "hasValidSignedEnterpriseKey": [
                5
            ],
            "id": [
                535
            ],
            "iframeMediaPermissions": [
                308
            ],
            "installedApplications": [
                48
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
                535
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
                213
            ],
            "viewFields": [
                650
            ],
            "viewFilterGroups": [
                653
            ],
            "viewFilters": [
                652
            ],
            "viewGroups": [
                656
            ],
            "viewSorts": [
                659
            ],
            "views": [
                647
            ],
            "workspaceCustomApplication": [
                48
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                677
            ],
            "workspaceMembersCount": [
                7
            ],
            "workspaceUrls": [
                689
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
                325
            ],
            "isBookCallOnboardingStepPending": [
                5
            ],
            "outcome": [
                674
            ],
            "personEnrichment": [
                325
            ],
            "personOutcome": [
                687
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
                213
            ],
            "id": [
                535
            ],
            "roleId": [
                535
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
                682
            ],
            "id": [
                535
            ],
            "locale": [
                1
            ],
            "name": [
                291
            ],
            "numberFormat": [
                683
            ],
            "openRecordIn": [
                404
            ],
            "roles": [
                458
            ],
            "timeFormat": [
                684
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
                535
            ],
            "userWorkspaceId": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                535
            ],
            "variables": [
                636
            ],
            "workspaceMemberId": [
                535
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
                325
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
                535
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
                535
            ],
            "workspaceUrls": [
                689
            ],
            "__typename": [
                1
            ]
        }
    }
}