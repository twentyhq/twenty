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
        23,
        25,
        27,
        30,
        32,
        39,
        51,
        59,
        61,
        67,
        79,
        83,
        84,
        86,
        91,
        96,
        102,
        107,
        113,
        116,
        117,
        118,
        119,
        127,
        129,
        143,
        148,
        193,
        194,
        221,
        225,
        226,
        228,
        238,
        244,
        248,
        252,
        255,
        262,
        277,
        279,
        289,
        296,
        297,
        298,
        309,
        311,
        324,
        325,
        326,
        327,
        328,
        329,
        331,
        332,
        333,
        336,
        337,
        339,
        340,
        343,
        345,
        349,
        353,
        362,
        369,
        370,
        371,
        374,
        378,
        379,
        384,
        388,
        409,
        411,
        412,
        415,
        420,
        432,
        434,
        438,
        443,
        460,
        472,
        473,
        475,
        499,
        501,
        503,
        564,
        584,
        591,
        593,
        607,
        613,
        614,
        616,
        617,
        619,
        620,
        621,
        624,
        625,
        630,
        632,
        635,
        640,
        641,
        642,
        645,
        646
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
                296
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
                499
            ],
            "createdAt": [
                194
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                499
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
                296
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
                296
            ],
            "roleId": [
                499
            ],
            "triggers": [
                296
            ],
            "updatedAt": [
                194
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
                499
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
                499
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
                499
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
                499
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                296
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
                194
            ],
            "deletedAt": [
                194
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
                194
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                194
            ],
            "id": [
                499
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                194
            ],
            "lastReadAt": [
                194
            ],
            "snoozedUntil": [
                194
            ],
            "threadId": [
                499
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                499
            ],
            "createdAt": [
                194
            ],
            "id": [
                499
            ],
            "parts": [
                21
            ],
            "processedAt": [
                194
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                499
            ],
            "senderWorkspaceMemberId": [
                499
            ],
            "status": [
                1
            ],
            "threadId": [
                499
            ],
            "turnId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                194
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                499
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                499
            ],
            "messageId": [
                499
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                296
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
                296
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                296
            ],
            "type": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                194
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
                194
            ],
            "errorMessage": [
                1
            ],
            "id": [
                499
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
                194
            ],
            "status": [
                23
            ],
            "threadId": [
                499
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
                499
            ],
            "aggregateOperation": [
                25
            ],
            "configurationType": [
                624
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                296
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "label": [
                1
            ],
            "numberFormat": [
                129
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                404
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
                86
            ],
            "kind": [
                1
            ],
            "limitValue": [
                86
            ],
            "periodEnd": [
                194
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
                29
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
                194
            ],
            "expiresAt": [
                194
            ],
            "id": [
                499
            ],
            "name": [
                1
            ],
            "revokedAt": [
                194
            ],
            "role": [
                426
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                194
            ],
            "id": [
                499
            ],
            "name": [
                1
            ],
            "revokedAt": [
                194
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
                39
            ],
            "value": [
                296
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
                41
            ],
            "receivedAt": [
                194
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
                499
            ],
            "role": [
                333
            ],
            "workspaceMemberId": [
                499
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
                63
            ],
            "applicationRegistrationId": [
                499
            ],
            "applicationVariables": [
                66
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                296
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                142
            ],
            "createdAt": [
                194
            ],
            "defaultLogicFunctionRole": [
                426
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                269
            ],
            "healthCheckLogicFunctionId": [
                499
            ],
            "id": [
                499
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                308
            ],
            "logoFileId": [
                499
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                355
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                499
            ],
            "settingsCustomTabFrontComponentId": [
                499
            ],
            "settingsMenuItems": [
                459
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                499
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                194
            ],
            "id": [
                499
            ],
            "lastAuthorizedAt": [
                194
            ],
            "lastUsedAt": [
                194
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                499
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                499
            ],
            "archivedAt": [
                194
            ],
            "authFailedAt": [
                194
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                400
            ],
            "connectionProviderId": [
                499
            ],
            "createdAt": [
                194
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                499
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                194
            ],
            "lastSignedInAt": [
                194
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                194
            ],
            "userWorkspaceId": [
                499
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
                499
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                47
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
                49
            ],
            "coverage": [
                50
            ],
            "files": [
                52
            ],
            "manifest": [
                296
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
                61
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
                51
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
                499
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
                262
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
                262
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
                194
            ],
            "fileFolder": [
                262
            ],
            "fileId": [
                499
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
                57
            ],
            "description": [
                1
            ],
            "status": [
                59
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationHealthStatus": {},
        "ApplicationRegistration": {
            "createdAt": [
                194
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                499
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
                499
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                61
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                194
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
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                10
            ],
            "versionDistribution": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                499
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                61
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                194
            ],
            "description": [
                1
            ],
            "id": [
                499
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
                296
            ],
            "type": [
                1
            ],
            "updatedAt": [
                194
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
                71
            ],
            "applicationRefreshToken": [
                71
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
                499
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
                296
            ],
            "scope": [
                67
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
                194
            ],
            "domain": [
                1
            ],
            "id": [
                499
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
                442
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                194
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
                71
            ],
            "refreshToken": [
                71
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                72
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
                499
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
                441
            ],
            "workspaceUrls": [
                647
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                76
            ],
            "availableWorkspacesForSignUp": [
                76
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                77
            ],
            "tokens": [
                72
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                499
            ],
            "aggregateOperation": [
                25
            ],
            "axisNameDisplay": [
                79
            ],
            "color": [
                1
            ],
            "configurationType": [
                624
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
                296
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupMode": [
                83
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                84
            ],
            "numberFormat": [
                129
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                369
            ],
            "primaryAxisGroupByFieldMetadataId": [
                499
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                277
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                369
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                499
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                277
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
                296
            ],
            "formattedToRawLookup": [
                296
            ],
            "groupMode": [
                83
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
                84
            ],
            "series": [
                85
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
                296
            ],
            "objectMetadataId": [
                499
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
                111
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
                499
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
                106
            ],
            "currentBillingSubscription": [
                106
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                473
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                91
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
                103
            ],
            "name": [
                1
            ],
            "prices": [
                97
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
                103
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
                92
            ],
            "meteredProducts": [
                93
            ],
            "planKey": [
                96
            ],
            "resourceCreditProducts": [
                92
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
                113
            ],
            "recurringInterval": [
                472
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
                113
            ],
            "recurringInterval": [
                472
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                99
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
                103
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
                103
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                92
            ],
            "on_BillingMeteredProduct": [
                93
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
                96
            ],
            "priceUsageBased": [
                113
            ],
            "productKey": [
                102
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "grantedCredits": [
                6
            ],
            "periodEnd": [
                194
            ],
            "periodStart": [
                194
            ],
            "productKey": [
                102
            ],
            "rolloverCredits": [
                6
            ],
            "totalGrantedCredits": [
                6
            ],
            "unitPriceCents": [
                6
            ],
            "usedCredits": [
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
                108
            ],
            "cancelAt": [
                194
            ],
            "collectionMethod": [
                107
            ],
            "currentPeriodEnd": [
                194
            ],
            "id": [
                499
            ],
            "interval": [
                472
            ],
            "metadata": [
                296
            ],
            "phases": [
                109
            ],
            "status": [
                473
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                101
            ],
            "creditAmount": [
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                499
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
                110
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
                106
            ],
            "currentBillingSubscription": [
                106
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
                499
            ],
            "contactAutoCreationPolicy": [
                116
            ],
            "createdAt": [
                194
            ],
            "handle": [
                1
            ],
            "id": [
                499
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                117
            ],
            "syncStageStartedAt": [
                194
            ],
            "syncStatus": [
                118
            ],
            "syncedAt": [
                194
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                194
            ],
            "visibility": [
                119
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
                624
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                624
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
                127
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
                624
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                296
            ],
            "error": [
                132
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
                624
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
                349
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                351
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
                27
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                136
            ],
            "aiModelTiers": [
                138
            ],
            "aiModels": [
                137
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                33
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                70
            ],
            "billing": [
                87
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                126
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
                140
            ],
            "publicFeatureFlags": [
                398
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                457
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                474
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                194
            ],
            "link": [
                1
            ],
            "startAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                30
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
                499
            ],
            "availabilityObjectMetadataId": [
                499
            ],
            "availabilityType": [
                143
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                499
            ],
            "createdAt": [
                194
            ],
            "engineComponentKey": [
                228
            ],
            "frontComponent": [
                269
            ],
            "frontComponentId": [
                499
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                499
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
                499
            ],
            "pageLayoutId": [
                499
            ],
            "payload": [
                144
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                499
            ],
            "updatedAt": [
                194
            ],
            "workflowVersionId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                361
            ],
            "on_PathCommandMenuItemPayload": [
                386
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                53
            ],
            "files": [
                260
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                499
            ],
            "archivedAt": [
                194
            ],
            "authFailedAt": [
                194
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                400
            ],
            "connectionProviderId": [
                499
            ],
            "createdAt": [
                194
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                499
            ],
            "lastCredentialsRefreshedAt": [
                194
            ],
            "lastSignedInAt": [
                194
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                194
            ],
            "userWorkspaceId": [
                499
            ],
            "visibility": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedImapSmtpCaldavAccount": {
            "connectionParameters": [
                282
            ],
            "handle": [
                1
            ],
            "id": [
                499
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                221
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
                499
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
                296
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
                296
            ],
            "roleId": [
                499
            ],
            "triggers": [
                296
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                499
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                54
            ],
            "targets": [
                56
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                60
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
                499
            ],
            "availabilityType": [
                143
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                499
            ],
            "engineComponentKey": [
                228
            ],
            "frontComponentId": [
                499
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
                499
            ],
            "pageLayoutId": [
                499
            ],
            "payload": [
                296
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                499
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
                323
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
                296
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
                296
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                499
            ],
            "options": [
                296
            ],
            "relationCreationPayload": [
                296
            ],
            "settings": [
                296
            ],
            "type": [
                255
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
                499
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
                499
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
                166
            ],
            "indexType": [
                289
            ],
            "objectMetadataId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                296
            ],
            "databaseEventTriggerSettings": [
                296
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                296
            ],
            "id": [
                499
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                296
            ],
            "source": [
                296
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                296
            ],
            "universalIdentifier": [
                499
            ],
            "workflowActionTriggerSettings": [
                296
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                498
            ],
            "color": [
                1
            ],
            "folderId": [
                499
            ],
            "icon": [
                1
            ],
            "id": [
                499
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                499
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                499
            ],
            "targetRecordId": [
                499
            ],
            "type": [
                353
            ],
            "userWorkspaceId": [
                499
            ],
            "viewId": [
                499
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
                296
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
                164
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                167
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                171
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
                499
            ],
            "type": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                378
            ],
            "pageLayoutId": [
                499
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
                296
            ],
            "objectMetadataId": [
                499
            ],
            "pageLayoutTabId": [
                499
            ],
            "position": [
                296
            ],
            "title": [
                1
            ],
            "type": [
                625
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                499
            ],
            "filter": [
                296
            ],
            "objectMetadataId": [
                499
            ],
            "orderBy": [
                296
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
                499
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                86
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                86
            ],
            "operationType": [
                584
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                591
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                593
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
                499
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                499
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                25
            ],
            "fieldMetadataId": [
                499
            ],
            "id": [
                499
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
                499
            ],
            "viewId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                499
            ],
            "logicalOperator": [
                613
            ],
            "parentViewFilterGroupId": [
                499
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                499
            ],
            "id": [
                499
            ],
            "operand": [
                614
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                499
            ],
            "subFieldName": [
                1
            ],
            "value": [
                296
            ],
            "viewFilterGroupId": [
                499
            ],
            "viewId": [
                499
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
                499
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                499
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
                499
            ],
            "calendarFieldMetadataId": [
                499
            ],
            "calendarLayout": [
                607
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                499
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                499
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                616
            ],
            "mainGroupByFieldMetadataId": [
                499
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                499
            ],
            "openRecordIn": [
                617
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                620
            ],
            "visibility": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                619
            ],
            "fieldMetadataId": [
                499
            ],
            "id": [
                499
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                499
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
                499
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
        "CursorPaging": {
            "after": [
                148
            ],
            "before": [
                148
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                499
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                499
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
                499
            ],
            "name": [
                272
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                499
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
                499
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                214
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
                499
            ],
            "pageLayoutId": [
                499
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
                499
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
                499
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                443
            ],
            "type": [
                279
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                499
            ],
            "status": [
                443
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                149
            ],
            "IMAP": [
                149
            ],
            "SMTP": [
                149
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
                624
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                194
            ],
            "domain": [
                1
            ],
            "id": [
                499
            ],
            "status": [
                225
            ],
            "tenantStatus": [
                226
            ],
            "unsubscribeHostnameStatus": [
                501
            ],
            "updatedAt": [
                194
            ],
            "verificationRecords": [
                602
            ],
            "verifiedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                624
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
                296
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
                296
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
                230
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                296
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
                194
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
                194
            ],
            "currentPeriodEnd": [
                194
            ],
            "expiresAt": [
                194
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
                194
            ],
            "start": [
                194
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
                238
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
                236
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                237
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
                239
            ],
            "first": [
                10
            ],
            "table": [
                244
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                240
            ],
            "records": [
                243
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
                296
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                194
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
                338
            ],
            "objectRecordEventsWithQueryIds": [
                368
            ],
            "queueJobEvents": [
                299
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                499
            ],
            "payload": [
                296
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                248
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
                499
            ],
            "createdAt": [
                194
            ],
            "defaultValue": [
                296
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                499
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
                499
            ],
            "morphRelations": [
                419
            ],
            "name": [
                1
            ],
            "object": [
                355
            ],
            "objectMetadataId": [
                499
            ],
            "options": [
                296
            ],
            "relation": [
                419
            ],
            "settings": [
                296
            ],
            "type": [
                255
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                194
            ],
            "writability": [
                345
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                624
            ],
            "fieldDisplayMode": [
                252
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
                253
            ],
            "pageInfo": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                148
            ],
            "node": [
                249
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                254
            ],
            "id": [
                500
            ],
            "isActive": [
                114
            ],
            "isSystem": [
                114
            ],
            "isUIEditable": [
                114
            ],
            "isUIReadOnly": [
                114
            ],
            "objectMetadataId": [
                500
            ],
            "or": [
                254
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
                499
            ],
            "id": [
                499
            ],
            "objectMetadataId": [
                499
            ],
            "roleId": [
                499
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
                499
            ],
            "objectMetadataId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                624
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
                194
            ],
            "id": [
                499
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
                499
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
                194
            ],
            "fileId": [
                499
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
                194
            ],
            "id": [
                499
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
                624
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                499
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                443
            ],
            "type": [
                279
            ],
            "workspace": [
                644
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
                336
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                624
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
                499
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                65
            ],
            "applicationVariables": [
                296
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
                194
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                499
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
                499
            ],
            "updatedAt": [
                194
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                271
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                624
            ],
            "frontComponentId": [
                499
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                499
            ],
            "pageLayoutType": [
                379
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
                499
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
                499
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
                499
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
                499
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
                624
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
                283
            ],
            "IMAP": [
                283
            ],
            "SMTP": [
                283
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
                221
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
                71
            ],
            "workspace": [
                648
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                194
            ],
            "id": [
                499
            ],
            "indexFieldMetadataList": [
                287
            ],
            "indexType": [
                289
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
                194
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                148
            ],
            "node": [
                285
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                194
            ],
            "fieldMetadataId": [
                499
            ],
            "id": [
                499
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                288
            ],
            "id": [
                500
            ],
            "isCustom": [
                114
            ],
            "or": [
                288
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                499
            ],
            "messages": [
                40
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                292
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
                499
            ],
            "messageThreadId": [
                499
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
                298
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                499
            ],
            "aggregateOperation": [
                25
            ],
            "axisNameDisplay": [
                79
            ],
            "color": [
                1
            ],
            "configurationType": [
                624
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
                296
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
                129
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                369
            ],
            "primaryAxisGroupByFieldMetadataId": [
                499
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                277
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                369
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                499
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                277
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
                296
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                304
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
                296
            ],
            "objectMetadataId": [
                499
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
                303
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
                499
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
                499
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                194
            ],
            "cronTriggerSettings": [
                296
            ],
            "databaseEventTriggerSettings": [
                296
            ],
            "description": [
                1
            ],
            "executionMode": [
                309
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                296
            ],
            "id": [
                499
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
                296
            ],
            "universalIdentifier": [
                499
            ],
            "updatedAt": [
                194
            ],
            "workflowActionTriggerSettings": [
                296
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                296
            ],
            "duration": [
                6
            ],
            "error": [
                296
            ],
            "logs": [
                1
            ],
            "status": [
                311
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                499
            ],
            "applicationUniversalIdentifier": [
                499
            ],
            "id": [
                499
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                71
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
                296
            ],
            "name": [
                1
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                318
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                61
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
                319
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                320
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
                624
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                146
            ],
            "connectedAccountId": [
                499
            ],
            "contactAutoCreationPolicy": [
                324
            ],
            "createdAt": [
                194
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
                499
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                331
            ],
            "pendingGroupEmailsAction": [
                325
            ],
            "syncStage": [
                326
            ],
            "syncStageStartedAt": [
                194
            ],
            "syncStatus": [
                327
            ],
            "syncedAt": [
                194
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                194
            ],
            "type": [
                328
            ],
            "updatedAt": [
                194
            ],
            "visibility": [
                329
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
                194
            ],
            "externalId": [
                1
            ],
            "id": [
                499
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                499
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                332
            ],
            "updatedAt": [
                194
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
                194
            ],
            "emailAddress": [
                1
            ],
            "id": [
                499
            ],
            "reason": [
                336
            ],
            "source": [
                337
            ],
            "unsubscribeTopicId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                334
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
                367
            ],
            "recordId": [
                1
            ],
            "type": [
                339
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
                499
            ],
            "property": [
                1
            ],
            "provenance": [
                343
            ],
            "recordId": [
                499
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
                499
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                141
            ],
            "objectMetadataItems": [
                347
            ],
            "views": [
                348
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
                499
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
                499
            ],
            "key": [
                616
            ],
            "objectMetadataId": [
                499
            ],
            "type": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                466,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                629,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
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
                        499
                    ],
                    "threadId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        499,
                        "UUID!"
                    ],
                    "roleId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        499,
                        "UUID!"
                    ],
                    "roleId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "authorizeApp": [
                74,
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
                125,
                {
                    "input": [
                        124,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                112
            ],
            "cancelSwitchBillingPlan": [
                112
            ],
            "cancelSwitchResourceCreditPrice": [
                112
            ],
            "checkCustomDomainValidRecords": [
                215
            ],
            "checkPublicDomainValidRecords": [
                215,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                105,
                {
                    "plan": [
                        96,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        472,
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
                60,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                60,
                {
                    "fileId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                145,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        499,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                373,
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
                264,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                264,
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
                264,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                264,
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
                        150,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                34,
                {
                    "input": [
                        152,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                323,
                {
                    "input": [
                        153,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                154,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        55,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                155,
                {
                    "input": [
                        156,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                68,
                {
                    "input": [
                        157,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                94
            ],
            "createCalendarEvent": [
                159,
                {
                    "input": [
                        158,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                16,
                {
                    "channelId": [
                        499
                    ]
                }
            ],
            "createCommandMenuItem": [
                142,
                {
                    "input": [
                        160,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                213,
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
                162,
                {
                    "input": [
                        161,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                224,
                {
                    "input": [
                        163,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                263,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        262,
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
                269,
                {
                    "input": [
                        165,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                352,
                {
                    "inputs": [
                        170,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                610,
                {
                    "inputs": [
                        184,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                609,
                {
                    "inputs": [
                        185,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                615,
                {
                    "inputs": [
                        188,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                334,
                {
                    "input": [
                        169,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                352,
                {
                    "input": [
                        170,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                263,
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
                463,
                {
                    "input": [
                        461,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                31,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        499,
                        "UUID!"
                    ],
                    "properties": [
                        296
                    ],
                    "recordId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        151,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                249,
                {
                    "input": [
                        172,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                285,
                {
                    "input": [
                        173,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                308,
                {
                    "input": [
                        168,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                355,
                {
                    "input": [
                        174,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                426,
                {
                    "createRoleInput": [
                        179,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                376,
                {
                    "input": [
                        175,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                377,
                {
                    "input": [
                        176,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                380,
                {
                    "input": [
                        177,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                397,
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
                463,
                {
                    "input": [
                        462,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                466,
                {
                    "input": [
                        180,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                94,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        96,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        472,
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
                502,
                {
                    "input": [
                        181,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                582,
                {
                    "input": [
                        182,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                601,
                {
                    "input": [
                        183,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                606,
                {
                    "input": [
                        189,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                609,
                {
                    "input": [
                        185,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                610,
                {
                    "input": [
                        184,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                611,
                {
                    "input": [
                        187,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                612,
                {
                    "input": [
                        186,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                615,
                {
                    "input": [
                        188,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                618,
                {
                    "input": [
                        190,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                622,
                {
                    "input": [
                        191,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                466,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        499,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        499
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
                        39
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                323,
                {
                    "id": [
                        499,
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
                        195,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                142,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                146,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                629
            ],
            "deleteEmailGroupChannel": [
                323,
                {
                    "id": [
                        499,
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
                269,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                352,
                {
                    "ids": [
                        499,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                352,
                {
                    "id": [
                        499,
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
                249,
                {
                    "input": [
                        196,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                285,
                {
                    "input": [
                        197,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                308,
                {
                    "input": [
                        312,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                355,
                {
                    "input": [
                        198,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        499,
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
                        499,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                199,
                {
                    "input": [
                        200,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                466,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                201,
                {
                    "twoFactorAuthenticationMethodId": [
                        499,
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
                        499,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                595
            ],
            "deleteUserFromWorkspace": [
                598,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                601,
                {
                    "id": [
                        499,
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
                609,
                {
                    "input": [
                        203,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                610,
                {
                    "input": [
                        202,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                611,
                {
                    "input": [
                        204,
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
                615,
                {
                    "input": [
                        205,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        206,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                622,
                {
                    "id": [
                        499,
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
                609,
                {
                    "input": [
                        209,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                610,
                {
                    "input": [
                        208,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                611,
                {
                    "input": [
                        210,
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
                615,
                {
                    "input": [
                        211,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        212,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                146,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                216,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                217,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                218,
                {
                    "input": [
                        219,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                222,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        499
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                89
            ],
            "enqueueJob": [
                231,
                {
                    "input": [
                        229,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                233,
                {
                    "input": [
                        232,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                633
            ],
            "executeOneLogicFunction": [
                310,
                {
                    "input": [
                        246,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                36,
                {
                    "apiKeyId": [
                        499,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                65,
                {
                    "applicationId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                71
            ],
            "generateTransientToken": [
                482
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                496,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                73,
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
                73,
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
                73,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                497,
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
                274,
                {
                    "input": [
                        275,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                315,
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
                372
            ],
            "grantApplicationCapabilities": [
                44,
                {
                    "input": [
                        276,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                284,
                {
                    "userId": [
                        499,
                        "UUID!"
                    ],
                    "workspaceId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                291,
                {
                    "input": [
                        290,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                293,
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
                293
            ],
            "installApplication": [
                42,
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
                        499,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        499
                    ],
                    "threadId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                234
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        421,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                413,
                {
                    "principal": [
                        410,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        418,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                65,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                73,
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
                        499,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        422,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                423,
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
                453,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                142,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                477,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                446,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                10
            ],
            "revokeApiKey": [
                34,
                {
                    "input": [
                        424,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                428,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                439,
                {
                    "input": [
                        435,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                58,
                {
                    "applicationId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                281,
                {
                    "connectionParameters": [
                        220,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        499
                    ]
                }
            ],
            "sendChatMessage": [
                446,
                {
                    "browsingContext": [
                        296
                    ],
                    "channelId": [
                        499
                    ],
                    "fileAttachments": [
                        261,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        499,
                        "[UUID!]"
                    ],
                    "messageId": [
                        499,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "threadId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                449,
                {
                    "input": [
                        448,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                452,
                {
                    "input": [
                        451,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                453,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        499
                    ]
                }
            ],
            "sendMessageCampaign": [
                455,
                {
                    "input": [
                        454,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                450,
                {
                    "input": [
                        456,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                38,
                {
                    "input": [
                        458,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                234,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                413,
                {
                    "accessLevel": [
                        409,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        418,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                413,
                {
                    "accessLevel": [
                        409,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        410,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        418,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                112,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                78,
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
                78,
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
                464,
                {
                    "input": [
                        465
                    ]
                }
            ],
            "signUpInWorkspace": [
                464,
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
                        499
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
                373,
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
                        194,
                        "DateTime!"
                    ],
                    "threadId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                128,
                {
                    "connectedAccountId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                468,
                {
                    "companyContext": [
                        296
                    ],
                    "personContext": [
                        296
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                469
            ],
            "switchBillingPlan": [
                112
            ],
            "switchSubscriptionInterval": [
                112
            ],
            "syncApplication": [
                643,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        296,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "trackAnalytics": [
                31,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        296
                    ],
                    "type": [
                        32,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                60,
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
                484,
                {
                    "input": [
                        483,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                488,
                {
                    "input": [
                        485,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                487,
                {
                    "input": [
                        486,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                492,
                {
                    "input": [
                        489,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                491,
                {
                    "input": [
                        490,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                494,
                {
                    "input": [
                        493,
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
                        499,
                        "UUID!"
                    ],
                    "input": [
                        504,
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
                        194
                    ],
                    "threadIds": [
                        499,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                34,
                {
                    "input": [
                        506,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                323,
                {
                    "input": [
                        507,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                42,
                {
                    "id": [
                        499,
                        "UUID!"
                    ],
                    "input": [
                        508,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                60,
                {
                    "input": [
                        509,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                64,
                {
                    "input": [
                        511,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                115,
                {
                    "input": [
                        513,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                142,
                {
                    "input": [
                        515,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                323,
                {
                    "input": [
                        516,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                269,
                {
                    "input": [
                        518,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                247,
                {
                    "input": [
                        520,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                352,
                {
                    "inputs": [
                        531,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                355,
                {
                    "inputs": [
                        532,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                615,
                {
                    "inputs": [
                        554,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                323,
                {
                    "input": [
                        523,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                330,
                {
                    "input": [
                        525,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                330,
                {
                    "input": [
                        527,
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
                352,
                {
                    "input": [
                        531,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        505,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        499
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
                249,
                {
                    "input": [
                        530,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        521,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                355,
                {
                    "input": [
                        532,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                426,
                {
                    "updateRoleInput": [
                        539,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        533,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        534,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        536,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        538,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                294,
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
                466,
                {
                    "input": [
                        541,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                477,
                {
                    "input": [
                        542,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                502,
                {
                    "input": [
                        543,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                582,
                {
                    "input": [
                        544,
                        "UpdateUsageLimitInput!"
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
                601,
                {
                    "input": [
                        545,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                606,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        556,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                609,
                {
                    "input": [
                        549,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                610,
                {
                    "input": [
                        547,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                611,
                {
                    "input": [
                        552,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                612,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        551,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                615,
                {
                    "input": [
                        554,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                618,
                {
                    "input": [
                        557,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                622,
                {
                    "input": [
                        559,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                629,
                {
                    "data": [
                        562,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                629,
                {
                    "data": [
                        561,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                638,
                {
                    "roleId": [
                        499,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        563,
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
                60,
                {
                    "file": [
                        564,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                260,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        564,
                        "Upload!"
                    ],
                    "fileFolder": [
                        262,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                264,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        564,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                264,
                {
                    "file": [
                        564,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                264,
                {
                    "file": [
                        564,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                264,
                {
                    "file": [
                        564,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                256,
                {
                    "upsertFieldPermissionsInput": [
                        565,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                606,
                {
                    "input": [
                        568,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                363,
                {
                    "upsertObjectPermissionsInput": [
                        569,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                427,
                {
                    "upsertPermissionFlagsInput": [
                        570,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                572,
                {
                    "input": [
                        571,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                606,
                {
                    "input": [
                        573,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                68,
                {
                    "input": [
                        599,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                603,
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
                78,
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
                224,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                604,
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
                498
            ],
            "applicationId": [
                499
            ],
            "color": [
                1
            ],
            "createdAt": [
                194
            ],
            "folderId": [
                499
            ],
            "icon": [
                1
            ],
            "id": [
                499
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                499
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                499
            ],
            "targetRecordId": [
                499
            ],
            "targetRecordIdentifier": [
                406
            ],
            "type": [
                353
            ],
            "updatedAt": [
                194
            ],
            "userWorkspaceId": [
                499
            ],
            "viewId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                499
            ],
            "color": [
                1
            ],
            "createdAt": [
                194
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                358,
                {
                    "filter": [
                        254,
                        "FieldFilter!"
                    ],
                    "paging": [
                        192,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                249
            ],
            "icon": [
                1
            ],
            "id": [
                499
            ],
            "imageIdentifierFieldMetadataId": [
                499
            ],
            "indexMetadataList": [
                285
            ],
            "indexMetadatas": [
                360,
                {
                    "filter": [
                        288,
                        "IndexFilter!"
                    ],
                    "paging": [
                        192,
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
                499
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
                362
            ],
            "readability": [
                340
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                499
            ],
            "searchFieldMetadataList": [
                445
            ],
            "sharingReach": [
                370
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                194
            ],
            "writability": [
                345
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                357
            ],
            "pageInfo": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                148
            ],
            "node": [
                355
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                253
            ],
            "pageInfo": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                359
            ],
            "id": [
                500
            ],
            "isActive": [
                114
            ],
            "isRemote": [
                114
            ],
            "isSearchable": [
                114
            ],
            "isSystem": [
                114
            ],
            "isUICreatable": [
                114
            ],
            "isUIEditable": [
                114
            ],
            "isUIReadOnly": [
                114
            ],
            "or": [
                359
            ],
            "universalIdentifier": [
                500
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                286
            ],
            "pageInfo": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                499
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
                499
            ],
            "restrictedFields": [
                296
            ],
            "rowLevelPermissionPredicateGroups": [
                430
            ],
            "rowLevelPermissionPredicates": [
                429
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
                499
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
                193
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                367
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
                296
            ],
            "before": [
                296
            ],
            "diff": [
                296
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
                366
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
                371
            ],
            "previousOnboardingStatus": [
                371
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
                148
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                148
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                499
            ],
            "createdAt": [
                194
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                499
            ],
            "deletedAt": [
                194
            ],
            "id": [
                499
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
                499
            ],
            "tabs": [
                377
            ],
            "type": [
                379
            ],
            "universalIdentifier": [
                499
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                499
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "icon": [
                1
            ],
            "id": [
                499
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
                378
            ],
            "pageLayoutId": [
                499
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                499
            ],
            "updatedAt": [
                194
            ],
            "widgets": [
                380
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                499
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                296
            ],
            "configuration": [
                623
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "gridPosition": [
                278
            ],
            "id": [
                499
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
                499
            ],
            "pageLayoutTabId": [
                499
            ],
            "position": [
                383
            ],
            "title": [
                1
            ],
            "type": [
                625
            ],
            "universalIdentifier": [
                499
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                378
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
                378
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
                381
            ],
            "on_PageLayoutWidgetGridPosition": [
                382
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                385
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                384
            ],
            "index": [
                10
            ],
            "layoutMode": [
                378
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
                499
            ],
            "createdAt": [
                194
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                499
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
                499
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                499
            ],
            "aggregateOperation": [
                25
            ],
            "color": [
                1
            ],
            "configurationType": [
                624
            ],
            "dateGranularity": [
                369
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
                296
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                499
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
                129
            ],
            "orderBy": [
                277
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
                392
            ],
            "formattedToRawLookup": [
                296
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
                296
            ],
            "objectMetadataId": [
                499
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
                307
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
                499
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
                221
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
                499
            ],
            "createdAt": [
                194
            ],
            "domain": [
                1
            ],
            "id": [
                499
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
                248
            ],
            "metadata": [
                399
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
                396
            ],
            "IMAP": [
                396
            ],
            "SMTP": [
                396
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                69
            ],
            "authProviders": [
                70
            ],
            "displayName": [
                1
            ],
            "id": [
                499
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                647
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
                499
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
                        499,
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
                22,
                {
                    "agentId": [
                        499,
                        "UUID!"
                    ],
                    "limit": [
                        10,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                26
            ],
            "apiKey": [
                34,
                {
                    "input": [
                        273,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                34
            ],
            "appConnection": [
                37,
                {
                    "id": [
                        17,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                37,
                {
                    "filter": [
                        305
                    ]
                }
            ],
            "appKeyValue": [
                38,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        39
                    ]
                }
            ],
            "appMessageChannels": [
                323,
                {
                    "filter": [
                        306
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                45,
                {
                    "applicationId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                46,
                {
                    "applicationId": [
                        499,
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
                444,
                {
                    "applicationId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                81,
                {
                    "input": [
                        82,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                105,
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
                499,
                {
                    "calendarEventId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                20,
                {
                    "threadId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                131,
                {
                    "threadId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                16,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                134,
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
                637,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                470,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                142,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                142
            ],
            "currentUser": [
                595
            ],
            "currentUserApplicationAuthorizations": [
                43
            ],
            "currentUserSessions": [
                597
            ],
            "currentWorkspace": [
                629
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
                235
            ],
            "eventLogs": [
                242,
                {
                    "input": [
                        241,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                48,
                {
                    "universalIdentifier": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                249,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                251,
                {
                    "filter": [
                        254,
                        "FieldFilter!"
                    ],
                    "paging": [
                        192,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                395,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                60,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                64,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                135,
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
                299,
                {
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
                60
            ],
            "findManyApplications": [
                42
            ],
            "findManyLogicFunctions": [
                308
            ],
            "findManyMarketplaceApps": [
                316,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                397
            ],
            "findMarketplaceAppDetail": [
                317,
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
                42,
                {
                    "id": [
                        499
                    ],
                    "universalIdentifier": [
                        499
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                60,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                308,
                {
                    "input": [
                        312,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                299,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findUpgradeApplicationJobStatus": [
                299,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                631
            ],
            "findWorkspaceFromInviteHash": [
                629,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                636
            ],
            "frontComponent": [
                269,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                269
            ],
            "getAddressDetails": [
                393,
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
                28
            ],
            "getApiKeyRoles": [
                426
            ],
            "getApprovedAccessDomains": [
                68
            ],
            "getAutoCompleteAddress": [
                75,
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
                296,
                {
                    "input": [
                        312,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                147,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                224
            ],
            "getInviteSuggestions": [
                295
            ],
            "getJobs": [
                299,
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
                        312,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                377,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                380,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                376,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        379
                    ]
                }
            ],
            "getPermissionFlags": [
                387
            ],
            "getPublicWorkspaceDataByDomain": [
                401,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                402,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                104
            ],
            "getRole": [
                426,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                426
            ],
            "getSSOIdentityProviders": [
                266
            ],
            "getToolIndex": [
                481
            ],
            "getToolInputSchema": [
                296,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                579,
                {
                    "input": [
                        580
                    ]
                }
            ],
            "getView": [
                606,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                609,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                610,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                610,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                609,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                611,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                612,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                612,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                611,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                615,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                615,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                618,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                618,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                606,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        620,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                634
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
                301,
                {
                    "input": [
                        302,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                95
            ],
            "messageSuppressions": [
                335,
                {
                    "input": [
                        267,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                341,
                {
                    "input": [
                        344,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                346
            ],
            "mostlyEmptyFieldMetadataIds": [
                499,
                {
                    "objectMetadataId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                115,
                {
                    "connectedAccountId": [
                        499
                    ]
                }
            ],
            "myConnectedAccounts": [
                146
            ],
            "myMessageChannels": [
                323,
                {
                    "connectedAccountId": [
                        499
                    ]
                }
            ],
            "myMessageFolders": [
                330,
                {
                    "messageChannelId": [
                        499
                    ]
                }
            ],
            "myUserApplicationVariables": [
                639
            ],
            "navigationMenuItem": [
                352,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                352
            ],
            "object": [
                355,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                365
            ],
            "objects": [
                356,
                {
                    "filter": [
                        359,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        192,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                390,
                {
                    "input": [
                        391,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                123,
                {
                    "input": [
                        394,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                317,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                316,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                408,
                {
                    "targets": [
                        418,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                413,
                {
                    "target": [
                        418,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                466,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                466
            ],
            "timelineActivityTypes": [
                477
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                498,
                {
                    "userId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                502
            ],
            "usageLimits": [
                582
            ],
            "usageQuotaDefinitions": [
                586
            ],
            "usageQuotaScopeConsumption": [
                588,
                {
                    "input": [
                        589,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                590
            ],
            "validatePasswordResetToken": [
                600,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                601,
                {
                    "objectMetadataId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                622,
                {
                    "id": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                499
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
                499
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
                499
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
                499
            ],
            "permissions": [
                407
            ],
            "recordId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                499
            ],
            "workspaceMemberId": [
                499
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
                409
            ],
            "generalAccessLevel": [
                409
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                407
            ],
            "roles": [
                416
            ],
            "shares": [
                414
            ],
            "sharingMode": [
                415
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                409
            ],
            "id": [
                17
            ],
            "principalId": [
                499
            ],
            "principalRoleId": [
                499
            ],
            "principalType": [
                411
            ],
            "rowCause": [
                412
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
                499
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
                624
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
                499
            ],
            "recordId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                249
            ],
            "sourceObjectMetadata": [
                355
            ],
            "targetFieldMetadata": [
                249
            ],
            "targetObjectMetadata": [
                355
            ],
            "type": [
                420
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
                499
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
                35
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
                256
            ],
            "icon": [
                1
            ],
            "id": [
                499
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                363
            ],
            "permissionFlags": [
                427
            ],
            "rowLevelPermissionPredicateGroups": [
                430
            ],
            "rowLevelPermissionPredicates": [
                429
            ],
            "universalIdentifier": [
                499
            ],
            "workspaceMembers": [
                638
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
                499
            ],
            "roleId": [
                499
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
                434
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
                296
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
                432
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
                499
            ],
            "logicalOperator": [
                432
            ],
            "objectMetadataId": [
                499
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                499
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
                499
            ],
            "id": [
                499
            ],
            "operand": [
                434
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "rowLevelPermissionPredicateGroupId": [
                499
            ],
            "subFieldName": [
                1
            ],
            "value": [
                296
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
                437
            ],
            "messages": [
                437
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                499
            ],
            "thread": [
                440
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                499
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
                436
            ],
            "content": [
                1
            ],
            "role": [
                438
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
                296
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                499
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
                499
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                443
            ],
            "type": [
                279
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                499
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                443
            ],
            "type": [
                279
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
                194
            ],
            "fieldMetadataId": [
                499
            ],
            "id": [
                499
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                499
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                499
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
                447
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
                296
            ],
            "workspaceMemberIds": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                499
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
                636
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
                194
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                123
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
                39
            ],
            "value": [
                296
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                499
            ],
            "createdAt": [
                194
            ],
            "frontComponentId": [
                499
            ],
            "icon": [
                1
            ],
            "id": [
                499
            ],
            "position": [
                6
            ],
            "scope": [
                460
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                499
            ],
            "updatedAt": [
                194
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
                499
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
                499
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                443
            ],
            "type": [
                279
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                71
            ],
            "workspace": [
                648
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
                499
            ],
            "content": [
                1
            ],
            "createdAt": [
                194
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                499
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
                194
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                425
            ],
            "configurationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                646
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
                243,
                {
                    "fieldFilters": [
                        237,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        244,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                405,
                {
                    "input": [
                        178,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                313,
                {
                    "input": [
                        314,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                13,
                {
                    "threadId": [
                        499,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                245,
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
                475
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
                624
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
                499
            ],
            "createdAt": [
                194
            ],
            "emit": [
                478
            ],
            "frontComponentUniversalIdentifier": [
                499
            ],
            "icon": [
                1
            ],
            "id": [
                499
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
                499
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                499
            ],
            "universalIdentifier": [
                499
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                499
            ],
            "on": [
                1
            ],
            "through": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                499
            ],
            "relationFieldUniversalIdentifier": [
                499
            ],
            "triggerFieldUniversalIdentifiers": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                624
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
                296
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
                71
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                499
            ],
            "personFilter": [
                296
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                194
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
                72
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
                194
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                499
            ],
            "gt": [
                499
            ],
            "gte": [
                499
            ],
            "iLike": [
                499
            ],
            "in": [
                499
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                499
            ],
            "lt": [
                499
            ],
            "lte": [
                499
            ],
            "neq": [
                499
            ],
            "notILike": [
                499
            ],
            "notIn": [
                499
            ],
            "notLike": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                194
            ],
            "description": [
                1
            ],
            "id": [
                499
            ],
            "name": [
                1
            ],
            "updatedAt": [
                194
            ],
            "visibility": [
                503
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
                499
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
                499
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                296
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
                296
            ],
            "roleId": [
                499
            ],
            "triggers": [
                296
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
                499
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
                499
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                329
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
                510
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
                512
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
                499
            ],
            "update": [
                514
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                116
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                119
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                499
            ],
            "availabilityType": [
                143
            ],
            "engineComponentKey": [
                228
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                499
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                499
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                296
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
                296
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                499
            ],
            "options": [
                296
            ],
            "settings": [
                296
            ],
            "translations": [
                342
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
                499
            ],
            "update": [
                519
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
                499
            ],
            "update": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                296
            ],
            "databaseEventTriggerSettings": [
                296
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                296
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
                296
            ],
            "workflowActionTriggerSettings": [
                296
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                499
            ],
            "update": [
                524
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                324
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
                331
            ],
            "visibility": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                499
            ],
            "update": [
                526
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
                499
            ],
            "update": [
                526
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
                499
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
                499
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
                499
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
                499
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
                362
            ],
            "readability": [
                340
            ],
            "sharingReach": [
                370
            ],
            "shortcut": [
                1
            ],
            "translations": [
                342
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                499
            ],
            "update": [
                517
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                499
            ],
            "update": [
                528
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                499
            ],
            "update": [
                529
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
                499
            ],
            "type": [
                379
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
                378
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
                499
            ],
            "layoutMode": [
                378
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                537
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
                296
            ],
            "configuration": [
                296
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                499
            ],
            "pageLayoutTabId": [
                499
            ],
            "position": [
                296
            ],
            "title": [
                1
            ],
            "type": [
                625
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
                296
            ],
            "configuration": [
                296
            ],
            "id": [
                499
            ],
            "objectMetadataId": [
                499
            ],
            "pageLayoutTabId": [
                499
            ],
            "position": [
                296
            ],
            "title": [
                1
            ],
            "type": [
                625
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
                499
            ],
            "tabs": [
                535
            ],
            "type": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                499
            ],
            "update": [
                540
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
                499
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
                499
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                342
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
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                499
            ],
            "payload": [
                182
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                499
            ],
            "update": [
                546
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
                499
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
                499
            ],
            "update": [
                548
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
                499
            ],
            "update": [
                550
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                25
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                499
            ],
            "logicalOperator": [
                613
            ],
            "parentViewFilterGroupId": [
                499
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                499
            ],
            "update": [
                553
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                499
            ],
            "operand": [
                614
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                499
            ],
            "subFieldName": [
                1
            ],
            "value": [
                296
            ],
            "viewFilterGroupId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                499
            ],
            "update": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                499
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
                499
            ],
            "calendarFieldMetadataId": [
                499
            ],
            "calendarLayout": [
                607
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                499
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                499
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                499
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                617
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                620
            ],
            "visibility": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                499
            ],
            "update": [
                558
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                619
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
                499
            ],
            "update": [
                560
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
                27
            ],
            "aiChatModelTier": [
                27
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                296
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                499
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
                635
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                296
            ],
            "workspaceMemberId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                257
            ],
            "roleId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                499
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                566
            ],
            "id": [
                499
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
                566
            ],
            "groups": [
                567
            ],
            "widgetId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                364
            ],
            "roleId": [
                499
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                499
            ],
            "predicateGroups": [
                431
            ],
            "predicates": [
                433
            ],
            "roleId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                430
            ],
            "predicates": [
                429
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                577
            ],
            "viewFields": [
                574
            ],
            "viewFilterGroups": [
                575
            ],
            "viewFilters": [
                576
            ],
            "viewSorts": [
                578
            ],
            "widgetId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                25
            ],
            "fieldMetadataId": [
                499
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                499
            ],
            "logicalOperator": [
                613
            ],
            "parentViewFilterGroupId": [
                499
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
                499
            ],
            "id": [
                499
            ],
            "operand": [
                614
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                499
            ],
            "subFieldName": [
                1
            ],
            "value": [
                296
            ],
            "viewFilterGroupId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                499
            ],
            "calendarFieldMetadataId": [
                499
            ],
            "calendarLayout": [
                607
            ],
            "kanbanAggregateOperation": [
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                499
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                499
            ],
            "openRecordIn": [
                617
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                619
            ],
            "fieldMetadataId": [
                499
            ],
            "id": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                194
            ],
            "periodStart": [
                194
            ],
            "timeSeries": [
                592
            ],
            "usageByApplication": [
                581
            ],
            "usageByModel": [
                581
            ],
            "usageByOperationType": [
                581
            ],
            "usageByUser": [
                581
            ],
            "userDailyUsage": [
                594
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                584
            ],
            "periodEnd": [
                194
            ],
            "periodStart": [
                194
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
            "__typename": [
                1
            ]
        },
        "UsageLimit": {
            "burstValue": [
                86
            ],
            "createdAt": [
                194
            ],
            "id": [
                499
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                86
            ],
            "operationType": [
                584
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                591
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                593
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                593
            ],
            "operationType": [
                584
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                583
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                587
            ],
            "resourceType": [
                591
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                585
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
                584
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                593
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                86
            ],
            "periodEnd": [
                194
            ],
            "periodStart": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                584
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                591
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                593
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                86
            ],
            "id": [
                499
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                86
            ],
            "operationType": [
                584
            ],
            "periodEnd": [
                194
            ],
            "periodStart": [
                194
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                86
            ],
            "resourceType": [
                591
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
                593
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
            "__typename": [
                1
            ]
        },
        "UsageUnit": {},
        "UsageUserDaily": {
            "dailyUsage": [
                592
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
                77
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                194
            ],
            "currentUserWorkspace": [
                598
            ],
            "currentWorkspace": [
                629
            ],
            "deletedAt": [
                194
            ],
            "deletedWorkspaceMembers": [
                207
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
                499
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
                371
            ],
            "previousOnboardingStatus": [
                371
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                194
            ],
            "userVars": [
                297
            ],
            "userWorkspaces": [
                598
            ],
            "workspaceMember": [
                638
            ],
            "workspaceMembers": [
                638
            ],
            "workspaces": [
                598
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
                296
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
        "UserSession": {
            "authProvider": [
                1
            ],
            "createdAt": [
                194
            ],
            "expiresAt": [
                194
            ],
            "id": [
                499
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
                194
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "id": [
                499
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                363
            ],
            "objectsPermissions": [
                363
            ],
            "permissionFlags": [
                388
            ],
            "twoFactorAuthenticationMethodSummary": [
                495
            ],
            "updatedAt": [
                194
            ],
            "user": [
                595
            ],
            "userId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                499
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
                499
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
                499
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                499
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
                499
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
                71
            ],
            "workspaceUrls": [
                647
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
                499
            ],
            "calendarEndFieldMetadataId": [
                499
            ],
            "calendarFieldMetadataId": [
                499
            ],
            "calendarLayout": [
                607
            ],
            "createdAt": [
                194
            ],
            "createdByUserWorkspaceId": [
                499
            ],
            "deletedAt": [
                194
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                499
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
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                499
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                616
            ],
            "mainGroupByFieldMetadataId": [
                499
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                499
            ],
            "openRecordIn": [
                617
            ],
            "position": [
                6
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                620
            ],
            "universalIdentifier": [
                499
            ],
            "updatedAt": [
                194
            ],
            "viewFieldGroups": [
                610
            ],
            "viewFields": [
                609
            ],
            "viewFilterGroups": [
                612
            ],
            "viewFilters": [
                611
            ],
            "viewGroups": [
                615
            ],
            "viewSorts": [
                618
            ],
            "visibility": [
                621
            ],
            "workspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                25
            ],
            "applicationId": [
                499
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "fieldMetadataId": [
                499
            ],
            "id": [
                499
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
                499
            ],
            "updatedAt": [
                194
            ],
            "viewFieldGroupId": [
                499
            ],
            "viewId": [
                499
            ],
            "workspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "id": [
                499
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
                194
            ],
            "viewFields": [
                609
            ],
            "viewId": [
                499
            ],
            "workspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "fieldMetadataId": [
                499
            ],
            "id": [
                499
            ],
            "operand": [
                614
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                499
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                194
            ],
            "value": [
                296
            ],
            "viewFilterGroupId": [
                499
            ],
            "viewId": [
                499
            ],
            "workspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "id": [
                499
            ],
            "logicalOperator": [
                613
            ],
            "parentViewFilterGroupId": [
                499
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                194
            ],
            "viewId": [
                499
            ],
            "workspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "fieldValue": [
                1
            ],
            "id": [
                499
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                194
            ],
            "viewId": [
                499
            ],
            "workspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "direction": [
                619
            ],
            "fieldMetadataId": [
                499
            ],
            "id": [
                499
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                194
            ],
            "viewId": [
                499
            ],
            "workspaceId": [
                499
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
                499
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "description": [
                1
            ],
            "id": [
                499
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
                194
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                24
            ],
            "on_BarChartConfiguration": [
                80
            ],
            "on_CalendarConfiguration": [
                120
            ],
            "on_CallRecordingSummaryConfiguration": [
                121
            ],
            "on_CallRecordingTranscriptConfiguration": [
                122
            ],
            "on_ChatConfiguration": [
                130
            ],
            "on_ChatThreadsConfiguration": [
                133
            ],
            "on_EmailThreadConfiguration": [
                223
            ],
            "on_EmailsConfiguration": [
                227
            ],
            "on_FieldConfiguration": [
                250
            ],
            "on_FieldRichTextConfiguration": [
                258
            ],
            "on_FieldsConfiguration": [
                259
            ],
            "on_FilesConfiguration": [
                265
            ],
            "on_FormFieldConfiguration": [
                268
            ],
            "on_FrontComponentConfiguration": [
                270
            ],
            "on_IframeConfiguration": [
                280
            ],
            "on_LineChartConfiguration": [
                300
            ],
            "on_MessageCampaignBodyConfiguration": [
                321
            ],
            "on_MessageCampaignDetailsConfiguration": [
                322
            ],
            "on_NotesConfiguration": [
                354
            ],
            "on_PieChartConfiguration": [
                389
            ],
            "on_RecordTableConfiguration": [
                417
            ],
            "on_StandaloneRichTextConfiguration": [
                467
            ],
            "on_TasksConfiguration": [
                476
            ],
            "on_TimelineConfiguration": [
                480
            ],
            "on_ViewConfiguration": [
                608
            ],
            "on_WorkflowConfiguration": [
                626
            ],
            "on_WorkflowRunConfiguration": [
                627
            ],
            "on_WorkflowVersionConfiguration": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                630
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                27
            ],
            "aiChatModelTier": [
                27
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                296
            ],
            "allowImpersonation": [
                4
            ],
            "allowedIframeOrigins": [
                1
            ],
            "billingCustomer": [
                88
            ],
            "billingEntitlements": [
                90
            ],
            "billingSubscriptions": [
                106
            ],
            "createdAt": [
                194
            ],
            "currentBillingSubscription": [
                106
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                426
            ],
            "deletedAt": [
                194
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
                247
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                499
            ],
            "installedApplications": [
                42
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
                499
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
                194
            ],
            "viewFields": [
                609
            ],
            "viewFilterGroups": [
                612
            ],
            "viewFilters": [
                611
            ],
            "viewGroups": [
                615
            ],
            "viewSorts": [
                618
            ],
            "views": [
                606
            ],
            "workspaceCustomApplication": [
                42
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                635
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                647
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
                296
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                632
            ],
            "personEnrichment": [
                296
            ],
            "personOutcome": [
                645
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
                194
            ],
            "id": [
                499
            ],
            "roleId": [
                499
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
                640
            ],
            "id": [
                499
            ],
            "locale": [
                1
            ],
            "name": [
                272
            ],
            "numberFormat": [
                641
            ],
            "openRecordIn": [
                374
            ],
            "roles": [
                426
            ],
            "timeFormat": [
                642
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
                499
            ],
            "userWorkspaceId": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                499
            ],
            "variables": [
                596
            ],
            "workspaceMemberId": [
                499
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
                296
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
                499
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
                499
            ],
            "workspaceUrls": [
                647
            ],
            "__typename": [
                1
            ]
        }
    }
}