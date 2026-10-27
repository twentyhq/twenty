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
        207,
        208,
        235,
        239,
        240,
        242,
        252,
        258,
        262,
        266,
        269,
        276,
        291,
        293,
        303,
        310,
        311,
        312,
        324,
        326,
        341,
        342,
        343,
        344,
        345,
        346,
        348,
        349,
        350,
        353,
        354,
        356,
        357,
        360,
        362,
        366,
        370,
        379,
        386,
        387,
        388,
        391,
        395,
        396,
        401,
        405,
        428,
        430,
        431,
        434,
        439,
        451,
        453,
        457,
        462,
        482,
        494,
        495,
        497,
        522,
        524,
        526,
        587,
        607,
        614,
        616,
        620,
        631,
        637,
        638,
        640,
        641,
        643,
        644,
        645,
        648,
        649,
        654,
        656,
        659,
        664,
        665,
        666,
        669,
        670
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
                310
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
                522
            ],
            "createdAt": [
                208
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                522
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
                310
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
                310
            ],
            "roleId": [
                522
            ],
            "triggers": [
                310
            ],
            "updatedAt": [
                208
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
                522
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
                522
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
                522
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
                522
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                310
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
                208
            ],
            "deletedAt": [
                208
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
                208
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                208
            ],
            "id": [
                522
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                208
            ],
            "lastReadAt": [
                208
            ],
            "snoozedUntil": [
                208
            ],
            "threadId": [
                522
            ],
            "updatedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                522
            ],
            "createdAt": [
                208
            ],
            "id": [
                522
            ],
            "parts": [
                21
            ],
            "processedAt": [
                208
            ],
            "reactions": [
                22
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                522
            ],
            "senderWorkspaceMemberId": [
                522
            ],
            "status": [
                1
            ],
            "threadId": [
                522
            ],
            "turnId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                208
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                522
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                522
            ],
            "messageId": [
                522
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                310
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
                310
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                310
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
                522
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                208
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
                208
            ],
            "errorMessage": [
                1
            ],
            "id": [
                522
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
                208
            ],
            "status": [
                24
            ],
            "threadId": [
                522
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
                522
            ],
            "aggregateOperation": [
                26
            ],
            "configurationType": [
                648
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                310
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
                423
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
                208
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
                208
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
                208
            ],
            "expiresAt": [
                208
            ],
            "id": [
                522
            ],
            "name": [
                1
            ],
            "revokedAt": [
                208
            ],
            "role": [
                445
            ],
            "updatedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                208
            ],
            "id": [
                522
            ],
            "name": [
                1
            ],
            "revokedAt": [
                208
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
                310
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
                208
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
                522
            ],
            "role": [
                350
            ],
            "workspaceMemberId": [
                522
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
                522
            ],
            "applicationVariables": [
                77
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                310
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                153
            ],
            "createdAt": [
                208
            ],
            "defaultLogicFunctionRole": [
                445
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                283
            ],
            "healthCheckLogicFunctionId": [
                522
            ],
            "id": [
                522
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                323
            ],
            "logoFileId": [
                522
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                372
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                522
            ],
            "settingsCustomTabFrontComponentId": [
                522
            ],
            "settingsMenuItems": [
                481
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                522
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                208
            ],
            "id": [
                522
            ],
            "lastAuthorizedAt": [
                208
            ],
            "lastUsedAt": [
                208
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                522
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                522
            ],
            "archivedAt": [
                208
            ],
            "authFailedAt": [
                208
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                419
            ],
            "connectionProviderId": [
                522
            ],
            "createdAt": [
                208
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                522
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                208
            ],
            "lastSignedInAt": [
                208
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
                208
            ],
            "userWorkspaceId": [
                522
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
                522
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
                310
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
                522
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
                276
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
                276
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
                208
            ],
            "fileFolder": [
                276
            ],
            "fileId": [
                522
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
                208
            ],
            "periodStart": [
                208
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
                208
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
                208
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
                208
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
                208
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
                522
            ],
            "connectionProviders": [
                49
            ],
            "settingsMenuItems": [
                481
            ],
            "variables": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                208
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                522
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
                522
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
                208
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
                205
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
                629
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                522
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
                208
            ],
            "description": [
                1
            ],
            "id": [
                522
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
                310
            ],
            "type": [
                1
            ],
            "updatedAt": [
                208
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
                522
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
                310
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
                208
            ],
            "domain": [
                1
            ],
            "id": [
                522
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
                461
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                208
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
                522
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
                460
            ],
            "workspaceUrls": [
                671
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
                522
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
                648
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
                310
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
                386
            ],
            "primaryAxisGroupByFieldMetadataId": [
                522
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                291
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                386
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                522
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                291
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
                310
            ],
            "formattedToRawLookup": [
                310
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
                310
            ],
            "objectMetadataId": [
                522
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
                522
            ],
            "userCreditsFallback": [
                620
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
                495
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
                494
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
                494
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
                208
            ],
            "periodStart": [
                208
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
                208
            ],
            "collectionMethod": [
                118
            ],
            "currentPeriodEnd": [
                208
            ],
            "hasUserCredits": [
                4
            ],
            "id": [
                522
            ],
            "interval": [
                494
            ],
            "metadata": [
                310
            ],
            "phases": [
                120
            ],
            "status": [
                495
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
                522
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
                522
            ],
            "contactAutoCreationPolicy": [
                127
            ],
            "createdAt": [
                208
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                522
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
                208
            ],
            "syncStatus": [
                129
            ],
            "syncedAt": [
                208
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                208
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
                648
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                648
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
                648
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                310
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
                648
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
                366
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                368
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
                417
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                479
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                496
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                208
            ],
            "link": [
                1
            ],
            "startAt": [
                208
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
                522
            ],
            "availabilityObjectMetadataId": [
                522
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
                522
            ],
            "createdAt": [
                208
            ],
            "engineComponentKey": [
                242
            ],
            "frontComponent": [
                283
            ],
            "frontComponentId": [
                522
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                522
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
                522
            ],
            "pageLayoutId": [
                522
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
                522
            ],
            "updatedAt": [
                208
            ],
            "workflowVersionId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                378
            ],
            "on_PathCommandMenuItemPayload": [
                403
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
                274
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                522
            ],
            "archivedAt": [
                208
            ],
            "authFailedAt": [
                208
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                419
            ],
            "connectionProviderId": [
                522
            ],
            "createdAt": [
                208
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                522
            ],
            "lastCredentialsRefreshedAt": [
                208
            ],
            "lastSignedInAt": [
                208
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
                208
            ],
            "userWorkspaceId": [
                522
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
                296
            ],
            "handle": [
                1
            ],
            "id": [
                522
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                235
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
                522
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
                310
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
                310
            ],
            "roleId": [
                522
            ],
            "triggers": [
                310
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                522
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                522
            ],
            "participantHandleFieldUniversalIdentifier": [
                522
            ],
            "visibility": [
                346
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
                522
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
                522
            ],
            "engineComponentKey": [
                242
            ],
            "frontComponentId": [
                522
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
                522
            ],
            "pageLayoutId": [
                522
            ],
            "payload": [
                310
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                522
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
                340
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
                310
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
                310
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                522
            ],
            "options": [
                310
            ],
            "relationCreationPayload": [
                310
            ],
            "settings": [
                310
            ],
            "type": [
                269
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
                522
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
                522
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
                303
            ],
            "objectMetadataId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                310
            ],
            "databaseEventTriggerSettings": [
                310
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                310
            ],
            "id": [
                522
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                310
            ],
            "source": [
                310
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                310
            ],
            "universalIdentifier": [
                522
            ],
            "workflowActionTriggerSettings": [
                310
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                522
            ],
            "color": [
                1
            ],
            "folderId": [
                522
            ],
            "icon": [
                1
            ],
            "id": [
                522
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                522
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                522
            ],
            "targetRecordId": [
                522
            ],
            "type": [
                370
            ],
            "userWorkspaceId": [
                522
            ],
            "viewId": [
                522
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
                310
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
                184
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
                522
            ],
            "type": [
                396
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                395
            ],
            "pageLayoutId": [
                522
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
                310
            ],
            "objectMetadataId": [
                522
            ],
            "pageLayoutTabId": [
                522
            ],
            "position": [
                310
            ],
            "title": [
                1
            ],
            "type": [
                649
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                522
            ],
            "filter": [
                310
            ],
            "objectMetadataId": [
                522
            ],
            "orderBy": [
                310
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
                522
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
                526
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
                607
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                614
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                616
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
                522
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                522
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
                522
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
                522
            ],
            "id": [
                522
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
                522
            ],
            "viewId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                522
            ],
            "logicalOperator": [
                637
            ],
            "parentViewFilterGroupId": [
                522
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                522
            ],
            "id": [
                522
            ],
            "operand": [
                638
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                522
            ],
            "subFieldName": [
                1
            ],
            "value": [
                310
            ],
            "viewFilterGroupId": [
                522
            ],
            "viewId": [
                522
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
                522
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                522
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
                522
            ],
            "calendarFieldMetadataId": [
                522
            ],
            "calendarLayout": [
                631
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                522
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                522
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                640
            ],
            "mainGroupByFieldMetadataId": [
                522
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                522
            ],
            "openRecordIn": [
                641
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                644
            ],
            "visibility": [
                645
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                643
            ],
            "fieldMetadataId": [
                522
            ],
            "id": [
                522
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                522
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
                522
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
                607
            ],
            "resource": [
                614
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                522
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                522
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
                522
            ],
            "name": [
                286
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                522
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
                522
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                228
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
                522
            ],
            "pageLayoutId": [
                522
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
                522
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
                522
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                462
            ],
            "type": [
                293
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                522
            ],
            "status": [
                462
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
                648
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                208
            ],
            "domain": [
                1
            ],
            "id": [
                522
            ],
            "status": [
                239
            ],
            "tenantStatus": [
                240
            ],
            "unsubscribeHostnameStatus": [
                524
            ],
            "updatedAt": [
                208
            ],
            "verificationRecords": [
                626
            ],
            "verifiedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                648
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
                310
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
                310
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
                244
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                310
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
                208
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
                208
            ],
            "currentPeriodEnd": [
                208
            ],
            "expiresAt": [
                208
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
                208
            ],
            "start": [
                208
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
                252
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
                250
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                251
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
                253
            ],
            "first": [
                10
            ],
            "table": [
                258
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                254
            ],
            "records": [
                257
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
                310
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                208
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
                355
            ],
            "objectRecordEventsWithQueryIds": [
                385
            ],
            "queueJobEvents": [
                313
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                522
            ],
            "payload": [
                310
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                262
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
                522
            ],
            "createdAt": [
                208
            ],
            "defaultValue": [
                310
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                522
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
                522
            ],
            "morphRelations": [
                438
            ],
            "name": [
                1
            ],
            "object": [
                372
            ],
            "objectMetadataId": [
                522
            ],
            "options": [
                310
            ],
            "relation": [
                438
            ],
            "settings": [
                310
            ],
            "type": [
                269
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                208
            ],
            "writability": [
                362
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                648
            ],
            "fieldDisplayMode": [
                266
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
                267
            ],
            "pageInfo": [
                392
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
                263
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                268
            ],
            "id": [
                523
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
                523
            ],
            "or": [
                268
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
                522
            ],
            "id": [
                522
            ],
            "objectMetadataId": [
                522
            ],
            "roleId": [
                522
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
                522
            ],
            "objectMetadataId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                648
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
                208
            ],
            "id": [
                522
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
                522
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
                208
            ],
            "fileId": [
                522
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
                208
            ],
            "id": [
                522
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
                648
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                522
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                462
            ],
            "type": [
                293
            ],
            "workspace": [
                668
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
                353
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                648
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
                522
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                76
            ],
            "applicationVariables": [
                310
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
                208
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                522
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
                522
            ],
            "updatedAt": [
                208
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                285
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                648
            ],
            "frontComponentId": [
                522
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                522
            ],
            "pageLayoutType": [
                396
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
                522
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
                522
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
                522
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
                522
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
                648
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
                297
            ],
            "IMAP": [
                297
            ],
            "SMTP": [
                297
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
                235
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
                672
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                208
            ],
            "id": [
                522
            ],
            "indexFieldMetadataList": [
                301
            ],
            "indexType": [
                303
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
                208
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
                299
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                208
            ],
            "fieldMetadataId": [
                522
            ],
            "id": [
                522
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                302
            ],
            "id": [
                523
            ],
            "isCustom": [
                125
            ],
            "or": [
                302
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                522
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
                306
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
                522
            ],
            "messageThreadId": [
                522
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
                312
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                522
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
                648
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
                310
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
                386
            ],
            "primaryAxisGroupByFieldMetadataId": [
                522
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                291
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                386
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                522
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                291
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
                310
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                318
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
                310
            ],
            "objectMetadataId": [
                522
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
                317
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                522
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
                522
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                208
            ],
            "cronTriggerSettings": [
                310
            ],
            "databaseEventTriggerSettings": [
                310
            ],
            "description": [
                1
            ],
            "executionMode": [
                324
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                310
            ],
            "id": [
                522
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
                310
            ],
            "universalIdentifier": [
                522
            ],
            "updatedAt": [
                208
            ],
            "workflowActionTriggerSettings": [
                310
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                310
            ],
            "duration": [
                6
            ],
            "error": [
                310
            ],
            "logs": [
                1
            ],
            "status": [
                326
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                522
            ],
            "applicationUniversalIdentifier": [
                522
            ],
            "id": [
                522
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                522
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
                310
            ],
            "name": [
                1
            ],
            "objects": [
                333
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                334
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
                335
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                336
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
                648
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                648
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
                522
            ],
            "contactAutoCreationPolicy": [
                341
            ],
            "createdAt": [
                208
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
                522
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
                348
            ],
            "messagingProviderUniversalIdentifier": [
                522
            ],
            "participantHandleFieldUniversalIdentifier": [
                522
            ],
            "pendingGroupEmailsAction": [
                342
            ],
            "syncStage": [
                343
            ],
            "syncStageStartedAt": [
                208
            ],
            "syncStatus": [
                344
            ],
            "syncedAt": [
                208
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                208
            ],
            "type": [
                345
            ],
            "updatedAt": [
                208
            ],
            "visibility": [
                346
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
                208
            ],
            "externalId": [
                1
            ],
            "id": [
                522
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                522
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                349
            ],
            "updatedAt": [
                208
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
                208
            ],
            "emailAddress": [
                1
            ],
            "id": [
                522
            ],
            "reason": [
                353
            ],
            "source": [
                354
            ],
            "unsubscribeTopicId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                351
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
                384
            ],
            "recordId": [
                1
            ],
            "type": [
                356
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
                522
            ],
            "property": [
                1
            ],
            "provenance": [
                360
            ],
            "recordId": [
                522
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
                522
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                522
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
                364
            ],
            "views": [
                365
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
                522
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
                522
            ],
            "key": [
                640
            ],
            "objectMetadataId": [
                522
            ],
            "type": [
                644
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                488,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                653,
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
                        522,
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
                        522
                    ],
                    "threadId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        522,
                        "UUID!"
                    ],
                    "roleId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        522,
                        "UUID!"
                    ],
                    "roleId": [
                        522,
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
                229
            ],
            "checkPublicDomainValidRecords": [
                229,
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
                        494,
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
                        522,
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
                        522,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                390,
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
                278,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                278,
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
                278,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                278,
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
                340,
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
                        522
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
                227,
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
                238,
                {
                    "input": [
                        176,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                277,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        276,
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
                283,
                {
                    "input": [
                        178,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                369,
                {
                    "inputs": [
                        183,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                634,
                {
                    "inputs": [
                        197,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                633,
                {
                    "inputs": [
                        198,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                639,
                {
                    "inputs": [
                        201,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                351,
                {
                    "input": [
                        182,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                369,
                {
                    "input": [
                        183,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                277,
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
                485,
                {
                    "input": [
                        483,
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
                        522,
                        "UUID!"
                    ],
                    "properties": [
                        310
                    ],
                    "recordId": [
                        522,
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
                263,
                {
                    "input": [
                        185,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                299,
                {
                    "input": [
                        186,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                323,
                {
                    "input": [
                        181,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                372,
                {
                    "input": [
                        187,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                445,
                {
                    "createRoleInput": [
                        192,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                393,
                {
                    "input": [
                        188,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                394,
                {
                    "input": [
                        189,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                397,
                {
                    "input": [
                        190,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                416,
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
                485,
                {
                    "input": [
                        484,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                488,
                {
                    "input": [
                        193,
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
                        494,
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
                525,
                {
                    "input": [
                        194,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                605,
                {
                    "input": [
                        195,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                625,
                {
                    "input": [
                        196,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                630,
                {
                    "input": [
                        202,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                633,
                {
                    "input": [
                        198,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                634,
                {
                    "input": [
                        197,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                635,
                {
                    "input": [
                        200,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                636,
                {
                    "input": [
                        199,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                639,
                {
                    "input": [
                        201,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                642,
                {
                    "input": [
                        203,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                646,
                {
                    "input": [
                        204,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                488,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        522,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        522
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
                340,
                {
                    "id": [
                        522,
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
                        209,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                153,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                157,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                653
            ],
            "deleteEmailGroupChannel": [
                340,
                {
                    "id": [
                        522,
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
                283,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                369,
                {
                    "ids": [
                        522,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                369,
                {
                    "id": [
                        522,
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
                263,
                {
                    "input": [
                        210,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                299,
                {
                    "input": [
                        211,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                323,
                {
                    "input": [
                        327,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                372,
                {
                    "input": [
                        212,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        522,
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
                        522,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                213,
                {
                    "input": [
                        214,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                488,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                215,
                {
                    "twoFactorAuthenticationMethodId": [
                        522,
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
                        522,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                618
            ],
            "deleteUserFromWorkspace": [
                622,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                625,
                {
                    "id": [
                        522,
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
                633,
                {
                    "input": [
                        217,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                634,
                {
                    "input": [
                        216,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                635,
                {
                    "input": [
                        218,
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
                639,
                {
                    "input": [
                        219,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        220,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                646,
                {
                    "id": [
                        522,
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
                633,
                {
                    "input": [
                        223,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                634,
                {
                    "input": [
                        222,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                635,
                {
                    "input": [
                        224,
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
                639,
                {
                    "input": [
                        225,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        226,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                157,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                230,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                231,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                232,
                {
                    "input": [
                        233,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                236,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        522
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                100
            ],
            "enqueueJob": [
                245,
                {
                    "input": [
                        243,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                247,
                {
                    "input": [
                        246,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                657
            ],
            "executeOneLogicFunction": [
                325,
                {
                    "input": [
                        260,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                38,
                {
                    "apiKeyId": [
                        522,
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
                        522,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                82
            ],
            "generateTransientToken": [
                505
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                519,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        522,
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
                520,
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
                288,
                {
                    "input": [
                        289,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                330,
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
                389
            ],
            "grantApplicationCapabilities": [
                47,
                {
                    "input": [
                        290,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                298,
                {
                    "userId": [
                        522,
                        "UUID!"
                    ],
                    "workspaceId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                305,
                {
                    "input": [
                        304,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                307,
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
                307
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
                        522,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        522
                    ],
                    "threadId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                248
            ],
            "removeAgentChatMessageReaction": [
                22,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        440,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                432,
                {
                    "principal": [
                        429,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        437,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        522,
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
                        522,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        441,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                442,
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
                475,
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
                        522,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                394,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                393,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                500,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                467,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        522,
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
                        443,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                447,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                458,
                {
                    "input": [
                        454,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                61,
                {
                    "applicationId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                295,
                {
                    "connectionParameters": [
                        234,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        522
                    ]
                }
            ],
            "sendAppChannelMessage": [
                466,
                {
                    "input": [
                        465,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                467,
                {
                    "browsingContext": [
                        310
                    ],
                    "channelId": [
                        522
                    ],
                    "fileAttachments": [
                        275,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        522,
                        "[UUID!]"
                    ],
                    "messageId": [
                        522,
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
                        522,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                470,
                {
                    "input": [
                        469,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                474,
                {
                    "input": [
                        473,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                475,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        522
                    ]
                }
            ],
            "sendMessageCampaign": [
                477,
                {
                    "input": [
                        476,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                472,
                {
                    "input": [
                        478,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                40,
                {
                    "input": [
                        480,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                248,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                432,
                {
                    "accessLevel": [
                        428,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        437,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                432,
                {
                    "accessLevel": [
                        428,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        429,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        437,
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
                486,
                {
                    "input": [
                        487
                    ]
                }
            ],
            "signUpInWorkspace": [
                486,
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
                        522
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
                390,
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
                        208,
                        "DateTime!"
                    ],
                    "threadId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                139,
                {
                    "connectedAccountId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                490,
                {
                    "companyContext": [
                        310
                    ],
                    "personContext": [
                        310
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                491
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
                347,
                {
                    "input": [
                        498,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                667,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        310,
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
                        310
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
                507,
                {
                    "input": [
                        506,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                511,
                {
                    "input": [
                        508,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                510,
                {
                    "input": [
                        509,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                515,
                {
                    "input": [
                        512,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                514,
                {
                    "input": [
                        513,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                517,
                {
                    "input": [
                        516,
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
                        522,
                        "UUID!"
                    ],
                    "input": [
                        527,
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
                        208
                    ],
                    "threadIds": [
                        522,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                36,
                {
                    "input": [
                        529,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                340,
                {
                    "input": [
                        530,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                45,
                {
                    "id": [
                        522,
                        "UUID!"
                    ],
                    "input": [
                        531,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                71,
                {
                    "input": [
                        532,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                75,
                {
                    "input": [
                        534,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                126,
                {
                    "input": [
                        536,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                153,
                {
                    "input": [
                        538,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                340,
                {
                    "input": [
                        539,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                283,
                {
                    "input": [
                        541,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                261,
                {
                    "input": [
                        543,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                369,
                {
                    "inputs": [
                        554,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                372,
                {
                    "inputs": [
                        555,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                639,
                {
                    "inputs": [
                        577,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                340,
                {
                    "input": [
                        546,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                347,
                {
                    "input": [
                        548,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                347,
                {
                    "input": [
                        550,
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
                369,
                {
                    "input": [
                        554,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        528,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        522
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
                263,
                {
                    "input": [
                        553,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        544,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                372,
                {
                    "input": [
                        555,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                445,
                {
                    "updateRoleInput": [
                        562,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                393,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        556,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                394,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        557,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        559,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                393,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        561,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                308,
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
                488,
                {
                    "input": [
                        564,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                500,
                {
                    "input": [
                        565,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                525,
                {
                    "input": [
                        566,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                605,
                {
                    "input": [
                        567,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                99,
                {
                    "userCreditsFallback": [
                        620,
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
                625,
                {
                    "input": [
                        568,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                630,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        579,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                633,
                {
                    "input": [
                        572,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                634,
                {
                    "input": [
                        570,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                635,
                {
                    "input": [
                        575,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                636,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        574,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                639,
                {
                    "input": [
                        577,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                642,
                {
                    "input": [
                        580,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                646,
                {
                    "input": [
                        582,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                653,
                {
                    "data": [
                        585,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                653,
                {
                    "data": [
                        584,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                662,
                {
                    "roleId": [
                        522,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        586,
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
                        587,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                274,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        587,
                        "Upload!"
                    ],
                    "fileFolder": [
                        276,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                278,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        587,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                278,
                {
                    "file": [
                        587,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                278,
                {
                    "file": [
                        587,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                278,
                {
                    "file": [
                        587,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                270,
                {
                    "upsertFieldPermissionsInput": [
                        588,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                630,
                {
                    "input": [
                        591,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                380,
                {
                    "upsertObjectPermissionsInput": [
                        592,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                446,
                {
                    "upsertPermissionFlagsInput": [
                        593,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                595,
                {
                    "input": [
                        594,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                630,
                {
                    "input": [
                        596,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                79,
                {
                    "input": [
                        623,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                627,
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
                238,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                628,
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
                522
            ],
            "applicationId": [
                522
            ],
            "color": [
                1
            ],
            "createdAt": [
                208
            ],
            "folderId": [
                522
            ],
            "icon": [
                1
            ],
            "id": [
                522
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                522
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                522
            ],
            "targetRecordId": [
                522
            ],
            "targetRecordIdentifier": [
                425
            ],
            "type": [
                370
            ],
            "updatedAt": [
                208
            ],
            "userWorkspaceId": [
                522
            ],
            "viewId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                522
            ],
            "color": [
                1
            ],
            "createdAt": [
                208
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
                375,
                {
                    "filter": [
                        268,
                        "FieldFilter!"
                    ],
                    "paging": [
                        206,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                263
            ],
            "icon": [
                1
            ],
            "id": [
                522
            ],
            "imageIdentifierFieldMetadataId": [
                522
            ],
            "indexMetadataList": [
                299
            ],
            "indexMetadatas": [
                377,
                {
                    "filter": [
                        302,
                        "IndexFilter!"
                    ],
                    "paging": [
                        206,
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
                522
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
                379
            ],
            "readability": [
                357
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                522
            ],
            "searchFieldMetadataList": [
                464
            ],
            "sharingReach": [
                387
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                208
            ],
            "writability": [
                362
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                374
            ],
            "pageInfo": [
                392
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
                372
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                267
            ],
            "pageInfo": [
                392
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                376
            ],
            "id": [
                523
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
                376
            ],
            "universalIdentifier": [
                523
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                300
            ],
            "pageInfo": [
                392
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                522
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
                522
            ],
            "restrictedFields": [
                310
            ],
            "rowLevelPermissionPredicateGroups": [
                449
            ],
            "rowLevelPermissionPredicates": [
                448
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
                522
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
                207
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                384
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
                310
            ],
            "before": [
                310
            ],
            "diff": [
                310
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
                383
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
                388
            ],
            "previousOnboardingStatus": [
                388
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
                522
            ],
            "createdAt": [
                208
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                522
            ],
            "deletedAt": [
                208
            ],
            "id": [
                522
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
                522
            ],
            "tabs": [
                394
            ],
            "type": [
                396
            ],
            "universalIdentifier": [
                522
            ],
            "updatedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                522
            ],
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "icon": [
                1
            ],
            "id": [
                522
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
                395
            ],
            "pageLayoutId": [
                522
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                522
            ],
            "updatedAt": [
                208
            ],
            "widgets": [
                397
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                522
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                310
            ],
            "configuration": [
                647
            ],
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "gridPosition": [
                292
            ],
            "id": [
                522
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
                522
            ],
            "pageLayoutTabId": [
                522
            ],
            "position": [
                400
            ],
            "title": [
                1
            ],
            "type": [
                649
            ],
            "universalIdentifier": [
                522
            ],
            "updatedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                395
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
                395
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
                398
            ],
            "on_PageLayoutWidgetGridPosition": [
                399
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                402
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                401
            ],
            "index": [
                10
            ],
            "layoutMode": [
                395
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
                522
            ],
            "createdAt": [
                208
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                522
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
                522
            ],
            "updatedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                522
            ],
            "aggregateOperation": [
                26
            ],
            "color": [
                1
            ],
            "configurationType": [
                648
            ],
            "dateGranularity": [
                386
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
                310
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                522
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
                291
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
                409
            ],
            "formattedToRawLookup": [
                310
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
                310
            ],
            "objectMetadataId": [
                522
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
                322
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
                208
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
                339
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                522
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
                235
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
                522
            ],
            "createdAt": [
                208
            ],
            "domain": [
                1
            ],
            "id": [
                522
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
                262
            ],
            "metadata": [
                418
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
                415
            ],
            "IMAP": [
                415
            ],
            "SMTP": [
                415
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
                522
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                671
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
                522
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
                        522,
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
                        522,
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
                        287,
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
                        319
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
                340,
                {
                    "filter": [
                        320
                    ]
                }
            ],
            "appMessageFolders": [
                347,
                {
                    "filter": [
                        321
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                48,
                {
                    "applicationId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                49,
                {
                    "applicationId": [
                        522,
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
                463,
                {
                    "applicationId": [
                        522,
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
                522,
                {
                    "calendarEventId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                20,
                {
                    "threadId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                142,
                {
                    "threadId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                16,
                {
                    "id": [
                        522,
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
                661,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                492,
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
                        522,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                153
            ],
            "currentUser": [
                618
            ],
            "currentUserApplicationAuthorizations": [
                46
            ],
            "currentUserSessions": [
                621
            ],
            "currentWorkspace": [
                653
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
                249
            ],
            "eventLogs": [
                256,
                {
                    "input": [
                        255,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                51,
                {
                    "universalIdentifier": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                263,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                265,
                {
                    "filter": [
                        268,
                        "FieldFilter!"
                    ],
                    "paging": [
                        206,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                414,
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
                        208
                    ],
                    "periodStart": [
                        208
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
                        208
                    ],
                    "periodStart": [
                        208
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
                313,
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
                323
            ],
            "findManyMarketplaceApps": [
                331,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                416
            ],
            "findMarketplaceAppDetail": [
                332,
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
                        522
                    ],
                    "universalIdentifier": [
                        522
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
                323,
                {
                    "input": [
                        327,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                313,
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
                313,
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
                655
            ],
            "findWorkspaceFromInviteHash": [
                653,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                660
            ],
            "frontComponent": [
                283,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                283
            ],
            "getAddressDetails": [
                410,
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
                445
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
                310,
                {
                    "input": [
                        327,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                159,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                238
            ],
            "getInviteSuggestions": [
                309
            ],
            "getJobs": [
                313,
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
                        327,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                393,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                394,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                394,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                397,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                397,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                393,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        396
                    ]
                }
            ],
            "getPermissionFlags": [
                404
            ],
            "getPublicWorkspaceDataByDomain": [
                420,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                421,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                115
            ],
            "getRole": [
                445,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                445
            ],
            "getSSOIdentityProviders": [
                280
            ],
            "getToolIndex": [
                504
            ],
            "getToolInputSchema": [
                310,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                602,
                {
                    "input": [
                        603
                    ]
                }
            ],
            "getView": [
                630,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                633,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                634,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                634,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                633,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                635,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                636,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                636,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                635,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                639,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                639,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                642,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                642,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                630,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        644,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                658
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
                315,
                {
                    "input": [
                        316,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                106
            ],
            "messageSuppressions": [
                352,
                {
                    "input": [
                        281,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                358,
                {
                    "input": [
                        361,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                363
            ],
            "mostlyEmptyFieldMetadataIds": [
                522,
                {
                    "objectMetadataId": [
                        522,
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
                        522
                    ]
                }
            ],
            "myConnectedAccounts": [
                157
            ],
            "myMessageChannels": [
                340,
                {
                    "connectedAccountId": [
                        522
                    ]
                }
            ],
            "myMessageFolders": [
                347,
                {
                    "messageChannelId": [
                        522
                    ]
                }
            ],
            "myUserApplicationVariables": [
                663
            ],
            "navigationMenuItem": [
                369,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                369
            ],
            "object": [
                372,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                382
            ],
            "objects": [
                373,
                {
                    "filter": [
                        376,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        206,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                407,
                {
                    "input": [
                        408,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                134,
                {
                    "input": [
                        411,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                413,
                {
                    "input": [
                        412,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                332,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                331,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                427,
                {
                    "targets": [
                        437,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                432,
                {
                    "target": [
                        437,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                488,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                488
            ],
            "timelineActivityTypes": [
                500
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                521,
                {
                    "userId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                525
            ],
            "usageLimits": [
                605
            ],
            "usageQuotaDefinitions": [
                609
            ],
            "usageQuotaScopeConsumption": [
                611,
                {
                    "input": [
                        612,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                613
            ],
            "validatePasswordResetToken": [
                624,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                625,
                {
                    "objectMetadataId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                646,
                {
                    "id": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                646
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                522
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
                522
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
                522
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
                522
            ],
            "permissions": [
                426
            ],
            "recordId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                522
            ],
            "workspaceMemberId": [
                522
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
                428
            ],
            "generalAccessLevel": [
                428
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                426
            ],
            "roles": [
                435
            ],
            "shares": [
                433
            ],
            "sharingMode": [
                434
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                428
            ],
            "id": [
                17
            ],
            "principalId": [
                522
            ],
            "principalRoleId": [
                522
            ],
            "principalType": [
                430
            ],
            "rowCause": [
                431
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
                522
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
                648
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
                522
            ],
            "recordId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                263
            ],
            "sourceObjectMetadata": [
                372
            ],
            "targetFieldMetadata": [
                263
            ],
            "targetObjectMetadata": [
                372
            ],
            "type": [
                439
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
                522
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
                522
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
                270
            ],
            "icon": [
                1
            ],
            "id": [
                522
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                380
            ],
            "permissionFlags": [
                446
            ],
            "rowLevelPermissionPredicateGroups": [
                449
            ],
            "rowLevelPermissionPredicates": [
                448
            ],
            "universalIdentifier": [
                522
            ],
            "workspaceMembers": [
                662
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
                522
            ],
            "roleId": [
                522
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
                453
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
                310
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
                451
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
                522
            ],
            "logicalOperator": [
                451
            ],
            "objectMetadataId": [
                522
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                522
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
                522
            ],
            "id": [
                522
            ],
            "operand": [
                453
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "rowLevelPermissionPredicateGroupId": [
                522
            ],
            "subFieldName": [
                1
            ],
            "value": [
                310
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
                456
            ],
            "messages": [
                456
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                310
            ],
            "runAsWorkspaceMemberId": [
                522
            ],
            "thread": [
                459
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
                522
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
                455
            ],
            "content": [
                1
            ],
            "role": [
                457
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
                310
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                522
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
                522
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                462
            ],
            "type": [
                293
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                522
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                462
            ],
            "type": [
                293
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
                208
            ],
            "fieldMetadataId": [
                522
            ],
            "id": [
                522
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                522
            ],
            "updatedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageInput": {
            "idempotencyKey": [
                522
            ],
            "messageChannelId": [
                522
            ],
            "messageThreadId": [
                522
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
                522
            ],
            "messageThreadId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                522
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
                468
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
                471
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
                522
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
                310
            ],
            "workspaceMemberIds": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                522
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
                660
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
                208
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
                310
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                522
            ],
            "createdAt": [
                208
            ],
            "frontComponentId": [
                522
            ],
            "icon": [
                1
            ],
            "id": [
                522
            ],
            "position": [
                6
            ],
            "scope": [
                482
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                522
            ],
            "updatedAt": [
                208
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
                522
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
                522
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                462
            ],
            "type": [
                293
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
                672
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
                522
            ],
            "content": [
                1
            ],
            "createdAt": [
                208
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                522
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
                208
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                444
            ],
            "configurationType": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                670
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
                257,
                {
                    "fieldFilters": [
                        251,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        258,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                424,
                {
                    "input": [
                        191,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                328,
                {
                    "input": [
                        329,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                13,
                {
                    "threadId": [
                        522,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                259,
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
                497
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                648
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
                522
            ],
            "createdAt": [
                208
            ],
            "emit": [
                501
            ],
            "frontComponentUniversalIdentifier": [
                522
            ],
            "icon": [
                1
            ],
            "id": [
                522
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
                522
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                522
            ],
            "universalIdentifier": [
                522
            ],
            "updatedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                522
            ],
            "on": [
                1
            ],
            "through": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                522
            ],
            "relationFieldUniversalIdentifier": [
                522
            ],
            "triggerFieldUniversalIdentifiers": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                648
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
                310
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
                522
            ],
            "personFilter": [
                310
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                208
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
                208
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                522
            ],
            "gt": [
                522
            ],
            "gte": [
                522
            ],
            "iLike": [
                522
            ],
            "in": [
                522
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                522
            ],
            "lt": [
                522
            ],
            "lte": [
                522
            ],
            "neq": [
                522
            ],
            "notILike": [
                522
            ],
            "notIn": [
                522
            ],
            "notLike": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                208
            ],
            "description": [
                1
            ],
            "id": [
                522
            ],
            "name": [
                1
            ],
            "updatedAt": [
                208
            ],
            "visibility": [
                526
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
                522
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
                522
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                310
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
                310
            ],
            "roleId": [
                522
            ],
            "triggers": [
                310
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
                522
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
                522
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                522
            ],
            "visibility": [
                346
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
                533
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
                535
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
                522
            ],
            "update": [
                537
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
                522
            ],
            "availabilityType": [
                154
            ],
            "engineComponentKey": [
                242
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                522
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                522
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                310
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
                310
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                522
            ],
            "options": [
                310
            ],
            "settings": [
                310
            ],
            "translations": [
                359
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
                522
            ],
            "update": [
                542
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
                522
            ],
            "update": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                310
            ],
            "databaseEventTriggerSettings": [
                310
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                310
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
                310
            ],
            "workflowActionTriggerSettings": [
                310
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                522
            ],
            "update": [
                547
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                341
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
                348
            ],
            "visibility": [
                346
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                522
            ],
            "update": [
                549
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
                522
            ],
            "update": [
                549
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
                522
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
                522
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
                522
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
                522
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
                379
            ],
            "readability": [
                357
            ],
            "sharingReach": [
                387
            ],
            "shortcut": [
                1
            ],
            "translations": [
                359
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                522
            ],
            "update": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                522
            ],
            "update": [
                551
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                522
            ],
            "update": [
                552
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
                522
            ],
            "type": [
                396
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
                395
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
                522
            ],
            "layoutMode": [
                395
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                560
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
                310
            ],
            "configuration": [
                310
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                522
            ],
            "pageLayoutTabId": [
                522
            ],
            "position": [
                310
            ],
            "title": [
                1
            ],
            "type": [
                649
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
                310
            ],
            "configuration": [
                310
            ],
            "id": [
                522
            ],
            "objectMetadataId": [
                522
            ],
            "pageLayoutTabId": [
                522
            ],
            "position": [
                310
            ],
            "title": [
                1
            ],
            "type": [
                649
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
                522
            ],
            "tabs": [
                558
            ],
            "type": [
                396
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                522
            ],
            "update": [
                563
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
                522
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
                522
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                359
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
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                522
            ],
            "payload": [
                195
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                522
            ],
            "update": [
                569
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
                522
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
                522
            ],
            "update": [
                571
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
                522
            ],
            "update": [
                573
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                522
            ],
            "logicalOperator": [
                637
            ],
            "parentViewFilterGroupId": [
                522
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                522
            ],
            "update": [
                576
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                522
            ],
            "operand": [
                638
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                522
            ],
            "subFieldName": [
                1
            ],
            "value": [
                310
            ],
            "viewFilterGroupId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                522
            ],
            "update": [
                578
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                522
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
                522
            ],
            "calendarFieldMetadataId": [
                522
            ],
            "calendarLayout": [
                631
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                522
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                522
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                522
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                641
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                644
            ],
            "visibility": [
                645
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                522
            ],
            "update": [
                581
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                643
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
                522
            ],
            "update": [
                583
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
                310
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                522
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
                659
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                310
            ],
            "workspaceMemberId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                271
            ],
            "roleId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                522
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                589
            ],
            "id": [
                522
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
                589
            ],
            "groups": [
                590
            ],
            "widgetId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                381
            ],
            "roleId": [
                522
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                522
            ],
            "predicateGroups": [
                450
            ],
            "predicates": [
                452
            ],
            "roleId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                449
            ],
            "predicates": [
                448
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                600
            ],
            "viewFields": [
                597
            ],
            "viewFilterGroups": [
                598
            ],
            "viewFilters": [
                599
            ],
            "viewSorts": [
                601
            ],
            "widgetId": [
                522
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
                522
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
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                522
            ],
            "logicalOperator": [
                637
            ],
            "parentViewFilterGroupId": [
                522
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
                522
            ],
            "id": [
                522
            ],
            "operand": [
                638
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                522
            ],
            "subFieldName": [
                1
            ],
            "value": [
                310
            ],
            "viewFilterGroupId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                522
            ],
            "calendarFieldMetadataId": [
                522
            ],
            "calendarLayout": [
                631
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                522
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                522
            ],
            "openRecordIn": [
                641
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                644
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                643
            ],
            "fieldMetadataId": [
                522
            ],
            "id": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                208
            ],
            "periodStart": [
                208
            ],
            "timeSeries": [
                615
            ],
            "usageByApplication": [
                604
            ],
            "usageByModel": [
                604
            ],
            "usageByOperationType": [
                604
            ],
            "usageByUser": [
                604
            ],
            "userDailyUsage": [
                617
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                607
            ],
            "periodEnd": [
                208
            ],
            "periodStart": [
                208
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
                208
            ],
            "id": [
                522
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                97
            ],
            "operationType": [
                607
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                614
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                616
            ],
            "updatedAt": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                616
            ],
            "operationType": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                606
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                610
            ],
            "resourceType": [
                614
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                608
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
                607
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                616
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
                208
            ],
            "periodStart": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                607
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                614
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                616
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
                522
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                97
            ],
            "operationType": [
                607
            ],
            "periodEnd": [
                208
            ],
            "periodStart": [
                208
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                97
            ],
            "resourceType": [
                614
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
                616
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
                615
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
                208
            ],
            "currentUserWorkspace": [
                622
            ],
            "currentWorkspace": [
                653
            ],
            "deletedAt": [
                208
            ],
            "deletedWorkspaceMembers": [
                221
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
                522
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
                388
            ],
            "previousOnboardingStatus": [
                388
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                208
            ],
            "userVars": [
                311
            ],
            "userWorkspaces": [
                622
            ],
            "workspaceMember": [
                662
            ],
            "workspaceMembers": [
                662
            ],
            "workspaces": [
                622
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
                310
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
                208
            ],
            "expiresAt": [
                208
            ],
            "id": [
                522
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
                208
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "id": [
                522
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                380
            ],
            "objectsPermissions": [
                380
            ],
            "permissionFlags": [
                405
            ],
            "twoFactorAuthenticationMethodSummary": [
                518
            ],
            "updatedAt": [
                208
            ],
            "user": [
                618
            ],
            "userId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                522
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
                522
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
                522
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                522
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
                522
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
                671
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
                522
            ],
            "calendarEndFieldMetadataId": [
                522
            ],
            "calendarFieldMetadataId": [
                522
            ],
            "calendarLayout": [
                631
            ],
            "createdAt": [
                208
            ],
            "createdByUserWorkspaceId": [
                522
            ],
            "deletedAt": [
                208
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                522
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
                522
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                640
            ],
            "mainGroupByFieldMetadataId": [
                522
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                522
            ],
            "openRecordIn": [
                641
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                644
            ],
            "universalIdentifier": [
                522
            ],
            "updatedAt": [
                208
            ],
            "viewFieldGroups": [
                634
            ],
            "viewFields": [
                633
            ],
            "viewFilterGroups": [
                636
            ],
            "viewFilters": [
                635
            ],
            "viewGroups": [
                639
            ],
            "viewSorts": [
                642
            ],
            "visibility": [
                645
            ],
            "workspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                648
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
                522
            ],
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "fieldMetadataId": [
                522
            ],
            "id": [
                522
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
                522
            ],
            "updatedAt": [
                208
            ],
            "viewFieldGroupId": [
                522
            ],
            "viewId": [
                522
            ],
            "workspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "id": [
                522
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
                208
            ],
            "viewFields": [
                633
            ],
            "viewId": [
                522
            ],
            "workspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "fieldMetadataId": [
                522
            ],
            "id": [
                522
            ],
            "operand": [
                638
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                522
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                208
            ],
            "value": [
                310
            ],
            "viewFilterGroupId": [
                522
            ],
            "viewId": [
                522
            ],
            "workspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "id": [
                522
            ],
            "logicalOperator": [
                637
            ],
            "parentViewFilterGroupId": [
                522
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                208
            ],
            "viewId": [
                522
            ],
            "workspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "fieldValue": [
                1
            ],
            "id": [
                522
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                208
            ],
            "viewId": [
                522
            ],
            "workspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "direction": [
                643
            ],
            "fieldMetadataId": [
                522
            ],
            "id": [
                522
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                208
            ],
            "viewId": [
                522
            ],
            "workspaceId": [
                522
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
                522
            ],
            "createdAt": [
                208
            ],
            "deletedAt": [
                208
            ],
            "description": [
                1
            ],
            "id": [
                522
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
                208
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
                237
            ],
            "on_EmailsConfiguration": [
                241
            ],
            "on_FieldConfiguration": [
                264
            ],
            "on_FieldRichTextConfiguration": [
                272
            ],
            "on_FieldsConfiguration": [
                273
            ],
            "on_FilesConfiguration": [
                279
            ],
            "on_FormFieldConfiguration": [
                282
            ],
            "on_FrontComponentConfiguration": [
                284
            ],
            "on_IframeConfiguration": [
                294
            ],
            "on_LineChartConfiguration": [
                314
            ],
            "on_MessageCampaignBodyConfiguration": [
                337
            ],
            "on_MessageCampaignDetailsConfiguration": [
                338
            ],
            "on_NotesConfiguration": [
                371
            ],
            "on_PieChartConfiguration": [
                406
            ],
            "on_RecordTableConfiguration": [
                436
            ],
            "on_StandaloneRichTextConfiguration": [
                489
            ],
            "on_TasksConfiguration": [
                499
            ],
            "on_TimelineConfiguration": [
                503
            ],
            "on_ViewConfiguration": [
                632
            ],
            "on_WorkflowConfiguration": [
                650
            ],
            "on_WorkflowRunConfiguration": [
                651
            ],
            "on_WorkflowVersionConfiguration": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                654
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
                310
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
                208
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
                445
            ],
            "deletedAt": [
                208
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
                261
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                522
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
                522
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
                208
            ],
            "viewFields": [
                633
            ],
            "viewFilterGroups": [
                636
            ],
            "viewFilters": [
                635
            ],
            "viewGroups": [
                639
            ],
            "viewSorts": [
                642
            ],
            "views": [
                630
            ],
            "workspaceCustomApplication": [
                45
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                659
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                671
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
                310
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                656
            ],
            "personEnrichment": [
                310
            ],
            "personOutcome": [
                669
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
                208
            ],
            "id": [
                522
            ],
            "roleId": [
                522
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
                664
            ],
            "id": [
                522
            ],
            "locale": [
                1
            ],
            "name": [
                286
            ],
            "numberFormat": [
                665
            ],
            "openRecordIn": [
                391
            ],
            "roles": [
                445
            ],
            "timeFormat": [
                666
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
                522
            ],
            "userWorkspaceId": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                522
            ],
            "variables": [
                619
            ],
            "workspaceMemberId": [
                522
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
                310
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
                522
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
                522
            ],
            "workspaceUrls": [
                671
            ],
            "__typename": [
                1
            ]
        }
    }
}