export default {
    "scalars": [
        1,
        4,
        6,
        7,
        8,
        11,
        15,
        17,
        18,
        24,
        26,
        28,
        31,
        33,
        40,
        52,
        60,
        62,
        68,
        80,
        84,
        85,
        87,
        92,
        97,
        103,
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
        276,
        278,
        288,
        295,
        296,
        297,
        308,
        310,
        323,
        324,
        325,
        326,
        327,
        328,
        330,
        331,
        332,
        335,
        336,
        338,
        339,
        342,
        344,
        348,
        352,
        361,
        368,
        369,
        370,
        373,
        377,
        378,
        383,
        387,
        408,
        410,
        411,
        414,
        419,
        431,
        433,
        437,
        442,
        459,
        471,
        472,
        474,
        490,
        492,
        494,
        555,
        575,
        582,
        584,
        598,
        604,
        605,
        607,
        608,
        610,
        611,
        612,
        615,
        616,
        621,
        623,
        626,
        631,
        632,
        633,
        636,
        637
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
                295
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
                490
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
                490
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
                295
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
                295
            ],
            "roleId": [
                490
            ],
            "triggers": [
                295
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
                490
            ],
            "name": [
                1
            ],
            "visibility": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelAssignmentFilter": {},
        "AgentChatChannelThreadStatus": {},
        "AgentChatChannelVisibility": {},
        "AgentChatEvent": {
            "event": [
                295
            ],
            "threadId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatInboxChannelSummary": {
            "channelId": [
                490
            ],
            "hasUnreadOpen": [
                4
            ],
            "openCount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "AgentChatInboxSummary": {
            "channels": [
                10
            ],
            "hasUnreadAssigned": [
                4
            ],
            "hasUnreadMention": [
                4
            ],
            "hasUnreadOpen": [
                4
            ],
            "needsInputCount": [
                11
            ],
            "openCount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatInboxThreadIds": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                4
            ],
            "threadIds": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatInboxViewInput": {
            "assignment": [
                6
            ],
            "channelId": [
                490
            ],
            "channelStatus": [
                7
            ],
            "kind": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatInboxViewKind": {},
        "AgentChatThread": {
            "contextWindowTokens": [
                11
            ],
            "conversationSize": [
                11
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
                11
            ],
            "totalInputCredits": [
                18
            ],
            "totalInputTokens": [
                11
            ],
            "totalOutputCredits": [
                18
            ],
            "totalOutputTokens": [
                11
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                194
            ],
            "id": [
                490
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
                490
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                490
            ],
            "createdAt": [
                194
            ],
            "id": [
                490
            ],
            "parts": [
                22
            ],
            "processedAt": [
                194
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                490
            ],
            "status": [
                1
            ],
            "threadId": [
                490
            ],
            "turnId": [
                490
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
                490
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                490
            ],
            "messageId": [
                490
            ],
            "orderIndex": [
                11
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                295
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
                295
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                295
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
                18
            ],
            "endedAt": [
                194
            ],
            "errorMessage": [
                1
            ],
            "id": [
                490
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
                194
            ],
            "status": [
                24
            ],
            "threadId": [
                490
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
                490
            ],
            "aggregateOperation": [
                26
            ],
            "configurationType": [
                615
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                295
            ],
            "firstDayOfTheWeek": [
                11
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
                403
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
                194
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
                30
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "AnalyticsType": {},
        "ApiConfig": {
            "mutationMaximumAffectedRecords": [
                18
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
                490
            ],
            "name": [
                1
            ],
            "revokedAt": [
                194
            ],
            "role": [
                425
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
                490
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
                40
            ],
            "value": [
                295
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
                42
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
                490
            ],
            "role": [
                332
            ],
            "workspaceMemberId": [
                490
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
                490
            ],
            "applicationVariables": [
                67
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                295
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                142
            ],
            "defaultLogicFunctionRole": [
                425
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
                490
            ],
            "id": [
                490
            ],
            "logicFunctions": [
                307
            ],
            "logoFileId": [
                490
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                354
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                490
            ],
            "settingsCustomTabFrontComponentId": [
                490
            ],
            "settingsMenuItems": [
                458
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                490
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
                490
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
                490
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                490
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
                399
            ],
            "connectionProviderId": [
                490
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
                490
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
                490
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
                490
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                48
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
                50
            ],
            "coverage": [
                51
            ],
            "files": [
                53
            ],
            "manifest": [
                295
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
                52
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
                490
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
                194
            ],
            "fileFolder": [
                262
            ],
            "fileId": [
                490
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
                58
            ],
            "description": [
                1
            ],
            "status": [
                60
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
                490
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
                490
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
                194
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
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                11
            ],
            "versionDistribution": [
                596
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                490
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
                194
            ],
            "description": [
                1
            ],
            "id": [
                490
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
                295
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
                490
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
                295
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
                194
            ],
            "domain": [
                1
            ],
            "id": [
                490
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
                441
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
                490
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
                440
            ],
            "workspaceUrls": [
                638
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
                490
            ],
            "aggregateOperation": [
                26
            ],
            "axisNameDisplay": [
                80
            ],
            "color": [
                1
            ],
            "configurationType": [
                615
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
                295
            ],
            "firstDayOfTheWeek": [
                11
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
                129
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                368
            ],
            "primaryAxisGroupByFieldMetadataId": [
                490
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                276
            ],
            "rangeMax": [
                18
            ],
            "rangeMin": [
                18
            ],
            "secondaryAxisGroupByDateGranularity": [
                368
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                490
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                276
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
                295
            ],
            "formattedToRawLookup": [
                295
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
                295
            ],
            "objectMetadataId": [
                490
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
                490
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
                472
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
            "meteredProducts": [
                94
            ],
            "planKey": [
                97
            ],
            "resourceCreditProducts": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingPriceLicensed": {
            "creditAmount": [
                18
            ],
            "isSellable": [
                4
            ],
            "priceUsageType": [
                113
            ],
            "recurringInterval": [
                471
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                18
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
                471
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
                18
            ],
            "unitAmount": [
                18
            ],
            "upTo": [
                18
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
                113
            ],
            "productKey": [
                103
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "grantedCredits": [
                18
            ],
            "periodEnd": [
                194
            ],
            "periodStart": [
                194
            ],
            "productKey": [
                103
            ],
            "rolloverCredits": [
                18
            ],
            "totalGrantedCredits": [
                18
            ],
            "unitPriceCents": [
                18
            ],
            "usedCredits": [
                18
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
            "currentPeriodEnd": [
                194
            ],
            "id": [
                490
            ],
            "interval": [
                471
            ],
            "metadata": [
                295
            ],
            "phases": [
                109
            ],
            "status": [
                472
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "billingProduct": [
                102
            ],
            "creditAmount": [
                18
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                490
            ],
            "quantity": [
                18
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                18
            ],
            "items": [
                110
            ],
            "start_date": [
                18
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
                18
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                18
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
                490
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
                490
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
                18
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
                615
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                615
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
                615
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                295
            ],
            "error": [
                132
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
                615
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                18
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
                18
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
                18
            ],
            "maxScoreLevels": [
                18
            ],
            "medianLatencyMs": [
                18
            ],
            "modelId": [
                1
            ],
            "outputCostPerMillionTokens": [
                18
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
                18
            ],
            "costPerTask": [
                18
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
                18
            ],
            "intelligenceIndex": [
                18
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
                18
            ],
            "modelFamily": [
                348
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                350
            ],
            "outputCostPerMillionTokens": [
                18
            ],
            "outputTokensPerSecond": [
                18
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
                28
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
                34
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
                397
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                456
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                473
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
                31
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
                490
            ],
            "availabilityObjectMetadataId": [
                490
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
                490
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
                490
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                490
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
                490
            ],
            "pageLayoutId": [
                490
            ],
            "payload": [
                144
            ],
            "position": [
                18
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                490
            ],
            "updatedAt": [
                194
            ],
            "workflowVersionId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                360
            ],
            "on_PathCommandMenuItemPayload": [
                385
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                54
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
                490
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
                399
            ],
            "connectionProviderId": [
                490
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
                490
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
                490
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
                281
            ],
            "handle": [
                1
            ],
            "id": [
                490
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                490
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
                18
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
            "memberIds": [
                490
            ],
            "name": [
                1
            ],
            "visibility": [
                8
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
                295
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
                295
            ],
            "roleId": [
                490
            ],
            "triggers": [
                295
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                490
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                328
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                55
            ],
            "targets": [
                57
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
                490
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
                490
            ],
            "engineComponentKey": [
                228
            ],
            "frontComponentId": [
                490
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
                490
            ],
            "pageLayoutId": [
                490
            ],
            "payload": [
                295
            ],
            "position": [
                18
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                490
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
                322
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
                295
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
                295
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                490
            ],
            "options": [
                295
            ],
            "relationCreationPayload": [
                295
            ],
            "settings": [
                295
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
                490
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
                490
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
                288
            ],
            "objectMetadataId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                295
            ],
            "databaseEventTriggerSettings": [
                295
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                295
            ],
            "id": [
                490
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                295
            ],
            "source": [
                295
            ],
            "timeoutSeconds": [
                18
            ],
            "toolTriggerSettings": [
                295
            ],
            "universalIdentifier": [
                490
            ],
            "workflowActionTriggerSettings": [
                295
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
                490
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
                490
            ],
            "icon": [
                1
            ],
            "id": [
                490
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                490
            ],
            "position": [
                18
            ],
            "targetObjectMetadataId": [
                490
            ],
            "targetRecordId": [
                490
            ],
            "type": [
                352
            ],
            "userWorkspaceId": [
                490
            ],
            "viewId": [
                490
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
                295
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
                490
            ],
            "type": [
                378
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                377
            ],
            "pageLayoutId": [
                490
            ],
            "position": [
                18
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
                295
            ],
            "objectMetadataId": [
                490
            ],
            "pageLayoutTabId": [
                490
            ],
            "position": [
                295
            ],
            "title": [
                1
            ],
            "type": [
                616
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                490
            ],
            "filter": [
                295
            ],
            "objectMetadataId": [
                490
            ],
            "orderBy": [
                295
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
                490
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
                494
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
                575
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                582
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                584
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
                490
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                490
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                18
            ],
            "viewId": [
                490
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
                490
            ],
            "id": [
                490
            ],
            "isVisible": [
                4
            ],
            "position": [
                18
            ],
            "size": [
                18
            ],
            "viewFieldGroupId": [
                490
            ],
            "viewId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                490
            ],
            "logicalOperator": [
                604
            ],
            "parentViewFilterGroupId": [
                490
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "viewId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                490
            ],
            "id": [
                490
            ],
            "operand": [
                605
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "relationTargetFieldMetadataId": [
                490
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                490
            ],
            "viewId": [
                490
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
                490
            ],
            "isVisible": [
                4
            ],
            "position": [
                18
            ],
            "viewId": [
                490
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
                490
            ],
            "calendarFieldMetadataId": [
                490
            ],
            "calendarLayout": [
                598
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                490
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                490
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                607
            ],
            "mainGroupByFieldMetadataId": [
                490
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                490
            ],
            "openRecordIn": [
                608
            ],
            "position": [
                18
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                611
            ],
            "visibility": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                610
            ],
            "fieldMetadataId": [
                490
            ],
            "id": [
                490
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                490
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
                490
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                490
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                490
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
                490
            ],
            "name": [
                271
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                490
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
                490
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
                490
            ],
            "pageLayoutId": [
                490
            ],
            "position": [
                18
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
                490
            ],
            "memberCount": [
                18
            ],
            "name": [
                1
            ],
            "position": [
                18
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
                490
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
            ],
            "type": [
                278
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                490
            ],
            "status": [
                442
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
                615
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
                490
            ],
            "status": [
                225
            ],
            "tenantStatus": [
                226
            ],
            "unsubscribeHostnameStatus": [
                492
            ],
            "updatedAt": [
                194
            ],
            "verificationRecords": [
                593
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
                615
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
                295
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
                295
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
                11
            ],
            "jobs": [
                230
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                295
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
                4
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
                11
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
                4
            ],
            "objectMetadataId": [
                1
            ],
            "properties": [
                295
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
                337
            ],
            "objectRecordEventsWithQueryIds": [
                367
            ],
            "queueJobEvents": [
                298
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                490
            ],
            "payload": [
                295
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
                490
            ],
            "createdAt": [
                194
            ],
            "defaultValue": [
                295
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                490
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
                490
            ],
            "morphRelations": [
                418
            ],
            "name": [
                1
            ],
            "object": [
                354
            ],
            "objectMetadataId": [
                490
            ],
            "options": [
                295
            ],
            "relation": [
                418
            ],
            "settings": [
                295
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
                344
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                615
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
                374
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
                491
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
                491
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
                490
            ],
            "id": [
                490
            ],
            "objectMetadataId": [
                490
            ],
            "roleId": [
                490
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
                490
            ],
            "objectMetadataId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                615
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
                490
            ],
            "path": [
                1
            ],
            "size": [
                18
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
                490
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
                490
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
                490
            ],
            "path": [
                1
            ],
            "size": [
                18
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
                615
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                490
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
            ],
            "type": [
                278
            ],
            "workspace": [
                635
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
                335
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                615
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
                490
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                66
            ],
            "applicationVariables": [
                295
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
                490
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
                490
            ],
            "updatedAt": [
                194
            ],
            "usesSdkClient": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                615
            ],
            "frontComponentId": [
                490
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                490
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
                490
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
                490
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
                490
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
                490
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
                18
            ],
            "columnSpan": [
                18
            ],
            "row": [
                18
            ],
            "rowSpan": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                615
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
                282
            ],
            "IMAP": [
                282
            ],
            "SMTP": [
                282
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
                18
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
                639
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
                490
            ],
            "indexFieldMetadataList": [
                286
            ],
            "indexType": [
                288
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
                284
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
                490
            ],
            "id": [
                490
            ],
            "order": [
                18
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
                287
            ],
            "id": [
                491
            ],
            "isCustom": [
                114
            ],
            "or": [
                287
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                490
            ],
            "messages": [
                41
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                291
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
                490
            ],
            "messageThreadId": [
                490
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
                11
            ],
            "enqueuedAt": [
                18
            ],
            "failedReason": [
                1
            ],
            "finishedAt": [
                18
            ],
            "jobId": [
                1
            ],
            "progress": [
                11
            ],
            "startedAt": [
                18
            ],
            "state": [
                297
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                490
            ],
            "aggregateOperation": [
                26
            ],
            "axisNameDisplay": [
                80
            ],
            "color": [
                1
            ],
            "configurationType": [
                615
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
                295
            ],
            "firstDayOfTheWeek": [
                11
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
                368
            ],
            "primaryAxisGroupByFieldMetadataId": [
                490
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                276
            ],
            "rangeMax": [
                18
            ],
            "rangeMin": [
                18
            ],
            "secondaryAxisGroupByDateGranularity": [
                368
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                490
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                276
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
                295
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                303
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
                295
            ],
            "objectMetadataId": [
                490
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
                18
            ],
            "__typename": [
                1
            ]
        },
        "LineChartSeries": {
            "data": [
                302
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "Location": {
            "lat": [
                18
            ],
            "lng": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunction": {
            "applicationId": [
                490
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                194
            ],
            "cronTriggerSettings": [
                295
            ],
            "databaseEventTriggerSettings": [
                295
            ],
            "description": [
                1
            ],
            "executionMode": [
                308
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                295
            ],
            "id": [
                490
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
                18
            ],
            "toolTriggerSettings": [
                295
            ],
            "universalIdentifier": [
                490
            ],
            "updatedAt": [
                194
            ],
            "workflowActionTriggerSettings": [
                295
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                295
            ],
            "duration": [
                18
            ],
            "error": [
                295
            ],
            "logs": [
                1
            ],
            "status": [
                310
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                490
            ],
            "applicationUniversalIdentifier": [
                490
            ],
            "id": [
                490
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                490
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
                295
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
                317
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
                318
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                319
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
                615
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                615
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
                490
            ],
            "contactAutoCreationPolicy": [
                323
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
                490
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                330
            ],
            "pendingGroupEmailsAction": [
                324
            ],
            "syncStage": [
                325
            ],
            "syncStageStartedAt": [
                194
            ],
            "syncStatus": [
                326
            ],
            "syncedAt": [
                194
            ],
            "throttleFailureCount": [
                18
            ],
            "throttleRetryAfter": [
                194
            ],
            "type": [
                327
            ],
            "updatedAt": [
                194
            ],
            "visibility": [
                328
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
                490
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                490
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                331
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
                490
            ],
            "reason": [
                335
            ],
            "source": [
                336
            ],
            "unsubscribeTopicId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                333
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
                366
            ],
            "recordId": [
                1
            ],
            "type": [
                338
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
                490
            ],
            "property": [
                1
            ],
            "provenance": [
                342
            ],
            "recordId": [
                490
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
                490
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                490
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
                346
            ],
            "views": [
                347
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
                490
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
                490
            ],
            "key": [
                607
            ],
            "objectMetadataId": [
                490
            ],
            "type": [
                611
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                465,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                620,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatChannelMembers": [
                4,
                {
                    "channelId": [
                        490,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        490,
                        "[UUID!]!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                490,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        490,
                        "[UUID!]!"
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
            "archiveAgentChatThread": [
                19,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        490
                    ],
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        490,
                        "UUID!"
                    ],
                    "roleId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        490,
                        "UUID!"
                    ],
                    "roleId": [
                        490,
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
                106,
                {
                    "plan": [
                        97,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        471,
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
                        490,
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
                        490,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                372,
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
                35,
                {
                    "input": [
                        152,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                322,
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
                        56,
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
                69,
                {
                    "input": [
                        157,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                95
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
                        490
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
                        18,
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
                351,
                {
                    "inputs": [
                        170,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                601,
                {
                    "inputs": [
                        184,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                600,
                {
                    "inputs": [
                        185,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                606,
                {
                    "inputs": [
                        188,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                333,
                {
                    "input": [
                        169,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                351,
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
                        18,
                        "Float!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                462,
                {
                    "input": [
                        460,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                32,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        490,
                        "UUID!"
                    ],
                    "properties": [
                        295
                    ],
                    "recordId": [
                        490,
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
                284,
                {
                    "input": [
                        173,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                307,
                {
                    "input": [
                        168,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                354,
                {
                    "input": [
                        174,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                425,
                {
                    "createRoleInput": [
                        179,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                375,
                {
                    "input": [
                        175,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                376,
                {
                    "input": [
                        176,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                379,
                {
                    "input": [
                        177,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                396,
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
                462,
                {
                    "input": [
                        461,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                465,
                {
                    "input": [
                        180,
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
                        471,
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
                493,
                {
                    "input": [
                        181,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                573,
                {
                    "input": [
                        182,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                592,
                {
                    "input": [
                        183,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                597,
                {
                    "input": [
                        189,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                600,
                {
                    "input": [
                        185,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                601,
                {
                    "input": [
                        184,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                602,
                {
                    "input": [
                        187,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                603,
                {
                    "input": [
                        186,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                606,
                {
                    "input": [
                        188,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                609,
                {
                    "input": [
                        190,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                613,
                {
                    "input": [
                        191,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                465,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        490,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        490
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
                        40
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                322,
                {
                    "id": [
                        490,
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
                        490,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                146,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                620
            ],
            "deleteEmailGroupChannel": [
                322,
                {
                    "id": [
                        490,
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
                        490,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                351,
                {
                    "ids": [
                        490,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                351,
                {
                    "id": [
                        490,
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
                249,
                {
                    "input": [
                        196,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                284,
                {
                    "input": [
                        197,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                307,
                {
                    "input": [
                        311,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                354,
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
                        490,
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
                        490,
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
                465,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                201,
                {
                    "twoFactorAuthenticationMethodId": [
                        490,
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
                        490,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                586
            ],
            "deleteUserFromWorkspace": [
                589,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                592,
                {
                    "id": [
                        490,
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
                600,
                {
                    "input": [
                        203,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                601,
                {
                    "input": [
                        202,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                602,
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
                606,
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
                613,
                {
                    "id": [
                        490,
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
                600,
                {
                    "input": [
                        209,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                601,
                {
                    "input": [
                        208,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                602,
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
                606,
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
                        490,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                216,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                217,
                {
                    "id": [
                        490,
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
                        490
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                90
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
                624
            ],
            "executeOneLogicFunction": [
                309,
                {
                    "input": [
                        246,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                37,
                {
                    "apiKeyId": [
                        490,
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
                        490,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                72
            ],
            "generateTransientToken": [
                481
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                487,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        490,
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
                488,
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
                273,
                {
                    "input": [
                        274,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                314,
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
                371
            ],
            "grantApplicationCapabilities": [
                45,
                {
                    "input": [
                        275,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                283,
                {
                    "userId": [
                        490,
                        "UUID!"
                    ],
                    "workspaceId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                290,
                {
                    "input": [
                        289,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                292,
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
                292
            ],
            "installApplication": [
                43,
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
            "joinAgentChatChannel": [
                4,
                {
                    "channelId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "leaveAgentChatChannel": [
                4,
                {
                    "channelId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsDoneInChannel": [
                4,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsRead": [
                19,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsUnread": [
                19,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        490
                    ],
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToInbox": [
                19,
                {
                    "threadId": [
                        490,
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
            "removeAgentChatChannelMember": [
                4,
                {
                    "channelId": [
                        490,
                        "UUID!"
                    ],
                    "memberWorkspaceMemberId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        420,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                412,
                {
                    "principal": [
                        409,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        417,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        490,
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
            "reopenAgentChatThreadInChannel": [
                4,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        421,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                422,
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
                452,
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
                        490,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                379,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                476,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                445,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                11
            ],
            "revokeApiKey": [
                35,
                {
                    "input": [
                        423,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                427,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                438,
                {
                    "input": [
                        434,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                59,
                {
                    "applicationId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                280,
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
                        490
                    ]
                }
            ],
            "sendChatMessage": [
                445,
                {
                    "browsingContext": [
                        295
                    ],
                    "fileAttachments": [
                        261,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        490,
                        "[UUID!]"
                    ],
                    "messageId": [
                        490,
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
                        490,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                448,
                {
                    "input": [
                        447,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                451,
                {
                    "input": [
                        450,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                452,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        490
                    ]
                }
            ],
            "sendMessageCampaign": [
                454,
                {
                    "input": [
                        453,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                449,
                {
                    "input": [
                        455,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                39,
                {
                    "input": [
                        457,
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
                412,
                {
                    "accessLevel": [
                        408,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        417,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                412,
                {
                    "accessLevel": [
                        408,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        409,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        417,
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
                463,
                {
                    "input": [
                        464
                    ]
                }
            ],
            "signUpInWorkspace": [
                463,
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
                        490
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
                372,
                {
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "snoozeAgentChatThread": [
                19,
                {
                    "snoozedUntil": [
                        194,
                        "DateTime!"
                    ],
                    "threadId": [
                        490,
                        "UUID!"
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
                        490,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                128,
                {
                    "connectedAccountId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                467,
                {
                    "companyContext": [
                        295
                    ],
                    "personContext": [
                        295
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                468
            ],
            "subscribeToAgentChatThread": [
                19,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "switchBillingPlan": [
                112
            ],
            "switchSubscriptionInterval": [
                112
            ],
            "syncApplication": [
                634,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        295,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "trackAnalytics": [
                32,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        295
                    ],
                    "type": [
                        33,
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
            "triggerInstallApplicationJob": [
                483,
                {
                    "input": [
                        482,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                485,
                {
                    "input": [
                        484,
                        "TriggerUninstallApplicationJobInput!"
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
            "unsubscribeFromAgentChatThread": [
                19,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "updateAgentChatChannel": [
                5,
                {
                    "channelId": [
                        490,
                        "UUID!"
                    ],
                    "input": [
                        495,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateApiKey": [
                35,
                {
                    "input": [
                        497,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                322,
                {
                    "input": [
                        498,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                43,
                {
                    "id": [
                        490,
                        "UUID!"
                    ],
                    "input": [
                        499,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                61,
                {
                    "input": [
                        500,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                65,
                {
                    "input": [
                        502,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                115,
                {
                    "input": [
                        504,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                142,
                {
                    "input": [
                        506,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                322,
                {
                    "input": [
                        507,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                269,
                {
                    "input": [
                        509,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                247,
                {
                    "input": [
                        511,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                351,
                {
                    "inputs": [
                        522,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                354,
                {
                    "inputs": [
                        523,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                606,
                {
                    "inputs": [
                        545,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                322,
                {
                    "input": [
                        514,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                329,
                {
                    "input": [
                        516,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                329,
                {
                    "input": [
                        518,
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
                351,
                {
                    "input": [
                        522,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        496,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        490
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
                        521,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        512,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                354,
                {
                    "input": [
                        523,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                425,
                {
                    "updateRoleInput": [
                        530,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        524,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        525,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                379,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        527,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        529,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                293,
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
                465,
                {
                    "input": [
                        532,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                476,
                {
                    "input": [
                        533,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                493,
                {
                    "input": [
                        534,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                573,
                {
                    "input": [
                        535,
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
                592,
                {
                    "input": [
                        536,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                597,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        547,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                600,
                {
                    "input": [
                        540,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                601,
                {
                    "input": [
                        538,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                602,
                {
                    "input": [
                        543,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                603,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        542,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                606,
                {
                    "input": [
                        545,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                609,
                {
                    "input": [
                        548,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                613,
                {
                    "input": [
                        550,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                620,
                {
                    "data": [
                        553,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                620,
                {
                    "data": [
                        552,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                629,
                {
                    "roleId": [
                        490,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        554,
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
                        555,
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
                        555,
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
                        555,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                264,
                {
                    "file": [
                        555,
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
                        555,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                264,
                {
                    "file": [
                        555,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                256,
                {
                    "upsertFieldPermissionsInput": [
                        556,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                597,
                {
                    "input": [
                        559,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                362,
                {
                    "upsertObjectPermissionsInput": [
                        560,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                426,
                {
                    "upsertPermissionFlagsInput": [
                        561,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                563,
                {
                    "input": [
                        562,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                597,
                {
                    "input": [
                        564,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                69,
                {
                    "input": [
                        590,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                594,
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
                224,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                595,
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
                490
            ],
            "color": [
                1
            ],
            "createdAt": [
                194
            ],
            "folderId": [
                490
            ],
            "icon": [
                1
            ],
            "id": [
                490
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                490
            ],
            "position": [
                18
            ],
            "targetObjectMetadataId": [
                490
            ],
            "targetRecordId": [
                490
            ],
            "targetRecordIdentifier": [
                405
            ],
            "type": [
                352
            ],
            "updatedAt": [
                194
            ],
            "userWorkspaceId": [
                490
            ],
            "viewId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                490
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
                357,
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
                490
            ],
            "imageIdentifierFieldMetadataId": [
                490
            ],
            "indexMetadataList": [
                284
            ],
            "indexMetadatas": [
                359,
                {
                    "filter": [
                        287,
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
                490
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
                361
            ],
            "readability": [
                339
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                490
            ],
            "searchFieldMetadataList": [
                444
            ],
            "sharingReach": [
                369
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
                344
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                356
            ],
            "pageInfo": [
                374
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
                354
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
                374
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                358
            ],
            "id": [
                491
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
                358
            ],
            "universalIdentifier": [
                491
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                285
            ],
            "pageInfo": [
                374
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                490
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
                490
            ],
            "restrictedFields": [
                295
            ],
            "rowLevelPermissionPredicateGroups": [
                429
            ],
            "rowLevelPermissionPredicates": [
                428
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
                490
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
                193
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                366
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
                295
            ],
            "before": [
                295
            ],
            "diff": [
                295
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
                365
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
                370
            ],
            "previousOnboardingStatus": [
                370
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
                490
            ],
            "createdAt": [
                194
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                490
            ],
            "deletedAt": [
                194
            ],
            "id": [
                490
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
                490
            ],
            "tabs": [
                376
            ],
            "type": [
                378
            ],
            "universalIdentifier": [
                490
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
                490
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
                490
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
                377
            ],
            "pageLayoutId": [
                490
            ],
            "position": [
                18
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                490
            ],
            "updatedAt": [
                194
            ],
            "widgets": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                490
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                295
            ],
            "configuration": [
                614
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "gridPosition": [
                277
            ],
            "id": [
                490
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
                490
            ],
            "pageLayoutTabId": [
                490
            ],
            "position": [
                382
            ],
            "title": [
                1
            ],
            "type": [
                616
            ],
            "universalIdentifier": [
                490
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
                377
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
                377
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
                380
            ],
            "on_PageLayoutWidgetGridPosition": [
                381
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                384
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                383
            ],
            "index": [
                11
            ],
            "layoutMode": [
                377
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
                490
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
                490
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
                490
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
                490
            ],
            "aggregateOperation": [
                26
            ],
            "color": [
                1
            ],
            "configurationType": [
                615
            ],
            "dateGranularity": [
                368
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
                295
            ],
            "firstDayOfTheWeek": [
                11
            ],
            "groupByFieldMetadataId": [
                490
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
                276
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
                391
            ],
            "formattedToRawLookup": [
                295
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
                295
            ],
            "objectMetadataId": [
                490
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
                18
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
                306
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
                490
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
                18
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
                490
            ],
            "createdAt": [
                194
            ],
            "domain": [
                1
            ],
            "id": [
                490
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
                398
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
                395
            ],
            "IMAP": [
                395
            ],
            "SMTP": [
                395
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
                490
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                638
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
                490
            ],
            "logo": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "agentChatInboxSummary": [
                12
            ],
            "agentChatInboxThreadIds": [
                13,
                {
                    "after": [
                        1
                    ],
                    "first": [
                        11
                    ],
                    "view": [
                        14,
                        "AgentChatInboxViewInput!"
                    ]
                }
            ],
            "agentRuns": [
                23,
                {
                    "agentId": [
                        490,
                        "UUID!"
                    ],
                    "limit": [
                        11,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                27
            ],
            "apiKey": [
                35,
                {
                    "input": [
                        272,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                35
            ],
            "appConnection": [
                38,
                {
                    "id": [
                        17,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                38,
                {
                    "filter": [
                        304
                    ]
                }
            ],
            "appKeyValue": [
                39,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        40
                    ]
                }
            ],
            "appMessageChannels": [
                322,
                {
                    "filter": [
                        305
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                46,
                {
                    "applicationId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                47,
                {
                    "applicationId": [
                        490,
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
                443,
                {
                    "applicationId": [
                        490,
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
                490,
                {
                    "calendarEventId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                131,
                {
                    "threadId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                16,
                {
                    "id": [
                        490,
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
                628,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                469,
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
                        490,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                142
            ],
            "currentUser": [
                586
            ],
            "currentUserApplicationAuthorizations": [
                44
            ],
            "currentUserSessions": [
                588
            ],
            "currentWorkspace": [
                620
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
                49,
                {
                    "universalIdentifier": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                249,
                {
                    "id": [
                        490,
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
                394,
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
            "findApplicationRegistrationStats": [
                63,
                {
                    "id": [
                        1,
                        "String!"
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
                298,
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
                61
            ],
            "findManyApplications": [
                43
            ],
            "findManyLogicFunctions": [
                307
            ],
            "findManyMarketplaceApps": [
                315,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                396
            ],
            "findMarketplaceAppDetail": [
                316,
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
                43,
                {
                    "id": [
                        490
                    ],
                    "universalIdentifier": [
                        490
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
                307,
                {
                    "input": [
                        311,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                298,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                622
            ],
            "findWorkspaceFromInviteHash": [
                620,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                627
            ],
            "frontComponent": [
                269,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                269
            ],
            "getAddressDetails": [
                392,
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
                29
            ],
            "getApiKeyRoles": [
                425
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
                295,
                {
                    "input": [
                        311,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                147,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                224
            ],
            "getInviteSuggestions": [
                294
            ],
            "getJobs": [
                298,
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
                        311,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                376,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                379,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                379,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                375,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        378
                    ]
                }
            ],
            "getPermissionFlags": [
                386
            ],
            "getPublicWorkspaceDataByDomain": [
                400,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                401,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                105
            ],
            "getRole": [
                425,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                425
            ],
            "getSSOIdentityProviders": [
                266
            ],
            "getToolIndex": [
                480
            ],
            "getToolInputSchema": [
                295,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                570,
                {
                    "input": [
                        571
                    ]
                }
            ],
            "getView": [
                597,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                600,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                601,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                601,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                600,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                602,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                603,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                603,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                602,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                606,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                606,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                609,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                609,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                597,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        611,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                625
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
                300,
                {
                    "input": [
                        301,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                96
            ],
            "messageSuppressions": [
                334,
                {
                    "input": [
                        267,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                340,
                {
                    "input": [
                        343,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                345
            ],
            "mostlyEmptyFieldMetadataIds": [
                490,
                {
                    "objectMetadataId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                115,
                {
                    "connectedAccountId": [
                        490
                    ]
                }
            ],
            "myConnectedAccounts": [
                146
            ],
            "myMessageChannels": [
                322,
                {
                    "connectedAccountId": [
                        490
                    ]
                }
            ],
            "myMessageFolders": [
                329,
                {
                    "messageChannelId": [
                        490
                    ]
                }
            ],
            "myUserApplicationVariables": [
                630
            ],
            "navigationMenuItem": [
                351,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                351
            ],
            "object": [
                354,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                364
            ],
            "objects": [
                355,
                {
                    "filter": [
                        358,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        192,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                389,
                {
                    "input": [
                        390,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                123,
                {
                    "input": [
                        393,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                316,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                315,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                407,
                {
                    "targets": [
                        417,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                412,
                {
                    "target": [
                        417,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                465,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                465
            ],
            "timelineActivityTypes": [
                476
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                489,
                {
                    "userId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                493
            ],
            "usageLimits": [
                573
            ],
            "usageQuotaDefinitions": [
                577
            ],
            "usageQuotaScopeConsumption": [
                579,
                {
                    "input": [
                        580,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                581
            ],
            "validatePasswordResetToken": [
                591,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                592,
                {
                    "objectMetadataId": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                613,
                {
                    "id": [
                        490,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                613
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                490
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
                490
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
                490
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
                490
            ],
            "permissions": [
                406
            ],
            "recordId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                490
            ],
            "workspaceMemberId": [
                490
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
                408
            ],
            "generalAccessLevel": [
                408
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                406
            ],
            "roles": [
                415
            ],
            "shares": [
                413
            ],
            "sharingMode": [
                414
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                408
            ],
            "id": [
                17
            ],
            "principalId": [
                490
            ],
            "principalRoleId": [
                490
            ],
            "principalType": [
                410
            ],
            "rowCause": [
                411
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
                490
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
                615
            ],
            "isUIEditable": [
                4
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
                490
            ],
            "recordId": [
                490
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
                354
            ],
            "targetFieldMetadata": [
                249
            ],
            "targetObjectMetadata": [
                354
            ],
            "type": [
                419
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
                490
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
                36
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
                490
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                362
            ],
            "permissionFlags": [
                426
            ],
            "rowLevelPermissionPredicateGroups": [
                429
            ],
            "rowLevelPermissionPredicates": [
                428
            ],
            "universalIdentifier": [
                490
            ],
            "workspaceMembers": [
                629
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
                490
            ],
            "roleId": [
                490
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
                433
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                18
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
                295
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
                431
            ],
            "objectMetadataId": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                18
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
                490
            ],
            "logicalOperator": [
                431
            ],
            "objectMetadataId": [
                490
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                490
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicateInput": {
            "fieldMetadataId": [
                490
            ],
            "id": [
                490
            ],
            "operand": [
                433
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                18
            ],
            "rowLevelPermissionPredicateGroupId": [
                490
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
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
                436
            ],
            "messages": [
                436
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                490
            ],
            "thread": [
                439
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                490
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
                435
            ],
            "content": [
                1
            ],
            "role": [
                437
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
            "isWaiting": [
                4
            ],
            "result": [
                295
            ],
            "success": [
                4
            ],
            "threadId": [
                490
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
                490
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
            ],
            "type": [
                278
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                490
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
            ],
            "type": [
                278
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
                490
            ],
            "id": [
                490
            ],
            "position": [
                18
            ],
            "tsVectorFieldMetadataId": [
                490
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
                490
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
                446
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
                295
            ],
            "workspaceMemberId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                490
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
                627
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
                18
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
                40
            ],
            "value": [
                295
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                490
            ],
            "createdAt": [
                194
            ],
            "frontComponentId": [
                490
            ],
            "icon": [
                1
            ],
            "id": [
                490
            ],
            "position": [
                18
            ],
            "scope": [
                459
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                490
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
                490
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
                490
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
            ],
            "type": [
                278
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
                639
            ],
            "__typename": [
                1
            ]
        },
        "SignUpInNewWorkspaceInput": {
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
        "Skill": {
            "applicationId": [
                490
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
                490
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
                424
            ],
            "configurationType": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                637
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
                404,
                {
                    "input": [
                        178,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                312,
                {
                    "input": [
                        313,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                9,
                {
                    "threadId": [
                        490,
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
                474
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
                615
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
                490
            ],
            "createdAt": [
                194
            ],
            "emit": [
                477
            ],
            "frontComponentUniversalIdentifier": [
                490
            ],
            "icon": [
                1
            ],
            "id": [
                490
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
                490
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                490
            ],
            "universalIdentifier": [
                490
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
                490
            ],
            "on": [
                1
            ],
            "through": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                490
            ],
            "relationFieldUniversalIdentifier": [
                490
            ],
            "triggerFieldUniversalIdentifiers": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                615
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
                295
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
        "TwoFactorAuthenticationMethodSummary": {
            "status": [
                1
            ],
            "strategy": [
                1
            ],
            "twoFactorAuthenticationMethodId": [
                490
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
                194
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                490
            ],
            "gt": [
                490
            ],
            "gte": [
                490
            ],
            "iLike": [
                490
            ],
            "in": [
                490
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                490
            ],
            "lt": [
                490
            ],
            "lte": [
                490
            ],
            "neq": [
                490
            ],
            "notILike": [
                490
            ],
            "notIn": [
                490
            ],
            "notLike": [
                490
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
                490
            ],
            "name": [
                1
            ],
            "updatedAt": [
                194
            ],
            "visibility": [
                494
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
            "visibility": [
                8
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
                490
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                295
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
                295
            ],
            "roleId": [
                490
            ],
            "triggers": [
                295
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
                490
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
                490
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                328
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
                501
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
                503
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
                490
            ],
            "update": [
                505
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
                490
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
                490
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                490
            ],
            "position": [
                18
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                295
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
                295
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                490
            ],
            "options": [
                295
            ],
            "settings": [
                295
            ],
            "translations": [
                341
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
                490
            ],
            "update": [
                510
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
                490
            ],
            "update": [
                513
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                295
            ],
            "databaseEventTriggerSettings": [
                295
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                295
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
                18
            ],
            "toolTriggerSettings": [
                295
            ],
            "workflowActionTriggerSettings": [
                295
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                490
            ],
            "update": [
                515
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                323
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
                330
            ],
            "visibility": [
                328
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                490
            ],
            "update": [
                517
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
                490
            ],
            "update": [
                517
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
                490
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
                490
            ],
            "position": [
                18
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
                490
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
                490
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
                361
            ],
            "readability": [
                339
            ],
            "sharingReach": [
                369
            ],
            "shortcut": [
                1
            ],
            "translations": [
                341
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                490
            ],
            "update": [
                508
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                490
            ],
            "update": [
                519
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                490
            ],
            "update": [
                520
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
                490
            ],
            "type": [
                378
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
                377
            ],
            "position": [
                18
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
                490
            ],
            "layoutMode": [
                377
            ],
            "position": [
                18
            ],
            "title": [
                1
            ],
            "widgets": [
                528
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
                295
            ],
            "configuration": [
                295
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                490
            ],
            "pageLayoutTabId": [
                490
            ],
            "position": [
                295
            ],
            "title": [
                1
            ],
            "type": [
                616
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
                295
            ],
            "configuration": [
                295
            ],
            "id": [
                490
            ],
            "objectMetadataId": [
                490
            ],
            "pageLayoutTabId": [
                490
            ],
            "position": [
                295
            ],
            "title": [
                1
            ],
            "type": [
                616
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
                490
            ],
            "tabs": [
                526
            ],
            "type": [
                378
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                490
            ],
            "update": [
                531
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
                490
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
                490
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                341
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
                494
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                490
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
                490
            ],
            "update": [
                537
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
                490
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
                490
            ],
            "update": [
                539
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
                18
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                490
            ],
            "update": [
                541
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
                18
            ],
            "size": [
                18
            ],
            "viewFieldGroupId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                490
            ],
            "logicalOperator": [
                604
            ],
            "parentViewFilterGroupId": [
                490
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "viewId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                490
            ],
            "update": [
                544
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                490
            ],
            "operand": [
                605
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "relationTargetFieldMetadataId": [
                490
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                490
            ],
            "update": [
                546
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                490
            ],
            "fieldValue": [
                1
            ],
            "isVisible": [
                4
            ],
            "position": [
                18
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
                490
            ],
            "calendarFieldMetadataId": [
                490
            ],
            "calendarLayout": [
                598
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                490
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                490
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                490
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                608
            ],
            "position": [
                18
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                611
            ],
            "visibility": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                490
            ],
            "update": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                610
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
                490
            ],
            "update": [
                551
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
                28
            ],
            "aiChatModelTier": [
                28
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                295
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                490
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                18
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
                18
            ],
            "workspaceDiscoverability": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                295
            ],
            "workspaceMemberId": [
                490
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                490
            ],
            "isVisible": [
                4
            ],
            "position": [
                18
            ],
            "viewFieldId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                557
            ],
            "id": [
                490
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                557
            ],
            "groups": [
                558
            ],
            "widgetId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                363
            ],
            "roleId": [
                490
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
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                490
            ],
            "predicateGroups": [
                430
            ],
            "predicates": [
                432
            ],
            "roleId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                429
            ],
            "predicates": [
                428
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                568
            ],
            "viewFields": [
                565
            ],
            "viewFilterGroups": [
                566
            ],
            "viewFilters": [
                567
            ],
            "viewSorts": [
                569
            ],
            "widgetId": [
                490
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
                490
            ],
            "isVisible": [
                4
            ],
            "position": [
                18
            ],
            "size": [
                18
            ],
            "viewFieldId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                490
            ],
            "logicalOperator": [
                604
            ],
            "parentViewFilterGroupId": [
                490
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "fieldMetadataId": [
                490
            ],
            "id": [
                490
            ],
            "operand": [
                605
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "relationTargetFieldMetadataId": [
                490
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                490
            ],
            "calendarFieldMetadataId": [
                490
            ],
            "calendarLayout": [
                598
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                490
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                490
            ],
            "openRecordIn": [
                608
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                611
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                610
            ],
            "fieldMetadataId": [
                490
            ],
            "id": [
                490
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
                583
            ],
            "usageByApplication": [
                572
            ],
            "usageByModel": [
                572
            ],
            "usageByOperationType": [
                572
            ],
            "usageByUser": [
                572
            ],
            "userDailyUsage": [
                585
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                575
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
                18
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
                87
            ],
            "createdAt": [
                194
            ],
            "id": [
                490
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                87
            ],
            "operationType": [
                575
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                582
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                584
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
                584
            ],
            "operationType": [
                575
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                574
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                578
            ],
            "resourceType": [
                582
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                576
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
                575
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                584
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
                575
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                582
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                584
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
                490
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                87
            ],
            "operationType": [
                575
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
                87
            ],
            "resourceType": [
                582
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
                584
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                18
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
                583
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
                194
            ],
            "currentUserWorkspace": [
                589
            ],
            "currentWorkspace": [
                620
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
                490
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
                370
            ],
            "previousOnboardingStatus": [
                370
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                194
            ],
            "userVars": [
                296
            ],
            "userWorkspaces": [
                589
            ],
            "workspaceMember": [
                629
            ],
            "workspaceMembers": [
                629
            ],
            "workspaces": [
                589
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
                295
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
                490
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
                490
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
                490
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                362
            ],
            "objectsPermissions": [
                362
            ],
            "permissionFlags": [
                387
            ],
            "twoFactorAuthenticationMethodSummary": [
                486
            ],
            "updatedAt": [
                194
            ],
            "user": [
                586
            ],
            "userId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                490
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
                490
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
                490
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                490
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
                490
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
                18
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
                638
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
                490
            ],
            "calendarEndFieldMetadataId": [
                490
            ],
            "calendarFieldMetadataId": [
                490
            ],
            "calendarLayout": [
                598
            ],
            "createdAt": [
                194
            ],
            "createdByUserWorkspaceId": [
                490
            ],
            "deletedAt": [
                194
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                490
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
                490
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                607
            ],
            "mainGroupByFieldMetadataId": [
                490
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                490
            ],
            "openRecordIn": [
                608
            ],
            "position": [
                18
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                611
            ],
            "universalIdentifier": [
                490
            ],
            "updatedAt": [
                194
            ],
            "viewFieldGroups": [
                601
            ],
            "viewFields": [
                600
            ],
            "viewFilterGroups": [
                603
            ],
            "viewFilters": [
                602
            ],
            "viewGroups": [
                606
            ],
            "viewSorts": [
                609
            ],
            "visibility": [
                612
            ],
            "workspaceId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                615
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
                490
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "fieldMetadataId": [
                490
            ],
            "id": [
                490
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
                18
            ],
            "size": [
                18
            ],
            "universalIdentifier": [
                490
            ],
            "updatedAt": [
                194
            ],
            "viewFieldGroupId": [
                490
            ],
            "viewId": [
                490
            ],
            "workspaceId": [
                490
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
                490
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
                18
            ],
            "updatedAt": [
                194
            ],
            "viewFields": [
                600
            ],
            "viewId": [
                490
            ],
            "workspaceId": [
                490
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
                490
            ],
            "id": [
                490
            ],
            "operand": [
                605
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "relationTargetFieldMetadataId": [
                490
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                194
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                490
            ],
            "viewId": [
                490
            ],
            "workspaceId": [
                490
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
                490
            ],
            "logicalOperator": [
                604
            ],
            "parentViewFilterGroupId": [
                490
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "updatedAt": [
                194
            ],
            "viewId": [
                490
            ],
            "workspaceId": [
                490
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
                490
            ],
            "isVisible": [
                4
            ],
            "position": [
                18
            ],
            "updatedAt": [
                194
            ],
            "viewId": [
                490
            ],
            "workspaceId": [
                490
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
                610
            ],
            "fieldMetadataId": [
                490
            ],
            "id": [
                490
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                194
            ],
            "viewId": [
                490
            ],
            "workspaceId": [
                490
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
                490
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
                490
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
                25
            ],
            "on_BarChartConfiguration": [
                81
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
                279
            ],
            "on_LineChartConfiguration": [
                299
            ],
            "on_MessageCampaignBodyConfiguration": [
                320
            ],
            "on_MessageCampaignDetailsConfiguration": [
                321
            ],
            "on_NotesConfiguration": [
                353
            ],
            "on_PieChartConfiguration": [
                388
            ],
            "on_RecordTableConfiguration": [
                416
            ],
            "on_StandaloneRichTextConfiguration": [
                466
            ],
            "on_TasksConfiguration": [
                475
            ],
            "on_TimelineConfiguration": [
                479
            ],
            "on_ViewConfiguration": [
                599
            ],
            "on_WorkflowConfiguration": [
                617
            ],
            "on_WorkflowRunConfiguration": [
                618
            ],
            "on_WorkflowVersionConfiguration": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                621
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                28
            ],
            "aiChatModelTier": [
                28
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                295
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
                194
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
                425
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
                18
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
                490
            ],
            "installedApplications": [
                43
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
                490
            ],
            "metadataVersion": [
                18
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                18
            ],
            "updatedAt": [
                194
            ],
            "viewFields": [
                600
            ],
            "viewFilterGroups": [
                603
            ],
            "viewFilters": [
                602
            ],
            "viewGroups": [
                606
            ],
            "viewSorts": [
                609
            ],
            "views": [
                597
            ],
            "workspaceCustomApplication": [
                43
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                626
            ],
            "workspaceMembersCount": [
                18
            ],
            "workspaceUrls": [
                638
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
                295
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                623
            ],
            "personEnrichment": [
                295
            ],
            "personOutcome": [
                636
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
                490
            ],
            "roleId": [
                490
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
                11
            ],
            "colorScheme": [
                1
            ],
            "dateFormat": [
                631
            ],
            "id": [
                490
            ],
            "locale": [
                1
            ],
            "name": [
                271
            ],
            "numberFormat": [
                632
            ],
            "openRecordIn": [
                373
            ],
            "roles": [
                425
            ],
            "timeFormat": [
                633
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
                490
            ],
            "userWorkspaceId": [
                490
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                490
            ],
            "variables": [
                587
            ],
            "workspaceMemberId": [
                490
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
                295
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
                490
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
                490
            ],
            "workspaceUrls": [
                638
            ],
            "__typename": [
                1
            ]
        }
    }
}