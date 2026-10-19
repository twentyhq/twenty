export default {
    "scalars": [
        1,
        4,
        6,
        8,
        10,
        11,
        18,
        20,
        22,
        25,
        27,
        34,
        46,
        54,
        62,
        68,
        80,
        84,
        85,
        87,
        92,
        97,
        103,
        108,
        114,
        117,
        118,
        119,
        120,
        128,
        130,
        144,
        148,
        150,
        152,
        196,
        197,
        224,
        228,
        229,
        231,
        241,
        247,
        251,
        255,
        258,
        265,
        280,
        282,
        292,
        299,
        300,
        301,
        312,
        314,
        328,
        329,
        330,
        331,
        332,
        333,
        335,
        336,
        337,
        340,
        341,
        343,
        344,
        347,
        349,
        353,
        357,
        366,
        373,
        374,
        375,
        378,
        382,
        383,
        388,
        392,
        413,
        415,
        416,
        419,
        424,
        436,
        438,
        442,
        447,
        464,
        476,
        477,
        479,
        503,
        505,
        507,
        567,
        587,
        594,
        596,
        600,
        611,
        617,
        618,
        620,
        621,
        623,
        624,
        625,
        628,
        629,
        634,
        636,
        639,
        644,
        645,
        646,
        649,
        650
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
                299
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
                503
            ],
            "createdAt": [
                197
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                503
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
                299
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
                299
            ],
            "roleId": [
                503
            ],
            "triggers": [
                299
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatEvent": {
            "event": [
                299
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
                8
            ],
            "openThreadCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "AgentChatThread": {
            "contextWindowTokens": [
                8
            ],
            "conversationSize": [
                8
            ],
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "id": [
                10
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                8
            ],
            "totalInputCredits": [
                11
            ],
            "totalInputTokens": [
                8
            ],
            "totalOutputCredits": [
                11
            ],
            "totalOutputTokens": [
                8
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                197
            ],
            "id": [
                503
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                197
            ],
            "lastReadAt": [
                197
            ],
            "snoozedUntil": [
                197
            ],
            "threadId": [
                503
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                503
            ],
            "createdAt": [
                197
            ],
            "id": [
                503
            ],
            "parts": [
                15
            ],
            "processedAt": [
                197
            ],
            "reactions": [
                16
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                503
            ],
            "senderWorkspaceMemberId": [
                503
            ],
            "status": [
                1
            ],
            "threadId": [
                503
            ],
            "turnId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                197
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                503
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                503
            ],
            "messageId": [
                503
            ],
            "orderIndex": [
                8
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                299
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
                299
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                299
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
                503
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                197
            ],
            "creatorName": [
                1
            ],
            "creatorSource": [
                1
            ],
            "credits": [
                11
            ],
            "endedAt": [
                197
            ],
            "errorMessage": [
                1
            ],
            "id": [
                503
            ],
            "input": [
                1
            ],
            "inputTokens": [
                8
            ],
            "modelId": [
                1
            ],
            "outputTokens": [
                8
            ],
            "reply": [
                1
            ],
            "startedAt": [
                197
            ],
            "status": [
                18
            ],
            "threadId": [
                503
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
                503
            ],
            "aggregateOperation": [
                20
            ],
            "configurationType": [
                628
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                299
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "label": [
                1
            ],
            "numberFormat": [
                130
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                408
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
                87
            ],
            "kind": [
                1
            ],
            "limitValue": [
                87
            ],
            "periodEnd": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "AiModelTier": {},
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                8
            ],
            "sections": [
                24
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
                8
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
                11
            ],
            "__typename": [
                1
            ]
        },
        "ApiKey": {
            "createdAt": [
                197
            ],
            "expiresAt": [
                197
            ],
            "id": [
                503
            ],
            "name": [
                1
            ],
            "revokedAt": [
                197
            ],
            "role": [
                430
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                197
            ],
            "id": [
                503
            ],
            "name": [
                1
            ],
            "revokedAt": [
                197
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
                10
            ],
            "name": [
                1
            ],
            "providerName": [
                1
            ],
            "scope": [
                148
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
                34
            ],
            "value": [
                299
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageInput": {
            "externalId": [
                1
            ],
            "participants": [
                36
            ],
            "receivedAt": [
                197
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
                503
            ],
            "role": [
                337
            ],
            "workspaceMemberId": [
                503
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
                64
            ],
            "applicationRegistrationId": [
                503
            ],
            "applicationVariables": [
                67
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                299
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                143
            ],
            "createdAt": [
                197
            ],
            "defaultLogicFunctionRole": [
                430
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                272
            ],
            "healthCheckLogicFunctionId": [
                503
            ],
            "id": [
                503
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                311
            ],
            "logoFileId": [
                503
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                359
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                503
            ],
            "settingsCustomTabFrontComponentId": [
                503
            ],
            "settingsMenuItems": [
                463
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                503
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                197
            ],
            "id": [
                503
            ],
            "lastAuthorizedAt": [
                197
            ],
            "lastUsedAt": [
                197
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                503
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                503
            ],
            "archivedAt": [
                197
            ],
            "authFailedAt": [
                197
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                404
            ],
            "connectionProviderId": [
                503
            ],
            "createdAt": [
                197
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                503
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                197
            ],
            "lastSignedInAt": [
                197
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                148
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                197
            ],
            "userWorkspaceId": [
                503
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
                503
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                42
            ],
            "scope": [
                152
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
                44
            ],
            "coverage": [
                45
            ],
            "files": [
                47
            ],
            "manifest": [
                299
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
                62
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
                46
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
                503
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
                265
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
                265
            ],
            "filePath": [
                1
            ],
            "size": [
                8
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
                197
            ],
            "fileFolder": [
                265
            ],
            "fileId": [
                503
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
                52
            ],
            "description": [
                1
            ],
            "status": [
                54
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
                56
            ],
            "bucketSizeInSeconds": [
                8
            ],
            "failedRunCount": [
                8
            ],
            "functions": [
                57
            ],
            "issues": [
                58
            ],
            "lifecycle": [
                59
            ],
            "lifecycleFailureCount": [
                8
            ],
            "lookbackInHours": [
                8
            ],
            "periodEnd": [
                197
            ],
            "periodStart": [
                197
            ],
            "rateLimitEventCount": [
                8
            ],
            "runCount": [
                8
            ],
            "versions": [
                60
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                197
            ],
            "errorCount": [
                8
            ],
            "infoCount": [
                8
            ],
            "warningCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringFunction": {
            "failedRunCount": [
                8
            ],
            "logicFunctionName": [
                1
            ],
            "p95DurationMs": [
                11
            ],
            "runCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringIssue": {
            "affectedInstallCount": [
                8
            ],
            "errorCode": [
                1
            ],
            "eventCount": [
                8
            ],
            "lastSeenAt": [
                197
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
                197
            ],
            "failedCount": [
                8
            ],
            "installCount": [
                8
            ],
            "uninstallCount": [
                8
            ],
            "upgradeCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringVersion": {
            "activeInstallCount": [
                8
            ],
            "failedRunCount": [
                8
            ],
            "runCount": [
                8
            ],
            "version": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                197
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                503
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
                503
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                62
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSourceType": {},
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                8
            ],
            "autoUpdateEnabled": [
                8
            ],
            "creditsUsedBreakdown": [
                194
            ],
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                8
            ],
            "totalCreditsUsed": [
                11
            ],
            "versionDistribution": [
                609
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                503
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                62
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                197
            ],
            "description": [
                1
            ],
            "id": [
                503
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
                299
            ],
            "type": [
                1
            ],
            "updatedAt": [
                197
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
                72
            ],
            "applicationRefreshToken": [
                72
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
                503
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
                299
            ],
            "scope": [
                68
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
                197
            ],
            "domain": [
                1
            ],
            "id": [
                503
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
                446
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                197
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
                72
            ],
            "refreshToken": [
                72
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                73
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
                503
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
                445
            ],
            "workspaceUrls": [
                651
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                77
            ],
            "availableWorkspacesForSignUp": [
                77
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                78
            ],
            "tokens": [
                73
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                503
            ],
            "aggregateOperation": [
                20
            ],
            "axisNameDisplay": [
                80
            ],
            "color": [
                1
            ],
            "configurationType": [
                628
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
                299
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "groupMode": [
                84
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                85
            ],
            "numberFormat": [
                130
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                373
            ],
            "primaryAxisGroupByFieldMetadataId": [
                503
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                280
            ],
            "rangeMax": [
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                373
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                503
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                280
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
                299
            ],
            "formattedToRawLookup": [
                299
            ],
            "groupMode": [
                84
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
                85
            ],
            "series": [
                86
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
                299
            ],
            "objectMetadataId": [
                503
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
                112
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
                503
            ],
            "userCreditsFallback": [
                600
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
                107
            ],
            "currentBillingSubscription": [
                107
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                92
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
                104
            ],
            "name": [
                1
            ],
            "prices": [
                98
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
                104
            ],
            "name": [
                1
            ],
            "prices": [
                99
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
                93
            ],
            "downgradePlanKeys": [
                97
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                94
            ],
            "planKey": [
                97
            ],
            "resourceCreditProducts": [
                93
            ],
            "upgradePlanKeys": [
                97
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingPriceLicensed": {
            "creditAmount": [
                11
            ],
            "isSellable": [
                4
            ],
            "priceUsageType": [
                114
            ],
            "recurringInterval": [
                476
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "priceUsageType": [
                114
            ],
            "recurringInterval": [
                476
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                100
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceTier": {
            "flatAmount": [
                11
            ],
            "unitAmount": [
                11
            ],
            "upTo": [
                11
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
                104
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
                104
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                93
            ],
            "on_BillingMeteredProduct": [
                94
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
                97
            ],
            "priceUsageBased": [
                114
            ],
            "productKey": [
                103
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                197
            ],
            "periodStart": [
                197
            ],
            "productKey": [
                103
            ],
            "unitPriceCents": [
                11
            ],
            "userCreditsUsed": [
                11
            ],
            "workspaceCreditsExtraGranted": [
                11
            ],
            "workspaceCreditsGranted": [
                11
            ],
            "workspaceCreditsTotalGranted": [
                11
            ],
            "workspaceCreditsUsed": [
                11
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
                109
            ],
            "cancelAt": [
                197
            ],
            "collectionMethod": [
                108
            ],
            "currentPeriodEnd": [
                197
            ],
            "id": [
                503
            ],
            "interval": [
                476
            ],
            "metadata": [
                299
            ],
            "phases": [
                110
            ],
            "status": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                102
            ],
            "creditAmount": [
                11
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                503
            ],
            "quantity": [
                11
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                11
            ],
            "items": [
                111
            ],
            "start_date": [
                11
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
                11
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                11
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
                107
            ],
            "currentBillingSubscription": [
                107
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
                503
            ],
            "contactAutoCreationPolicy": [
                117
            ],
            "createdAt": [
                197
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                503
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                118
            ],
            "syncStageStartedAt": [
                197
            ],
            "syncStatus": [
                119
            ],
            "syncedAt": [
                197
            ],
            "throttleFailureCount": [
                11
            ],
            "updatedAt": [
                197
            ],
            "visibility": [
                120
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
                628
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "CampaignAudiencePreviewDTO": {
            "duplicateEmails": [
                8
            ],
            "globallyUnsubscribed": [
                8
            ],
            "hardSuppressed": [
                8
            ],
            "sendable": [
                8
            ],
            "topicUnsubscribed": [
                8
            ],
            "totalMembers": [
                8
            ],
            "trackingRefused": [
                8
            ],
            "withoutEmail": [
                8
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
                8
            ],
            "__typename": [
                1
            ]
        },
        "Captcha": {
            "provider": [
                128
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
                628
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                299
            ],
            "error": [
                133
            ],
            "maxSeq": [
                8
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
                628
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                11
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
                11
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
                11
            ],
            "maxScoreLevels": [
                11
            ],
            "medianLatencyMs": [
                11
            ],
            "modelId": [
                1
            ],
            "outputCostPerMillionTokens": [
                11
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
                11
            ],
            "costPerTask": [
                11
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
                11
            ],
            "intelligenceIndex": [
                11
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
                11
            ],
            "modelFamily": [
                353
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                355
            ],
            "outputCostPerMillionTokens": [
                11
            ],
            "outputTokensPerSecond": [
                11
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
                22
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                137
            ],
            "aiModelTiers": [
                139
            ],
            "aiModels": [
                138
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                28
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                71
            ],
            "billing": [
                88
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                127
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
                141
            ],
            "publicFeatureFlags": [
                402
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                461
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                197
            ],
            "link": [
                1
            ],
            "startAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                25
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
                503
            ],
            "availabilityObjectMetadataId": [
                503
            ],
            "availabilityType": [
                144
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                503
            ],
            "createdAt": [
                197
            ],
            "engineComponentKey": [
                231
            ],
            "frontComponent": [
                272
            ],
            "frontComponentId": [
                503
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                503
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
                503
            ],
            "pageLayoutId": [
                503
            ],
            "payload": [
                145
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                503
            ],
            "updatedAt": [
                197
            ],
            "workflowVersionId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                365
            ],
            "on_PathCommandMenuItemPayload": [
                390
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                48
            ],
            "files": [
                263
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                503
            ],
            "archivedAt": [
                197
            ],
            "authFailedAt": [
                197
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                404
            ],
            "connectionProviderId": [
                503
            ],
            "createdAt": [
                197
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                503
            ],
            "lastCredentialsRefreshedAt": [
                197
            ],
            "lastSignedInAt": [
                197
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                148
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                197
            ],
            "userWorkspaceId": [
                503
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
                285
            ],
            "handle": [
                1
            ],
            "id": [
                503
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                224
            ],
            "host": [
                1
            ],
            "password": [
                1
            ],
            "port": [
                11
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionProviderScope": {},
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
                299
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
                299
            ],
            "roleId": [
                503
            ],
            "triggers": [
                299
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                503
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                333
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                49
            ],
            "targets": [
                51
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                61
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
                503
            ],
            "availabilityType": [
                144
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                503
            ],
            "engineComponentKey": [
                231
            ],
            "frontComponentId": [
                503
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
                503
            ],
            "pageLayoutId": [
                503
            ],
            "payload": [
                299
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                503
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
                327
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
                299
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
                299
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                503
            ],
            "options": [
                299
            ],
            "relationCreationPayload": [
                299
            ],
            "settings": [
                299
            ],
            "type": [
                258
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
                503
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
                503
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
                168
            ],
            "indexType": [
                292
            ],
            "objectMetadataId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                299
            ],
            "databaseEventTriggerSettings": [
                299
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                299
            ],
            "id": [
                503
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                299
            ],
            "source": [
                299
            ],
            "timeoutSeconds": [
                11
            ],
            "toolTriggerSettings": [
                299
            ],
            "universalIdentifier": [
                503
            ],
            "workflowActionTriggerSettings": [
                299
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "color": [
                1
            ],
            "folderId": [
                503
            ],
            "icon": [
                1
            ],
            "id": [
                503
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                503
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                503
            ],
            "targetRecordId": [
                503
            ],
            "type": [
                357
            ],
            "userWorkspaceId": [
                503
            ],
            "viewId": [
                503
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
                299
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
                166
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                169
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                173
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
                503
            ],
            "type": [
                383
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                382
            ],
            "pageLayoutId": [
                503
            ],
            "position": [
                11
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
                299
            ],
            "objectMetadataId": [
                503
            ],
            "pageLayoutTabId": [
                503
            ],
            "position": [
                299
            ],
            "title": [
                1
            ],
            "type": [
                629
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                503
            ],
            "filter": [
                299
            ],
            "objectMetadataId": [
                503
            ],
            "orderBy": [
                299
            ],
            "__typename": [
                1
            ]
        },
        "CreateRoleInput": {
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
                503
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
                507
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                87
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                87
            ],
            "operationType": [
                587
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                594
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                596
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
                503
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                503
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                11
            ],
            "viewId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                20
            ],
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "size": [
                11
            ],
            "viewFieldGroupId": [
                503
            ],
            "viewId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                503
            ],
            "logicalOperator": [
                617
            ],
            "parentViewFilterGroupId": [
                503
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "operand": [
                618
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                503
            ],
            "subFieldName": [
                1
            ],
            "value": [
                299
            ],
            "viewFilterGroupId": [
                503
            ],
            "viewId": [
                503
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
                503
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewId": [
                503
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
                503
            ],
            "calendarFieldMetadataId": [
                503
            ],
            "calendarLayout": [
                611
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                503
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                503
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                620
            ],
            "mainGroupByFieldMetadataId": [
                503
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                503
            ],
            "openRecordIn": [
                621
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                624
            ],
            "visibility": [
                625
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                623
            ],
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                503
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
                503
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
                11
            ],
            "label": [
                1
            ],
            "operation": [
                587
            ],
            "resource": [
                594
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                150
            ],
            "before": [
                150
            ],
            "first": [
                8
            ],
            "last": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "DatabaseEventAction": {},
        "DateTime": {},
        "DeleteApprovedAccessDomainInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                503
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                503
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
                503
            ],
            "name": [
                275
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                503
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
                503
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                217
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
                503
            ],
            "pageLayoutId": [
                503
            ],
            "position": [
                11
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
                503
            ],
            "memberCount": [
                11
            ],
            "name": [
                1
            ],
            "position": [
                11
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
                503
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                447
            ],
            "type": [
                282
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                503
            ],
            "status": [
                447
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                151
            ],
            "IMAP": [
                151
            ],
            "SMTP": [
                151
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
                628
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                197
            ],
            "domain": [
                1
            ],
            "id": [
                503
            ],
            "status": [
                228
            ],
            "tenantStatus": [
                229
            ],
            "unsubscribeHostnameStatus": [
                505
            ],
            "updatedAt": [
                197
            ],
            "verificationRecords": [
                606
            ],
            "verifiedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "EngineComponentKey": {},
        "EnqueueJobInput": {
            "delayMs": [
                8
            ],
            "jobId": [
                1
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payload": [
                299
            ],
            "retryLimit": [
                8
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
                299
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
                8
            ],
            "jobs": [
                233
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                299
            ],
            "retryLimit": [
                8
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
                8
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
                197
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
                197
            ],
            "currentPeriodEnd": [
                197
            ],
            "expiresAt": [
                197
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
                197
            ],
            "start": [
                197
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
                241
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
                239
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                240
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
                242
            ],
            "first": [
                8
            ],
            "table": [
                247
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                243
            ],
            "records": [
                246
            ],
            "totalCount": [
                8
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
                299
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                197
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
                342
            ],
            "objectRecordEventsWithQueryIds": [
                372
            ],
            "queueJobEvents": [
                302
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                503
            ],
            "payload": [
                299
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                251
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
                503
            ],
            "createdAt": [
                197
            ],
            "defaultValue": [
                299
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                503
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
                503
            ],
            "morphRelations": [
                423
            ],
            "name": [
                1
            ],
            "object": [
                359
            ],
            "objectMetadataId": [
                503
            ],
            "options": [
                299
            ],
            "relation": [
                423
            ],
            "settings": [
                299
            ],
            "type": [
                258
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                197
            ],
            "writability": [
                349
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                628
            ],
            "fieldDisplayMode": [
                255
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
                256
            ],
            "pageInfo": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                150
            ],
            "node": [
                252
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                257
            ],
            "id": [
                504
            ],
            "isActive": [
                115
            ],
            "isSystem": [
                115
            ],
            "isUIEditable": [
                115
            ],
            "isUIReadOnly": [
                115
            ],
            "objectMetadataId": [
                504
            ],
            "or": [
                257
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
                503
            ],
            "id": [
                503
            ],
            "objectMetadataId": [
                503
            ],
            "roleId": [
                503
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
                503
            ],
            "objectMetadataId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                628
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
                197
            ],
            "id": [
                503
            ],
            "path": [
                1
            ],
            "size": [
                11
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
                503
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
                197
            ],
            "fileId": [
                503
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
                197
            ],
            "id": [
                503
            ],
            "path": [
                1
            ],
            "size": [
                11
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
                628
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                503
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                447
            ],
            "type": [
                282
            ],
            "workspace": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "FindMessageSuppressionsInput": {
            "limit": [
                8
            ],
            "offset": [
                8
            ],
            "reason": [
                340
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                628
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
                503
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                66
            ],
            "applicationVariables": [
                299
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
                197
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                503
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
                503
            ],
            "updatedAt": [
                197
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                274
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                628
            ],
            "frontComponentId": [
                503
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                503
            ],
            "pageLayoutType": [
                383
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
                503
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
                503
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
                503
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
                503
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
                11
            ],
            "columnSpan": [
                11
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
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                628
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
                286
            ],
            "IMAP": [
                286
            ],
            "SMTP": [
                286
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
                224
            ],
            "host": [
                1
            ],
            "port": [
                11
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
                72
            ],
            "workspace": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                197
            ],
            "id": [
                503
            ],
            "indexFieldMetadataList": [
                290
            ],
            "indexType": [
                292
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
                197
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                150
            ],
            "node": [
                288
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                197
            ],
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "order": [
                11
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                291
            ],
            "id": [
                504
            ],
            "isCustom": [
                115
            ],
            "or": [
                291
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                503
            ],
            "messages": [
                35
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                295
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
                503
            ],
            "messageThreadId": [
                503
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
                8
            ],
            "enqueuedAt": [
                11
            ],
            "failedReason": [
                1
            ],
            "finishedAt": [
                11
            ],
            "jobId": [
                1
            ],
            "progress": [
                8
            ],
            "startedAt": [
                11
            ],
            "state": [
                301
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                503
            ],
            "aggregateOperation": [
                20
            ],
            "axisNameDisplay": [
                80
            ],
            "color": [
                1
            ],
            "configurationType": [
                628
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
                299
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "isCumulative": [
                4
            ],
            "isStacked": [
                4
            ],
            "numberFormat": [
                130
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                373
            ],
            "primaryAxisGroupByFieldMetadataId": [
                503
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                280
            ],
            "rangeMax": [
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                373
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                503
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                280
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
                299
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                307
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
                299
            ],
            "objectMetadataId": [
                503
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
                11
            ],
            "__typename": [
                1
            ]
        },
        "LineChartSeries": {
            "data": [
                306
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
                148
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "Location": {
            "lat": [
                11
            ],
            "lng": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunction": {
            "applicationId": [
                503
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                197
            ],
            "cronTriggerSettings": [
                299
            ],
            "databaseEventTriggerSettings": [
                299
            ],
            "description": [
                1
            ],
            "executionMode": [
                312
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                299
            ],
            "id": [
                503
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
                11
            ],
            "toolTriggerSettings": [
                299
            ],
            "universalIdentifier": [
                503
            ],
            "updatedAt": [
                197
            ],
            "workflowActionTriggerSettings": [
                299
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                299
            ],
            "duration": [
                11
            ],
            "error": [
                299
            ],
            "logs": [
                1
            ],
            "status": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "LogicFunctionIdInput": {
            "id": [
                10
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                503
            ],
            "applicationUniversalIdentifier": [
                503
            ],
            "id": [
                503
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                72
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
                8
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
                299
            ],
            "name": [
                1
            ],
            "objects": [
                321
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                322
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                62
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
                323
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                324
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
                628
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                147
            ],
            "connectedAccountId": [
                503
            ],
            "contactAutoCreationPolicy": [
                328
            ],
            "createdAt": [
                197
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
                503
            ],
            "importProgress": [
                8
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                335
            ],
            "pendingGroupEmailsAction": [
                329
            ],
            "syncStage": [
                330
            ],
            "syncStageStartedAt": [
                197
            ],
            "syncStatus": [
                331
            ],
            "syncedAt": [
                197
            ],
            "throttleFailureCount": [
                11
            ],
            "throttleRetryAfter": [
                197
            ],
            "type": [
                332
            ],
            "updatedAt": [
                197
            ],
            "visibility": [
                333
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
                197
            ],
            "externalId": [
                1
            ],
            "id": [
                503
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                503
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                336
            ],
            "updatedAt": [
                197
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
                197
            ],
            "emailAddress": [
                1
            ],
            "id": [
                503
            ],
            "reason": [
                340
            ],
            "source": [
                341
            ],
            "unsubscribeTopicId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                338
            ],
            "totalCount": [
                8
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
                371
            ],
            "recordId": [
                1
            ],
            "type": [
                343
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
                503
            ],
            "property": [
                1
            ],
            "provenance": [
                347
            ],
            "recordId": [
                503
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
                503
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                142
            ],
            "objectMetadataItems": [
                351
            ],
            "views": [
                352
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
                503
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
                503
            ],
            "key": [
                620
            ],
            "objectMetadataId": [
                503
            ],
            "type": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                470,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                633,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                16,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        503,
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
                        503
                    ],
                    "threadId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        503,
                        "UUID!"
                    ],
                    "roleId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        503,
                        "UUID!"
                    ],
                    "roleId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "authorizeApp": [
                75,
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
                126,
                {
                    "input": [
                        125,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                113
            ],
            "cancelSwitchBillingPlan": [
                113
            ],
            "cancelSwitchResourceCreditPrice": [
                113
            ],
            "checkCustomDomainValidRecords": [
                218
            ],
            "checkPublicDomainValidRecords": [
                218,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                106,
                {
                    "plan": [
                        97,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        476,
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
                61,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                61,
                {
                    "fileId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                146,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        503,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                377,
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
                267,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                267,
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
                267,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                267,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApiKey": [
                29,
                {
                    "input": [
                        154,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                327,
                {
                    "input": [
                        155,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                156,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        50,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                157,
                {
                    "input": [
                        158,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                69,
                {
                    "input": [
                        159,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                95
            ],
            "createCalendarEvent": [
                161,
                {
                    "input": [
                        160,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                9
            ],
            "createCommandMenuItem": [
                143,
                {
                    "input": [
                        162,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                216,
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
                164,
                {
                    "input": [
                        163,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                227,
                {
                    "input": [
                        165,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                266,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        265,
                        "FileFolder!"
                    ],
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        11,
                        "Float!"
                    ]
                }
            ],
            "createFrontComponent": [
                272,
                {
                    "input": [
                        167,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                356,
                {
                    "inputs": [
                        172,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                614,
                {
                    "inputs": [
                        186,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                613,
                {
                    "inputs": [
                        187,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                619,
                {
                    "inputs": [
                        190,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                338,
                {
                    "input": [
                        171,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                356,
                {
                    "input": [
                        172,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                266,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        11,
                        "Float!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                467,
                {
                    "input": [
                        465,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                26,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        503,
                        "UUID!"
                    ],
                    "properties": [
                        299
                    ],
                    "recordId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        153,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                252,
                {
                    "input": [
                        174,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                288,
                {
                    "input": [
                        175,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                311,
                {
                    "input": [
                        170,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                359,
                {
                    "input": [
                        176,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                430,
                {
                    "createRoleInput": [
                        181,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                380,
                {
                    "input": [
                        177,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                381,
                {
                    "input": [
                        178,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                384,
                {
                    "input": [
                        179,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                401,
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
                467,
                {
                    "input": [
                        466,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                470,
                {
                    "input": [
                        182,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                95,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        97,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        476,
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
                506,
                {
                    "input": [
                        183,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                585,
                {
                    "input": [
                        184,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                605,
                {
                    "input": [
                        185,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                610,
                {
                    "input": [
                        191,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                613,
                {
                    "input": [
                        187,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                614,
                {
                    "input": [
                        186,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                615,
                {
                    "input": [
                        189,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                616,
                {
                    "input": [
                        188,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                619,
                {
                    "input": [
                        190,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                622,
                {
                    "input": [
                        192,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                626,
                {
                    "input": [
                        193,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                470,
                {
                    "id": [
                        503,
                        "UUID!"
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
                        34
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                327,
                {
                    "id": [
                        503,
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
                        198,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                143,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                147,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                633
            ],
            "deleteEmailGroupChannel": [
                327,
                {
                    "id": [
                        503,
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
                272,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                356,
                {
                    "ids": [
                        503,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                356,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                3,
                {
                    "input": [
                        13,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                252,
                {
                    "input": [
                        199,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                288,
                {
                    "input": [
                        200,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                311,
                {
                    "input": [
                        315,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                359,
                {
                    "input": [
                        201,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        503,
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
                        503,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                202,
                {
                    "input": [
                        203,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                470,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                204,
                {
                    "twoFactorAuthenticationMethodId": [
                        503,
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
                        503,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                598
            ],
            "deleteUserFromWorkspace": [
                602,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                605,
                {
                    "id": [
                        503,
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
                613,
                {
                    "input": [
                        206,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                614,
                {
                    "input": [
                        205,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                615,
                {
                    "input": [
                        207,
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
                619,
                {
                    "input": [
                        208,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        209,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                626,
                {
                    "id": [
                        503,
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
                613,
                {
                    "input": [
                        212,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                614,
                {
                    "input": [
                        211,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                615,
                {
                    "input": [
                        213,
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
                619,
                {
                    "input": [
                        214,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        215,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                147,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                219,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                220,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                221,
                {
                    "input": [
                        222,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                225,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        503
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                90
            ],
            "enqueueJob": [
                234,
                {
                    "input": [
                        232,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                236,
                {
                    "input": [
                        235,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                637
            ],
            "executeOneLogicFunction": [
                313,
                {
                    "input": [
                        249,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                31,
                {
                    "apiKeyId": [
                        503,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                66,
                {
                    "applicationId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                72
            ],
            "generateTransientToken": [
                486
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                500,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                74,
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
                74,
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
                74,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                501,
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
                277,
                {
                    "input": [
                        278,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                318,
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
                376
            ],
            "grantApplicationCapabilities": [
                39,
                {
                    "input": [
                        279,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                287,
                {
                    "userId": [
                        503,
                        "UUID!"
                    ],
                    "workspaceId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                294,
                {
                    "input": [
                        293,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                296,
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
                296
            ],
            "installApplication": [
                37,
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
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                237
            ],
            "removeAgentChatMessageReaction": [
                16,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        425,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                417,
                {
                    "principal": [
                        414,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        422,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                66,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                74,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        426,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                427,
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
                457,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                143,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                381,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                384,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                481,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                450,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                8
            ],
            "revokeApiKey": [
                29,
                {
                    "input": [
                        428,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                432,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                443,
                {
                    "input": [
                        439,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                53,
                {
                    "applicationId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                284,
                {
                    "connectionParameters": [
                        223,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        503
                    ]
                }
            ],
            "sendChatMessage": [
                450,
                {
                    "browsingContext": [
                        299
                    ],
                    "fileAttachments": [
                        264,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        503,
                        "[UUID!]"
                    ],
                    "messageId": [
                        503,
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
                        503,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                453,
                {
                    "input": [
                        452,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                456,
                {
                    "input": [
                        455,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                457,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        503
                    ]
                }
            ],
            "sendMessageCampaign": [
                459,
                {
                    "input": [
                        458,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                454,
                {
                    "input": [
                        460,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                33,
                {
                    "input": [
                        462,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                237,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                417,
                {
                    "accessLevel": [
                        413,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        422,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                417,
                {
                    "accessLevel": [
                        413,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        414,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        422,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                113,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                79,
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
                79,
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
                468,
                {
                    "input": [
                        469
                    ]
                }
            ],
            "signUpInWorkspace": [
                468,
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
                        503
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
                377,
                {
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "startChannelSync": [
                129,
                {
                    "connectedAccountId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                472,
                {
                    "companyContext": [
                        299
                    ],
                    "personContext": [
                        299
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                473
            ],
            "switchBillingPlan": [
                113,
                {
                    "plan": [
                        97
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                113
            ],
            "syncApplication": [
                647,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        299,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "trackAnalytics": [
                26,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        299
                    ],
                    "type": [
                        27,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                61,
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
                488,
                {
                    "input": [
                        487,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                492,
                {
                    "input": [
                        489,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                491,
                {
                    "input": [
                        490,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                496,
                {
                    "input": [
                        493,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                495,
                {
                    "input": [
                        494,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                498,
                {
                    "input": [
                        497,
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
            "updateAgentChatThreadInboxState": [
                12,
                {
                    "action": [
                        6,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        197
                    ],
                    "threadIds": [
                        503,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                29,
                {
                    "input": [
                        509,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                327,
                {
                    "input": [
                        510,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                37,
                {
                    "id": [
                        503,
                        "UUID!"
                    ],
                    "input": [
                        511,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                61,
                {
                    "input": [
                        512,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                65,
                {
                    "input": [
                        514,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                116,
                {
                    "input": [
                        516,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                143,
                {
                    "input": [
                        518,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                327,
                {
                    "input": [
                        519,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                272,
                {
                    "input": [
                        521,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                250,
                {
                    "input": [
                        523,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                356,
                {
                    "inputs": [
                        534,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                359,
                {
                    "inputs": [
                        535,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                619,
                {
                    "inputs": [
                        557,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                327,
                {
                    "input": [
                        526,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                334,
                {
                    "input": [
                        528,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                334,
                {
                    "input": [
                        530,
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
                356,
                {
                    "input": [
                        534,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        508,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        503
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
                252,
                {
                    "input": [
                        533,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        524,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                359,
                {
                    "input": [
                        535,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                430,
                {
                    "updateRoleInput": [
                        542,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        536,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                381,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        537,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                384,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        539,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        541,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                297,
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
                470,
                {
                    "input": [
                        544,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                481,
                {
                    "input": [
                        545,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                506,
                {
                    "input": [
                        546,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                585,
                {
                    "input": [
                        547,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                89,
                {
                    "userCreditsFallback": [
                        600,
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
                605,
                {
                    "input": [
                        548,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                610,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        559,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                613,
                {
                    "input": [
                        552,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                614,
                {
                    "input": [
                        550,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                615,
                {
                    "input": [
                        555,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                616,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        554,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                619,
                {
                    "input": [
                        557,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                622,
                {
                    "input": [
                        560,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                626,
                {
                    "input": [
                        562,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                633,
                {
                    "data": [
                        565,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                633,
                {
                    "data": [
                        564,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                642,
                {
                    "roleId": [
                        503,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        566,
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
                61,
                {
                    "file": [
                        567,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                263,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        567,
                        "Upload!"
                    ],
                    "fileFolder": [
                        265,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                267,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        567,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                267,
                {
                    "file": [
                        567,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                267,
                {
                    "file": [
                        567,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                267,
                {
                    "file": [
                        567,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                259,
                {
                    "upsertFieldPermissionsInput": [
                        568,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                610,
                {
                    "input": [
                        571,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                367,
                {
                    "upsertObjectPermissionsInput": [
                        572,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                431,
                {
                    "upsertPermissionFlagsInput": [
                        573,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                575,
                {
                    "input": [
                        574,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                610,
                {
                    "input": [
                        576,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                69,
                {
                    "input": [
                        603,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                607,
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
                79,
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
                227,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                608,
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
            "applicationId": [
                503
            ],
            "color": [
                1
            ],
            "createdAt": [
                197
            ],
            "folderId": [
                503
            ],
            "icon": [
                1
            ],
            "id": [
                503
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                503
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                503
            ],
            "targetRecordId": [
                503
            ],
            "targetRecordIdentifier": [
                410
            ],
            "type": [
                357
            ],
            "updatedAt": [
                197
            ],
            "userWorkspaceId": [
                503
            ],
            "viewId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                503
            ],
            "color": [
                1
            ],
            "createdAt": [
                197
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                362,
                {
                    "filter": [
                        257,
                        "FieldFilter!"
                    ],
                    "paging": [
                        195,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                252
            ],
            "icon": [
                1
            ],
            "id": [
                503
            ],
            "imageIdentifierFieldMetadataId": [
                503
            ],
            "indexMetadataList": [
                288
            ],
            "indexMetadatas": [
                364,
                {
                    "filter": [
                        291,
                        "IndexFilter!"
                    ],
                    "paging": [
                        195,
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
                503
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
                366
            ],
            "readability": [
                344
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                503
            ],
            "searchFieldMetadataList": [
                449
            ],
            "sharingReach": [
                374
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                197
            ],
            "writability": [
                349
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                361
            ],
            "pageInfo": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                150
            ],
            "node": [
                359
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                256
            ],
            "pageInfo": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                363
            ],
            "id": [
                504
            ],
            "isActive": [
                115
            ],
            "isRemote": [
                115
            ],
            "isSearchable": [
                115
            ],
            "isSystem": [
                115
            ],
            "isUICreatable": [
                115
            ],
            "isUIEditable": [
                115
            ],
            "isUIReadOnly": [
                115
            ],
            "or": [
                363
            ],
            "universalIdentifier": [
                504
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                289
            ],
            "pageInfo": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                503
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
                503
            ],
            "restrictedFields": [
                299
            ],
            "rowLevelPermissionPredicateGroups": [
                434
            ],
            "rowLevelPermissionPredicates": [
                433
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
                503
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
                8
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordEvent": {
            "action": [
                196
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                371
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
                299
            ],
            "before": [
                299
            ],
            "diff": [
                299
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
                370
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
                375
            ],
            "previousOnboardingStatus": [
                375
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
                150
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                150
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                503
            ],
            "createdAt": [
                197
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                503
            ],
            "deletedAt": [
                197
            ],
            "id": [
                503
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
                503
            ],
            "tabs": [
                381
            ],
            "type": [
                383
            ],
            "universalIdentifier": [
                503
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                503
            ],
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "icon": [
                1
            ],
            "id": [
                503
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
                382
            ],
            "pageLayoutId": [
                503
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                503
            ],
            "updatedAt": [
                197
            ],
            "widgets": [
                384
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                503
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                299
            ],
            "configuration": [
                627
            ],
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "gridPosition": [
                281
            ],
            "id": [
                503
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
                503
            ],
            "pageLayoutTabId": [
                503
            ],
            "position": [
                387
            ],
            "title": [
                1
            ],
            "type": [
                629
            ],
            "universalIdentifier": [
                503
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                382
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "column": [
                8
            ],
            "columnSpan": [
                8
            ],
            "layoutMode": [
                382
            ],
            "row": [
                8
            ],
            "rowSpan": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetCanvasPosition": [
                385
            ],
            "on_PageLayoutWidgetGridPosition": [
                386
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                389
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                388
            ],
            "index": [
                8
            ],
            "layoutMode": [
                382
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
                503
            ],
            "createdAt": [
                197
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                503
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
                503
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                503
            ],
            "aggregateOperation": [
                20
            ],
            "color": [
                1
            ],
            "configurationType": [
                628
            ],
            "dateGranularity": [
                373
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
                299
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "groupByFieldMetadataId": [
                503
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
                130
            ],
            "orderBy": [
                280
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
                396
            ],
            "formattedToRawLookup": [
                299
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
                299
            ],
            "objectMetadataId": [
                503
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
                11
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
                310
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
        "PublicApplicationRegistration": {
            "id": [
                503
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
                224
            ],
            "host": [
                1
            ],
            "port": [
                11
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
                503
            ],
            "createdAt": [
                197
            ],
            "domain": [
                1
            ],
            "id": [
                503
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
                251
            ],
            "metadata": [
                403
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
                400
            ],
            "IMAP": [
                400
            ],
            "SMTP": [
                400
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                70
            ],
            "authProviders": [
                71
            ],
            "displayName": [
                1
            ],
            "id": [
                503
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                651
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
                503
            ],
            "logo": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "agentChatOpenThreadsSummary": [
                7
            ],
            "agentRuns": [
                17,
                {
                    "agentId": [
                        503,
                        "UUID!"
                    ],
                    "limit": [
                        8,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                21
            ],
            "apiKey": [
                29,
                {
                    "input": [
                        276,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                29
            ],
            "appConnection": [
                32,
                {
                    "id": [
                        10,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                32,
                {
                    "filter": [
                        308
                    ]
                }
            ],
            "appKeyValue": [
                33,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        34
                    ]
                }
            ],
            "appMessageChannels": [
                327,
                {
                    "filter": [
                        309
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                40,
                {
                    "applicationId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                41,
                {
                    "applicationId": [
                        503,
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
                448,
                {
                    "applicationId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                82,
                {
                    "input": [
                        83,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                106,
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
                503,
                {
                    "calendarEventId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                14,
                {
                    "threadId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                132,
                {
                    "threadId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                9,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                135,
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
                641,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                474,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                143,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                143
            ],
            "currentUser": [
                598
            ],
            "currentUserApplicationAuthorizations": [
                38
            ],
            "currentUserSessions": [
                601
            ],
            "currentWorkspace": [
                633
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
                238
            ],
            "eventLogs": [
                245,
                {
                    "input": [
                        244,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                43,
                {
                    "universalIdentifier": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                252,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                254,
                {
                    "filter": [
                        257,
                        "FieldFilter!"
                    ],
                    "paging": [
                        195,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                399,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                61,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                55,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        197
                    ],
                    "periodStart": [
                        197
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                63,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        197
                    ],
                    "periodStart": [
                        197
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                65,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                136,
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
                302,
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
                61
            ],
            "findManyApplications": [
                37
            ],
            "findManyLogicFunctions": [
                311
            ],
            "findManyMarketplaceApps": [
                319,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                401
            ],
            "findMarketplaceAppDetail": [
                320,
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
                        13,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                37,
                {
                    "id": [
                        503
                    ],
                    "universalIdentifier": [
                        503
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                311,
                {
                    "input": [
                        315,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                302,
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
                302,
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
                635
            ],
            "findWorkspaceFromInviteHash": [
                633,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                640
            ],
            "frontComponent": [
                272,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                272
            ],
            "getAddressDetails": [
                397,
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
                23
            ],
            "getApiKeyRoles": [
                430
            ],
            "getApprovedAccessDomains": [
                69
            ],
            "getAutoCompleteAddress": [
                76,
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
                299,
                {
                    "input": [
                        315,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                149,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                227
            ],
            "getInviteSuggestions": [
                298
            ],
            "getJobs": [
                302,
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
                        315,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                381,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                381,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                384,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                384,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                380,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        383
                    ]
                }
            ],
            "getPermissionFlags": [
                391
            ],
            "getPublicWorkspaceDataByDomain": [
                405,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                406,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                105
            ],
            "getRole": [
                430,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                430
            ],
            "getSSOIdentityProviders": [
                269
            ],
            "getToolIndex": [
                485
            ],
            "getToolInputSchema": [
                299,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                582,
                {
                    "input": [
                        583
                    ]
                }
            ],
            "getView": [
                610,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                613,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                614,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                614,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                613,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                615,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                616,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                616,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                615,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                619,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                619,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                622,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                622,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                610,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        624,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                638
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
                304,
                {
                    "input": [
                        305,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                96
            ],
            "messageSuppressions": [
                339,
                {
                    "input": [
                        270,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                345,
                {
                    "input": [
                        348,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                350
            ],
            "mostlyEmptyFieldMetadataIds": [
                503,
                {
                    "objectMetadataId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                116,
                {
                    "connectedAccountId": [
                        503
                    ]
                }
            ],
            "myConnectedAccounts": [
                147
            ],
            "myMessageChannels": [
                327,
                {
                    "connectedAccountId": [
                        503
                    ]
                }
            ],
            "myMessageFolders": [
                334,
                {
                    "messageChannelId": [
                        503
                    ]
                }
            ],
            "myUserApplicationVariables": [
                643
            ],
            "navigationMenuItem": [
                356,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                356
            ],
            "object": [
                359,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                369
            ],
            "objects": [
                360,
                {
                    "filter": [
                        363,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        195,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                394,
                {
                    "input": [
                        395,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                124,
                {
                    "input": [
                        398,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                320,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                319,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                412,
                {
                    "targets": [
                        422,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                417,
                {
                    "target": [
                        422,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                470,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                470
            ],
            "timelineActivityTypes": [
                481
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                502,
                {
                    "userId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                506
            ],
            "usageLimits": [
                585
            ],
            "usageQuotaDefinitions": [
                589
            ],
            "usageQuotaScopeConsumption": [
                591,
                {
                    "input": [
                        592,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                593
            ],
            "validatePasswordResetToken": [
                604,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                605,
                {
                    "objectMetadataId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                626,
                {
                    "id": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                503
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
                503
            ],
            "progress": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "RecordIdentifier": {
            "id": [
                503
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
                503
            ],
            "permissions": [
                411
            ],
            "recordId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                503
            ],
            "workspaceMemberId": [
                503
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
                413
            ],
            "generalAccessLevel": [
                413
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                411
            ],
            "roles": [
                420
            ],
            "shares": [
                418
            ],
            "sharingMode": [
                419
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                413
            ],
            "id": [
                10
            ],
            "principalId": [
                503
            ],
            "principalRoleId": [
                503
            ],
            "principalType": [
                415
            ],
            "rowCause": [
                416
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
                503
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
                628
            ],
            "isUIEditable": [
                4
            ],
            "recordLimit": [
                8
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
                503
            ],
            "recordId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                252
            ],
            "sourceObjectMetadata": [
                359
            ],
            "targetFieldMetadata": [
                252
            ],
            "targetObjectMetadata": [
                359
            ],
            "type": [
                424
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
                10
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
                503
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
            "__typename": [
                1
            ]
        },
        "Role": {
            "agents": [
                3
            ],
            "apiKeys": [
                30
            ],
            "applicationId": [
                503
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
                259
            ],
            "icon": [
                1
            ],
            "id": [
                503
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                367
            ],
            "permissionFlags": [
                431
            ],
            "rowLevelPermissionPredicateGroups": [
                434
            ],
            "rowLevelPermissionPredicates": [
                433
            ],
            "universalIdentifier": [
                503
            ],
            "workspaceMembers": [
                642
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
                503
            ],
            "roleId": [
                503
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
                438
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
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
                299
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
                436
            ],
            "objectMetadataId": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
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
                503
            ],
            "logicalOperator": [
                436
            ],
            "objectMetadataId": [
                503
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                503
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicateInput": {
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "operand": [
                438
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "rowLevelPermissionPredicateGroupId": [
                503
            ],
            "subFieldName": [
                1
            ],
            "value": [
                299
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
                441
            ],
            "messages": [
                441
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                299
            ],
            "runAsWorkspaceMemberId": [
                503
            ],
            "thread": [
                444
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
                503
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
                440
            ],
            "content": [
                1
            ],
            "role": [
                442
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
                299
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                503
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
                503
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                447
            ],
            "type": [
                282
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                503
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                447
            ],
            "type": [
                282
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
                197
            ],
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "position": [
                11
            ],
            "tsVectorFieldMetadataId": [
                503
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                503
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
                451
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
                299
            ],
            "workspaceMemberIds": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                503
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
                640
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
                197
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                124
            ],
            "campaignId": [
                1
            ],
            "queuedCount": [
                8
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
                11
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
                34
            ],
            "value": [
                299
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                503
            ],
            "createdAt": [
                197
            ],
            "frontComponentId": [
                503
            ],
            "icon": [
                1
            ],
            "id": [
                503
            ],
            "position": [
                11
            ],
            "scope": [
                464
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                503
            ],
            "updatedAt": [
                197
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
                503
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
                503
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                447
            ],
            "type": [
                282
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                72
            ],
            "workspace": [
                652
            ],
            "__typename": [
                1
            ]
        },
        "SignUpInNewWorkspaceInput": {
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
                503
            ],
            "content": [
                1
            ],
            "createdAt": [
                197
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                503
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
                197
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                429
            ],
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                650
            ],
            "thread": [
                9
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
                246,
                {
                    "fieldFilters": [
                        240,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        247,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                409,
                {
                    "input": [
                        180,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                316,
                {
                    "input": [
                        317,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                5,
                {
                    "threadId": [
                        503,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                248,
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
                479
            ],
            "supportFrontChatId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SupportDriver": {},
        "TasksConfiguration": {
            "configurationType": [
                628
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
                503
            ],
            "createdAt": [
                197
            ],
            "emit": [
                482
            ],
            "frontComponentUniversalIdentifier": [
                503
            ],
            "icon": [
                1
            ],
            "id": [
                503
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
                503
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                503
            ],
            "universalIdentifier": [
                503
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                503
            ],
            "on": [
                1
            ],
            "through": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                503
            ],
            "relationFieldUniversalIdentifier": [
                503
            ],
            "triggerFieldUniversalIdentifiers": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                628
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
                299
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
                72
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                503
            ],
            "personFilter": [
                299
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                197
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
                73
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
                197
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                503
            ],
            "gt": [
                503
            ],
            "gte": [
                503
            ],
            "iLike": [
                503
            ],
            "in": [
                503
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                503
            ],
            "lt": [
                503
            ],
            "lte": [
                503
            ],
            "neq": [
                503
            ],
            "notILike": [
                503
            ],
            "notIn": [
                503
            ],
            "notLike": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                197
            ],
            "description": [
                1
            ],
            "id": [
                503
            ],
            "name": [
                1
            ],
            "updatedAt": [
                197
            ],
            "visibility": [
                507
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeTopicVisibility": {},
        "UpdateAgentInput": {
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                503
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                299
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
                299
            ],
            "roleId": [
                503
            ],
            "triggers": [
                299
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
                503
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
                503
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                333
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
                513
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
                515
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
                503
            ],
            "update": [
                517
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                117
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
                120
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                503
            ],
            "availabilityType": [
                144
            ],
            "engineComponentKey": [
                231
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                503
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                503
            ],
            "position": [
                11
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                299
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
                299
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                503
            ],
            "options": [
                299
            ],
            "settings": [
                299
            ],
            "translations": [
                346
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
                503
            ],
            "update": [
                522
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
                503
            ],
            "update": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                299
            ],
            "databaseEventTriggerSettings": [
                299
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                299
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
                11
            ],
            "toolTriggerSettings": [
                299
            ],
            "workflowActionTriggerSettings": [
                299
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                503
            ],
            "update": [
                527
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                328
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
                335
            ],
            "visibility": [
                333
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                503
            ],
            "update": [
                529
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
                503
            ],
            "update": [
                529
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
                503
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
                503
            ],
            "position": [
                11
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
                503
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
                503
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
                366
            ],
            "readability": [
                344
            ],
            "sharingReach": [
                374
            ],
            "shortcut": [
                1
            ],
            "translations": [
                346
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                503
            ],
            "update": [
                520
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                503
            ],
            "update": [
                531
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                503
            ],
            "update": [
                532
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
                503
            ],
            "type": [
                383
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
                382
            ],
            "position": [
                11
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
                503
            ],
            "layoutMode": [
                382
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "widgets": [
                540
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
                299
            ],
            "configuration": [
                299
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                503
            ],
            "pageLayoutTabId": [
                503
            ],
            "position": [
                299
            ],
            "title": [
                1
            ],
            "type": [
                629
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
                299
            ],
            "configuration": [
                299
            ],
            "id": [
                503
            ],
            "objectMetadataId": [
                503
            ],
            "pageLayoutTabId": [
                503
            ],
            "position": [
                299
            ],
            "title": [
                1
            ],
            "type": [
                629
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
                503
            ],
            "tabs": [
                538
            ],
            "type": [
                383
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                503
            ],
            "update": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRolePayload": {
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
                503
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
                503
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                346
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
                507
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                503
            ],
            "payload": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                503
            ],
            "update": [
                549
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
                503
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
                503
            ],
            "update": [
                551
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
                11
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                503
            ],
            "update": [
                553
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                20
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "size": [
                11
            ],
            "viewFieldGroupId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                503
            ],
            "logicalOperator": [
                617
            ],
            "parentViewFilterGroupId": [
                503
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                503
            ],
            "update": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                503
            ],
            "operand": [
                618
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                503
            ],
            "subFieldName": [
                1
            ],
            "value": [
                299
            ],
            "viewFilterGroupId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                503
            ],
            "update": [
                558
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                503
            ],
            "fieldValue": [
                1
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
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
                503
            ],
            "calendarFieldMetadataId": [
                503
            ],
            "calendarLayout": [
                611
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                503
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                503
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                503
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                621
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                624
            ],
            "visibility": [
                625
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                503
            ],
            "update": [
                561
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                623
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
                503
            ],
            "update": [
                563
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
                22
            ],
            "aiChatModelTier": [
                22
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                299
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                503
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                11
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
                11
            ],
            "workspaceDiscoverability": [
                639
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                299
            ],
            "workspaceMemberId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                260
            ],
            "roleId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                503
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewFieldId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                569
            ],
            "id": [
                503
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                569
            ],
            "groups": [
                570
            ],
            "widgetId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                368
            ],
            "roleId": [
                503
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                503
            ],
            "predicateGroups": [
                435
            ],
            "predicates": [
                437
            ],
            "roleId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                434
            ],
            "predicates": [
                433
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                580
            ],
            "viewFields": [
                577
            ],
            "viewFilterGroups": [
                578
            ],
            "viewFilters": [
                579
            ],
            "viewSorts": [
                581
            ],
            "widgetId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                20
            ],
            "fieldMetadataId": [
                503
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "size": [
                11
            ],
            "viewFieldId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                503
            ],
            "logicalOperator": [
                617
            ],
            "parentViewFilterGroupId": [
                503
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "operand": [
                618
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                503
            ],
            "subFieldName": [
                1
            ],
            "value": [
                299
            ],
            "viewFilterGroupId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                503
            ],
            "calendarFieldMetadataId": [
                503
            ],
            "calendarLayout": [
                611
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                503
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                503
            ],
            "openRecordIn": [
                621
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                623
            ],
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                197
            ],
            "periodStart": [
                197
            ],
            "timeSeries": [
                595
            ],
            "usageByApplication": [
                584
            ],
            "usageByModel": [
                584
            ],
            "usageByOperationType": [
                584
            ],
            "usageByUser": [
                584
            ],
            "userDailyUsage": [
                597
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                587
            ],
            "periodEnd": [
                197
            ],
            "periodStart": [
                197
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
                11
            ],
            "key": [
                1
            ],
            "label": [
                1
            ],
            "userCreditsUsed": [
                11
            ],
            "workspaceCreditsUsed": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimit": {
            "burstValue": [
                87
            ],
            "createdAt": [
                197
            ],
            "id": [
                503
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                87
            ],
            "operationType": [
                587
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                594
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                596
            ],
            "updatedAt": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                596
            ],
            "operationType": [
                587
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                586
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                590
            ],
            "resourceType": [
                594
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                588
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
                587
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                596
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                87
            ],
            "periodEnd": [
                197
            ],
            "periodStart": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                587
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                594
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                596
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                87
            ],
            "id": [
                503
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                87
            ],
            "operationType": [
                587
            ],
            "periodEnd": [
                197
            ],
            "periodStart": [
                197
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                87
            ],
            "resourceType": [
                594
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
                596
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                11
            ],
            "date": [
                1
            ],
            "workspaceCreditsUsed": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "UsageUnit": {},
        "UsageUserDaily": {
            "dailyUsage": [
                595
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
                78
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                197
            ],
            "currentUserWorkspace": [
                602
            ],
            "currentWorkspace": [
                633
            ],
            "deletedAt": [
                197
            ],
            "deletedWorkspaceMembers": [
                210
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
                503
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
                375
            ],
            "previousOnboardingStatus": [
                375
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                197
            ],
            "userVars": [
                300
            ],
            "userWorkspaces": [
                602
            ],
            "workspaceMember": [
                642
            ],
            "workspaceMembers": [
                642
            ],
            "workspaces": [
                602
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
                299
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
                197
            ],
            "expiresAt": [
                197
            ],
            "id": [
                503
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
                197
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "id": [
                503
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                367
            ],
            "objectsPermissions": [
                367
            ],
            "permissionFlags": [
                392
            ],
            "twoFactorAuthenticationMethodSummary": [
                499
            ],
            "updatedAt": [
                197
            ],
            "user": [
                598
            ],
            "userId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                503
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
                503
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
                503
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                503
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
                503
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
                11
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
                72
            ],
            "workspaceUrls": [
                651
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
                8
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
                503
            ],
            "calendarEndFieldMetadataId": [
                503
            ],
            "calendarFieldMetadataId": [
                503
            ],
            "calendarLayout": [
                611
            ],
            "createdAt": [
                197
            ],
            "createdByUserWorkspaceId": [
                503
            ],
            "deletedAt": [
                197
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                503
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
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                503
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                620
            ],
            "mainGroupByFieldMetadataId": [
                503
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                503
            ],
            "openRecordIn": [
                621
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                624
            ],
            "universalIdentifier": [
                503
            ],
            "updatedAt": [
                197
            ],
            "viewFieldGroups": [
                614
            ],
            "viewFields": [
                613
            ],
            "viewFilterGroups": [
                616
            ],
            "viewFilters": [
                615
            ],
            "viewGroups": [
                619
            ],
            "viewSorts": [
                622
            ],
            "visibility": [
                625
            ],
            "workspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                20
            ],
            "applicationId": [
                503
            ],
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
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
                11
            ],
            "size": [
                11
            ],
            "universalIdentifier": [
                503
            ],
            "updatedAt": [
                197
            ],
            "viewFieldGroupId": [
                503
            ],
            "viewId": [
                503
            ],
            "workspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "id": [
                503
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
                11
            ],
            "updatedAt": [
                197
            ],
            "viewFields": [
                613
            ],
            "viewId": [
                503
            ],
            "workspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "operand": [
                618
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                503
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                197
            ],
            "value": [
                299
            ],
            "viewFilterGroupId": [
                503
            ],
            "viewId": [
                503
            ],
            "workspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "id": [
                503
            ],
            "logicalOperator": [
                617
            ],
            "parentViewFilterGroupId": [
                503
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "updatedAt": [
                197
            ],
            "viewId": [
                503
            ],
            "workspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "fieldValue": [
                1
            ],
            "id": [
                503
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "updatedAt": [
                197
            ],
            "viewId": [
                503
            ],
            "workspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "direction": [
                623
            ],
            "fieldMetadataId": [
                503
            ],
            "id": [
                503
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                197
            ],
            "viewId": [
                503
            ],
            "workspaceId": [
                503
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
                503
            ],
            "createdAt": [
                197
            ],
            "deletedAt": [
                197
            ],
            "description": [
                1
            ],
            "id": [
                503
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
                197
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                19
            ],
            "on_BarChartConfiguration": [
                81
            ],
            "on_CalendarConfiguration": [
                121
            ],
            "on_CallRecordingSummaryConfiguration": [
                122
            ],
            "on_CallRecordingTranscriptConfiguration": [
                123
            ],
            "on_ChatConfiguration": [
                131
            ],
            "on_ChatThreadsConfiguration": [
                134
            ],
            "on_EmailThreadConfiguration": [
                226
            ],
            "on_EmailsConfiguration": [
                230
            ],
            "on_FieldConfiguration": [
                253
            ],
            "on_FieldRichTextConfiguration": [
                261
            ],
            "on_FieldsConfiguration": [
                262
            ],
            "on_FilesConfiguration": [
                268
            ],
            "on_FormFieldConfiguration": [
                271
            ],
            "on_FrontComponentConfiguration": [
                273
            ],
            "on_IframeConfiguration": [
                283
            ],
            "on_LineChartConfiguration": [
                303
            ],
            "on_MessageCampaignBodyConfiguration": [
                325
            ],
            "on_MessageCampaignDetailsConfiguration": [
                326
            ],
            "on_NotesConfiguration": [
                358
            ],
            "on_PieChartConfiguration": [
                393
            ],
            "on_RecordTableConfiguration": [
                421
            ],
            "on_StandaloneRichTextConfiguration": [
                471
            ],
            "on_TasksConfiguration": [
                480
            ],
            "on_TimelineConfiguration": [
                484
            ],
            "on_ViewConfiguration": [
                612
            ],
            "on_WorkflowConfiguration": [
                630
            ],
            "on_WorkflowRunConfiguration": [
                631
            ],
            "on_WorkflowVersionConfiguration": [
                632
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                634
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                22
            ],
            "aiChatModelTier": [
                22
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                299
            ],
            "allowImpersonation": [
                4
            ],
            "allowedIframeOrigins": [
                1
            ],
            "billingCustomer": [
                89
            ],
            "billingEntitlements": [
                91
            ],
            "billingSubscriptions": [
                107
            ],
            "createdAt": [
                197
            ],
            "currentBillingSubscription": [
                107
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                430
            ],
            "deletedAt": [
                197
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                11
            ],
            "featureFlags": [
                250
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                503
            ],
            "installedApplications": [
                37
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
            "isTwoFactorAuthenticationEnforced": [
                4
            ],
            "logo": [
                1
            ],
            "logoFileId": [
                503
            ],
            "metadataVersion": [
                11
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                11
            ],
            "updatedAt": [
                197
            ],
            "viewFields": [
                613
            ],
            "viewFilterGroups": [
                616
            ],
            "viewFilters": [
                615
            ],
            "viewGroups": [
                619
            ],
            "viewSorts": [
                622
            ],
            "views": [
                610
            ],
            "workspaceCustomApplication": [
                37
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                639
            ],
            "workspaceMembersCount": [
                11
            ],
            "workspaceUrls": [
                651
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceActivationStatus": {},
        "WorkspaceAiStats": {
            "conversationsCount": [
                8
            ],
            "skillsCount": [
                8
            ],
            "toolsCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCompanyEnrichmentOutcome": {},
        "WorkspaceCompanyEnrichmentResult": {
            "enrichment": [
                299
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                636
            ],
            "personEnrichment": [
                299
            ],
            "personOutcome": [
                649
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
                197
            ],
            "id": [
                503
            ],
            "roleId": [
                503
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
                8
            ],
            "colorScheme": [
                1
            ],
            "dateFormat": [
                644
            ],
            "id": [
                503
            ],
            "locale": [
                1
            ],
            "name": [
                275
            ],
            "numberFormat": [
                645
            ],
            "openRecordIn": [
                378
            ],
            "roles": [
                430
            ],
            "timeFormat": [
                646
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
                503
            ],
            "userWorkspaceId": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                503
            ],
            "variables": [
                599
            ],
            "workspaceMemberId": [
                503
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
                299
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
                503
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
                503
            ],
            "workspaceUrls": [
                651
            ],
            "__typename": [
                1
            ]
        }
    }
}