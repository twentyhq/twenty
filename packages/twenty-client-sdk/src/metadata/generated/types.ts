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
        299,
        301,
        313,
        320,
        321,
        322,
        334,
        336,
        352,
        353,
        354,
        355,
        356,
        357,
        359,
        360,
        361,
        364,
        365,
        367,
        368,
        371,
        373,
        377,
        381,
        390,
        397,
        398,
        399,
        402,
        406,
        407,
        412,
        416,
        439,
        441,
        442,
        445,
        451,
        463,
        465,
        469,
        474,
        494,
        506,
        507,
        509,
        534,
        536,
        538,
        602,
        622,
        629,
        631,
        635,
        646,
        652,
        653,
        655,
        656,
        658,
        659,
        660,
        663,
        664,
        669,
        671,
        674,
        679,
        680,
        681,
        684,
        685
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
                320
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
                534
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
                534
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
                320
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
                320
            ],
            "roleId": [
                534
            ],
            "triggers": [
                320
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
                534
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                534
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
                534
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
                534
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
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                320
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
                213
            ],
            "deletedAt": [
                213
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
                534
            ],
            "isSubscribed": [
                4
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
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                534
            ],
            "createdAt": [
                213
            ],
            "id": [
                534
            ],
            "parts": [
                22
            ],
            "processedAt": [
                213
            ],
            "reactions": [
                23
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                534
            ],
            "senderWorkspaceMemberId": [
                534
            ],
            "status": [
                1
            ],
            "threadId": [
                534
            ],
            "turnId": [
                534
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
                534
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                534
            ],
            "messageId": [
                534
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                320
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
                320
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                320
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
                534
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                534
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
                6
            ],
            "endedAt": [
                213
            ],
            "errorMessage": [
                1
            ],
            "id": [
                534
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
                213
            ],
            "status": [
                25
            ],
            "threadId": [
                534
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
                534
            ],
            "aggregateOperation": [
                27
            ],
            "configurationType": [
                663
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                320
            ],
            "firstDayOfTheWeek": [
                10
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
                434
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
        "AiRunEvent": {
            "createdAt": [
                1
            ],
            "error": [
                1
            ],
            "id": [
                1
            ],
            "input": [
                320
            ],
            "isError": [
                4
            ],
            "output": [
                320
            ],
            "role": [
                1
            ],
            "runId": [
                534
            ],
            "text": [
                1
            ],
            "toolCallId": [
                1
            ],
            "toolName": [
                1
            ],
            "type": [
                32
            ],
            "usage": [
                294
            ],
            "__typename": [
                1
            ]
        },
        "AiRunEventType": {},
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
                213
            ],
            "expiresAt": [
                213
            ],
            "id": [
                534
            ],
            "name": [
                1
            ],
            "revokedAt": [
                213
            ],
            "role": [
                457
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
                534
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
                320
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
                534
            ],
            "role": [
                361
            ],
            "workspaceMemberId": [
                534
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
                534
            ],
            "applicationVariables": [
                80
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                320
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                156
            ],
            "createdAt": [
                213
            ],
            "defaultLogicFunctionRole": [
                457
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
                534
            ],
            "id": [
                534
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                333
            ],
            "logoFileId": [
                534
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                383
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                534
            ],
            "settingsCustomTabFrontComponentId": [
                534
            ],
            "settingsMenuItems": [
                493
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                534
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
                534
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
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                534
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
                430
            ],
            "connectionProviderId": [
                534
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
                534
            ],
            "isOwnedByCurrentUser": [
                4
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
                534
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
                534
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
                320
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
                534
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
                213
            ],
            "fileFolder": [
                281
            ],
            "fileId": [
                534
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
                213
            ],
            "periodStart": [
                213
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
                213
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
                213
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
                534
            ],
            "connectionProviders": [
                52
            ],
            "settingsMenuItems": [
                493
            ],
            "variables": [
                634
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
                534
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
                534
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
                10
            ],
            "autoUpdateEnabled": [
                10
            ],
            "creditsUsedBreakdown": [
                210
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
                644
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                534
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
                534
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
                320
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
                534
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
                320
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
                534
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
                473
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
                534
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
                472
            ],
            "workspaceUrls": [
                686
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
                534
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
                663
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
                320
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
                143
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                397
            ],
            "primaryAxisGroupByFieldMetadataId": [
                534
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
                397
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                534
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
                320
            ],
            "formattedToRawLookup": [
                320
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
                320
            ],
            "objectMetadataId": [
                534
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
                125
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
                534
            ],
            "userCreditsFallback": [
                635
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
                4
            ],
            "status": [
                507
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
                4
            ],
            "isSellable": [
                4
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
                6
            ],
            "isSellable": [
                4
            ],
            "priceUsageType": [
                127
            ],
            "recurringInterval": [
                506
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
                127
            ],
            "recurringInterval": [
                506
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
                4
            ],
            "id": [
                534
            ],
            "interval": [
                506
            ],
            "metadata": [
                320
            ],
            "phases": [
                123
            ],
            "status": [
                507
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
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                534
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
                124
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
                534
            ],
            "contactAutoCreationPolicy": [
                130
            ],
            "createdAt": [
                213
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                534
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
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
                6
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
                663
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                663
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "ChartNumberFormat": {},
        "ChatConfiguration": {
            "configurationType": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                320
            ],
            "error": [
                146
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
                663
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
                377
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                379
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
                150
            ],
            "aiModelTiers": [
                152
            ],
            "aiModels": [
                151
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
                154
            ],
            "publicFeatureFlags": [
                428
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                491
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                508
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
                534
            ],
            "availabilityObjectMetadataId": [
                534
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
                534
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
                534
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                534
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
                534
            ],
            "pageLayoutId": [
                534
            ],
            "payload": [
                158
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                534
            ],
            "updatedAt": [
                213
            ],
            "workflowVersionId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                389
            ],
            "on_PathCommandMenuItemPayload": [
                414
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
                534
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
                430
            ],
            "connectionProviderId": [
                534
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
                534
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
                534
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
                305
            ],
            "handle": [
                1
            ],
            "id": [
                534
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                534
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
                534
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
                320
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
                320
            ],
            "roleId": [
                534
            ],
            "triggers": [
                320
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                534
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                534
            ],
            "participantHandleFieldUniversalIdentifier": [
                534
            ],
            "visibility": [
                357
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
            "availabilityObjectMetadataId": [
                534
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
                534
            ],
            "engineComponentKey": [
                247
            ],
            "frontComponentId": [
                534
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
                534
            ],
            "pageLayoutId": [
                534
            ],
            "payload": [
                320
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                534
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
                351
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
                320
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
                320
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                534
            ],
            "options": [
                320
            ],
            "relationCreationPayload": [
                320
            ],
            "settings": [
                320
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
                534
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
                534
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
                313
            ],
            "objectMetadataId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                320
            ],
            "databaseEventTriggerSettings": [
                320
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                320
            ],
            "id": [
                534
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                320
            ],
            "source": [
                320
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                320
            ],
            "universalIdentifier": [
                534
            ],
            "workflowActionTriggerSettings": [
                320
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                534
            ],
            "id": [
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                534
            ],
            "color": [
                1
            ],
            "folderId": [
                534
            ],
            "icon": [
                1
            ],
            "id": [
                534
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                534
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                534
            ],
            "targetRecordId": [
                534
            ],
            "type": [
                381
            ],
            "userWorkspaceId": [
                534
            ],
            "viewId": [
                534
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
                320
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
                534
            ],
            "type": [
                407
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                406
            ],
            "pageLayoutId": [
                534
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
                320
            ],
            "objectMetadataId": [
                534
            ],
            "pageLayoutTabId": [
                534
            ],
            "position": [
                320
            ],
            "title": [
                1
            ],
            "type": [
                664
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                534
            ],
            "filter": [
                320
            ],
            "objectMetadataId": [
                534
            ],
            "orderBy": [
                320
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                534
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                534
            ],
            "secondFieldMetadataId": [
                534
            ],
            "thirdFieldMetadataId": [
                534
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
                534
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
                538
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
                622
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                629
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                631
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
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                534
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
                534
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
                534
            ],
            "id": [
                534
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
                534
            ],
            "viewId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                534
            ],
            "logicalOperator": [
                652
            ],
            "parentViewFilterGroupId": [
                534
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                534
            ],
            "id": [
                534
            ],
            "operand": [
                653
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                534
            ],
            "subFieldName": [
                1
            ],
            "value": [
                320
            ],
            "viewFilterGroupId": [
                534
            ],
            "viewId": [
                534
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
                534
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                534
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
                534
            ],
            "calendarFieldMetadataId": [
                534
            ],
            "calendarLayout": [
                646
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                534
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                534
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                655
            ],
            "mainGroupByFieldMetadataId": [
                534
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                534
            ],
            "openRecordIn": [
                656
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                659
            ],
            "visibility": [
                660
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                658
            ],
            "fieldMetadataId": [
                534
            ],
            "id": [
                534
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                534
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
                534
            ],
            "operations": [
                1
            ],
            "roleId": [
                534
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
                622
            ],
            "resource": [
                629
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                534
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
                534
            ],
            "name": [
                291
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                534
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
                534
            ],
            "isCustomDomainEnabled": [
                4
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
                534
            ],
            "pageLayoutId": [
                534
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
                534
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
                534
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                474
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
                534
            ],
            "status": [
                474
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                663
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
                534
            ],
            "status": [
                244
            ],
            "tenantStatus": [
                245
            ],
            "unsubscribeHostnameStatus": [
                536
            ],
            "updatedAt": [
                213
            ],
            "verificationRecords": [
                641
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
                663
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
                320
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
                320
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
                249
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                320
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
                213
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
                213
            ],
            "currentPeriodEnd": [
                213
            ],
            "expiresAt": [
                213
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
                258
            ],
            "first": [
                10
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
                320
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
                366
            ],
            "objectRecordEventsWithQueryIds": [
                396
            ],
            "queueJobEvents": [
                323
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                534
            ],
            "payload": [
                320
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagKey": {},
        "Field": {
            "applicationId": [
                534
            ],
            "createdAt": [
                213
            ],
            "defaultValue": [
                320
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
                534
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
                534
            ],
            "morphRelations": [
                450
            ],
            "name": [
                1
            ],
            "object": [
                383
            ],
            "objectMetadataId": [
                534
            ],
            "options": [
                320
            ],
            "relation": [
                450
            ],
            "settings": [
                320
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
            "writability": [
                373
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                663
            ],
            "fieldDisplayMode": [
                271
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
                272
            ],
            "pageInfo": [
                403
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
                535
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
                535
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
                4
            ],
            "canUpdateFieldValue": [
                4
            ],
            "fieldMetadataId": [
                534
            ],
            "id": [
                534
            ],
            "objectMetadataId": [
                534
            ],
            "roleId": [
                534
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
                534
            ],
            "objectMetadataId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                663
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
                213
            ],
            "id": [
                534
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
                534
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
                534
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
                534
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
                663
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                534
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                474
            ],
            "type": [
                301
            ],
            "workspace": [
                683
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
                364
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                663
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
                534
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                79
            ],
            "applicationVariables": [
                320
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
                534
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
                534
            ],
            "updatedAt": [
                213
            ],
            "usesSdkClient": [
                4
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
                663
            ],
            "frontComponentId": [
                534
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                534
            ],
            "pageLayoutType": [
                407
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
                468
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                320
            ],
            "scope": [
                320
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
                320
            ],
            "success": [
                4
            ],
            "text": [
                1
            ],
            "turnId": [
                534
            ],
            "usage": [
                294
            ],
            "__typename": [
                1
            ]
        },
        "GenerateUsage": {
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
        "GetApiKeyInput": {
            "id": [
                534
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
                534
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
                534
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
                534
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
                663
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
                306
            ],
            "IMAP": [
                306
            ],
            "SMTP": [
                306
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
                687
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
                534
            ],
            "threadId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                534
            ],
            "createdAt": [
                213
            ],
            "id": [
                534
            ],
            "indexFieldMetadataList": [
                311
            ],
            "indexType": [
                313
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
                309
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
                534
            ],
            "id": [
                534
            ],
            "order": [
                6
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
                312
            ],
            "id": [
                535
            ],
            "isCustom": [
                128
            ],
            "or": [
                312
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                534
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
                316
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
                534
            ],
            "messageThreadId": [
                534
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
                322
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                534
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
                663
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
                320
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
                143
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                397
            ],
            "primaryAxisGroupByFieldMetadataId": [
                534
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
                397
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                534
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
                320
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                328
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
                320
            ],
            "objectMetadataId": [
                534
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
                327
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                534
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
                534
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                213
            ],
            "cronTriggerSettings": [
                320
            ],
            "databaseEventTriggerSettings": [
                320
            ],
            "description": [
                1
            ],
            "executionMode": [
                334
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                320
            ],
            "id": [
                534
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
                320
            ],
            "universalIdentifier": [
                534
            ],
            "updatedAt": [
                213
            ],
            "workflowActionTriggerSettings": [
                320
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                320
            ],
            "duration": [
                6
            ],
            "error": [
                320
            ],
            "logs": [
                1
            ],
            "status": [
                336
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                534
            ],
            "applicationUniversalIdentifier": [
                534
            ],
            "id": [
                534
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                534
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
                320
            ],
            "name": [
                1
            ],
            "objects": [
                343
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                344
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
                345
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                346
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
                534
            ],
            "connectionProviderId": [
                534
            ],
            "createdAt": [
                213
            ],
            "id": [
                534
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
                663
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                663
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
                534
            ],
            "contactAutoCreationPolicy": [
                352
            ],
            "createdAt": [
                213
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
                534
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
                359
            ],
            "messagingProviderUniversalIdentifier": [
                534
            ],
            "participantHandleFieldUniversalIdentifier": [
                534
            ],
            "pendingGroupEmailsAction": [
                353
            ],
            "syncStage": [
                354
            ],
            "syncStageStartedAt": [
                213
            ],
            "syncStatus": [
                355
            ],
            "syncedAt": [
                213
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                213
            ],
            "type": [
                356
            ],
            "updatedAt": [
                213
            ],
            "visibility": [
                357
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
                534
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                534
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                360
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
                534
            ],
            "reason": [
                364
            ],
            "source": [
                365
            ],
            "unsubscribeTopicId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                362
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
                395
            ],
            "recordId": [
                1
            ],
            "type": [
                367
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
                534
            ],
            "property": [
                1
            ],
            "provenance": [
                371
            ],
            "recordId": [
                534
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
                534
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                155
            ],
            "objectMetadataItems": [
                375
            ],
            "views": [
                376
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
                534
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
                534
            ],
            "key": [
                655
            ],
            "objectMetadataId": [
                534
            ],
            "type": [
                659
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                500,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                668,
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
                        534,
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
                        534
                    ],
                    "threadId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        534,
                        "UUID!"
                    ],
                    "roleId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        534,
                        "UUID!"
                    ],
                    "roleId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        308,
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
                        506,
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
                        534,
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
                        534,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                401,
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
            "createAgentChatChannel": [
                5,
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
                351,
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
                17,
                {
                    "channelId": [
                        534
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
                        6,
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
                380,
                {
                    "inputs": [
                        187,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                649,
                {
                    "inputs": [
                        202,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                648,
                {
                    "inputs": [
                        203,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                654,
                {
                    "inputs": [
                        206,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                347,
                {
                    "input": [
                        185,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                362,
                {
                    "input": [
                        186,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                380,
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
                497,
                {
                    "input": [
                        495,
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
                        534,
                        "UUID!"
                    ],
                    "properties": [
                        320
                    ],
                    "recordId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
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
                309,
                {
                    "input": [
                        190,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                333,
                {
                    "input": [
                        184,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                383,
                {
                    "input": [
                        191,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                457,
                {
                    "createRoleInput": [
                        197,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                404,
                {
                    "input": [
                        192,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                405,
                {
                    "input": [
                        193,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                408,
                {
                    "input": [
                        194,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                427,
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
                449,
                {
                    "input": [
                        196,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                497,
                {
                    "input": [
                        496,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                500,
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
                        506,
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
                537,
                {
                    "input": [
                        199,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                620,
                {
                    "input": [
                        200,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                640,
                {
                    "input": [
                        201,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                645,
                {
                    "input": [
                        207,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                648,
                {
                    "input": [
                        203,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                649,
                {
                    "input": [
                        202,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                650,
                {
                    "input": [
                        205,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                651,
                {
                    "input": [
                        204,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                654,
                {
                    "input": [
                        206,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                657,
                {
                    "input": [
                        208,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                661,
                {
                    "input": [
                        209,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                500,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        534,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        534
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
                351,
                {
                    "id": [
                        534,
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
                        214,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                156,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                160,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                668
            ],
            "deleteEmailGroupChannel": [
                351,
                {
                    "id": [
                        534,
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
                288,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                380,
                {
                    "ids": [
                        534,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                347,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                380,
                {
                    "id": [
                        534,
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
                268,
                {
                    "input": [
                        215,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                309,
                {
                    "input": [
                        216,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                333,
                {
                    "input": [
                        337,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                383,
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
                        534,
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
                        534,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                449,
                {
                    "id": [
                        534,
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
                500,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                220,
                {
                    "twoFactorAuthenticationMethodId": [
                        534,
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
                        534,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                633
            ],
            "deleteUserFromWorkspace": [
                637,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                640,
                {
                    "id": [
                        534,
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
                648,
                {
                    "input": [
                        222,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                649,
                {
                    "input": [
                        221,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                650,
                {
                    "input": [
                        223,
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
                654,
                {
                    "input": [
                        224,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        225,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                661,
                {
                    "id": [
                        534,
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
                648,
                {
                    "input": [
                        228,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                649,
                {
                    "input": [
                        227,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                650,
                {
                    "input": [
                        229,
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
                654,
                {
                    "input": [
                        230,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        231,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
                {
                    "input": [
                        308,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                160,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                235,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                236,
                {
                    "id": [
                        534,
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
                        534
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
                672
            ],
            "executeOneLogicFunction": [
                335,
                {
                    "input": [
                        265,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                293,
                {
                    "input": [
                        292,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                41,
                {
                    "apiKeyId": [
                        534,
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
                        534,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                85
            ],
            "generateTransientToken": [
                517
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                531,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        534,
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
                532,
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
                340,
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
                400
            ],
            "grantApplicationCapabilities": [
                50,
                {
                    "input": [
                        298,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                307,
                {
                    "userId": [
                        534,
                        "UUID!"
                    ],
                    "workspaceId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                315,
                {
                    "input": [
                        314,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                317,
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
                317
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
                        534,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        534
                    ],
                    "threadId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                253
            ],
            "removeAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        452,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                443,
                {
                    "principal": [
                        440,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        448,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        534,
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
                        534,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        453,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                454,
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
                487,
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
                        534,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                405,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                404,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                408,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                512,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                479,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        534,
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
                        455,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                459,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                470,
                {
                    "input": [
                        466,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                64,
                {
                    "applicationId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                304,
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
                        534
                    ]
                }
            ],
            "sendAppChannelMessage": [
                478,
                {
                    "input": [
                        477,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                479,
                {
                    "browsingContext": [
                        320
                    ],
                    "channelId": [
                        534
                    ],
                    "fileAttachments": [
                        280,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        534,
                        "[UUID!]"
                    ],
                    "messageId": [
                        534,
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
                        534,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                482,
                {
                    "input": [
                        481,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                486,
                {
                    "input": [
                        485,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                487,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        534
                    ]
                }
            ],
            "sendMessageCampaign": [
                489,
                {
                    "input": [
                        488,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                484,
                {
                    "input": [
                        490,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                43,
                {
                    "input": [
                        492,
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
            "setRecordGeneralAccess": [
                443,
                {
                    "accessLevel": [
                        439,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        448,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                443,
                {
                    "accessLevel": [
                        439,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        440,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        448,
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
                498,
                {
                    "input": [
                        499
                    ]
                }
            ],
            "signUpInWorkspace": [
                498,
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
                        534
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
                401,
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
                        213,
                        "DateTime!"
                    ],
                    "threadId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                142,
                {
                    "connectedAccountId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                502,
                {
                    "companyContext": [
                        320
                    ],
                    "personContext": [
                        320
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                503
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
                358,
                {
                    "input": [
                        510,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                682,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        320,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
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
                        320
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
                519,
                {
                    "input": [
                        518,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                523,
                {
                    "input": [
                        520,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                522,
                {
                    "input": [
                        521,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                527,
                {
                    "input": [
                        524,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                526,
                {
                    "input": [
                        525,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                529,
                {
                    "input": [
                        528,
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
                        534,
                        "UUID!"
                    ],
                    "input": [
                        539,
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
                        213
                    ],
                    "threadIds": [
                        534,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                39,
                {
                    "input": [
                        541,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                351,
                {
                    "input": [
                        542,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                48,
                {
                    "id": [
                        534,
                        "UUID!"
                    ],
                    "input": [
                        543,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                74,
                {
                    "input": [
                        544,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                78,
                {
                    "input": [
                        546,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                129,
                {
                    "input": [
                        548,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                156,
                {
                    "input": [
                        550,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                351,
                {
                    "input": [
                        551,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                288,
                {
                    "input": [
                        553,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                266,
                {
                    "input": [
                        555,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                380,
                {
                    "inputs": [
                        568,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                383,
                {
                    "inputs": [
                        569,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                654,
                {
                    "inputs": [
                        591,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                347,
                {
                    "input": [
                        558,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                351,
                {
                    "input": [
                        560,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                358,
                {
                    "input": [
                        562,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                358,
                {
                    "input": [
                        564,
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
                380,
                {
                    "input": [
                        568,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        540,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        534
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
                        567,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        556,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                383,
                {
                    "input": [
                        569,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                457,
                {
                    "updateRoleInput": [
                        576,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                404,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        570,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                405,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        571,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                408,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        573,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                404,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        575,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                318,
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
                500,
                {
                    "input": [
                        578,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                512,
                {
                    "input": [
                        579,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                537,
                {
                    "input": [
                        580,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                620,
                {
                    "input": [
                        581,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                102,
                {
                    "userCreditsFallback": [
                        635,
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
                640,
                {
                    "input": [
                        582,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                645,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        593,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                648,
                {
                    "input": [
                        586,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                649,
                {
                    "input": [
                        584,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                650,
                {
                    "input": [
                        589,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                651,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        588,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                654,
                {
                    "input": [
                        591,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                657,
                {
                    "input": [
                        594,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                661,
                {
                    "input": [
                        596,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                668,
                {
                    "data": [
                        600,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                668,
                {
                    "data": [
                        598,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                668,
                {
                    "data": [
                        599,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                677,
                {
                    "roleId": [
                        534,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        601,
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
                        602,
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
                        602,
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
                        602,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                283,
                {
                    "file": [
                        602,
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
                        602,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                283,
                {
                    "file": [
                        602,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                275,
                {
                    "upsertFieldPermissionsInput": [
                        603,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                645,
                {
                    "input": [
                        606,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                391,
                {
                    "upsertObjectPermissionsInput": [
                        607,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                458,
                {
                    "upsertPermissionFlagsInput": [
                        608,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                610,
                {
                    "input": [
                        609,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                645,
                {
                    "input": [
                        611,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                82,
                {
                    "input": [
                        638,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                642,
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
                643,
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
                534
            ],
            "applicationId": [
                534
            ],
            "color": [
                1
            ],
            "createdAt": [
                213
            ],
            "folderId": [
                534
            ],
            "icon": [
                1
            ],
            "id": [
                534
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                534
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                534
            ],
            "targetRecordId": [
                534
            ],
            "targetRecordIdentifier": [
                436
            ],
            "type": [
                381
            ],
            "updatedAt": [
                213
            ],
            "userWorkspaceId": [
                534
            ],
            "viewId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                534
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
                386,
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
                534
            ],
            "imageIdentifierFieldMetadataId": [
                534
            ],
            "indexMetadataList": [
                309
            ],
            "indexMetadatas": [
                388,
                {
                    "filter": [
                        312,
                        "IndexFilter!"
                    ],
                    "paging": [
                        211,
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
                534
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
                390
            ],
            "readability": [
                368
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                534
            ],
            "searchFieldMetadataList": [
                476
            ],
            "sharingReach": [
                398
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
            "writability": [
                373
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                385
            ],
            "pageInfo": [
                403
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
                383
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
                403
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                387
            ],
            "id": [
                535
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
                387
            ],
            "universalIdentifier": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                310
            ],
            "pageInfo": [
                403
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                534
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
                534
            ],
            "restrictedFields": [
                320
            ],
            "rowLevelPermissionPredicateGroups": [
                461
            ],
            "rowLevelPermissionPredicates": [
                460
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
                534
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
                212
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                395
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
                320
            ],
            "before": [
                320
            ],
            "diff": [
                320
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
                394
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
                399
            ],
            "previousOnboardingStatus": [
                399
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
                163
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
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
                534
            ],
            "createdAt": [
                213
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                534
            ],
            "deletedAt": [
                213
            ],
            "id": [
                534
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
                534
            ],
            "tabs": [
                405
            ],
            "type": [
                407
            ],
            "universalIdentifier": [
                534
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
                534
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
                534
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
                406
            ],
            "pageLayoutId": [
                534
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                534
            ],
            "updatedAt": [
                213
            ],
            "widgets": [
                408
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                534
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                320
            ],
            "configuration": [
                662
            ],
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "gridPosition": [
                300
            ],
            "id": [
                534
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
                534
            ],
            "pageLayoutTabId": [
                534
            ],
            "position": [
                411
            ],
            "title": [
                1
            ],
            "type": [
                664
            ],
            "universalIdentifier": [
                534
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
                406
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
                406
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
                409
            ],
            "on_PageLayoutWidgetGridPosition": [
                410
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                413
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                412
            ],
            "index": [
                10
            ],
            "layoutMode": [
                406
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
                534
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
                534
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
                534
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
                534
            ],
            "aggregateOperation": [
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                663
            ],
            "dateGranularity": [
                397
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
                320
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                534
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
                143
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
                420
            ],
            "formattedToRawLookup": [
                320
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
                320
            ],
            "objectMetadataId": [
                534
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
                332
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
                350
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                534
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
                534
            ],
            "createdAt": [
                213
            ],
            "domain": [
                1
            ],
            "id": [
                534
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
                267
            ],
            "metadata": [
                429
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
                426
            ],
            "IMAP": [
                426
            ],
            "SMTP": [
                426
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
                534
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                686
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
                534
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
                        534,
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
                        534,
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
            "aiRunEvents": [
                31,
                {
                    "after": [
                        1
                    ],
                    "agentUniversalIdentifier": [
                        534
                    ],
                    "runId": [
                        534
                    ],
                    "threadKey": [
                        1
                    ]
                }
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
                        329
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
                351,
                {
                    "filter": [
                        330
                    ]
                }
            ],
            "appMessageFolders": [
                358,
                {
                    "filter": [
                        331
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                51,
                {
                    "applicationId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                52,
                {
                    "applicationId": [
                        534,
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
                475,
                {
                    "applicationId": [
                        534,
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
                        4
                    ],
                    "returnUrlPath": [
                        1
                    ]
                }
            ],
            "callRecordingIdForCalendarEvent": [
                534,
                {
                    "calendarEventId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "threadId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                145,
                {
                    "threadId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                17,
                {
                    "id": [
                        534,
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
                676,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                504,
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
                        534,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                156
            ],
            "currentUser": [
                633
            ],
            "currentUserApplicationAuthorizations": [
                49
            ],
            "currentUserSessions": [
                636
            ],
            "currentWorkspace": [
                668
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
                        4
                    ],
                    "universalIdentifier": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                268,
                {
                    "id": [
                        534,
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
                425,
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
                323,
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
                333
            ],
            "findManyMarketplaceApps": [
                341,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                427
            ],
            "findMarketplaceAppDetail": [
                342,
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
                        534
                    ],
                    "universalIdentifier": [
                        534
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
                333,
                {
                    "input": [
                        337,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                323,
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
                323,
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
                670
            ],
            "findWorkspaceFromInviteHash": [
                668,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                675
            ],
            "frontComponent": [
                288,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                288
            ],
            "getAddressDetails": [
                421,
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
                457
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
                320,
                {
                    "input": [
                        337,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                162,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                243
            ],
            "getInviteSuggestions": [
                319
            ],
            "getJobs": [
                323,
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
                        337,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                404,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                405,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                405,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                408,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                408,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                404,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        407
                    ]
                }
            ],
            "getPermissionFlags": [
                415
            ],
            "getPublicWorkspaceDataByDomain": [
                431,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                432,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                118
            ],
            "getRole": [
                457,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                457
            ],
            "getSSOIdentityProviders": [
                285
            ],
            "getToolIndex": [
                516
            ],
            "getToolInputSchema": [
                320,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                617,
                {
                    "input": [
                        618
                    ]
                }
            ],
            "getView": [
                645,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                648,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                649,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                649,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                648,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                650,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                651,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                651,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                650,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                654,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                654,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                657,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                657,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                645,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        659,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                673
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
                325,
                {
                    "input": [
                        326,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                109
            ],
            "mcpServer": [
                347,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                347
            ],
            "messageSuppressions": [
                363,
                {
                    "input": [
                        286,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                369,
                {
                    "input": [
                        372,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                374
            ],
            "mostlyEmptyFieldMetadataIds": [
                534,
                {
                    "objectMetadataId": [
                        534,
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
                        534
                    ]
                }
            ],
            "myConnectedAccounts": [
                160
            ],
            "myMessageChannels": [
                351,
                {
                    "connectedAccountId": [
                        534
                    ]
                }
            ],
            "myMessageFolders": [
                358,
                {
                    "messageChannelId": [
                        534
                    ]
                }
            ],
            "myUserApplicationVariables": [
                678
            ],
            "navigationMenuItem": [
                380,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                380
            ],
            "object": [
                383,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                393
            ],
            "objects": [
                384,
                {
                    "filter": [
                        387,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        211,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                418,
                {
                    "input": [
                        419,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                137,
                {
                    "input": [
                        422,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                424,
                {
                    "input": [
                        423,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                342,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                341
            ],
            "recordPermissions": [
                438,
                {
                    "targets": [
                        448,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                443,
                {
                    "target": [
                        448,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                449
            ],
            "skill": [
                500,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                500
            ],
            "timelineActivityTypes": [
                512
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                533,
                {
                    "userId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                537
            ],
            "usageLimits": [
                620
            ],
            "usageQuotaDefinitions": [
                624
            ],
            "usageQuotaScopeConsumption": [
                626,
                {
                    "input": [
                        627,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                628
            ],
            "validatePasswordResetToken": [
                639,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                640,
                {
                    "objectMetadataId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                661,
                {
                    "id": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                661
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                534
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
                534
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
                534
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
                534
            ],
            "permissions": [
                437
            ],
            "recordId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                534
            ],
            "workspaceMemberId": [
                534
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
                439
            ],
            "generalAccessLevel": [
                439
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                437
            ],
            "roles": [
                446
            ],
            "shares": [
                444
            ],
            "sharingMode": [
                445
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                439
            ],
            "id": [
                18
            ],
            "principalId": [
                534
            ],
            "principalRoleId": [
                534
            ],
            "principalType": [
                441
            ],
            "rowCause": [
                442
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
                534
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
                663
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
                534
            ],
            "recordId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                534
            ],
            "id": [
                534
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                534
            ],
            "secondFieldMetadataId": [
                534
            ],
            "thirdFieldMetadataId": [
                534
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
                383
            ],
            "targetFieldMetadata": [
                268
            ],
            "targetObjectMetadata": [
                383
            ],
            "type": [
                451
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
                534
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
                534
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
                275
            ],
            "icon": [
                1
            ],
            "id": [
                534
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                391
            ],
            "permissionFlags": [
                458
            ],
            "rowLevelPermissionPredicateGroups": [
                461
            ],
            "rowLevelPermissionPredicates": [
                460
            ],
            "universalIdentifier": [
                534
            ],
            "workspaceMembers": [
                677
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
                534
            ],
            "roleId": [
                534
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
                465
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
                320
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
                463
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
                534
            ],
            "logicalOperator": [
                463
            ],
            "objectMetadataId": [
                534
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                534
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
                534
            ],
            "id": [
                534
            ],
            "operand": [
                465
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "relationFieldMetadataId": [
                534
            ],
            "rowLevelPermissionPredicateGroupId": [
                534
            ],
            "subFieldName": [
                1
            ],
            "value": [
                320
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
                468
            ],
            "messages": [
                468
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                320
            ],
            "runAsWorkspaceMemberId": [
                534
            ],
            "thread": [
                471
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
                534
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
                467
            ],
            "content": [
                1
            ],
            "role": [
                469
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
                320
            ],
            "runId": [
                534
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                534
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
                534
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                474
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
                534
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                474
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
                213
            ],
            "fieldMetadataId": [
                534
            ],
            "id": [
                534
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                534
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
                534
            ],
            "messageChannelId": [
                534
            ],
            "messageThreadId": [
                534
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
                534
            ],
            "messageThreadId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                534
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
                480
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
                483
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
                534
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
                320
            ],
            "workspaceMemberIds": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                534
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
                675
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
                320
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                534
            ],
            "createdAt": [
                213
            ],
            "frontComponentId": [
                534
            ],
            "icon": [
                1
            ],
            "id": [
                534
            ],
            "position": [
                6
            ],
            "scope": [
                494
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                534
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
                534
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
                534
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                474
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
                85
            ],
            "workspace": [
                687
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
                534
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
                534
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
                213
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                456
            ],
            "configurationType": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                685
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
                435,
                {
                    "input": [
                        195,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                338,
                {
                    "input": [
                        339,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                14,
                {
                    "threadId": [
                        534,
                        "UUID!"
                    ]
                }
            ],
            "onAiRunEvent": [
                31,
                {
                    "after": [
                        1
                    ],
                    "agentUniversalIdentifier": [
                        534
                    ],
                    "runId": [
                        534
                    ],
                    "threadKey": [
                        1
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
                509
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                663
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
                534
            ],
            "createdAt": [
                213
            ],
            "emit": [
                513
            ],
            "frontComponentUniversalIdentifier": [
                534
            ],
            "icon": [
                1
            ],
            "id": [
                534
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
                534
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                534
            ],
            "universalIdentifier": [
                534
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
                534
            ],
            "on": [
                1
            ],
            "through": [
                514
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                534
            ],
            "relationFieldUniversalIdentifier": [
                534
            ],
            "triggerFieldUniversalIdentifiers": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                663
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
                320
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
                534
            ],
            "personFilter": [
                320
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
                534
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
                4
            ],
            "isAwaitingRecoveryEnrollment": [
                4
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
                534
            ],
            "gt": [
                534
            ],
            "gte": [
                534
            ],
            "iLike": [
                534
            ],
            "in": [
                534
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                534
            ],
            "lt": [
                534
            ],
            "lte": [
                534
            ],
            "neq": [
                534
            ],
            "notILike": [
                534
            ],
            "notIn": [
                534
            ],
            "notLike": [
                534
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
                534
            ],
            "name": [
                1
            ],
            "updatedAt": [
                213
            ],
            "visibility": [
                538
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
                534
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
                534
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                320
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
                320
            ],
            "roleId": [
                534
            ],
            "triggers": [
                320
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
                534
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
                534
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                534
            ],
            "visibility": [
                357
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
                545
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
                547
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
                534
            ],
            "update": [
                549
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
                4
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
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
                534
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
                534
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                320
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
                320
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                534
            ],
            "options": [
                320
            ],
            "settings": [
                320
            ],
            "translations": [
                370
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
                534
            ],
            "update": [
                554
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
                534
            ],
            "update": [
                557
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                320
            ],
            "databaseEventTriggerSettings": [
                320
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                320
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
                320
            ],
            "workflowActionTriggerSettings": [
                320
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                534
            ],
            "update": [
                559
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                534
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
                534
            ],
            "update": [
                561
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                352
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
                359
            ],
            "visibility": [
                357
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                534
            ],
            "update": [
                563
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
                534
            ],
            "update": [
                563
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
                534
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
                534
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
                534
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
                534
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
                390
            ],
            "readability": [
                368
            ],
            "sharingReach": [
                398
            ],
            "shortcut": [
                1
            ],
            "translations": [
                370
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                534
            ],
            "update": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                534
            ],
            "update": [
                565
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                534
            ],
            "update": [
                566
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
                534
            ],
            "type": [
                407
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
                406
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
                534
            ],
            "layoutMode": [
                406
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                574
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
                320
            ],
            "configuration": [
                320
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                534
            ],
            "pageLayoutTabId": [
                534
            ],
            "position": [
                320
            ],
            "title": [
                1
            ],
            "type": [
                664
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
                320
            ],
            "configuration": [
                320
            ],
            "id": [
                534
            ],
            "objectMetadataId": [
                534
            ],
            "pageLayoutTabId": [
                534
            ],
            "position": [
                320
            ],
            "title": [
                1
            ],
            "type": [
                664
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
                534
            ],
            "tabs": [
                572
            ],
            "type": [
                407
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                534
            ],
            "update": [
                577
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
                534
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
                534
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                370
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
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                534
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
                534
            ],
            "update": [
                583
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
                534
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
                534
            ],
            "update": [
                585
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
                534
            ],
            "update": [
                587
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                534
            ],
            "logicalOperator": [
                652
            ],
            "parentViewFilterGroupId": [
                534
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                534
            ],
            "update": [
                590
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                534
            ],
            "operand": [
                653
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                534
            ],
            "subFieldName": [
                1
            ],
            "value": [
                320
            ],
            "viewFilterGroupId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                534
            ],
            "update": [
                592
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                534
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
                534
            ],
            "calendarFieldMetadataId": [
                534
            ],
            "calendarLayout": [
                646
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                534
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                534
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                534
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                656
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "translations": [
                370
            ],
            "type": [
                659
            ],
            "visibility": [
                660
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                534
            ],
            "update": [
                595
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                658
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
                534
            ],
            "update": [
                597
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
                534
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
                320
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                534
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
                674
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                320
            ],
            "workspaceMemberId": [
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                534
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                604
            ],
            "id": [
                534
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
                604
            ],
            "groups": [
                605
            ],
            "widgetId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                392
            ],
            "roleId": [
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                534
            ],
            "predicateGroups": [
                462
            ],
            "predicates": [
                464
            ],
            "roleId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                461
            ],
            "predicates": [
                460
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                615
            ],
            "viewFields": [
                612
            ],
            "viewFilterGroups": [
                613
            ],
            "viewFilters": [
                614
            ],
            "viewSorts": [
                616
            ],
            "widgetId": [
                534
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
                534
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
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                534
            ],
            "logicalOperator": [
                652
            ],
            "parentViewFilterGroupId": [
                534
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
                534
            ],
            "id": [
                534
            ],
            "operand": [
                653
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                534
            ],
            "subFieldName": [
                1
            ],
            "value": [
                320
            ],
            "viewFilterGroupId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                534
            ],
            "calendarFieldMetadataId": [
                534
            ],
            "calendarLayout": [
                646
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                534
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                534
            ],
            "openRecordIn": [
                656
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                659
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                658
            ],
            "fieldMetadataId": [
                534
            ],
            "id": [
                534
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
                630
            ],
            "usageByApplication": [
                619
            ],
            "usageByModel": [
                619
            ],
            "usageByOperationType": [
                619
            ],
            "usageByUser": [
                619
            ],
            "userDailyUsage": [
                632
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                622
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
                213
            ],
            "id": [
                534
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                100
            ],
            "operationType": [
                622
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                629
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                631
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
                631
            ],
            "operationType": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                621
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                625
            ],
            "resourceType": [
                629
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                623
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
                622
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                631
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
                622
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                629
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                631
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
                534
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                100
            ],
            "operationType": [
                622
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
                629
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
                631
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
                630
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
                213
            ],
            "currentUserWorkspace": [
                637
            ],
            "currentWorkspace": [
                668
            ],
            "deletedAt": [
                213
            ],
            "deletedWorkspaceMembers": [
                226
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
                534
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
                399
            ],
            "previousOnboardingStatus": [
                399
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                213
            ],
            "userVars": [
                321
            ],
            "userWorkspaces": [
                637
            ],
            "workspaceMember": [
                677
            ],
            "workspaceMembers": [
                677
            ],
            "workspaces": [
                637
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
                320
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
                534
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
                213
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                534
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
                534
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                391
            ],
            "objectsPermissions": [
                391
            ],
            "permissionFlags": [
                416
            ],
            "twoFactorAuthenticationMethodSummary": [
                530
            ],
            "updatedAt": [
                213
            ],
            "user": [
                633
            ],
            "userId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                534
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
                534
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
                534
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                534
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
                534
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
                686
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
                534
            ],
            "calendarEndFieldMetadataId": [
                534
            ],
            "calendarFieldMetadataId": [
                534
            ],
            "calendarLayout": [
                646
            ],
            "createdAt": [
                213
            ],
            "createdByUserWorkspaceId": [
                534
            ],
            "deletedAt": [
                213
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                534
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
                534
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                655
            ],
            "mainGroupByFieldMetadataId": [
                534
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                534
            ],
            "openRecordIn": [
                656
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                659
            ],
            "universalIdentifier": [
                534
            ],
            "updatedAt": [
                213
            ],
            "viewFieldGroups": [
                649
            ],
            "viewFields": [
                648
            ],
            "viewFilterGroups": [
                651
            ],
            "viewFilters": [
                650
            ],
            "viewGroups": [
                654
            ],
            "viewSorts": [
                657
            ],
            "visibility": [
                660
            ],
            "workspaceId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                663
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
                534
            ],
            "createdAt": [
                213
            ],
            "deletedAt": [
                213
            ],
            "fieldMetadataId": [
                534
            ],
            "id": [
                534
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
                534
            ],
            "updatedAt": [
                213
            ],
            "viewFieldGroupId": [
                534
            ],
            "viewId": [
                534
            ],
            "workspaceId": [
                534
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
                534
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
                213
            ],
            "viewFields": [
                648
            ],
            "viewId": [
                534
            ],
            "workspaceId": [
                534
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
                534
            ],
            "id": [
                534
            ],
            "operand": [
                653
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                534
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                213
            ],
            "value": [
                320
            ],
            "viewFilterGroupId": [
                534
            ],
            "viewId": [
                534
            ],
            "workspaceId": [
                534
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
                534
            ],
            "logicalOperator": [
                652
            ],
            "parentViewFilterGroupId": [
                534
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                213
            ],
            "viewId": [
                534
            ],
            "workspaceId": [
                534
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
                534
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                213
            ],
            "viewId": [
                534
            ],
            "workspaceId": [
                534
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
                658
            ],
            "fieldMetadataId": [
                534
            ],
            "id": [
                534
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                213
            ],
            "viewId": [
                534
            ],
            "workspaceId": [
                534
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
                534
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
                534
            ],
            "operations": [
                1
            ],
            "role": [
                457
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
                26
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
                302
            ],
            "on_LineChartConfiguration": [
                324
            ],
            "on_MessageCampaignBodyConfiguration": [
                348
            ],
            "on_MessageCampaignDetailsConfiguration": [
                349
            ],
            "on_NotesConfiguration": [
                382
            ],
            "on_PieChartConfiguration": [
                417
            ],
            "on_RecordTableConfiguration": [
                447
            ],
            "on_StandaloneRichTextConfiguration": [
                501
            ],
            "on_TasksConfiguration": [
                511
            ],
            "on_TimelineConfiguration": [
                515
            ],
            "on_ViewConfiguration": [
                647
            ],
            "on_WorkflowConfiguration": [
                665
            ],
            "on_WorkflowRunConfiguration": [
                666
            ],
            "on_WorkflowVersionConfiguration": [
                667
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                663
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                669
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
                320
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
                457
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
                6
            ],
            "featureFlags": [
                266
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                534
            ],
            "iframeMediaPermissions": [
                303
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
                534
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
                213
            ],
            "viewFields": [
                648
            ],
            "viewFilterGroups": [
                651
            ],
            "viewFilters": [
                650
            ],
            "viewGroups": [
                654
            ],
            "viewSorts": [
                657
            ],
            "views": [
                645
            ],
            "workspaceCustomApplication": [
                48
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                674
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                686
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
                320
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                671
            ],
            "personEnrichment": [
                320
            ],
            "personOutcome": [
                684
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
                534
            ],
            "roleId": [
                534
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
                679
            ],
            "id": [
                534
            ],
            "locale": [
                1
            ],
            "name": [
                291
            ],
            "numberFormat": [
                680
            ],
            "openRecordIn": [
                402
            ],
            "roles": [
                457
            ],
            "timeFormat": [
                681
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
                534
            ],
            "userWorkspaceId": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                534
            ],
            "variables": [
                634
            ],
            "workspaceMemberId": [
                534
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
                320
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
                534
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
                534
            ],
            "workspaceUrls": [
                686
            ],
            "__typename": [
                1
            ]
        }
    }
}